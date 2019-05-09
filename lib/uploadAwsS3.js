'use strict'
require('dotenv').config()

const AWS = require('aws-sdk')
const {promisify} = require('util')
const fs = require('fs')
const readFile = promisify(fs.readFile)


async function uploadAwsS3(file){
  const { newFileName, fileData } = file
  AWS.config.update({
    accessKeyId: process.env.accessKeyId,
    secretAccessKey: process.env.secretAccessKey,
    region: process.env.region
  })
  const s3Bucket = new AWS.S3({params: {Bucket: 'image-crop', timeout: 6000000}})

  console.log(fileData.length)
  const base64Data = new Buffer.from(fileData)
  let params = {
    ACL: 'public-read',
    Key: newFileName,
    Body: base64Data,
    ContentType: 'binary'
  }

  //upload Image to S3
  console.log('after encoding base64Data', fileData, base64Data)
  await s3Bucket.putObject(params).promise()
  console.log('s3 upload success !')

}

module.exports = async (file) => {
  await uploadAwsS3(file)
  return Promise.all([`https://s3.ap-northeast-2.amazonaws.com/image-crop/${file.newFileName}`])
}