import { useState, useEffect, useContext } from 'react' // ✅
import { useNavigate } from 'react-router-dom' // ✅
import { InterviewContext } from '../contexts/InteviewContextProvider' // ✅

import { v4 as uuidv4 } from 'uuid' // ✅
import { io } from 'socket.io-client' // ✅
import axios from 'axios' // ✅

import { SERVER_BASE_URL } from '../config/FetchConfigs'

import dateFormat from 'date-format' // ✅
import {closeAzureRecognizer,createAzureRecognizer} from '../utils/azure-transcription' // ✅
import { deleteIndexedDB } from '../hooks/useIndexedDB' // ✅
import { sendLogRequest } from '../utils/logger' // ✅

import SessionEndedModal from '../components/SessionEndedModal' // ✅
import HeaderDescription from '../components/Header.Description' // ✅
import VideoResponse from '../components/VideoResponse' // ✅
import VideoRecorder from '../components/VideoRecorder' // ✅

function Session () {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isAudioOn, setIsAudioOn] = useState(true)
  const [sessionEnded, setSessionEnded] = useState(false)
  const [mediaStream, setMediaStream] = useState(null)
  const [videoRec, setVideoRec] = useState(null)
  const [serverSocket, setServerSocket] = useState(null)
  const [azureRec, setAzureRec] = useState(null)
  const [isVideoPermitted, setIsVideoPermitted] = useState(null)
  let isTranscriptOn = null

  const navigate = useNavigate()

  const {
    videosUri,
    meetingId,
    sessionData,
    setVideosUri,
    interviewQuestions,
    responseVideoIndex
    // mediaDeviceConfig
  } = useContext(InterviewContext)

  function clearSession () {
    // deleteIndexedDB().then(() => {
    mediaStream?.getTracks().forEach(track => track.stop())
    console.log(mediaStream?.getTracks())

    if (responseVideoIndex == videosUri.length - 1) {
      axios
        .get('/update-question-index', {
          baseURL: 'https://api.rysyl.com/v1',
          params: {
            application_id: meetingId,
            question_index: 2
          }
        })
        .then(res => {
          sendLogRequest(meetingId, 'info', `${res.data} to ${2}`)
        })
    }

    closeAzureRecognizer()
    serverSocket.close()
    setServerSocket(null)
    setAzureRec(null)
    setVideoRec(null)
    setMediaStream(null)
    setVideosUri([])

    // console.log('Cleared Session')
    // })
  }

  async function createMediaStream () {
    let stream = null
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: { noiseSuppression: true, echoCancellation: true }
      })
    } catch (e) {
      console.error(e)
    }
    return stream
  }

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

  useEffect(() => {
    if (sessionEnded === true) {
      clearSession()
      // console.log('Timeout started')
      setTimeout(() => {
        // console.log('Timeout finished')
        navigate('/', {
          replace: true
        })
      }, 4000)
    }
  }, [sessionEnded])

  useEffect(() => {
    async function socketInit (stream) {
      console.log('Socket init', stream)

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
          }),
          start_time: Date.now(),
          interviewer_questions: JSON.stringify(interviewQuestions),
          video_index: responseVideoIndex
        }
      })

      socket.on('connect', () => {
        sendLogRequest(`Socket (${socket.id}) connected to client side`)
        // console.log('Server Socket', socket.connected)
      })

      socket.on('disconnect', async () => {
        sendLogRequest(
          meetingId,
          'info',
          `Socket (${socket.id}) disconnected from client side`
        )
        // https://api.rysyl.com/v1/update-question-index?application_id=2f69849e-33e9-45fb-b64b-20376730792a&question_index=2
        await deleteIndexedDB(meetingId)
      })

      setServerSocket(socket)
      return { stream, socket }
    }
    async function videoRecInit (stream, socket) {
      const rec = createRecorder(stream, socket)
      setVideoRec(rec)
      return stream
    }
    async function azureSTTRec (stream) {
      const azureRec = await createAzureRecognizer(stream, meetingId)
      setAzureRec(azureRec)
      // return stream
    }

    async function handleAll () {
      createMediaStream()
        .then(stream => {
          if (stream) {
            setMediaStream(stream)
            setIsVideoPermitted(true)
            return stream
          } else {
            setIsVideoPermitted(false)
            throw Error('Video access denied')
          }
        })
        .then(stream => {
          console.log(1, stream)
          azureSTTRec(stream).then(() => {
            setTimeout(() => {
              socketInit(stream).then(({ stream, socket }) => {
                videoRecInit(stream, socket).then(() => {
                  sendLogRequest(meetingId, 'info', 'All components loaded.')
                  setIsLoaded(true)
                })
              })
            }, 2000)
          })
        })
        .catch(e => {
          console.error(e)
        })
    }

    async function init () {
      const permissionStatus = await navigator.permissions.query({
        name: 'camera'
      })

      if (
        permissionStatus.state === 'granted' ||
        permissionStatus.state === 'prompt'
      ) {
        handleAll()
      } else setIsVideoPermitted(false)

      permissionStatus.addEventListener('change', e => {
        if (e.target.state === 'granted') handleAll()
        else setIsVideoPermitted(false)
      })
    }

    window.onpopstate = function (e) {
      console.log('Pressed back', e)
      e.preventDefault()
      setSessionEnded(true)
    }

    if (meetingId === '' || videosUri?.length === 0) {
      console.log('lol')
      navigate('/', {
        replace: true
      })
    } else {
      init()
    }
  }, [])

  return (
    <div>
      {isVideoPermitted === false && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)'
          }}
          className='d-flex justify-content-center align-items-center w-100 h-100'
        >
          <div
            style={{
              maxWidth: '300px'
            }}
            className='d-flex bg-light w-100 flex-column rounded-3 justify-content-center align-items-center p-5'
          >
            <img width={'75'} src='/assets/images/warning.svg' />
            <br />
            <h5>
              Provide access to camera in order to proceed with the interview.
            </h5>
          </div>
        </div>
      )}

      {isVideoPermitted && isLoaded && (
        <>
          {sessionEnded && <SessionEndedModal />}
          <div className='container-fluid d-flex flex-column h-100'>
            <HeaderDescription />

            <div className='w-100 d-flex justify-content-evenly gap-4 flex-md-row align-items-center flex-column mt-3 mb-5'>
              <VideoResponse
                isTranscriptOn={isTranscriptOn}
                isAudioOn={isAudioOn}
                setSessionEnded={setSessionEnded}
                azureRec={azureRec}
              />

              <VideoRecorder
                isTranscriptOn={isTranscriptOn}
                mediaStream={mediaStream}
                azureRec={azureRec}
                isAudioOn={isAudioOn}
                setIsAudioOn={setIsAudioOn}
                setSessionEnded={setSessionEnded}
                rtcRecorder={videoRec}
                serverSocket={serverSocket}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Session

// video: {
//   deviceId: mediaDeviceConfig?.audioinput?.deviceId,
//   groupId: mediaDeviceConfig?.audioinput?.groupId
// },
// audio: {
//   deviceId: mediaDeviceConfig?.audioinput?.deviceId,
//   groupId: mediaDeviceConfig?.audioinput?.groupId,
//   noiseSuppression: true,
//   echoCancellation: true
// }
