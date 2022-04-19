const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');

const webcamCanvas = document.getElementById('webcamCanvas');
const webCanCtx = webcamCanvas.getContext('2d');

let model = undefined;
let poses;
let dectector;

let stage = ""
let stage2 = ""
let counter = 0;
let can;

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  var angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle
}

function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}

function enableCam() {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
    gameLoaded = true;
  });
}

function drawLine(x1, y1, x2, y2, color = '#FFFFFF', lineWidth = 2) {
  webCanCtx.closePath();

  webCanCtx.beginPath();
  webCanCtx.moveTo(x1, y1);
  webCanCtx.lineTo(x2, y2);
  webCanCtx.strokeStyle = color;
  webCanCtx.lineWidth = lineWidth;
  webCanCtx.stroke();
  webCanCtx.closePath();

  webCanCtx.beginPath();
}

async function draw() {
  //background(0);
  if (poses && poses.length > 0) {

    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.5) {
        webCanCtx.beginPath();
        webCanCtx.arc(x, y, 4, 0, 2 * Math.PI);
        webCanCtx.fillStyle = 'red';
        webCanCtx.fill();
      }

    }
    
    // Drawing the skeleton
    let a = poses[0].keypoints[0];
    let b = poses[0].keypoints[1];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[0];
    b = poses[0].keypoints[2];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[3];
    b = poses[0].keypoints[1];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[2];
    b = poses[0].keypoints[4];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[6];
    b = poses[0].keypoints[8];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[8];
    b = poses[0].keypoints[10];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[5];
    b = poses[0].keypoints[7];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[7];
    b = poses[0].keypoints[9];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[5];
    b = poses[0].keypoints[6];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[6];
    b = poses[0].keypoints[12];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[5];
    b = poses[0].keypoints[11];
    drawLine(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[11];
    b = poses[0].keypoints[12];
    drawLine(a.x, a.y, b.x, b.y);
  
    //Curl Detection 

    //Left Side
    var shoulder = poses[0].keypoints[5];
    var elbow = poses[0].keypoints[7];
    var wrist = poses[0].keypoints[9];
    var leftShoulder = [shoulder.x, shoulder.y]
    var leftElbow = [elbow.x, elbow.y]
    var leftWrist = [wrist.x, wrist.y]
    var angle1 = calculateAngle(leftShoulder, leftElbow, leftWrist);

    //Right Side
    shoulder = poses[0].keypoints[6];
    elbow = poses[0].keypoints[8];
    wrist = poses[0].keypoints[10];
    var rightShoulder = [shoulder.x, shoulder.y]
    var rightElbow = [elbow.x, elbow.y]
    var rightWrist = [wrist.x, wrist.y]
    var angle2 = calculateAngle(rightShoulder, rightElbow, rightWrist);


    if ((angle1 > 160 && angle2 > 160)) {
      stage = "down"
    }
    if ((angle1 < 30 && angle2 < 30) && stage == 'down') {
      stage = "up"
      counter += 1
      game.inputTrigger.hasCurlInput = true;
    }

  }
}

async function predictWebcam() {
  poses = await detector.estimatePoses(video);
  webCanCtx.clearRect(0, 0, webcamCanvas.clientWidth, webcamCanvas.clientHeight);
  await draw();
  game.loop();
  window.requestAnimationFrame(predictWebcam);
}

async function init() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet);
  model = true;

  if (getUserMediaSupported()) {
    enableCam();
  } else {
    console.warn('getUserMedia() is not supported by your browser');
  }
}

init();