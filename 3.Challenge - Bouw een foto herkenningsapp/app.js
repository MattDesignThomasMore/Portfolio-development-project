let video;
let classifier;
let label = "";
let prob = 0;
let scanning = false;
let scanY = 0;

function setup() {
    createCanvas(640, 550);
    background(0);
    video = createCapture(VIDEO);
    video.size(640, 480);
    video.hide();
    classifier = ml5.imageClassifier('MobileNet', modelReady);
    let takePhotoBtn = select('.take-photo-button');
    takePhotoBtn.mousePressed(takePhoto);
}

function draw() {
    background(0);
    image(video, 0, 0);
    
    if (scanning) {
        scanEffect();
    }
    
    fill(255);
    textSize(24);
    textAlign(LEFT, BOTTOM);
    text(`Label: ${label}`, 10, height - 40);
    text(`Confidence: ${(prob * 100).toFixed(2)}%`, 10, height - 10);
}

function modelReady() {
    console.log("Model is loaded!");
}

function classifyVideo() {
    if (!scanning) {
        classifier.classify(video, gotResults);
    }
}

function gotResults(error, results) {
    if (error) {
        console.error("Error during classification:", error);
        return;
    }

    if (results && results[0]) {
        label = results[0].label;
        prob = results[0].confidence;
        speak(`Object recognized: ${label} with confidence ${Math.floor(prob * 100)} percent`);
    }
}

function takePhoto() {
    scanning = true;
    setTimeout(() => {
        classifier.classify(video, gotResults);
        scanning = false;
    }, 2000);
}

function scanEffect() {
    noFill();
    stroke(0, 255, 0);
    strokeWeight(4);
    line(0, scanY, width, scanY);
    
    scanY += 5;
    if (scanY > height) {
        scanY = 0;
    }
}

function speak(text) {
    if ('speechSynthesis' in window) {
        let utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        speechSynthesis.speak(utterance);
    } else {
        alert('Sorry, your browser does not support speech synthesis.');
    }
}
