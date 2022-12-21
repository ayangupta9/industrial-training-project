import React, { useState, useEffect, useRef, useContext } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'
import eyeOpen from '../assets/icons/eye-open.svg'
import eyeClose from '../assets/icons/eye-close.svg'
import ReactTooltip from 'react-tooltip'
import { sendLogRequest } from '../utils/logger'
import axios from 'axios'
// import { SERVER_BASE_URL } from '../config/FetchConfigs'
// interviewQuestions
// setIsInterviewerSpeaking
// sessionData,
// mediaDeviceConfig,
// let startedSpeaking = false

let lastSpokenTime = 0
let final_stt_data = []

function ToggleCamera ({ isCameraOn, setIsCameraOn, meetingId }) {
  function toggleCamera () {
    if (isCameraOn === false)
      sendLogRequest(meetingId, 'info', 'Interviewee hidden')
    else sendLogRequest(meetingId, 'info', 'Interviewee unhidden')
    setIsCameraOn(prev => !prev)
  }

  return (
    <>
      <img
        onClick={toggleCamera}
        style={{
          cursor: 'pointer'
        }}
        data-tip
        data-for='camera-tooltip'
        width='30'
        className='d-flex justify-content-center align-items-center align-content-center'
        src={isCameraOn ? eyeClose : eyeOpen}
        alt='camera toggle icon'
      />

      <ReactTooltip id='camera-tooltip' place='top' effect='solid' type='light'>
        <p className='m-0 px-1'>
          <b>{isCameraOn ? 'Hide Yourself' : 'Unhide yourself'}</b>
        </p>
      </ReactTooltip>
    </>
  )
}

function ToggleAudio ({
  isTranscriptOn,
  mediaStream,
  azureRec,
  isAudioOn,
  setIsAudioOn,
  meetingId
}) {
  useEffect(() => {
    if (mediaStream) {
      mediaStream.getAudioTracks().forEach(track => {
        if (track.kind === 'audioinput') {
          track.enabled = !track.enabled
        }
      })

      if (isTranscriptOn === true) {
        if (isAudioOn === false) {
          isTranscriptOn = false
          azureRec.stopContinuousRecognitionAsync(() => {
            sendLogRequest(meetingId, 'info', 'Microphone muted')
            console.log('Stopped recognizer because mute')
          })
        } else if (isAudioOn === true) {
          isTranscriptOn = true
          azureRec.startContinuousRecognitionAsync(() => {
            sendLogRequest(meetingId, 'info', 'Microphone unmuted')
            console.log('Started recognizer because unmute')
          })
        }
      }
    }

    return () => {}
  }, [isAudioOn])

  return (
    <>
      <i
        // data-bs-toggle='tooltip'
        // data-bs-placement='top'
        // title={isAudioOn ? 'Mute mic' : 'Unmute mic'}
        data-tip
        data-for='mic-tooltip'
        onClick={() => {
          setIsAudioOn(prev => !prev)
        }}
        style={{
          cursor: 'pointer',
          fontSize: '1.5em'
        }}
        className={
          isAudioOn === true
            ? 'bi bi-mic-mute-fill text-light'
            : 'bi bi-mic-fill text-light'
        }
      ></i>

      <ReactTooltip id='mic-tooltip' place='top' effect='solid' type='light'>
        <p className='m-0 px-1'>
          <b>{isAudioOn ? 'Mute Yourself' : 'Unmute yourself'}</b>
        </p>
      </ReactTooltip>
    </>
  )
}

