# Crop-Vision



#### 시작하기

- 준비 작업

```bash
$ git clone https://github.com/mbxd1/Image-Crop.git
$ cd crop-vision
$ npm i
```

1. OS 환경설정

```bash
//프로젝트 루트 디렉토리 .env 파일
accessKeyId = AWS AccessKey 입력
secretAccessKey = AWS SecterKey 입력
region = ap-northeast-2 // Seoul
GOOGLE_APPLICATION_CREDENTIALS= 구글 AccessKey 파일 경로 입력
```



2. 이미지를 읽어서 임시로 저장할 asset 폴더 만들기

<img width="184" alt="스크린샷 2019-05-09 오후 3 34 59" src="https://user-images.githubusercontent.com/39187116/57435257-ddd66200-7277-11e9-8a58-c3f4847a9aff.png">

original 폴더는 클라이언트로 부터 요청받은 url로 부터 이미지를 읽어 저장할 폴더

asset-crop은 Vision API를 이용하여 텍스트를 자른 이미지를 저장할 폴더



3. 소스에서 수정 할 부분 (프로젝트에 맞게)

   - 디렉토리 path를 프로젝트에 맞게 수정

   <code>`${__dirname}/../../asset/original/${fileName}`</code>

   - S3 버킷이름 설정

   ```js
   //uploadAwsS3.js
   const s3Bucket = new AWS.S3({params: {Bucket: '버킷이름', timeout: 6000000}})
   ```

   - 클라이언트에 response 할 s3 url 수정

   ```js
   //uploadAwsS3.js
   return `https://s3.ap-northeast-2.amazonaws.com/버킷이름/${file.newFileName}`
   ```

   

   

<br/>

#### API 사용

- API 호출

> API 를 만들면서 인증관련 미들웨어는 넣지 않았습니다.

<img width="682" alt="스크린샷 2019-05-09 오후 3 41 59" src="https://user-images.githubusercontent.com/39187116/57435262-dfa02580-7277-11e9-9f84-2a4cae9cc0d7.png">

<code>/crop</code> 경로에 쿼리스트링 방식으로 이미지의 s3 object url을 넣어 API 요청을 합니다.

- 결과1

<img width="622" alt="스크린샷 2019-05-09 오후 3 43 56" src="https://user-images.githubusercontent.com/39187116/57435265-e29b1600-7277-11e9-96bd-8cb1aeb58907.png">

JSON 형식으로 result 값에 crop된 이미지의 url을 리턴 받습니다.

<img width="842" alt="스크린샷 2019-05-09 오후 3 46 33" src="https://user-images.githubusercontent.com/39187116/57435272-e62e9d00-7277-11e9-86c1-fda3404dd816.png">

AWS 버킷내에 원본 이미지 이름_vision 이름으로 파일을 업로드 합니다.



- 결과2

원본

<img width="754" alt="target" src="https://user-images.githubusercontent.com/39187116/57435344-1bd38600-7278-11e9-90fc-cf3a3e947e07.png">



crop된 이미지

![target_vision](https://user-images.githubusercontent.com/39187116/57435358-24c45780-7278-11e9-924a-51721c32a88c.png)



- 결과3

만약 crop할 수 없는 이미지( 텍스트가 허용범위 밖에 있는 이미지 )를 request하면 http status 404 code와 null 값을 response 합니다.


#### 코드분석

코드의 흐름은 다음과 같습니다.

1. <code>fs.createWriteStram</code> 으로 이미지 서버에 저장
2. <code>image-size</code> 모듈로 이미지의 height 값 구하기
3.  <code>Vision API</code>로 이미지안 텍스트의 좌표값 구하기
4. <code>Jimp</code> 모둘로 이미지 crop -> 정사각형으로 resize -> 새로운 이미지로 저장
5. 새로운 이미지 <code>AWS S3</code>에 업로드
6. asset 폴더에 저장한 original 이미지, crop된 이미지 삭제

image 높이를 구한 이유는 이미지를 crop하기 전에 이미지 높이의 상위, 하위 몇 퍼센트 까지 텍스트를 허용 할 것인지 알기 위해서 구하였습니다.

텍스트 허용범위를 수정 하고 싶다면,

```js
// vision.js
const topCutPoint = Math.round( height / 100 ) * 20 //상위 20퍼센트 까지
const bottomCutPoint = Math.round( height /100) * 85 //밑에서 15퍼센트
```

코드를 수정하면 됩니다.

