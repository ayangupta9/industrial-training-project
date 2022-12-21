import React from 'react'
import { Link } from 'react-router-dom'

function ErrorRoute () {
  return (
    <div className='w-100 h-100 d-flex flex-column justify-content-center align-items-center'>
      <h1 className='fw-bold display-1 '>404 PAGE NOT FOUND</h1>
      <p>Seems like you're a little lost. Let us help you.</p>

      <Link to={'/'} replace={true}>
        <button className='button rounded-pill px-4 py-2'>Back to Home</button>
      </Link>
    </div>
  )
}

export default ErrorRoute
