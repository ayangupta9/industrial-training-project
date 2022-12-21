const { S3, S3Client } = require('@aws-sdk/client-s3')
require('dotenv').config()

const AWScredentials = {
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.SECRET_ACCESS_KEY
}

const s3 = new S3({
  credentials: AWScredentials,
  region: process.env.REGION
})

const s3client = new S3Client({
  credentials: AWScredentials,
  region: process.env.REGION
})

module.exports = {
  s3client
}
