import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { InterviewContext } from '../contexts/InteviewContextProvider'
// import Button from './Button'

function MeetingIdInput ({ setOpenJoinInterviewModel }) {
  const [errorMsg, setErrorMsg] = useState('')
  const { meetingId, setMeetingId } = useContext(InterviewContext)
  const navigate = useNavigate()

  // const test_api_id = '71d8296a-0613-4304-b0b3-636e831786dc'
  // const test_api_id = '1bf5264d-5b1a-45f1-9fe6-3ecc26cad5c9'

  useEffect(() => {
    setMeetingId('')
  }, [])

  function handleClick () {
    if (meetingId === '') {
      setErrorMsg('Enter a valid meeting ID')
      return
    }

    setErrorMsg('')
    setMeetingId(meetingId)
    navigate(`/interview-dash`)
  }

  return (
    <div
      style={{ maxWidth: '400px' }}
      className='bg-white d-flex justify-content-center p-5 w-100 rounded-3'>
      <div className='w-100'>
        <p style={{ fontSize: '1.15em' }}>
          <b>Do not use external headphones/earphones</b>
        </p>
        <input
          required
          value={meetingId}
          onChange={e => {
            if (errorMsg !== '') setErrorMsg('')
            setMeetingId(e.target.value.trim())
          }}
          type='text'
          placeholder='Enter Meeting ID'
          className='rounded-pill form-control border-1 w-100 px-2 py-2 text-center'
        />
        <small className='text-danger'>{errorMsg}</small>
        <br />
        <div className='d-flex gap-3 flex-column'>
          <button
            onClick={handleClick}
            style={{ border: 'none', background: '#1A73E8' }}
            className='rounded-pill text-white w-100 px-4 py-2'>
            Enter Interview Room
          </button>

          <button
            className='rounded-pill border-0 px-4 py-2 text-white bg-danger w-100'
            onClick={() => {setOpenJoinInterviewModel(prev => !prev)}}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default MeetingIdInput

{
  /* <Button
            handleClick={handleClick}
            buttonClass='w-100'
            buttonTitle='Enter Interview Room'
          /> */
}
