const Jimp = require('jimp')
const fs = require('fs')

function crop(location, image, targetPath, cropPath, newFileName) {
  return new Promise((resolve, reject) => {
    try {
      Jimp.read(targetPath)
          .then(async (file) => {
            file.crop(0, location.top, image.width, image.height - location.top - (image.height - location.bottom))
                .resize(image.width, image.width)
                .write(cropPath + newFileName, () => {
                  fs.readFile(cropPath+newFileName, (err, data) => {
                    if(err) reject(err)
                    resolve(data)
                  })
                })
          })
    } catch (err) {
      reject(err)
    }
  })
}


module.exports = (location, image, fileName) => {
  return new Promise( (resolve, reject) => {
    const targetPath = `${__dirname}/../asset/original/${fileName}`
    const cropPath = `${__dirname}/../asset/asset-crop/`

    const newFileNameArr = fileName.split('.')
    const newFileName = newFileNameArr[0] + '_vision.' + newFileNameArr[1]

    crop(location, image, targetPath, cropPath, newFileName)
        .then(fileData => {
          console.log(fileData)
          resolve({newFileName, fileData})
        })
        .catch(err => {
          reject(err)
        })
  })
}