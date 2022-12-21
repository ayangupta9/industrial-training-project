import React, { useEffect, useRef, useState } from 'react'
import AudioWaveForm from '../components/AudioWaveForm'

let count = 0

function TestPage () {
  const [mediaDevices, setMediaDevices] = useState([])
  const displayVideoRef = useRef(null)

  const [chosenDevice, setChosenDevice] = useState(0)
  const [mediaStream, setMediaStream] = useState(null)

  const [deviceFlag, setDeviceFlag] = useState(null)

  const [defaultDevice, setDefaultDevice] = useState(null)

  useEffect(() => {
    if (mediaStream === null) {
      navigator.mediaDevices
        .getUserMedia({
          video: true,
          audio: true
        })
        .then(async stream => {
          const audioTrack = stream.getAudioTracks()[0]

          setDefaultDevice(audioTrack)
          setMediaStream(stream)

          console.log(audioTrack)

          return audioTrack
        })
        .then(audioTrack => {
          navigator.mediaDevices.ondevicechange = async function (e) {
            if (count === 0) {
              count += 1
              return
            }

            const devices = (
              await navigator.mediaDevices.enumerateDevices()
            ).filter(device => device.label === audioTrack.label)

            console.log(devices)

            if (devices.length === 0) setDeviceFlag(true)
            else setDeviceFlag(false)

            count = 0
          }
        })
    }
  }, [mediaStream])

  return (
    <div className='m-5 d-flex flex-column gap-4 justify-content-center align-items-center'>
      {deviceFlag === true && (
        <div
          style={{
            top: '0',
            left: '0',
            position: 'absolute',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            height: '100%',
            background: 'rgba(0,0,0,0.5)'
          }}
        >
          <div
            style={{
              maxWidth: '300px',
              width: '100%',
              padding: '2rem',
              borderRadius: '15px',
              backgroundColor: 'white'
            }}
          >
            <h1>
              Please use the default <code>audioinput</code> device
            </h1>
          </div>
        </div>
      )}

      <div
        style={{
          maxWidth: '900px'
        }}
      >
        <h1 className='mb-4'>Test Header</h1>

        <img
          className='mx-5 float-end'
          width={200}
          src='/assets/images/warning.svg'
          alt=''
        />

        <p className='text-start'>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Aliquid odit
          magnam, harum porro veniam repellat animi ad odio vel ratione. Aliquid
          ut fuga, provident iste ex fugit. Dolorum obcaecati earum laboriosam
          incidunt minima deserunt eaque dolore hic! Minima repellendus eaque
          nemo optio ratione dolorem amet repellat. Sint possimus tempora
          accusantium.
        </p>

        <p className='text-start'>
          Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptates
          at dolorum sit non sunt. Suscipit consequuntur dolor aperiam quia
          debitis inventore aliquid, nulla dolore officiis expedita culpa
          perferendis sequi hic?
        </p>
      </div>

      {/* {mediaDevices.length > 0 && mediaStream && (
        <>
          <select
            onChange={e => {
              console.log('Select changed')
              setChosenDevice(e.target.value)
            }}
            value={chosenDevice}
            className='form-select-lg'
            name='device-select'
            id='device-select'
          >
            {mediaDevices.map((device, idx) => {
              return (
                <option value={idx} className='' key={device.deviceId}>
                  {device.label}
                </option>
              )
            })}
          </select>
          <div className='p-2 bg-light rounded-3 d-flex justify-content-center align-items-center'>
            <AudioWaveForm mediaStream={mediaStream} />
          </div>
          <button className='btn btn-outline-dark'>CHOOSE THIS DEVICE</button>
        </>
      )} */}
    </div>
  )
}

export default TestPage
