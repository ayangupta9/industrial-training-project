import React, { useContext } from 'react'
import { InterviewContext } from '../contexts/InteviewContextProvider'

function HeaderDescription () {
  const { interviewDescription } = useContext(InterviewContext)

  return (
    <div className='dash-header container-fluid d-flex flex-column flex-md-row justify-content-between px-4 pt-4'>
      <div className='job-desc d-flex flex-wrap gap-5'>
        <div className='company-name text-start'>
          <h4 className='mb-3 fw-bold'>Company Name</h4>
          <p>{interviewDescription.company_name}</p>
        </div>
        <div className='job-role text-start'>
          <h4 className='mb-3 fw-bold'>Job role</h4>
          <p>{interviewDescription.job_role}</p>
        </div>
        <div className='hiring-manager text-start'>
          <h4 className='mb-3 fw-bold'>Hiring Manager</h4>
          <p>{interviewDescription.hiring_manager}</p>
        </div>
      </div>
      <div className='interview-conductor text-start d-flex gap-3'>
        <div className='interviewer-image float-left'>
          {interviewDescription.character_thumbnail_link.length === 0 ? (
            <p>Loading...</p>
          ) : (
            <img
              style={{
                maxHeight: '100px'
              }}
              className='h-100'
              src={interviewDescription.character_thumbnail_link}
              alt='Interview conductor'
            />
          )}
        </div>
        <div className='interviewer-desc'>
          <p className='fw-bold'>Interview Conductor</p>
          <p>{interviewDescription.interview_character_name}</p>
        </div>
      </div>
    </div>
  )
}

export default HeaderDescription