function VideoRecorder ({
  mediaStream,
  rtcRecorder,
  serverSocket,
  isTranscriptOn,
  setSessionEnded,
  isAudioOn,
  setIsAudioOn,
  azureRec
}) {
  const {
    responseVideoIndex,
    setResponseVideoIndex,
    meetingId,
    setIsSameVideo
  } = useContext(InterviewContext)

  const [startedSpeaking, setStartedSpeaking] = useState(false)
  const [isCameraOn, setIsCameraOn] = useState(true)
  const displayVideoRef = useRef(null)

  useEffect(() => {
    console.dir(displayVideoRef)

    if (azureRec) {
      azureRec.recognizing = (s, e) => {
        if (e.result.text && e.result.text !== undefined) {
          if (startedSpeaking === false) setStartedSpeaking(true)
          lastSpokenTime = parseInt(new Date().getTime() / 1000)
        }
      }

      azureRec.recognized = async (s, e) => {
        if (
          e.result.text &&
          e.result.text !== undefined &&
          e.result.text.length > 0
        )
          final_stt_data.push(e.result.text)
      }

      azureRec.canceled = (s, e) => {
        console.log(`CANCELED: Reason=`, e)
        if (isTranscriptOn) {
          azureRec.stopContinuousRecognitionAsync(() => {
            sendLogRequest(
              meetingId,
              'alert',
              'Speech Recognizer service cancelled'
            )
            console.log('Stopped in canceled')
          })
        }
      }

      azureRec.sessionStopped = (s, e) => {
        if (isTranscriptOn) {
          isTranscriptOn = false
          azureRec.stopContinuousRecognitionAsync(() => {
            sendLogRequest(
              meetingId,
              'alert',
              'Speech Recognizer service session stopped'
            )

            console.log('Stopped in session stopped')
          })
        }
      }
    }

    return () => {
      stopAzureRecording().then(() => {
        sendLogRequest(
          meetingId,
          'alert',
          'Speech Recognizer completely stopped'
        )
        console.log('Completely stopped recorder')
      })
    }
  }, [azureRec])

  async function startAzureRecording () {
    if (rtcRecorder && azureRec) {
      serverSocket.connect()
      rtcRecorder.start(1000)
    }
  }

  async function stopAzureRecording () {
    if (rtcRecorder && azureRec) {
      isTranscriptOn = false
      azureRec.stopContinuousRecognitionAsync(() => {
        console.log('Stopped in Video Recorder')
      })
      serverSocket.disconnect()

      try {
        if (rtcRecorder.state !== 'inactive') rtcRecorder.stop()
      } catch (e) {
        console.error(e)
      }
    } else {
      console.error(
        'Could not stop recording; either rtcrecordeer or azureRec is null'
      )
    }
  }

  function emitTranscription () {
    serverSocket.emit(
      'azure-transcribe-data',
      { index: responseVideoIndex, transcription: final_stt_data },
      response => {
        if (response.idx === responseVideoIndex) setIsSameVideo(true)
        setResponseVideoIndex(response.idx)
        axios
          .get('/update-question-index', {
            baseURL: 'https://api.rysyl.com/v1',
            params: {
              application_id: meetingId,
              question_index: response.idx
            }
          })
          .then(res => {
            sendLogRequest(meetingId, 'info', `${res.data} to ${response.idx}`)
          })
      }
    )
    // startedSpeaking = false
    setStartedSpeaking(false)
    final_stt_data = []
    lastSpokenTime = 0
  }

  useEffect(() => {
    const recordVideoInit = async () => {
      displayVideoRef.current.srcObject = mediaStream
      displayVideoRef.current.muted = true
      await startAzureRecording()
    }

    recordVideoInit()
  }, [rtcRecorder])

  useEffect(() => {
    let intervalId
    if (lastSpokenTime !== 0 && startedSpeaking === true) {
      intervalId = setInterval(() => {
        if (lastSpokenTime !== 0 &&
          Math.floor(new Date().getTime() / 1000) - lastSpokenTime >= 4
        ) {
          console.log('Detected silence')
          isTranscriptOn = false
          azureRec.stopContinuousRecognitionAsync(() => {
            sendLogRequest(meetingId,'alert','Detected silence. Emitting transcription now.')
            console.log('Stopped now emitting transcript')
            emitTranscription()
            clearInterval(intervalId)
          })}}, 1000)
    }

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [startedSpeaking])

  return (
    <div className='position-relative d-flex gap-3 flex-column align-items-center'>
      {/* {!isCameraOn && ( */}

      {/* // * FRONT CAMERA VIDEO RECORDER */}
      <div
        className='overlay'
        style={{
          zIndex: '3',
          background: isCameraOn ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)',
          height: 'min-content',
          borderRadius: '15px',
          overflow: 'hidden',
          width: '220px'
        }}
      >
        <video
          autoPlay={true}
          style={{
            visibility: isCameraOn ? 'visible' : 'hidden',
            height: '100%',
            maxWidth: '220px',
            transform: 'scale(1.1)',
            boxShadow: '0px 0px 50px 0px lightgray'
          }}
          className='border-5 w-100 '
          ref={displayVideoRef}
        ></video>
      </div>

      {/* // * MEDIA DEVICE TOGGLER */}
      <div className='d-flex gap-4 px-4 py-2 rounded-3 bg-dark'>
        <ToggleCamera
          setIsCameraOn={setIsCameraOn}
          isCameraOn={isCameraOn}
          meetingId={meetingId}
          // mediaStream={mediaStream}
        />

        <ToggleAudio
          meetingId={meetingId}
          isTranscriptOn={isTranscriptOn}
          isAudioOn={isAudioOn}
          setIsAudioOn={setIsAudioOn}
          mediaStream={mediaStream}
          azureRec={azureRec}
        />
      </div>

      {/* // * END SESSION BUTTON */}
      <div>
        <button
          onClick={() => {
            stopAzureRecording().then(() => {
              setSessionEnded(true)
            })
          }}
          style={{
            border: 'none'
          }}
          className='bg-danger text-light rounded-pill mt-4 px-4 py-2'
        >
          End Session
        </button>
      </div>
    </div>
  )
}

export default VideoRecorder
