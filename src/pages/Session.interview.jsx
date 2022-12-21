import React, { useContext, useEffect, useState } from 'react'
// import { RecordRTCPromisesHandler } from 'recordrtc'
import { useNavigate } from 'react-router-dom'
import { InterviewContext } from '../contexts/InteviewContextProvider'
import { createAzureRecognizer } from '../utils/azure-transcription'
import VideoResponse from '../components/VideoResponse'
import VideoRecorder from '../components/VideoRecorder'
import SessionEndedModal from '../components/SessionEndedModal'
import { io } from 'socket.io-client'
import { deleteIndexedDB } from '../hooks/useIndexedDB'
import { SERVER_BASE_URL } from '../config/FetchConfigs'
import HeaderDescription from '../components/Header.Description'
import { v4 as uuidv4 } from 'uuid'
import dateFormat from 'date-format'
import { sendLogRequest } from '../utils/logger'

let isRecording = false
let serverSocket = null
let audioRecognizer = null
let rtcRecorder = null
let count = 0

function SessionInterview () {
  const {
    // videosUri,
    setVideosUri,
    meetingId,
    // isInterviewerSpeaking,
    // isRecognizerOn,
    // setIsRecognizerOn,
    sessionData
  } = useContext(InterviewContext)

  // ! TOGGLING STATE
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [sessionEnded, setSessionEnded] = useState(false)

  // ! FUNCTIONING COMPONENTS
  const [mediaStream, setMediaStream] = useState(null)
  // const [audioRecognizer, setAudioRecognizer] = useState(null)
  // const [serverSocket, setServerSocket] = useState(null)
  // const [rtcRecorder, setRtcRecorder] = useState(null)

  // ? FUNCTIONS

  /**
   * CLEAR SESSIONInterview INCLUDING INDEXED DB, CLOSING SERVER, MEDIASTREAM, RTCRECORDER, VIDEOSURI
   */
  function clearSession () {
    deleteIndexedDB().then(() => {
      // closeAzureRecognizer()
      serverSocket.close()
      serverSocket = null
      audioRecognizer = null
      rtcRecorder = null
      setVideosUri([])
      setMediaStream(null)
      // setAudioRecognizer(null)
      // setServerSocket(null)
      // setRtcRecorder(null)
    })
  }

  /**
   *
   * @param {MediaStream} stream Pass the newly created MediaStream object
   * @returns MediaRecorder
   */
  function createRecorder (stream, socket) {
    const r = new MediaRecorder(stream, {
      mimeType: 'video/webm;codecs=vp9'
    })

    r.onstop = function () {
      socket.emit('rec-stopped', true)
    }

    r.ondataavailable = async function (ev) {
      socket.emit('video-audio-blob', ev.data)
    }

    return r
  }

  /**
   * Creates a new ```MediaStream``` object from the ```device``` and ```group id``` of the newly connected device
   * @param {InputDeviceInfo} device Pass the newly connected input device information
   * @returns MediaStream
   */
  async function getNewStream (device) {
    const newStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        suppressLocalAudioPlayback: true,
        deviceId: device.deviceId,
        groupId: device.groupId
      },
      video: true
    })
    return newStream
  }

  /**
   * Checks the connected media devices and returns the newly connected ```InputDeviceInfo```.
   * Filters by kind (_```audioinput```_) and deviceId (_```communcations```_)
   * @returns InputDeviceInfo
   */
  async function getNewDevice () {
    const devices = await navigator.mediaDevices.enumerateDevices()
    const filtered_device = devices.filter(device => {
      return (
        device.kind.includes('audioinput') &&
        device.deviceId.toLowerCase().includes('default')
      )
    })
    return filtered_device[0]
  }

  /**
   * Called after `init` function in order to detect audio input device change
   */
  async function detectAudioInputChange () {
    navigator.mediaDevices.ondevicechange = async function (e) {
      if (count == 0) {
        count += 1
        return
      }
      console.log(
        'SessionInterview interview audiorecognizer\n',
        audioRecognizer
      )
      audioRecognizer.stopContinuousRecognitionAsync(
        () => {
          console.log('Stopped in SessionInterview interview')
          audioRecognizer.close()
          audioRecognizer = null
        },
        e => {
          sendLogRequest(meetingId, 'error', e.toString())
          console.error(e)
        }
      )

      // ! CHECK IF RECORDING IS ON -> STOP RECORDER AND RECOGNIZER
      // if (isRecording) {
      rtcRecorder.stop()
      // }

      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop())
        setMediaStream(null)
      } // ! STOP PREVIOUS MEDIASTREAM
      const new_device = await getNewDevice() // ! GET NEW DEVICE
      const stream = await getNewStream(new_device) // ! CREATE NEW STREAM WITH THE DEVICE AND ASSIGN TO GLOBAL STREAM
      setMediaStream(stream)

      // ! CREATE RECORDER AND RECOGNIZER
      audioRecognizer = await createAzureRecognizer(stream) // * RECOGNIZER

      console.log(serverSocket)
      const rec = createRecorder(stream, serverSocket) // * RECORDER
      rtcRecorder = rec

      // ! IF RECORDER AND RECOGNIZER INACTIVE, START RECOGNIZING
      if (isRecording && rec.state === 'inactive') {
        rec.start(1000)
      }

      count = 0
    }
  }

  // * HOOKS
  const navigate = useNavigate()

  useEffect(() => {
    async function init () {
      const id = uuidv4().toString()

      const socket = io(SERVER_BASE_URL, {
        query: {
          applicant_id: meetingId,
          session_data: JSON.stringify({
            ...sessionData,
            interview_start_timestamp: dateFormat(
              'yyyy-MM-dd hh:mm:ss',
              new Date()
            ),
            id: id
          })
        }
      })

      socket.on('connect', () => {
        console.log('Server Socket', socket.connected)
      })

      socket.on('disconnect', async () => {
        await deleteIndexedDB()
      })
      serverSocket = socket

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          suppressLocalAudioPlayback: true
        },
        video: true
      })

      rtcRecorder = createRecorder(stream, socket)

      // setRtcRecorder(recorder)
      setMediaStream(stream)
      createAzureRecognizer(stream).then(rec => {
        // setAudioRecognizer(rec)
        audioRecognizer = rec
        setIsLoaded(true)
      })
    }

    if (meetingId === '') {
      navigate('/', {
        replace: true
      })
    } else {
      init().then(() => {
        detectAudioInputChange()
      })
    }
  }, [])

  useEffect(() => {
    if (sessionEnded) {
      clearSession()
    }
    return () => {}
  }, [sessionEnded])

  return (
    <>
      {isLoaded && (
        <>
          {sessionEnded && <SessionEndedModal />}

          <div className='container-fluid d-flex flex-column h-100'>
            <HeaderDescription />

            <div className='w-100 d-flex justify-content-evenly gap-4 flex-md-row flex-column mt-5'>
              <VideoResponse
                isAudioOn={isAudioOn}
                audioRecognizer={audioRecognizer}
              />

              <VideoRecorder
                mediaStream={mediaStream}
                isAudioOn={isAudioOn}
                setIsAudioOn={setIsAudioOn}
                setSessionEnded={setSessionEnded}
                rtcRecorder={rtcRecorder}
                serverSocket={serverSocket}
                audioRecognizer={audioRecognizer}
              />
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default SessionInterview

// new RecordRTCPromisesHandler(stream, {
//   type: 'video',
//   mimeType: 'video/webm;codecs=h264',
//   timeSlice: 1000,
//   ondataavailable: blob => {
//     if (socket) socket.emit('video-audio-blob', blob)
//   }
// })
// if (isInterviewerSpeaking === false && isRecognizerOn === false) {
//   speechRecognizer.startContinuousRecognitionAsync(
//     () => {
//       speechRecognizer.recognizing = (s, e) => {
//         console.log(e.result.text)
//       }

//       speechRecognizer.recognized = async (s, e) => {
//         if (
//           e.result.text &&
//           e.result.text !== undefined &&
//           e.result.text.length > 0
//         )
//           console.log(e.result.text)
//       }

//       speechRecognizer.canceled = (s, e) => {
//         console.log(`CANCELED: Reason=${e.reason}`)
//         speechRecognizer.stopContinuousRecognitionAsync()
//       }

//       speechRecognizer.sessionStopped = (s, e) => {
//         speechRecognizer.stopContinuousRecognitionAsync()
//       }
//     },
//     err => {
//       console.error(err)
//     }
//   )
// }
