import axios from 'axios'
import { SERVER_BASE_URL } from '../config/FetchConfigs'

export function sendLogRequest (meetingId, level, logMessage) {
  const data = {
    meetingId: meetingId,
    level: level,
    logMessage: logMessage
  }

  console.log(data)
  axios.post('/log', data, {
      headers: {
        'Content-Type': 'application/json'
      },
      baseURL: SERVER_BASE_URL
    }).then(response => {
      console.log(20, response.data)
    }).catch(e => {
      console.error(e)
    })
}
