
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

