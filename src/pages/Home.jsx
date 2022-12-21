import { useState } from 'react'
import ApplicationId from '../components/MeetingId.input'
// import Button from '../components/Button'
import Modal from '../components/Modal'
// import { InterviewContext } from '../contexts/InteviewContextProvider'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import InterviewFrontImage from '../assets/vectors/interview-front.svg'
// import dateFormat from 'date-format'
import {
  faBan,
  faCamera,
  faComputer,
  faHeadphones,
  faLaptop,
  faMicrophone,
  faStopCircle
} from '@fortawesome/free-solid-svg-icons'

import { library } from '@fortawesome/fontawesome-svg-core'
import { faChrome } from '@fortawesome/free-brands-svg-icons'

library.add(
  faLaptop,
  faChrome,
  faHeadphones,
  faStopCircle,
  faBan,
  faCamera,
  faMicrophone,
  faComputer
)

// import TestPage from './Test.page'

function InstructionsGrid () {
  return (
    <>
      <div className='instructions-group d-flex flex-column gap-4'>
        <div className='instruction-group-row d-flex flex-row gap-4'>
          <div className='instruction-card bg-white p-4'>
            {/* <FontAwesomeIcon icon='fa-light fa-laptop' /> */}
            <FontAwesomeIcon size='4x' icon={faComputer} />
            <p className='pt-4'>
              <b>Take the interview on a desktop/laptop</b>
            </p>
          </div>
          <div className='instruction-card bg-white p-4'>
            <FontAwesomeIcon size='4x' icon={faChrome} />

            <p className='pt-4'>
              <b>Use Google Chrome for taking the interview</b>
            </p>
          </div>
        </div>
        <div className='instruction-group-row d-flex flex-row gap-4'>
          <div className='instruction-card bg-white p-4'>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <FontAwesomeIcon color='red' size='4x' icon='ban' />
              <FontAwesomeIcon
                style={{
                  position: 'absolute'
                }}
                size='2x'
                icon={faHeadphones}
              />
            </div>

            <p className='pt-4'>
              <b>Do not use external headphones/earphones</b>
            </p>
          </div>
          <div className='instruction-card bg-white p-4'>
            <div className='d-flex flex-row gap-4 justify-content-center align-items-center'>
              <FontAwesomeIcon size='4x' icon={faMicrophone} />
              <FontAwesomeIcon size='4x' icon={faCamera} />
            </div>

            <p className='pt-4'>
              <b>Make sure Microphone and Camera are working</b>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

function Home () {
  const [openJoinInterviewModel, setOpenJoinInterviewModel] = useState(false)

  // useEffect(() => {
  //   console.log(dateFormat('yyyy-mm-dd hh:MM:ss'))
  // }, [])

  return (
    <>
      <Modal
        open={openJoinInterviewModel}
        children={
          <ApplicationId
            setOpenJoinInterviewModel={setOpenJoinInterviewModel}
          />
        }
      />
      <div className='container h-100 '>
        <div className='d-flex flex-column h-100 justify-content-evenly align-items-center flex-md-row'>
          <div className='flex-grow-1 w-100 d-flex flex-column align-items-center'>
            <InstructionsGrid />

            <button
              onClick={() => {
                setOpenJoinInterviewModel(prev => !prev)
              }}
              style={{
                backgroundColor: '#1A73E8',
                outline: 'none',
                border: 'none'
              }}
              className='rounded-pill text-white px-4 py-2 mt-5 w-50'
            >
              Join Interview Session
            </button>
          </div>
          <div className='rounded-3 align-items-center d-flex flex-column flex-grow-1 w-100'>
            {/* <InterviewFrontImage /> */}
            <img
              style={{
                width: '80%'
              }}
              src={InterviewFrontImage}
              alt=''
            />
          </div>
        </div>
      </div>
    </>
  )
}

export default Home

{
  /* <Button
              handleClick={() => {
              }}
              buttonTitle='JOIN INTERVIEW SESSION'
              buttonClass={'w-50'}
            /> */
}
{
  /* <hr className='w-50 my-3' /> */
}
{
  /* <ul className='w-50 text-start ms-4 list-group'>
              <li>Take the interview on a desktop/laptop.</li>
              <li>Use Google Chrome for taking the interview.</li>
              <li>
                Make sure your Microphone and Camera are in working condition.
              </li>
            </ul> */
}
{
  /* <div
              style={{
                maxWidth: '500px'
              }}
              className='content text-center d-flex w-100 h-100 justify-content-center align-items-center flex-column'
            >
               <h1 className='fw-bold display-3'>INTERVIEW PORTAL</h1> 
            </div> */
}
