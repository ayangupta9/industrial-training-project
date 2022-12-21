import React, { createContext, useState } from 'react'

export const InterviewContext = createContext({})

function InteviewContextProvider ({ children }) {
  const [meetingId, setMeetingId] = useState('')
  const [isRecognizerOn, setIsRecognizerOn] = useState(false)
  const [isInterviewerSpeaking, setIsInterviewerSpeaking] = useState(false)
  const [videosUri, setVideosUri] = useState([])
  const [responseVideoIndex, setResponseVideoIndex] = useState(2)
  const [isSameVideo, setIsSameVideo] = useState(false)
  const [interviewQuestions, setInterviewQuestions] = useState(null)
  const [mediaDeviceConfig, setMediaDeviceConfig] = useState({
    audioinput: {
      deviceId: null,
      groupId: null
    },
    videoinput: {
      deviceId: null,
      groupId: null
    }
  })
  const [sessionData, setSessionData] = useState({
    application_id: '',
    job_id: '',
    interview_start_timestamp: '',
    interview_end_timestamp: '',
    id: null
  })

  const [interviewDescription, setInterviewDescription] = useState({
    job_role: '',
    hiring_manager: '',
    company_name: '',
    interview_character_name: '',
    character_thumbnail_link: ''
  })

  return (
    <InterviewContext.Provider
      value={{
        interviewDescription: interviewDescription,
        setInterviewDescription: setInterviewDescription,
        meetingId: meetingId,
        setMeetingId: setMeetingId,
        videosUri: videosUri,
        setVideosUri: setVideosUri,
        responseVideoIndex: responseVideoIndex,
        setResponseVideoIndex: setResponseVideoIndex,
        isInterviewerSpeaking: isInterviewerSpeaking,
        setIsInterviewerSpeaking: setIsInterviewerSpeaking,
        isRecognizerOn: isRecognizerOn,
        setIsRecognizerOn: setIsRecognizerOn,
        mediaDeviceConfig: mediaDeviceConfig,
        setMediaDeviceConfig: setMediaDeviceConfig,
        isSameVideo: isSameVideo,
        setIsSameVideo: setIsSameVideo,
        sessionData: sessionData,
        setSessionData: setSessionData,
        interviewQuestions: interviewQuestions,
        setInterviewQuestions: setInterviewQuestions
      }}
    >
      {children}
    </InterviewContext.Provider>
  )
}

export default InteviewContextProvider
