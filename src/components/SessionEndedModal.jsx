import React from 'react'
import { useNavigate } from 'react-router-dom'
import Button from './Button'

function SessionEndedModal () {
  // const navigate = useNavigate()

  return (
    <div
      style={{
        background: 'rgba(0,0,0,0.5)',
        marginTop: '-60px',
        zIndex: '100'
      }}
      className='position-absolute w-100 h-100 d-flex justify-content-center align-items-center'
    >
      <div
        style={{
          maxWidth: '400px'
        }}
        className='p-5 rounded-3 text-center w-100 text-dark bg-light m-4'
      >
        <h3>
          <b>THANK YOU!</b>
        </h3>
        <br />
        <br />
        <p>
          Thank you for the interview, the same has been shared with respective
          hiring managers.
        </p>
        {/* <Button
          handleClick={() => {
            navigate('/', { replace: true })
          }}
          buttonTitle={'Go to Home Page'}
        /> */}
      </div>
    </div>
  )
}

export default SessionEndedModal
