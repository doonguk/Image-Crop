'use strict'
const imageSize = require('../../lib/imageSize')
const Jimp = require('../../lib/jimp')
const uploadAwsS3 = require('../../lib/uploadAwsS3')
const vision = require('../../lib/vision')
const fs = require('fs')
const request = require('request')
const {promisify} = require('util')
const deleteFile = promisify(fs.unlink)


module.exports.cropImage = async(req, res, next) => {
  try {
    const { url } = req.body
    console.log('req url', url)
    const fileNameArr = url.split('/')
    const fileName = fileNameArr[fileNameArr.length - 1]
    const requestOptions = {
      method: "GET"
      , uri: `${url}`
      , encoding: null
    }

    const picStream = fs.createWriteStream(`${__dirname}/../../asset/original/${fileName}`)
    picStream.on('close', async () => {
      const dimensions = await imageSize(fileName)
      const location = await vision(dimensions.height, fileName)
      if (location.error) {
        try {
          await deleteFile(`${__dirname}/../../asset/original/${fileName}`)
          res.status(400).json({result: `Can't crop url : ${url}`})
        } catch(err){
          next(err)
        }
      } else {
        try {
          const file = await Jimp(location, dimensions, fileName)
          console.log('2')
          const [url] = await uploadAwsS3(file)

          //fileDelete
          await deleteFile(`${__dirname}/../../asset/original/${fileName}`)
          await deleteFile(`${__dirname}/../../asset/asset-crop/${file.newFileName}`)

          //res
          res.status(201).json({result: url})
        } catch(err){
          next(err)
        }
      }
    })
    request(requestOptions).pipe(picStream)
  } catch (err) {
    next(err)
  }
}