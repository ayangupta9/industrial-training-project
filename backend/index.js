const open = require('openai')
require('dotenv').config()

const { writeFile } = require('fs')
const express = require('express')
const http = require('http')
const sio = require('socket.io')
const cors = require('cors')
const fileupload = require('express-fileupload')
const { s3client } = require('./utils/s3objects')
const videoResponseRouter = require('./routes/VideoResponseRouter')
const { Upload } = require('@aws-sdk/lib-storage')
const { saveInterviewData } = require('./utils/sessionUtils')
// const dateFormat = require('date-format')
const { v4: uuidv4 } = require('uuid')
const { Blob, Buffer } = require('node:buffer')
const { log, createLogger } = require('./utils/logging')
const { Decoder, Reader, tools } = require('ts-ebml')
const axios = require('axios').default
const moment = require('moment-timezone')

const PORT = process.env.PORT || 8080
const app = express()
const server = http.createServer(app)

const io = new sio.Server(server, {
  cors: {
    origin: '*'
  },
  pingTimeout: 50000,
  upgradeTimeout: 50000
})

// app.use(morgan('tiny'))
app.use(cors())
app.use(fileupload())
app.use(express.json())
app.use(
  express.urlencoded({
    extended: false
  })
)
app.use(videoResponseRouter)

app.get('/', (req, res) => {
  res.send('Interview Express Server')
})

