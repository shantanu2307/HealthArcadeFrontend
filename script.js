const video = document.getElementById('webcam');
const liveView = document.getElementById('liveView');
const demosSection = document.getElementById('demos');
const enableWebcamButton = document.getElementById('webcamButton');

let model = undefined;
let poses;
let dectector;

function getUserMediaSupported() {
  return !!(navigator.mediaDevices &&
    navigator.mediaDevices.getUserMedia);
}
if (getUserMediaSupported()) {
  enableWebcamButton.addEventListener('click', enableCam);
} else {
  console.warn('getUserMedia() is not supported by your browser');
}

function enableCam(event) {
  // Only continue if the COCO-SSD has finished loading.
  if (!model) {
    return;
  }
  // Hide the button once clicked.
  event.target.classList.add('removed');
  // getUsermedia parameters to force video but not audio.
  const constraints = {
    video: true
  };

  // Activate the webcam stream.
  navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
    video.srcObject = stream;
    video.addEventListener('loadeddata', predictWebcam);
  });

}

async function draw() {
  background(0);
  if (poses && poses.length > 0) {

    for (let kp of poses[0].keypoints) {
      const { x, y, score } = kp;
      if (score > 0.5) {
        fill(255, 0, 0);
        stroke(0);
        strokeWeight(4);
        circle(x, y, 16);
      }

    }

    // Drawing the skeleton
    let a = poses[0].keypoints[0];
    let b = poses[0].keypoints[1];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[0];
    b = poses[0].keypoints[2];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[3];
    b = poses[0].keypoints[1];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[2];
    b = poses[0].keypoints[4];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[6];
    b = poses[0].keypoints[8];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[8];
    b = poses[0].keypoints[10];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[5];
    b = poses[0].keypoints[7];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[7];
    b = poses[0].keypoints[9];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[5];
    b = poses[0].keypoints[6];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[6];
    b = poses[0].keypoints[12];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[5];
    b = poses[0].keypoints[11];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[11];
    b = poses[0].keypoints[12];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

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
  await draw();
  window.requestAnimationFrame(predictWebcam);

}

async function init() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });
  model = true;
  gameLoaded = true;
  game.currentState = 'tutorial';
  demosSection.classList.remove('invisible');
}

init();
