import { useState, useEffect, useRef, useContext } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'

function AudioPlayer ({ audioRef }) {
  const [play, setPlay] = useState(false)

  useEffect(() => {
    if (audioRef) {
      if (play == false) audioRef.current.pause()
      else audioRef.current.play()
    } else {
      console.log('AudioRef is null')
    }
  }, [play])

  return (
    <div
      style={{
        flex: '2'
      }}
      className='w-100'
    >
      <i
        onClick={() => {
          setPlay(prev => !prev)
        }}
        style={{
          fontSize: '1.5em',
          cursor: 'pointer'
        }}
        className={play ? 'bi bi-pause-circle-fill' : 'bi bi-play-circle-fill'}
      ></i>

      <audio
        hidden
        onEnded={() => {
          setPlay(false)
        }}
        controlsList='nodownload'
        src='https://rysyl-characters.s3.ap-south-1.amazonaws.com/notification-6175.mp3'
        ref={audioRef}
      ></audio>
    </div>
  )
}

function AudioOutputTester ({ audioOutputDevices }) {
  const [chosenDeviceId, setChosenDeviceId] = useState(0)
  const audioRef = useRef(null)
  const { setMediaDeviceConfig } = useContext(InterviewContext)

  useEffect(() => {
    if (audioOutputDevices && audioOutputDevices.length > 0) {
      setMediaDeviceConfig(prev => {
        return {
          ...prev,
          audiooutput: {
            deviceId: audioOutputDevices[chosenDeviceId].deviceId,
            label: audioOutputDevices[chosenDeviceId].label
          }
        }
      })
    }

    async function handleChange () {
      if (audioOutputDevices && audioOutputDevices.length > 0)
        audioRef.current.setSinkId(audioOutputDevices[chosenDeviceId].deviceId)
    }

    handleChange().then(() => {})
  }, [audioOutputDevices, chosenDeviceId])

  return (
    <div className='d-flex card-footer p-2 pt-2 bg-white flex-column w-100 justify-content-evenly align-items-center'>
      <h6 className='m-0 mb-2'>Audio Output</h6>
      <div className='d-flex w-100 gap-4 flex-column flex-md-row justify-content-center align-items-center'>
        <select
          onChange={e => {
            console.log('Select changed')
            setChosenDeviceId(e.target.value)
          }}
          style={{ fontSize: '0.85em', flex: '3' }}
          value={chosenDeviceId}
          className='form-select w-100'
          name='device-select'
          id='device-select'
        >
          {audioOutputDevices.map((device, idx) => {
            return (
              <option value={idx} key={device.deviceId}>
                {device.label}
              </option>
            )
          })}
        </select>

        <AudioPlayer audioRef={audioRef} />
      </div>
    </div>
  )
}

// function AudioOutputTester () {
//   const audioRef = useRef(null)
//   const [audioOutputDevices, setaudioOutputDevices] = useState([])
//   const [chosenDeviceId, setchosenDeviceId] = useState(0)

//   const { setMediaDeviceConfig } = useContext(InterviewContext)
//   useEffect(() => {
//     // audioRef.current.src =

//     navigator.mediaDevices
//       .getUserMedia({
//         audio: true
//       })
//       .then(stream => {
//         navigator.mediaDevices.enumerateDevices().then(devices => {
//           const audio_output_devices = devices.filter(
//             device => device.kind === 'audiooutput'
//           )
//           setaudioOutputDevices(audio_output_devices)
//         })

//         navigator.mediaDevices.ondevicechange = function () {
//           if (count === 0) {
//             count += 1
//             return
//           }
//           navigator.mediaDevices.enumerateDevices().then(devices => {
//             const audio_output_devices = devices.filter(
//               device => device.kind === 'audiooutput'
//             )
//             setaudioOutputDevices(audio_output_devices)
//           })
//           count = 0
//         }
//       })

//     return () => {}
//   }, [])

//   return (
//     <div className='d-flex gap-3 card-footer p-2 pt-4 bg-white flex-column w-100 justify-content-evenly align-items-center'>
//       {audioOutputDevices.length > 0 && (
//         <>
//           <h4 className='m-0'>Audio Output</h4>
//           <div className='d-flex w-100 gap-4 flex-column flex-md-row justify-content-center align-items-center'>
//             <select
//               onChange={e => {
//                 console.log('Select changed')
//                 setchosenDeviceId(e.target.value)
//               }}
//               value={chosenDeviceId}
//               className='form-select w-100'
//               name='device-select'
//               id='device-select'
//             >
//               {audioOutputDevices.map((device, idx) => {
//                 return (
//                   <option value={idx} key={device.deviceId}>
//                     {device.label}
//                   </option>
//                 )
//               })}
//             </select>
//             <audio
//               controls
//               className='w-100'
//               controlsList='nodownload'
//               src='https://rysyl-characters.s3.ap-south-1.amazonaws.com/notification-6175.mp3'
//               ref={audioRef}
//             ></audio>
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

export default AudioOutputTester
