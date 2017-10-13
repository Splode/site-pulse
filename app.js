const fs = require('fs')
const nodemailer = require('nodemailer')
const moment = require('moment')
const chalk = require('chalk')
const request = require('request')

const auth = require('./auth.json')
const config = require('./config.json')

const checkInterval = config.options.checkInterval
const logDir = config.options.logDir
const maxFileSize = config.options.maxFileSize
const logFiletype = config.options.logFiletype

let mailOptions = config.mailer

let siteLs = config.sites.reduce((acc, item) => {
  let newSite = site(item.url, item.log)
  acc.push(newSite)
  return acc
}, [])

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir)
}

checkAll(siteLs)

setInterval(() => {
  checkAll(siteLs)
}, checkInterval)

function check (site) {
  let logPath = logDir + '/' + site.log + logFiletype

  request(site.url, {
    json: false
  }, (err, res, body) => {
    if (err) {
      return console.log(chalk.red(`Unable to access site at ${site.url}. This is likely an indication that the url is incorrect.
    `), err)
    }

    let responseCode = res.statusCode
    let responseTime = getDate()
    let response = `Status code: ${responseCode}\tDate accessed: ${responseTime}\r`

    if (responseCode !== 200 && !site.alertSent) {
      mailOptions.subject = `Site Availability Alert for ${site.url}`
      mailOptions.text = `Site ${site.url} has responded with a code of ${responseCode}. This may be indicative of limited availability. \r\rPlease check ${site.url} to ensure site health.`

      sendAlert(mailOptions)
      site.alertSent = true
    }

    fs.appendFile(logPath, response, (err) => {
      if (err) throw err
      console.log(chalk.green(`============== Updated ${site.log} ==============
      ${response}
    `))
    })
  })

  fs.readFile(logPath, (err) => {
    if (err) {
      return
    }
    clearLog(logPath, maxFileSize)
  })
}

function checkAll (sites) {
  sites.forEach((site) => {
    check(site)
  }, this)
}

function clearLog (log, maxSize) {
  let fileSize = getFileSize(log)

  if (fileSize > maxSize) {
    fs.unlink(log, (err) => {
      if (err) throw err
      console.log(chalk.yellow(`Cleared ${log}`))
    })
  }
}

function getDate () {
  let rawDate = new Date()

  return moment(rawDate).format('MMMM Do YYYY, h:mm:ss a')
}

function getFileSize (filename) {
  const stats = fs.statSync(filename)
  const fileSizeInBytes = stats.size

  return fileSizeInBytes
}

function sendAlert (mailOptions) {
  let transporter = nodemailer.createTransport({
    host: auth.host,
    port: auth.port,
    secure: auth.secure,
    auth: {
      user: auth.user,
      pass: auth.pass
    }
  })

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error)
    }
    console.log(chalk.yellow('Message sent: %s', info.messageId))
  })
}

function site (url, log) {
  return ({
    url: url,
    log: `log-${log}`,
    alertSent: false
  })
}
