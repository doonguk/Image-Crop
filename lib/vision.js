const vision = require('@google-cloud/vision');
// Creates a client
const client = new vision.ImageAnnotatorClient();

async function visionAPI(height, fileDir) {
  const topCutPoint = Math.round( height / 100 ) * 20
  const bottomCutPoint = Math.round( height /100) * 85 //밑에서 15퍼센트
  try{
    let positions = []
    let location = {}
    let forCount = 0
    const [textResult] = await client.documentTextDetection(fileDir)
    const fullTextAnnotation = textResult.fullTextAnnotation
    if(fullTextAnnotation){
      fullTextAnnotation.pages.forEach( page => {
        page.blocks.forEach(block =>{
          let wordTexts = ''
          block.paragraphs.forEach((para)=>{
            para.words.forEach( word =>{
              const wordText = word.symbols.map(s => s.text).join('')
              wordTexts = wordTexts + wordText
              if(word.boundingBox.vertices[1]['y'] > bottomCutPoint){
                positions.push(word.boundingBox.vertices[1]['y'])
              }
              positions.push(word.boundingBox.vertices[2]['y']) // 글자 오른쪽 밑 y값
            })
          })
        })
      })
      positions.forEach( (position, index) =>{
        if(positions[index] < topCutPoint && positions[index+1] > topCutPoint ){
          location.top = position
        }
        if(positions[index] > bottomCutPoint && forCount === 0 ) {
          location.bottom = position
          forCount = 1
        }
        if(topCutPoint < positions[index] && positions[index] < bottomCutPoint ){ //글자가 이미지 중간에있으면
          // console.log('Not crop position', positions[index], 'topCutPoint', topCutPoint, 'bottomCutPoint', bottomCutPoint)
          location.error = true
        }
      })
      return location
    }
    else{
      location.error = true
      return location
    }
  }catch(err){
    console.log("ERROR :", err)
  }
}

module.exports = async(height, fileName) => {
  const fileDir = `${__dirname}/../asset/original/${fileName}`
  return await visionAPI(height,fileDir)
}