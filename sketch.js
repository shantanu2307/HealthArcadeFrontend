
let detector;
let poses;
let video;
let stage = ""
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


async function init() {
  detector = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, { modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING });
}


async function videoReady() {
  console.log('video ready')
  gameLoaded = true;
  game.currentState = 'tutorial';
  await getPoses();
}

async function setup() {
  can = createCanvas(640, 480);
  can.id('mycanvas');
  can.parent('alpha');
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


    a = poses[0].keypoints[12];
    b = poses[0].keypoints[14];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[14];
    b = poses[0].keypoints[16];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[11];
    b = poses[0].keypoints[13];
    strokeWeight(2);
    stroke(255);
    line(a.x, a.y, b.x, b.y);

    a = poses[0].keypoints[13];
    b = poses[0].keypoints[15];
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

    //Squat Detection 


    //Left side
    leftShoulder = poses[0].keypoints[5];
    var leftHip = poses[0].keypoints[11];
    var leftKnee = poses[0].keypoints[13];
    var leftAnkle = poses[0].keypoints[15];


    leftShoulder = [leftShoulder.x, leftShoulder.y];
    leftHip = [leftHip.x, leftHip.y];
    leftKnee = [leftKnee.x, leftKnee.y];
    leftAnkle = [leftAnkle.x, leftAnkle.y];

    var angleKnee1 = calculateAngle(leftHip, leftKnee, leftAnkle);

    //RightSide
    rightShoulder = poses[0].keypoints[6];
    var rightHip = poses[0].keypoints[12];
    var rightKnee = poses[0].keypoints[14];
    var rightAnkle = poses[0].keypoints[16];


    rightShoulder = [rightShoulder.x, rightShoulder.y];
    rightHip = [rightHip.x, rightHip.y];
    rightKnee = [rightKnee.x, rightKnee.y];
    rightAnkle = [rightAnkle.x, rightAnkle.y];

    var angleKnee2 = calculateAngle(rightHip, rightKnee, rightAnkle);

    if ((angleKnee1 > 120) && (angleKnee2 > 120)) {
      stage = "upPosn"
    }

    if ((angleKnee1 <= 90 && angleKnee2 <= 90) && stage == 'upPosn') {
      stage = "downPosn"
      counter += 1
      game.inputTrigger.hasCurlInput = true;
    }



    // PushUp
    leftShoulder = poses[0].keypoints[5];
    rightShoulder = poses[0].keypoints[6];
    leftElbow = poses[0].keypoints[7];
    rightElbow = poses[0].keypoints[8];
    if ((rightShoulder.y >= rightElbow.y) && (leftShoulder.y >= leftElbow.y)) {
      stage = "pushDown";
    }

    if (((rightShoulder.y < rightElbow.y) && (leftShoulder.y < leftElbow.y)) && (stage == "pushDown")) {
      counter += 1;
      stage = "pushUp";
      game.inputTrigger.hasCurlInput = true;
    }

  }

}

