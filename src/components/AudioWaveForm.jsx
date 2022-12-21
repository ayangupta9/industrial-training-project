import React, { useEffect, useRef } from 'react'
import Oscilloscope from 'oscilloscope'

function AudioWaveForm ({ mediaStream }) {
  const analysisCanvasRef = useRef(null)

  useEffect(() => {
    const audioCtx = new AudioContext()
    const source = audioCtx.createMediaStreamSource(mediaStream)
    const scope = new Oscilloscope(source)

    const ctx = analysisCanvasRef.current.getContext('2d')
    ctx.lineWidth = 4
    ctx.strokeStyle = 'black' //color of candle/bar
    scope.animate(ctx)

    return () => {
      scope.stop()
    }
  }, [mediaStream])

  return (
    <>
      <canvas
        ref={analysisCanvasRef}
        id='output'
        height={'70px'}
        className='w-100'
      ></canvas>
    </>
  )
}

export default AudioWaveForm

// let analyser = null
// let data = null
// useEffect(() => {
//   function getAudioAnalysisData (stream) {
//     const audioCtx = new AudioContext()
//     analyser = audioCtx.createAnalyser()
//     analyser.fftSize = 2048
//     const audioSrc = audioCtx.createMediaStreamSource(stream)
//     audioSrc.connect(analyser)
//     data = new Uint8Array(analyser.frequencyBinCount)
//   }

//   function drawAnalysis (dataParm) {
//     const ctx = analysisCanvasRef.current.getContext('2d')
//     dataParm = [...dataParm]
//     ctx.fillStyle = 'white' //white background
//     ctx.lineWidth = 2
//     ctx.strokeStyle = '#d5d4d5' //color of candle/bar
//     const space = analysisCanvasRef.current.width / dataParm.length
//     dataParm.forEach((value, i) => {
//       ctx.beginPath()
//       ctx.moveTo(space * i, analysisCanvasRef.current.height)
//       ctx.lineTo(space * i, analysisCanvasRef.current.height - value)
//       ctx.stroke()
//     })
//   }

//   const loopingFunction = () => {
//     requestAnimationFrame(loopingFunction)
//     analyser.getByteFrequencyData(data)
//     drawAnalysis(data)
//   }

//   getAudioAnalysisData(mediaStream)
//   requestAnimationFrame(loopingFunction)
// }, [mediaStream])
