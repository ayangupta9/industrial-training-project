import React, { useState, useRef, useEffect, useContext } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'
import AudioWaveForm from './AudioWaveForm'

function AudioInputTester ({ audioInputDevices }) {
  const [chosenDeviceId, setChosenDeviceId] = useState(0)
  const [mediaStream, setMediaStream] = useState(null)

  const { setMediaDeviceConfig } = useContext(InterviewContext)

  useEffect(() => {
    return () => {
      if (mediaStream) mediaStream.getTracks().forEach(track => track.stop())
    }
  }, [])

  useEffect(() => {
    if (audioInputDevices && audioInputDevices.length > 0) {
      if (mediaStream) {
        // console.log(mediaStream)
        mediaStream.getTracks().forEach(track => track.stop())
      }

      navigator.mediaDevices
        .getUserMedia({
          audio: {
            deviceId: audioInputDevices[chosenDeviceId]?.deviceId,
            groupId: audioInputDevices[chosenDeviceId]?.groupId
          }
        })
        .then(stream => {
          setMediaStream(stream)
          setMediaDeviceConfig(prev => {
            return {
              ...prev,
              audioinput: {
                deviceId: audioInputDevices[chosenDeviceId].deviceId,
                groupId: audioInputDevices[chosenDeviceId].groupId,
                label: audioInputDevices[chosenDeviceId].label
              }
            }
          })
        })
    }
  }, [audioInputDevices, chosenDeviceId])

  return (
    <>
      <div className='d-flex card-header bg-white p-2 w-100 flex-column justify-content-evenly align-items-center'>
        <h6 className='m-0 mb-2'>Audio Input</h6>
        <div className='d-flex w-100 gap-2 flex-column flex-md-row justify-content-center align-items-center'>
          <select
            onChange={e => {
              console.log('Select changed')
              setChosenDeviceId(e.target.value)
            }}
            value={chosenDeviceId}
            style={{
              flex: '3',
              fontSize: '0.85em'
            }}
            className='form-select w-100'
            name='device-select'
            id='device-select'
          >
            {audioInputDevices.map((device, idx) => {
              return (
                <option value={idx} key={device.deviceId}>
                  {device.label}
                </option>
              )
            })}
          </select>

          {mediaStream ? (
            <div
              style={{
                flex: '2'
              }}
              className='p-2 bg-light w-100 rounded-3 d-flex justify-content-center align-items-center'
            >
              <AudioWaveForm mediaStream={mediaStream} />
            </div>
          ) : (
            <div className='spinner-border' role='status'>
              <span className='visually-hidden'>Loading...</span>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

// function AudioInputTester () {
//   const [chosenDeviceId, setChosenDeviceId] = useState(0)
//   const [mediaStream, setMediaStream] = useState(null)
//   const [mediaDevices, setMediaDevices] = useState([])
//   const { setMediaDeviceConfig } = useContext(InterviewContext)

//   useEffect(() => {
//     navigator.mediaDevices.getUserMedia(
//       {
//         audio: true
//       },
//       stream => {
//         navigator.mediaDevices.ondevicechange = function () {
//           console.log('Change in devices')
//           if (count === 0) {
//             count += 1
//             return
//           }
//           navigator.mediaDevices.enumerateDevices().then(devices => {
//             const audioInputDevices = devices.filter(
//               device => device.kind === 'audioinput'
//             )
//             setMediaDevices(audioInputDevices)
//           })
//           count = 0
//         }
//       }
//     )
//   }, [])

//   useEffect(() => {
//     if (mediaStream) {
//       mediaStream.getTracks().forEach(track => {
//         track.stop()
//       })
//       setMediaStream(null)
//     }
//     return () => {}
//   }, [chosenDeviceId])

//   useEffect(() => {
//     if (mediaStream === null && flag === true) {
//       navigator.mediaDevices
//         .getUserMedia({
//           audio:
//             mediaDevices[chosenDeviceId]?.deviceId &&
//             mediaDevices[chosenDeviceId]?.groupId
//               ? {
//                   deviceId: mediaDevices[chosenDeviceId].deviceId,
//                   groupId: mediaDevices[chosenDeviceId].groupId
//                 }
//               : true
//         })
//         .then(stream => {
//           setMediaStream(stream)
//           navigator.mediaDevices.enumerateDevices().then(devices => {
//             const audioInputDevices = devices.filter(
//               device => device.kind === 'audioinput'
//             )
//             setMediaDevices(audioInputDevices)
//             setMediaDeviceConfig(prev => {
//               return {
//                 ...prev,
//                 audioinput: {
//                   deviceId: audioInputDevices[chosenDeviceId].deviceId,
//                   groupId: audioInputDevices[chosenDeviceId].groupId,
//                   label: audioInputDevices[chosenDeviceId].label
//                 }
//               }
//             })
//           })
//         })
//     }
//   }, [mediaStream])

//   return (
//     <div className='d-flex card-header bg-white p-2 w-100 flex-column gap-3 justify-content-evenly align-items-center'>
//       {mediaDevices.length > 0 && (
//         <>
//           <h4 className='m-0'>Audio Input</h4>
//           <div className='d-flex w-100 gap-4 flex-column flex-md-row justify-content-center align-items-center'>
//             <select
//               onChange={e => {
//                 console.log('Select changed')
//                 setChosenDeviceId(e.target.value)
//               }}
//               value={chosenDeviceId}
//               className='form-select w-100'
//               name='device-select'
//               id='device-select'
//             >
//               {mediaDevices.map((device, idx) => {
//                 return (
//                   <option value={idx} key={device.deviceId}>
//                     {device.label}
//                   </option>
//                 )
//               })}
//             </select>

//             {mediaStream ? (
//               <div className='p-2 bg-light rounded-3 d-flex justify-content-center align-items-center'>
//                 <AudioWaveForm mediaStream={mediaStream} />
//               </div>
//             ) : (
//               <div className='spinner-border' role='status'>
//                 <span className='visually-hidden'>Loading...</span>
//               </div>
//             )}
//           </div>
//         </>
//       )}
//     </div>
//   )
// }

export default AudioInputTester
