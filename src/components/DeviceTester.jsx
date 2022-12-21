import { ConnectionClosedEvent } from 'microsoft-cognitiveservices-speech-sdk/distrib/lib/src/common/ConnectionEvents'
import React, { useContext, useEffect, useState } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'
// import Collapse from 'rc-collapse'
import AudioInputTester from './AudioInputTester'
import AudioOutputTester from './AudioOutputTester'
// import 'rc-collapse/assets/index.css'
// import { InterviewContext } from '../contexts/InteviewContextProvider'

function DeviceTester ({ isPermitted, setIsPermitted }) {
  const [audioInputDevices, setAudioInputDevices] = useState(null)
  const [audioOutputDevices, setAudioOutputDevices] = useState(null)

  let count = 0
  function setMediaDevices () {
    navigator.mediaDevices.enumerateDevices().then(devices => {
      const audioInput = devices.filter(device => device.kind === 'audioinput')
      setAudioInputDevices(audioInput)
      const audioOutput = devices.filter(
        device => device.kind === 'audiooutput'
      )
      setAudioOutputDevices(audioOutput)
    })
  }

  useEffect(() => {
    async function handleDevices () {
      navigator.mediaDevices
        .getUserMedia({
          audio: true
        })
        .then(() => {
          navigator.mediaDevices.enumerateDevices().then(devices => {
            const audioInput = devices.filter(
              device => device.kind === 'audioinput'
            )
            setAudioInputDevices(audioInput)
            const audioOutput = devices.filter(
              device => device.kind === 'audiooutput'
            )
            setAudioOutputDevices(audioOutput)
          })
        })
        .then(() => {
          navigator.mediaDevices.ondevicechange = () => {
            if (count === 0) {
              count += 1
              return
            }

            setMediaDevices()
            count = 0
          }
        })
        .catch(e => {
          setIsPermitted(false)
        })
    }

    async function init () {
      const permissionStatus = await navigator.permissions.query({
        name: 'microphone'
      })

      if (
        permissionStatus.state === 'granted' ||
        permissionStatus.state === 'prompt'
      ) {
        handleDevices().then(() => {
          setIsPermitted(true)
        })
      } else {
        setIsPermitted(false)
      }

      permissionStatus.addEventListener('change', e => {
        if (e.target.state === 'granted') {
          handleDevices().then(() => {
            setIsPermitted(true)
          })
        } else {
          setIsPermitted(false)
        }
      })
    }

    init()
  }, [])

  return (
    <>
      {isPermitted === false && (
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
              Provide access to microphone in order to proceed with the
              interview
            </h5>
          </div>
        </div>
      )}
      {isPermitted === true && (
        <div className='h-100 d-flex flex-column align-items-center justify-content-start gap-2 w-100'>
          <h5>Select Audio</h5>
          <div
            style={{
              maxWidth: '20rem'
            }}
            className='card w-100 p-1'
          >
            {audioInputDevices && (
              <AudioInputTester audioInputDevices={audioInputDevices} />
            )}
            {audioOutputDevices && (
              <AudioOutputTester audioOutputDevices={audioOutputDevices} />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default DeviceTester
