import React, { useEffect, useState } from 'react'

function RecordingStopwatch () {
  const [interviewTime, setInterviewTime] = useState(0)

  useEffect(() => {
    let interval
    interval = setInterval(() => {
      setInterviewTime(prevTime => prevTime + 1)
    }, 1000)
    // clearInterval(interval)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className='recorder-stopwatch'>
      <div className='rounded-2 bg-dark p-2 text-light'>
        <svg
          className='me-2'
          width='12'
          height='12'
          viewBox='0 0 12 12'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <circle cx='6' cy='6' r='6' fill='white' />
          <circle cx='6' cy='6' r='3' fill='#FB0242' />
        </svg>
        <span>
          {('0' + (Math.floor(interviewTime / 3600) % 60).toString()).slice(-2)}
          :
        </span>
        <span>
          {('0' + (Math.floor(interviewTime / 60) % 60).toString()).slice(-2)}:
        </span>
        <span>{('0' + (interviewTime % 60).toString()).slice(-2)}</span>
      </div>
    </div>
  )
}

export default RecordingStopwatch
