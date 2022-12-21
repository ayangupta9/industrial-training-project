const { Router } = require('express')
const { log } = require('../utils/logging')
const { getSingleFromS3 } = require('../utils/s3functions')

const router = Router()

router.get('/load-video/:meeting_id/:bucket/:key', async (req, res) => {
  const key = req.params.key
  const bucket_name = req.params.bucket
  const meeting_id = req.params.meeting_id

  try {
    const response = await getSingleFromS3(bucket_name, key)
    console.log('Got response from s3 for', key)
    log(meeting_id, `Got response from s3 for ${key}`, 'info')
    res.status(200).json({
      message: key + ' Data downloaded',
      video_base: response
    })
  } catch (e) {
    log(meeting_id, `Could not download video asset\n${e.toString()}`, 'error')
    res.status(500).json({
      message: 'Could not download video asset'
    })
  }
})

module.exports = router

// router.get('/load-all-videos', async (req, res) => {
//   try {
//     const video_keys = await listAllFromS3()
//     const response = await getAllFromS3(video_keys)

//     // console.log('Got all responses')
//     res.status(200).json({
//       message: 'All Data downloaded',
//       video_bases: response
//     })
//   } catch (e) {
//     console.error(e)
//     res.status(503).json({
//       message: 'Could not download data'
//     })
//   }
// })
