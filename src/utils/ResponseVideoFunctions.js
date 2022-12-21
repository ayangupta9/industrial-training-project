import axios from 'axios'
import { SERVER_BASE_URL } from '../config/FetchConfigs'
import { sendLogRequest } from './logger'

const idbOperations = {
  GET_OP: 0,
  SET_OP: 1
}

async function getVideoFromIDB (accessIDB, video_key) {
  const get_value = await accessIDB(idbOperations.GET_OP, video_key)
  if (get_value && get_value !== undefined) {
    return get_value
  } else {
    return false
  }
}

// if (key !== 'silence') {
// const idb_key = key.split('.')[0].charAt(key.split('.')[0].length - 1)
// }
// const get_value = await getVideoFromIDB(accessIDB, idb_key)
// const BASE_URL = 'http://localhost:8080'
// await accessIDB(idbOperations.SET_OP, idb_key, videoBlob)

export async function fetchFromS3 (accessIDB, bucket, key, meetingId) {
  const get_value = await getVideoFromIDB(accessIDB, key)
  if (get_value) return get_value

  const response = await axios.get(`load-video/${meetingId}/${bucket}/${key}`, {
    baseURL: SERVER_BASE_URL
  })

  const video_base = response.data.video_base

  if (video_base && video_base !== undefined) {
    const videoBlob = await (
      await fetch('data:video/mp4;base64,' + video_base)
    ).blob()
    await accessIDB(idbOperations.SET_OP, key, videoBlob)
    return videoBlob
  } else {
    throw Error('No video base url found in response')
  }
}

async function getConductorImage (link, meetingId) {
  const link_split = link.split('/')
  const bucket = link_split[link_split.length - 2]
  const key = link_split[link_split.length - 1]
  const response = await axios.get(`load-video/${meetingId}/${bucket}/${key}`, {
    baseURL: SERVER_BASE_URL
  })

  return URL.createObjectURL(
    await (
      await fetch('data:image/png;base64,' + response.data.video_base)
    ).blob()
  )
}


/**
 * 
 * @param {function} accessIDB returned from useIndexedDB hook which provides accessing and mutating values in the browser's Indexed DB
 * @param {String} meetingId Alphanumeric id input by the user and used by Rysyl API for fetching interview details
 * @param {function} setInterviewDescription 
 * @param {function} setSessionData 
 * @param {function} setInterviewQuestions 
 * @param {function} setResponseVideoIndex 
 * @returns 
 */
export async function collectApplicationData (
  accessIDB,
  meetingId,
  setInterviewDescription,
  setSessionData,
  setInterviewQuestions,
  setResponseVideoIndex
) {
  const url =
    'https://api.rysyl.com/v1/get-application?application_id=' + meetingId

  try {


    // * Fetch data from the API
    const response = await axios.get(url)
    sendLogRequest(meetingId, 'info', `Fetched application data`)
    console.log(response)


    const applicant_data = response.data
    const interview_assets = applicant_data.interview_assets

    // * Fetch image of the interviewer
    const character_thumbnail_link = await getConductorImage(
      applicant_data.character_thumbnail_link,
      meetingId
    )

    // * Set the state of variables in InterviewContext to the fetched data
    setInterviewDescription({
      job_role: applicant_data.job_role,
      hiring_manager: applicant_data.hiring_manager,
      interview_character_name: applicant_data.interview_character_name,
      character_thumbnail_link: character_thumbnail_link,
      company_name: applicant_data.company_name
    })

    setSessionData(prevSessionData => {
      return {
        ...prevSessionData,
        job_id: applicant_data.job_id,
        application_id: meetingId
      }
    })

    setInterviewQuestions(applicant_data?.questions)

    console.log(
      'Starting from question ',
      parseInt(applicant_data?.question_index)
    )
    setResponseVideoIndex(parseInt(applicant_data?.question_index))

    sendLogRequest(meetingId, 'info', 'Fetching video assets now')

    // * Fetch video blobs from the video assets key name

    let video_blobs = []
    for (const asset of interview_assets) {
      const asset_split = asset.split('/')
      const bucket = asset_split[asset_split.length - 2]
      const key = asset_split[asset_split.length - 1]
      try {
        // * Fetch video based on bucket name and key name, save into the indexedDB and push the blob into a list
        const video_blob = await fetchFromS3(accessIDB, bucket, key, meetingId)
        video_blobs.push(URL.createObjectURL(video_blob))
      } catch (e) {
        console.error(e)
        return false
      }
    }

    // * Return the list of all the video assets
    return video_blobs
  } catch (e) {
    sendLogRequest(
      meetingId,
      'error',
      `Could not fetch application data\n${e.toString()}`
    )
    console.error(e)
    return e
  }
}

// export async function devCollectApplicationData (accessIDB, meetingId) {
//   const interview_assets_keys = [
//     'silence.mp4',
//     'Question1.mp4',
//     'Question2.mp4',
//     'Question3.mp4',
//     'Question4.mp4',
//     'Question5.mp4',
//     'Question6.mp4'
//   ]
//   let video_blobs = []
//   for (const asset_key of interview_assets_keys) {
//     const bucket = 'interview-rysyl-preloaded-interviewer-videos'
//     // const key = 'Question' + asset + '.mp4'
//     try {
//       const video_blob = await fetchFromS3(accessIDB, bucket, asset_key)
//       video_blobs.push(URL.createObjectURL(video_blob))
//     } catch (e) {
//       console.error(e)
//       return false
//     }
//   }
//   return video_blobs
// }
