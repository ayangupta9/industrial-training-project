import {
  AudioConfig,
  SpeechConfig,
  SpeechRecognizer
} from 'microsoft-cognitiveservices-speech-sdk'
import axios from 'axios'
import { SERVER_BASE_URL } from '../config/FetchConfigs'
import { sendLogRequest } from './logger'

let speechConfig = null
let recognizer = null
let audioConfig = null

export async function createAzureRecognizer (stream, meetingId) {
  if (speechConfig === null) {
    const BASE_URL = SERVER_BASE_URL
    // const BASE_URL = 'http://localhost:8080'
    try {
      const response = await axios.get('get-speech-token', {
        baseURL: BASE_URL
      })

      sendLogRequest(meetingId, 'info', 'Fetched Azure speech service tokens')

      const authToken = response.data.token
      const region = response.data.region

      speechConfig = SpeechConfig.fromAuthorizationToken(authToken, region)

      speechConfig.enableDictation()
      speechConfig.requestWordLevelTimestamps()
      speechConfig.enableAudioLogging()
    } catch (error) {
      sendLogRequest(
        meetingId,
        'info',
        `Could not fetch Azure speech service tokens.\n${error.toString()}`
      )
      console.error(error)
    }
  }

  audioConfig = AudioConfig.fromStreamInput(stream)

  return new Promise((resolve, reject) => {
    recognizer = new SpeechRecognizer(speechConfig, audioConfig)

    resolve(recognizer)
  })
}

export function closeAzureRecognizer () {
  if (audioConfig) audioConfig.close()
  if (speechConfig) speechConfig.close()
  if (recognizer) recognizer.close()
}
