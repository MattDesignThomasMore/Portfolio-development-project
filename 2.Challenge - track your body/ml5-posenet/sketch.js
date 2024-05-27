var video = document.getElementById('video');
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
let poses = [];
let poseStream = []




let allKeypoints = ['nose', 'leftEye', 'rightEye', 'leftEar', 'rightEar', 'leftShoulder', 'rightShoulder', 'leftElbow', 'rightElbow', 'leftWrist', 'rightWrist', 'leftHip', 'rightHip', 'leftKnee', 'rightKnee', 'leftAnkle', 'rightAnkle']

let start_frame = false
let result_count = 0
let start_frames_index = []
let end_frames_index = []
let reached_down = false

let ANGLE_CHECK = 180
let DISTANCE_THRESHOLD = 20

function vectorAngle(v1, v2){
  var numer = v1.x * v2.x + v1.y * v2.y
  var denom = Math.sqrt(v1.x * v1.x + v1.y * v1.y) * Math.sqrt(v2.x * v2.x + v2.y * v2.y)
  return Math.acos(numer / denom) * 180.0 / Math.PI
}

function checkReps(pose){
  var reps_done = false

  leftShoulder = {
    'x': pose.leftShoulder.x,
    'y': pose.leftShoulder.y
  }

  rightShoulder = {
    'x': pose.rightShoulder.x,
    'y': pose.rightShoulder.y
  }

  leftHip = {
    'x': pose.leftHip.x,
    'y': pose.leftHip.y
  }

  rightHip = {
    'x': pose.rightHip.x,
    'y': pose.rightHip.y
  }

  leftKnee = {
    'x': pose.leftKnee.x,
    'y': pose.leftKnee.y
  }

  rightKnee = {
    'x': pose.rightKnee.x,
    'y': pose.rightKnee.y
  }

  leftHSVec = {
    'x': leftShoulder.x - leftHip.x,
    'y': leftShoulder.y - leftHip.y
  } 

  rightHSVec = {
    'x': rightShoulder.x - rightHip.x,
    'y': rightShoulder.y - rightHip.y
  }

  leftHKVec = {
    'x': leftKnee.x - leftHip.x,
    'y': leftKnee.y - leftHip.y
  }

  rightHKVec = {
    'x': rightKnee.x - rightHip.x,
    'y': rightKnee.y - rightHip.y
  }

  leftSHKAngle = vectorAngle(leftHSVec, leftHKVec)
  rightSHKAngle = vectorAngle(rightHSVec, rightHKVec)

  if(leftSHKAngle >= 0.9 * ANGLE_CHECK && rightSHKAngle >= 0.9 * ANGLE_CHECK){
    if(!start_frame){
      console.log('start frame')
      start_frame = true
    }
    else if(start_frame && reached_down){
      console.log('end frame')
      start_frame = false
      reached_down = false
      reps_done = true
    }
  }

  if(Math.abs(leftHKVec.y) < 20 && Math.abs(rightHKVec.y) < 20){
    console.log('reached down')
    reached_down = true
  }

  return reps_done
}






var points = ["nose", "leftEye", "rightEye", "leftEar", "rightEar", "leftShoulder", "rightShoulder", "leftElbow", "rightElbow", "leftWrist", "rightWrist", "leftHip", "rightHip", "leftKnee", "rightKnee", "leftAnkle", "rightAnkle"]



function startRecording(){
  const btn = this;
  btn.textContent = 'stop recording';
  btn.onclick = stopRecording;
  
  const chunks = []; 
  const rec = new MediaRecorder(video.srcObject);
  rec.ondataavailable = e => chunks.push(e.data);
  rec.onstop = e => download(new Blob(chunks));
  rec.start();
  function stopRecording(){
    rec.stop();
    btn.textContent = 'start recording';
    btn.onclick = startRecording;
  }
}
function download(blob){
  let a = document.createElement('a'); 
  a.href = URL.createObjectURL(blob);
  a.download = 'recorded.webm';
  document.body.appendChild(a);
  a.click();
  saveText(JSON.stringify(poseStream), "poseStream.json");
}


if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices.getUserMedia({ video: true }).then(function(stream) {
    video.srcObject=stream;

    video.play();
  }).then(()=>{ // enable the button
    const btn = document.getElementById('downloadButton');
    btn.disabled = false;
    btn.onclick = startRecording;
  });
}

function drawCameraIntoCanvas() {
  ctx.drawImage(video, 0, 0, 640, 480);
  drawKeypoints();
  drawSkeleton();
  window.requestAnimationFrame(drawCameraIntoCanvas);
}
drawCameraIntoCanvas();

let poseparams =   {
  architecture: 'MobileNetV1',
  imageScaleFactor: 0.3,
  outputStride: 16,
  flipHorizontal: false,
  minConfidence: 0.5,
  maxPoseDetections: 1,
  scoreThreshold: 0.5,
  nmsRadius: 20,
  detectionType: 'multiple',
  inputResolution: 513,
  multiplier: 0.75,
  quantBytes: 2
}

function saveText(text, filename){
  var a = document.createElement('a');
  a.setAttribute('href', 'data:text/plain;charset=utf-u,'+encodeURIComponent(text));
  a.setAttribute('download', filename);
  a.click()
}

const poseNet = ml5.poseNet(video, poseparams, modelReady);
poseNet.on('pose', gotPoses);

function gotPoses(results) {
  poses = results;


  if(poses.length > 0){
    tmpPose = poses[0].pose
    res = checkReps(tmpPose)
    console.log('Reps Done')
  }



}

function modelReady() {
  console.log("model ready")
}

function drawKeypoints()  {
  for (let i = 0; i < poses.length; i++) {
    for (let j = 0; j < poses[i].pose.keypoints.length; j++) {
      let keypoint = poses[i].pose.keypoints[j];
      if (keypoint.score > 0.2) {
        ctx.beginPath();
        ctx.arc(keypoint.position.x, keypoint.position.y, 10, 0, 2 * Math.PI);
        ctx.fillStyle = "#c82124";
        ctx.fill();
        ctx.stroke();
      }
    }
  }
}

function drawSkeleton() {
  for (let i = 0; i < poses.length; i++) {
    for (let j = 0; j < poses[i].skeleton.length; j++) {
      let partA = poses[i].skeleton[j][0];
      let partB = poses[i].skeleton[j][1];
      ctx.beginPath();
      ctx.moveTo(partA.position.x, partA.position.y);
      ctx.lineTo(partB.position.x, partB.position.y);
      ctx.stroke();
    }
  }
}