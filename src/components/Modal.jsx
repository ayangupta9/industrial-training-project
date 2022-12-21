import React from 'react'

function Modal ({ children, open }) {
  return (
    <>
      {open && (
        <div
          style={{
            position: 'absolute',
            backgroundColor: 'rgba(0,0,0,0.5)',
            marginTop: '-60px',
            zIndex: '100'
          }}
          className='d-flex justify-content-center w-100 h-100 align-items-center'
        >
          {children}
        </div>
      )}
    </>
  )
}

export default Modal
