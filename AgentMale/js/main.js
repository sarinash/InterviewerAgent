const video = document.getElementById('cam');
const face = document.getElementById('face');
let Emotion;
Promise.all(
  [
    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
    faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
    faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
    faceapi.nets.faceExpressionNet.loadFromUri('/models'),
   
  ]
).then(startvideo)
async function startvideo() {
  console.info("Models loaded, now I will access to WebCam")
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true
  })
  video.srcObject = stream

}

function detectExpression() {

  //setInterval to detect face expression periodically (every 500 milliseconds)
  const milliseconds = 500
  setInterval(async () => {
    const detection = await faceapi
    .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
    .withFaceLandmarks()
    .withFaceExpressions();
    //  detectAllFaces retruns an array of faces 
    if (detection.length > 0) {
      //  walk through all faces detected
      detection.forEach(element => {
        let status = "";
        let valueStatus = 0.0;
        for (const [key, value] of Object.entries(element.expressions)) {
          if (value > valueStatus) {
            status = key
            valueStatus = value;
          }
        }
        // find the emotions
        Emotion = status;
        console.log(Emotion);
      });
    } else {
      console.log("No Faces")
    }
  }, milliseconds);
}

//Add a listener once the Video is played
video.addEventListener('playing', () => {
  detectExpression()
  
})