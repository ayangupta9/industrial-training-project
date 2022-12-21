import { useState, useEffect, useContext } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'
import useIndexedDB from '../hooks/useIndexedDB'
import { collectApplicationData } from '../utils/ResponseVideoFunctions'
import { useNavigate } from 'react-router-dom'
import ReactTooltip from 'react-tooltip'
import HeaderDescription from '../components/Header.Description'
import { sendLogRequest } from '../utils/logger'
import SingleTester from '../components/device-test-components/SingleTester'
import { isMobile } from 'react-device-detect'
import '../styles/InterviewDash.css'

function LoaderComponent () {
  return (
    <div>
      <h3>Preparing interview assets. Please wait.</h3>
      <br />
      <div
        style={{
          width: '100px',
          height: '100px'
        }}
        className='spinner-border'
        role='status'
      >
        <span className='visually-hidden'>Loading...</span>
      </div>
    </div>
  )
}

function Dash () {
  const STORE_NAME = 'cached-videos-store'
  const navigate = useNavigate()
  const [isFetchingVideos, setIsFetchingVideos] = useState(true)
  const [isAudioPermitted, setIsAudioPermitted] = useState(null)
  const [isVideoPermitted, setIsVideoPermitted] = useState(null)

  const {
    meetingId,
    videosUri,
    setVideosUri,
    setInterviewDescription,
    setInterviewQuestions,
    setResponseVideoIndex,
    setSessionData
  } = useContext(InterviewContext)

  const accessIDB = useIndexedDB(STORE_NAME)

  useEffect(() => {
    async function fetchData () {
      let video_blobs
      try {
        video_blobs = await collectApplicationData(
          accessIDB,
          meetingId,
          setInterviewDescription,
          setSessionData,
          setInterviewQuestions,
          setResponseVideoIndex
        )
        console.log(video_blobs)
      } catch (e) {
      } finally {
        if (video_blobs) {
          setVideosUri(video_blobs)
          sendLogRequest(meetingId,'info','Fetched all videos.\nIn Ready state now')
          return false
        } else {
          sendLogRequest(meetingId, 'error', 'Could not fetch videos')
          console.error('Could not fetch videos')
          return true
        }
      }
    }

    async function init () {
      if (!isMobile) {
        if (meetingId === '') {
          navigate('/', { replace: true })
        } else {
          sendLogRequest(meetingId, 'info', 'Preparing interview assets now')

          if (videosUri.length === 0) {
            try {
              const flag = await fetchData()
              setIsFetchingVideos(flag)
            } catch (e) {
              console.error(e)
            }
          } else {
            setIsFetchingVideos(true)
          }
        }
      }
    }

    init()

    return () => {}
  }, [])

  return (
    <div className='d-flex flex-column justify-content-start align-items-center w-100 h-100'>
      {!isMobile ? (
        <>
          <HeaderDescription />
          <div
            style={{ height: 'min-content' }}
            className='d-flex w-100 mt-2 my-md-0 flex-column justify-content-start justify-content-md-center'
          >
            <div className='d-flex w-100  p-4 gap-5 flex-column flex-lg-row justify-content-evenly align-items-center'>
              <div className='h-100 d-flex justify-content-center align-items-center gap-5 flex-column'>
                {isFetchingVideos ? (
                  <LoaderComponent />
                ) : (
                  <h1>
                    Your interview session is ready.
                    <br /> All the best!
                  </h1>
                )}
              </div>

              <div className='d-flex flex-column gap-4 justify-content-center align-items-center h-100'>
                <SingleTester
                  isAudioPermitted={isAudioPermitted}
                  setIsAudioPermitted={setIsAudioPermitted}
                  isVideoPermitted={isVideoPermitted}
                  setIsVideoPermitted={setIsVideoPermitted}
                />
              </div>
            </div>

            <div data-tip data-for='join-interview-btn-tooltip'>
              <button
                onClick={async () => {
                  sendLogRequest(meetingId, 'info', 'Entering session now')
                  navigate('/interview-session')
                }}
                disabled={
                  isFetchingVideos === true ||
                  !isAudioPermitted ||
                  !isVideoPermitted
                }
                style={{ fontSize: '1.5rem' }}
                className={
                  'button rounded-pill px-4 py-2 ' +
                  (isFetchingVideos === false &&
                  isVideoPermitted &&
                  isAudioPermitted
                    ? 'mb-4 join-interview-btn'
                    : 'mb-4 disabled-button')
                }
              >
                Join Interview Session
              </button>
            </div>

            {(isFetchingVideos === true ||
              !isAudioPermitted ||
              !isVideoPermitted) && (
              <ReactTooltip
                id='join-interview-btn-tooltip'
                place='top'
                effect='solid'
                type='dark'
              >
                <p className='m-0 px-1'>
                  Test Microphone and Camera before joining
                </p>
              </ReactTooltip>
            )}
          </div>
        </>
      ) : (
        <div className='d-flex h-100 w-100 justify-content-center align-items-center'>
          <h3 className='text-dark'>
            The portal is only supported on desktop/laptop currently.
          </h3>
        </div>
      )}
    </div>
  )
}

export default Dash

// import Button from '../components/Button'
// import DeviceTester from '../components/DeviceTester'
// import AudioOutputTester from '../components/AudioOutputTester'
// import RootTester from '../components/device-test-components/RootTester'

// const [checks, setChecks] = useState({
//   check1: false,
//   check2: false,
//   check3: false
// })

// useEffect(() => {
//   if (checks.check1 && checks.check2 && checks.check3) {
//     sendLogRequest(meetingId, 'info', 'All checks cleared')
//   }
//   setShowError(false)
// }, [checks])

{
  /* <RootTester
                  isAudioPermitted={isAudioPermitted}
                  setIsAudioPermitted={setIsAudioPermitted}
                  isVideoPermitted={isVideoPermitted}
                  setIsVideoPermitted={setIsVideoPermitted}
                  checks={checks}
                  setChecks={setChecks}
                /> */
}
