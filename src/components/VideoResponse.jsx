import React, { useContext, useEffect, useRef } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'
import RecordingStopwatch from './RecordingStopwatch'

const videoStyle = {
  left: '0',
  right: '0',
  top: '0',
  marginLeft: 'auto',
  marginRight: 'auto'
}

function VideoResponse ({
  isAudioOn,
  azureRec,
  isTranscriptOn,
  setSessionEnded
}) {
  const mainVideoRef = useRef(null)
  const bgVideoRef = useRef(null)

  const {
    videosUri,
    responseVideoIndex,
    isSameVideo,
    setIsSameVideo
  } = useContext(InterviewContext)

  useEffect(() => {
    async function init () {
      bgVideoRef.current.hidden = true
      bgVideoRef.current.src = videosUri[0]

      mainVideoRef.current.hidden = false
      mainVideoRef.current.src = videosUri[responseVideoIndex]
      mainVideoRef.current.autoPlay = true
    }

    init()
  }, [])

  function changeMainVideoSrc () {
    if (isSameVideo === true)
      mainVideoRef.current.src = videosUri[responseVideoIndex]
  }

  useEffect(() => {
    changeMainVideoSrc()
  }, [responseVideoIndex, isSameVideo])

  return (
    <>
      {azureRec && videosUri && (
        <div style={{ maxWidth: '800px' }} className='w-100'>
          <div className='position-relative w-100 h-100'>
            <div
              style={{ zIndex: '4' }}
              className='position-absolute right-0 top-0 p-2'
            >
              <RecordingStopwatch />
            </div>

            <video
              style={{
                ...videoStyle,
                zIndex: '3'
              }}
              ref={mainVideoRef}
              onPlaying={e => {
                if (azureRec) {
                  if (isTranscriptOn) {
                    isTranscriptOn = false
                    azureRec.stopContinuousRecognitionAsync(() => {
                      console.log('Stopped in Video Response')
                    })
                  }
                }
              }}
              onEnded={() => {
                if (responseVideoIndex === videosUri.length - 1) {
                  setSessionEnded(true)
                  return
                }

                if (isSameVideo) setIsSameVideo(false)
                if (azureRec) {
                  if (isAudioOn === true && !isTranscriptOn) {
                    isTranscriptOn = true
                    azureRec.startContinuousRecognitionAsync(() => {
                      console.log('Started in Video Response')
                    })
                  }
                }

                bgVideoRef.current.hidden = false
                bgVideoRef.current.loop = true
                bgVideoRef.current.play()

                mainVideoRef.current.hidden = true
                mainVideoRef.current.currentTime = 0
              }}
              onLoadedData={() => {
                bgVideoRef.current.pause()
                bgVideoRef.current.currentTime = 0
                bgVideoRef.current.hidden = true
                mainVideoRef.current.hidden = false
              }}
              className='rounded-3 w-100'
              autoPlay={true}
              src={videosUri[responseVideoIndex]}
              preload='auto'
            ></video>
            
            <video
              muted
              style={{ ...videoStyle, zIndex: '1' }}
              ref={bgVideoRef}
              className='rounded-3 w-100'
              src={videosUri[0]}
              preload='auto'
            ></video>
          
          </div>
        </div>
      )}
    </>
  )
}

export default VideoResponse
