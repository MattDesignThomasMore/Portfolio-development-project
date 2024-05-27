let permissionGranted = false;
let avocado;
let pit;
let snacks = [];
let gameStarted = false;
let gameEnded = false;
let score = 0;
let startTime;
let duration = 30;

function setup() {
    createCanvas(windowWidth, windowHeight).parent('canvasWrapper');
    avocado = new Avocado(width / 2, height / 2);
    pit = new Pit(random(width), random(height));

    if (typeof (DeviceOrientationEvent) !== 'undefined' && typeof (DeviceOrientationEvent.requestPermission) === 'function') {
        DeviceOrientationEvent.requestPermission()
            .catch(error => {
                let button = createButton("Click to allow access to sensors");
                button.style("font-size", "24px");
                button.center();
                button.mousePressed(requestAccess);
                console.error(error);
            })
            .then(() => {
                permissionGranted = true;
            });
    } else {
        permissionGranted = true;
    }

    select('#startButton').mousePressed(startGame);
    select('#restartButton').mousePressed(restartGame);
}

function requestAccess() {
    DeviceOrientationEvent.requestPermission()
        .then(response => {
            if (response == 'granted') {
                permissionGranted = true;
            } else {
                permissionGranted = false;
            }
        })
        .catch(console.error);
}

function startGame() {
    if (!permissionGranted) return;
    gameStarted = true;
    gameEnded = false;
    select('#introScreen').addClass('hidden');
    score = 0;
    startTime = millis();
    snacks = [];
    avocado.reset();
    pit.reset();
}

function endGame() {
    gameEnded = true;
    gameStarted = false;
    select('#scoreMessage').html(`Your score: ${score}`);
    select('#endScreen').removeClass('hidden');
}

function restartGame() {
    gameStarted = false;
    gameEnded = false;
    select('#endScreen').addClass('hidden');
    select('#introScreen').removeClass('hidden');
}

function draw() {
    if (!permissionGranted) return;

    background(135, 194, 50);

    if (gameStarted && !gameEnded) {
        avocado.update();
        avocado.display();

        pit.update(avocado);
        pit.display();

        if (frameCount % 60 === 0) {
            snacks.push(new Snack());
        }

        for (let i = snacks.length - 1; i >= 0; i--) {
            snacks[i].update();
            snacks[i].display();
            if (snacks[i].collected(avocado)) {
                score += 10;
                snacks.splice(i, 1);
            }
            if (snacks[i].offscreen()) {
                snacks.splice(i, 1);
            }
        }

        if (pit.hits(avocado)) {
            endGame();
        }

        let elapsed = (millis() - startTime) / 1000;
        if (elapsed >= duration) {
            endGame();
        }

        // Display score
        fill(255);
        textSize(32);
        text(`Score: ${score}`, 10, 30);
    }
}

class Avocado {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 30;
    }

    update() {
        const dx = constrain(rotationY, -3, 3);
        const dy = constrain(rotationX, -3, 3);
        this.x += dx * 2;
        this.y += dy * 2;
        this.x = constrain(this.x, this.r, width - this.r);
        this.y = constrain(this.y, this.r, height - this.r);
    }

    display() {
        fill(50, 205, 50);
        ellipse(this.x, this.y, this.r * 2);
    }

    reset() {
        this.x = width / 2;
        this.y = height / 2;
    }
}

class Pit {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.r = 20;
    }

    update(avocado) {
        let angle = atan2(avocado.y - this.y, avocado.x - this.x);
        this.x += cos(angle) * 2;
        this.y += sin(angle) * 2;
    }

    display() {
        fill(139, 69, 19);
        ellipse(this.x, this.y, this.r * 2);
    }

    hits(avocado) {
        let d = dist(this.x, this.y, avocado.x, avocado.y);
        return (d < this.r + avocado.r);
    }

    reset() {
        this.x = random(width);
        this.y = random(height);
    }
}

class Snack {
    constructor() {
        this.x = random(width);
        this.y = -20;
        this.r = 15;
        this.speed = 3;
    }

    update() {
        this.y += this.speed;
    }

    display() {
        fill(255, 223, 0);
        ellipse(this.x, this.y, this.r * 2);
    }

    collected(avocado) {
        let d = dist(this.x, this.y, avocado.x, avocado.y);
        return (d < this.r + avocado.r);
    }

    offscreen() {
        return (this.y > height + this.r);
    }
}

