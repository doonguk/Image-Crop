const { promisify } = require('util')
const sizeOf = promisify(require('image-size'))

module.exports = async (fileName) => {
  try {
    const imagePath = `${__dirname}/../asset/original/${fileName}`
    return await sizeOf(imagePath)
  }catch(err){
    console.log(err)
  }
}