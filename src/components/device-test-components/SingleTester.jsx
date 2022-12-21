import React, { useState, useEffect, useContext, useRef } from 'react'
import { InterviewContext } from '../../contexts/InteviewContextProvider'
import { sendLogRequest } from '../../utils/logger'
import AudioWaveForm from '../AudioWaveForm'

function SingleTester ({
  isVideoPermitted,
  setIsVideoPermitted,
  isAudioPermitted,
  setIsAudioPermitted
  //   areMediaDevicesPermitted,
  //   setAreMediaDevicesPermitted
}) {
  const [testerStream, setTesterStream] = useState(null)
  const displayVideoRef = useRef(null)
  const { meetingId } = useContext(InterviewContext)

  async function askForPermissions () {
    let flag = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      })
      setTesterStream(stream)
      flag = true
    } catch (error) {
      flag = false
      console.error(error)
    } finally {
      return flag
    }
  }

  async function permissionsInit () {
    const cameraStatus = await navigator.permissions.query({
      name: 'camera'
    })
    const micStatus = await navigator.permissions.query({
      name: 'microphone'
    })

    if (
      (cameraStatus.state === 'granted' || cameraStatus.state === 'prompt') &&
      (micStatus.state === 'granted' || micStatus.state === 'prompt')
    ) {
      const flag = await askForPermissions()

      if (flag) {
        sendLogRequest(meetingId, 'info', 'Video and audio permissions granted')
      } else {
        sendLogRequest(
          meetingId,
          'error',
          'Video and audio permissions not granted'
        )
      }

      setIsAudioPermitted(flag)
      setIsVideoPermitted(flag)
    }

    cameraStatus.onchange = async function (e) {
      if (e.target.state === 'granted') {
        const flag = await askForPermissions()

        if (flag) sendLogRequest(meetingId, 'info', 'Video permissions granted')
        else sendLogRequest(meetingId, 'error', 'Video permissions not granted')

        setIsVideoPermitted(flag)
      } else {
        sendLogRequest(meetingId, 'error', 'Video permissions not granted')
        setIsVideoPermitted(false)
      }
    }

    micStatus.onchange = async function (e) {
      if (e.target.state === 'granted') {
        const flag = await askForPermissions()
        if (flag) sendLogRequest(meetingId, 'info', 'Audio permissions granted')
        else sendLogRequest(meetingId, 'error', 'Audio permissions not granted')
        setIsAudioPermitted(flag)
      } else {
        sendLogRequest(meetingId, 'error', 'Audio permissions not granted')
        setIsAudioPermitted(false)
      }
    }
  }

  useEffect(() => {
    if (testerStream !== null) {
      displayVideoRef.current.srcObject = testerStream
      displayVideoRef.current.muted = true
    }

    return () => {
      testerStream?.getTracks().forEach(track => track.stop())
    }
  }, [testerStream])

  return (
    <div>
      <p
        style={{
          fontSize: '1.15em'
        }}
      >
        <b>Do not use external headphones/earphones</b>
      </p>

      {!isVideoPermitted && !isAudioPermitted && (
        <button
          style={{
            fontSize: '1.25rem'
          }}
          onClick={permissionsInit}
          className='btn btn-success rounded-pill px-4 py-2'
        >
          Test microphone and camera
        </button>
      )}
      {testerStream && (
        <>
          <div className='mt-3'>
            <p className='mb-1 text-center'>
              <small>
                <i>Say somthing to test your microphone</i>
              </small>
            </p>
            <div className='p-2 bg-light w-100 rounded-3 d-flex flex-column justify-content-center align-items-center'>
              <AudioWaveForm mediaStream={testerStream} />
            </div>
          </div>

          <video
            ref={displayVideoRef}
            className='mt-3 align-self-center'
            autoPlay={true}
            width={'200px'}
          ></video>
        </>
      )}
    </div>
  )
}

export default SingleTester
