require('dotenv').config()
const { s3client } = require('./s3objects')
const { ListObjectsCommand, GetObjectCommand } = require('@aws-sdk/client-s3')

const streamToString = stream =>
  new Promise((resolve, reject) => {
    const chunks = []
    stream.on('data', chunk => chunks.push(chunk))
    stream.on('error', reject)
    stream.on('end', () => resolve(Buffer.concat(chunks).toString('base64')))
  })

async function getSingleFromS3 (bucket_name, key) {
  const bucketParams = {
    Bucket: bucket_name,
    Key: key
  }

  try {
    const data = await s3client.send(new GetObjectCommand(bucketParams))
    const base = await streamToString(data.Body)
    return base
  } catch (e) {
    console.error(e)
  }
}

async function getAllFromS3 (bucket_name, video_keys) {
  video_base_strings = []
  for (const key of video_keys) {
    const bucketParams = {
      // Bucket: process.env.INTERVIEWER_PRELOADED_BUCKET_NAME,
      Bucket: bucket_name,
      Key: key
    }

    try {
      const data = await s3client.send(new GetObjectCommand(bucketParams))
      const base = await streamToString(data.Body)
      video_base_strings.push(base)
      return video_base_strings
    } catch (e) {
      console.error(e)
      throw new Error(e)
    }
  }
}

async function listAllFromS3 () {
  const bucketParams = {
    Bucket: process.env.INTERVIEWER_PRELOADED_BUCKET_NAME
  }
  try {
    const data = await s3client.send(new ListObjectsCommand(bucketParams))
    const data_contents = data.Contents.map(content => content.Key)
    console.log(data_contents)
    return data_contents
  } catch (e) {
    console.error(e)
    throw new Error('Object could not be retrieved')
  }
}

// listAllFromS3()

module.exports = {
  listAllFromS3,
  getSingleFromS3,
  getAllFromS3
}
