import { useState, useEffect, useRef, useContext } from 'react'
import { InterviewContext } from '../../contexts/InteviewContextProvider'
import AudioWaveForm from '../AudioWaveForm'
import ReactTooltip from 'react-tooltip'
import { sendLogRequest } from '../../utils/logger'

function PermitModal ({ device }) {
  return (
    <div
      style={{
        overflow: 'hidden',
        // position: 'fixed',
        zIndex: '99',
        position: 'fixed',
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
          Provide access to <b>{device}</b> in order to proceed with the
          interview
        </h5>
      </div>
    </div>
  )
}

// async function getDevice(label) {
//   const devices = navigator.mediaDevices.enumerateDevices()

// }

function RootTester ({
  isAudioPermitted,
  setIsAudioPermitted,
  isVideoPermitted,
  setIsVideoPermitted,
  checks,
  setChecks
}) {
  const displayVideoRef = useRef(null)

  const { meetingId } = useContext(InterviewContext)

  const [audioMS, setAudioMS] = useState(null)
  const [videoMS, setVideoMS] = useState(null)
  // let audioMS = null
  // let videoMS = null

  async function handleAudioDevices () {
    let audioFlag = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true
      })
      sendLogRequest(meetingId, 'info', 'Audio Permissions permitted')
      setAudioMS(stream)
      audioFlag = true
    } catch (e) {
      sendLogRequest(
        meetingId,
        'error',
        `Audio Permissions denied\n${e.toString()}`
      )
      console.log(e)
      audioFlag = false
    } finally {
      return audioFlag
    }
  }

  async function handleVideoDevices () {
    let videoFlag = false
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true
      })
      sendLogRequest(meetingId, 'info', 'Video Permissions permitted')
      setVideoMS(stream)
      videoFlag = true
    } catch (e) {
      sendLogRequest(meetingId, 'error', 'Video Permissions denied')
      console.error(e)
      videoFlag = false
    } finally {
      return videoFlag
    }
  }

  async function audioInit () {
    const status = await navigator.permissions.query({
      name: 'microphone'
    })

    if (status.state === 'granted' || status.state === 'prompt') {
      const flag = await handleAudioDevices()
      console.log(105, flag)
      setIsAudioPermitted(flag)
    }

    // handleAudioDevices().then(flag => {
    // })
    else setIsAudioPermitted(false)

    status.onchange = async e => {
      if (e.target.state === 'granted') {
        const flag = await handleAudioDevices()
        console.log(116, flag)
        setIsAudioPermitted(flag)
      } else setIsAudioPermitted(false)
    }
  }

  async function videoInit () {
    const status = await navigator.permissions.query({
      name: 'camera'
    })

    if (status.state === 'granted' || status.state === 'prompt') {
      const flag = await handleVideoDevices()
      setIsVideoPermitted(flag)
      console.log(134, flag)
    } else setIsVideoPermitted(false)

    status.onchange = async e => {
      console.log(e)

      if (e.target.state === 'granted') {
        const flag = await handleVideoDevices()
        setIsVideoPermitted(flag)
        console.log(147, flag)
      } else setIsVideoPermitted(false)
    }
  }

  useEffect(() => {
    if (videoMS !== null) {
      displayVideoRef.current.srcObject = videoMS
      displayVideoRef.current.muted = true
    }
    return () => {
      videoMS?.getTracks().forEach(track => track.stop())
      console.log(videoMS?.getTracks())
    }
  }, [videoMS])

  useEffect(() => {
    return () => {
      audioMS?.getTracks().forEach(track => track.stop())
      console.log(audioMS?.getTracks())
    }
  }, [audioMS])

  useEffect(() => {
    console.log(158, isAudioPermitted, isVideoPermitted)

    // return () => {
    //   console.log(audioMS?.getTracks())
    //
    //   console.log(videoMS?.getTracks())
    //   // console.log('Stopped video tracks')
    // }
  }, [])

  return (
    <>
      {isAudioPermitted === false && <PermitModal device={'microphone'} />}
      {isVideoPermitted === false && <PermitModal device={'camera'} />}

      <div>
        <div className='card p-3 d-flex flex-column'>
          <div className='form-check d-flex gap-4'>
            <input
              onChange={e => {
                setChecks(prev => {
                  return {
                    ...prev,
                    check1: e.target.checked
                  }
                })
              }}
              type='checkbox'
              name='default-audio-input'
              id='default-audio-input'
              className='form-check-input'
            />

            <label htmlFor='default-audio-input' className='form-check-label'>
              Do not plug in headphone/earphone.
            </label>
          </div>
          <hr
            style={{
              margin: '0.75rem'
            }}
          />
          <div
            data-tip
            data-for='audio-permission-tooltip'
            className='d-flex form-check gap-4'
          >
            {!isAudioPermitted && (
              <ReactTooltip
                id='audio-permission-tooltip'
                place='left'
                effect='solid'
                type='dark'
              >
                <p className='m-0 px-1'>Enable microphone permissions</p>
              </ReactTooltip>
            )}

            <>
              <input
                disabled={!isAudioPermitted}
                onChange={e => {
                  setChecks(prev => {
                    return {
                      ...prev,
                      check2: e.target.checked
                    }
                  })
                }}
                type='checkbox'
                name='default-audio-input-test'
                id='default-audio-input-test'
                className='form-check-input'
              />

              {/* {(isAudioPermitted === null || isAudioPermitted === false) && ( */}
            </>
            {/* )} */}

            <div className='d-flex flex-column w-100 justify-content-start align-items-start'>
              <div className='d-flex justify-content-between align-items-start w-100'>
                <label
                  htmlFor='default-audio-input-test'
                  className='form-check-label'
                >
                  Test Your Microphone
                </label>
                <button
                  onClick={async () => {
                    await audioInit()
                  }}
                  className=' btn btn-sm btn-success px-4'
                >
                  Test
                </button>
              </div>
              {audioMS && (
                <div className='mt-3'>
                  <p className='mb-1 text-start'>
                    <small>
                      <i>Say somthing to test your microphone</i>
                    </small>
                  </p>
                  <div className='p-2 bg-light w-100 rounded-3 d-flex flex-column justify-content-center align-items-center'>
                    <AudioWaveForm mediaStream={audioMS} />
                  </div>
                </div>
              )}
            </div>
          </div>
          <hr
            style={{
              margin: '0.75rem'
            }}
          />
          <div
            data-tip
            data-for='video-permission-tooltip'
            className='d-flex form-check gap-4'
          >
            {!isVideoPermitted && (
              <ReactTooltip
                id='video-permission-tooltip'
                place='left'
                effect='solid'
                type='dark'
              >
                <p className='m-0 px-1'>Enable camera permissions</p>
              </ReactTooltip>
            )}
            <>
              <input
                disabled={!isVideoPermitted}
                onChange={e => {
                  setChecks(prev => {
                    return {
                      ...prev,
                      check3: e.target.checked
                    }
                  })
                }}
                type='checkbox'
                name='default-video-input-test'
                id='default-video-input-test'
                className='form-check-input'
              />
              {/* {(isVideoPermitted === null || isVideoPermitted === false) && ( */}
            </>
            {/* )} */}
            <div className='d-flex flex-column w-100 justify-content-start align-items-start'>
              <div className='d-flex justify-content-between align-items-start w-100'>
                <label
                  htmlFor='default-video-input-test'
                  className='form-check-label'
                >
                  Test Your Camera
                </label>
                <button
                  onClick={async () => {
                    await videoInit()
                  }}
                  className='btn btn-sm btn-success px-4'
                >
                  Test
                </button>
              </div>

              {videoMS && (
                <video
                  ref={displayVideoRef}
                  className='mt-3 align-self-center'
                  autoPlay={true}
                  width={'200px'}
                ></video>
              )}

              {/* {audioMS && <AudioWaveForm mediaStream={audioMS} />} */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default RootTester