app.get('/get-speech-token', async (req, res) => {
  const speechKey = process.env.AZURE_SUBSCRIPTION_KEY
  const speechRegion = process.env.AZURE_SERVICE_REGION

  console.log(speechKey, speechRegion)

  const headers = {
    headers: {
      'Ocp-Apim-Subscription-Key': speechKey,
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  }

  try {
    const tokenResponse = await axios.post(
      `https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
      null,
      headers
    )

    res.send({ token: tokenResponse.data, region: speechRegion })
  } catch (err) {
    res.status(401).send('There was an error authorizing your speech key.')
  }
})

app.post('/log', (req, res) => {
  // console.log(req.body)
  log(req.body.meetingId, req.body.logMessage, req.body.level)
  res.send(true)
})

// upload session video to s3
async function uploadVideoSessionToS3 (buffer, filename) {
  try {
    const parallelUploads = new Upload({
      client: s3client,
      params: {
        Bucket: process.env.RECORDED_VIDEOS_BUCKET_NAME,
        Key: filename,
        Body: buffer
      },
      queueSize: 4,
      partSize: 1024 * 1024 * 5
    })

    parallelUploads.on('httpUploadProgress', progress => {
      console.log(progress)
    })

    await parallelUploads.done()
  } catch (e) {
    throw e
  }
}

// finally {
//   audioBuffer = null
// }

//classification
const configuration = new open.Configuration({
  apiKey: process.env.OPENAI_API_KEY
})
const openai = new open.OpenAIApi(configuration)

async function openaiResponse (text, applicant_id) {
  const completion = await openai.createCompletion({
    // model: 'ada:ft-rysyl-2022-08-01-09-04-12',
    model: 'ada:ft-rysyl-2022-08-24-06-44-43',
    prompt: text,
    temperature: 0,
    max_tokens: 1,
    stop: ['\n']
  })
  log(applicant_id, completion.data, 'info')
  let response_str = completion.data.choices[0].text
  return response_str
}

function injectMetadata (buffer, video_duration) {
  const decoder = new Decoder()
  const reader = new Reader()
  reader.logging = false
  reader.drop_default_duration = false

  try {
    const elms = decoder.decode(buffer)
    elms.forEach(elm => reader.read(elm))
    reader.stop()

    const refinedMetadataBuf = tools.makeMetadataSeekable(
      reader.metadatas,
      video_duration,
      reader.cues
    )

    console.log(141, refinedMetadataBuf.byteLength)
    const body = buffer.slice(reader.metadataSize)
    console.log(143, body)

    return new Blob([refinedMetadataBuf, body], {
      type: 'video/webm;codecs=vp9'
    })
  } catch (error) {
    throw error
  }
}

function returnTimeStamp (start_time) {
  const time =
    moment()
      .tz('Asia/Calcutta')
      .valueOf() - start_time
  return {
    hours: ('0' + Math.floor(time / 1000 / 60 / 60)).slice(-2),
    minutes: ('0' + (Math.floor(time / 60000) % 60)).slice(-2),
    seconds: ('0' + Math.floor((time / 1000) % 60)).slice(-2)
  }
}

function saveVideoLocally (buffer, session_id) {
  writeFile(`video_${session_id}.webm`, buffer, null, err => {
    if (err) {
      console.error(err)
      return
    }
    console.log('Saved video for session', session_id)
  })
}

io.on('connection', async socket => {
  
  // * Variables
  let audioBuffer = []
  let transcriptions = []
  let question_ts = {
    hours: '00',
    minutes: '00',
    seconds: '00'
  }

  // * Socket data
  const applicant_id = socket.handshake.query.applicant_id
  const interviewer_questions = JSON.parse(
    socket.handshake.query.interviewer_questions
  )
  let session_data = JSON.parse(socket.handshake.query.session_data)
  const start_time = parseInt(socket.handshake.query.start_time)
  let videoIndex = parseInt(socket.handshake.query.video_index)
  let previousVideoIndex = videoIndex - 1

  const logger = createLogger(applicant_id)

  log(applicant_id, `Interview Start time: ${start_time}`, 'info', logger)
  log(
    applicant_id,
    `Connected socket for communication, \nmeeting id: ${applicant_id}\nsocket id:${socket.id}`,
    'info',
    logger
  )

  socket.on('azure-transcribe-data', (data, callback) => {
    console.log(data)
    // transcriptions.push(data.transcription.join(' '))

    transcriptions.push(
      `Timestamp: ${question_ts.hours}:${question_ts.minutes}:${
        question_ts.seconds
      }\r\nInterviewer: ${
        interviewer_questions[data.index]
      }\r\nInterviewee: ${data.transcription.join('. ')}\r\n`
    )

    log(
      applicant_id,
      `Timestamp: ${question_ts.hours}:${question_ts.minutes}:${
        question_ts.seconds
      }\r\nInterviewer: ${
        interviewer_questions[data.index]
      }\r\nInterviewee: ${data.transcription.join('. ')}\r\n`,
      'info'
    )

    question_ts = returnTimeStamp(start_time)

    let text = data.transcription.join(' ').concat('\n\n###\n\n')
    console.log('joined text', text)
    console.log('getting open ai response')

    log(applicant_id, 'Getting open ai response', 'info')

    let response = openaiResponse(text)
    response.then(function (result) {
      log(applicant_id, `open ai response\n${result}`, 'info')

      if (result != '1') {
        previousVideoIndex = videoIndex
        videoIndex++
        log(applicant_id, `${videoIndex} index inside result=0`, 'info')
        // console.log(videoIndex, 'index inside result=0')
      } else {
        videoIndex = previousVideoIndex + 1
      }
      callback({
        idx: videoIndex
      })
    })

    log(applicant_id, `${videoIndex} index outside`, 'info')
  })

  socket.on('video-audio-blob', data => {
    audioBuffer.push(data)
  })

  socket.on('disconnect', async () => {
    log(
      applicant_id,
      `Socket (${socket.id}) disconnected from server. Performing interview-end functions.`,
      'info'
    )

    const video_duration =
      moment()
        .tz('Asia/Kolkata')
        .valueOf() - start_time
    const sessionId = uuidv4()
    const filename = `${session_data?.id}_${sessionId}.webm`
    audioBuffer.splice(audioBuffer.length - 2, 2)
    const buffer = Buffer.concat(audioBuffer)

    log(
      applicant_id,
      `Video data compiled.\n${JSON.stringify({
        filename: filename,
        size_in_bytes: buffer.byteLength
      })}`,
      'info',
      logger
    )

    const db_data = {
      ...session_data,
      session_id: sessionId,
      interview_s3_link: filename,
      interview_end_timestamp: moment()
        .tz('Asia/Calcutta')
        .format('YYYY-MM-DD HH:mm:ss'),
      transcript:
        transcriptions.join('\r\n') +
        `Timestamp: ${question_ts.hours}:${question_ts.minutes}:${
          question_ts.seconds
        }\r\nInterviewer: ${
          interviewer_questions[interviewer_questions.length - 1]
        }\r\n`
    }

    try {
      const fixed_blob = injectMetadata(buffer, video_duration)

      log(
        applicant_id,
        'Injected necessary metadata into video buffer',
        'info',
        logger
      )

      const video_buffer = Buffer.from(await fixed_blob.arrayBuffer())

      try {
        const result = await saveInterviewData(db_data)
        log(
          applicant_id,
          `Data sent to database ${JSON.stringify(db_data)}`,
          'info',
          logger
        )

        try {
          await uploadVideoSessionToS3(video_buffer, filename)
          log(
            applicant_id,
            `Video recording [size: ${video_buffer.byteLength} bytes] saved to s3`,
            'info',
            logger
          )
        } catch (e) {
          log(
            applicant_id,
            `Could not save video recording\n${e.toString()}`,
            'error',
            logger
          )
        }
      } catch (e) {
        log(
          applicant_id,
          `Could not save data to database\n${e.toString()}`,
          'error',
          logger
        )
      } finally {
        audioBuffer = []
        transcriptions = []
      }
    } catch (error) {
      log(
        applicant_id,
        `Error occured while injecting metadata\n${error.toString()}`,
        'error',
        logger
      )
    }

    log(
      applicant_id,
      `Interview ended.\nStart time: ${db_data.interview_start_timestamp}\nEnd time: ${db_data.interview_end_timestamp}`,
      'info',
      logger
    )
  })
})

server.listen(PORT, () => {
  console.log('Listening at', PORT)
})

/*

    // const video_buffer = Buffer.from(await fixed_blob.arrayBuffer(), 'binary')
    // saveVideoLocally(video_buffer, sessionId)
  // transports: ['websocket'],
  // allowUpgrades: false,
    // console.log(videoIndex, 'index outside')

    // var response = openai.createCompletion(engine='ada:ft-rysyl-2022-07-30-05-29-40', prompt= "Can you please repeat?\n\n###\n\n", temperature=0, frequency_penalty=0, presence_penalty=0, stop=["\n"])
    // console.log(response.choices[0])
    // const randomVideoIndex = Math.floor(Math.random() * 5)

  // let randomVideoIndex = 3

  // socket.on('azure-transcribe-data', (data, callback) => {
  //   transcriptions.push(
  //     `Interviewer: ${
  //       interviewer_questions[data.index]
  //     }\r\nInterviewee: ${data.transcription.join('. ')}\r\n`
  //   )

  //   log(
  //     applicant_id,
  //     `Interviewer: ${
  //       interviewer_questions[data.index]
  //     }\r\nInterviewee: ${data.transcription.join('. ')}\r\n`,
  //     'info',
  //     logger
  //   )
  //   console.log(randomVideoIndex)
  //   callback({
  //     idx: randomVideoIndex
  //   })
  //   randomVideoIndex += 1
  // })


// socket.on 'rec-stopped'

// socket.on('azure-transcribe-data', (data, callback) => {
//   console.log(data)

//   transcriptions.push(
//     `Interviewer: ${
//       interviewer_questions[data.index]
//     }\r\nInterviewee: ${data.transcription.join('. ')}\r\n`
//   )

//   log(
//     applicant_id,
//     `Interviewer: ${
//       interviewer_questions[data.index]
//     }\r\nInterviewee: ${data.transcription.join('. ')}\r\n`,
//     'info'
//   )

//   let text = data.transcription.join(' ').concat('\n\n###\n\n')
//   console.log('joined text', text)

//   log(applicant_id, 'Getting open ai response', 'info')
//   // console.log('getting open ai response')
//   let response = openaiResponse(text)
//   response.then(function (result) {
//     log(applicant_id, `open ai response\n${result}`, 'info')
//     // console.log('open ai response', result)

//     if (result === '0') {
//       if (videoIndex == 7) {
//         videoIndex = previousVideoIndex + 2
//         previousVideoIndex++
//         // console.log(videoIndex, 'index inside result=0')
//         log(applicant_id, `${videoIndex} index inside result=0`, 'info')
//       } else {
//         previousVideoIndex = videoIndex
//         videoIndex++
//         log(applicant_id, `${videoIndex} index inside result=0`, 'info')
//         // console.log(videoIndex, 'index inside result=0')
//       }
//     } else if (result === '2') {
//       previousVideoIndex = videoIndex
//       videoIndex = 7
//       log(applicant_id, `${videoIndex} index inside result=2`, 'info')
//       // console.log(videoIndex, 'index inside result=2')
//     } else if (result === '1') {
//       videoIndex = previousVideoIndex + 1
//     }
//     callback({
//       idx: videoIndex
//     })
//   })

//   log(applicant_id, `${videoIndex} index outside`, 'info')
//   // console.log(videoIndex, 'index outside')
//   //var response = openai.createCompletion(engine='ada:ft-rysyl-2022-07-30-05-29-40', prompt= "Can you please repeat?\n\n###\n\n", temperature=0, frequency_penalty=0, presence_penalty=0, stop=["\n"])
//   // console.log(response.choices[0])
//   //const randomVideoIndex = Math.floor(Math.random() * 5)
// })
*/
