
let detector;
let poses;
let video;
let stage = ""
let counter = 0;

function calculateAngle(a, b, c) {
  const radians = Math.atan2(c[1] - b[1], c[0] - b[0]) - Math.atan2(a[1] - b[1], a[0] - b[0]);
  var angle = Math.abs(radians * 180.0 / Math.PI);
  if (angle > 180.0) {
    angle = 360 - angle;
  }
  return angle
}


async function init() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });
}


async function videoReady() {
  console.log('video ready')
  gameLoaded = true;
  await getPoses();
}

async function setup() {
  await init();
  video = createCapture(VIDEO, videoReady);
  video.size(640, 480);
  video.hide();

}


async function getPoses() {
  poses = await detector.estimatePoses(video.elt);
  setTimeout(getPoses, 0);
}

function draw() {
  background(220);
  if (poses && poses.length > 0) {
    var shoulder = poses[0].keypoints[5];
    var elbow = poses[0].keypoints[7];
    var wrist = poses[0].keypoints[9];

    shoulder = [shoulder.x, shoulder.y]
    elbow = [elbow.x, elbow.y]
    wrist = [wrist.x, wrist.y]
    var angle = calculateAngle(shoulder, elbow, wrist);

    if (angle > 160) {
      stage = "down"
    }
    if (angle < 30 && stage == 'down') {
      stage = "up"
      counter += 1
      console.log(counter);
      game.inputTrigger.hasCurlInput = true;
    }
  }

}

