const winston = require('winston')
const WinstonCloudwatch = require('winston-cloudwatch')

const awsOptions = {
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_KEY
  },
  region: process.env.REGION
}

function createLogger (logName) {
  const logger = winston.createLogger({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
    transports: [
      new winston.transports.Console({
        format: winston.format.cli()
      }),
      new winston.transports.File({
        dirname: './logs/',
        filename: `${logName}.log`
      }),
      new WinstonCloudwatch({
        awsOptions: awsOptions,
        logGroupName: 'interview-test-log-group',
        logStreamName: `${logName}`
      })
    ]
  })

  return logger
}

function log (logName, logMessage, logLevel = 'info', logger = null) {
  let logSwitch = true

  if (logSwitch) {
    let l = logger
    if (logger === null) {
      l = createLogger(logName)
      l.log(logLevel, logMessage)
      l.destroy()
    } else {
      l.log(logLevel, logMessage)
    }
  }
  // l.destroy()
}

module.exports = { log, createLogger }
