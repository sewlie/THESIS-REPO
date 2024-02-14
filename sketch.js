let svgImages = [];
let playlist = [];
let currentSongIndex = 0;
let isPlaying = false;
let startTime, elapsedTime = 0, intervalId;
let rotationAngles = [0, 0]; // Adjusting for simplicity
let rotationStartTimes = [0, 0]; // Adjusting to initiate only first ring rotation initially
let animationduration1s = [170, 232]; // Example duration1s for full rotations
let x = 1; // Initial state to control the start of the interaction
let buffer; // Declare an off-screen buffer for larger-than-canvas drawing

function preload() {
  svgImages.push(loadImage("assets/Asset10.svg"));
  svgImages.push(loadImage("assets/Asset17.svg"));
  playlist.push(loadSound("assets/Circles.mp3"));
  playlist.push(loadSound("assets/Complicated.mp3"));
}

function setup() {
    pixelDensity(2); // Be mindful of performance implications
    createCanvas(2000, 2000);
    buffer = createGraphics(4000, 4000, P2D); // Specify P2D renderer if not already
    background(255);
    setupAudioPlayer(playlist[0]);
}

function draw() {
  background(255);
  buffer.clear();

  let currentTime1 = millis() / 1000;
  buffer.push();
  // The translation within the buffer doesn't need to change for this adjustment
  buffer.translate(2000 - 500, 2000 + 400);

  for (let i = 0; i < svgImages.length; i++) {
    if (x > 1 && ((i == 0 || (i == 1 && currentTime1 - rotationStartTimes[0] > 170)))) {
      let elapsedTime = currentTime1 - rotationStartTimes[i];
      let duration1 = animationduration1s[i];
      let rotationProgress = elapsedTime / duration1;
      let targetAngle = rotationProgress * TWO_PI;
      // Reverse the direction by negating the targetAngle
      rotationAngles[i] = min(targetAngle, TWO_PI) * -1; // Multiply by -1 to reverse direction
    }

    buffer.push(); // Isolate the rotation for each SVG
    buffer.rotate(rotationAngles[i]);
    buffer.image(svgImages[i], -2000, -2000, 4000, 4000); // Drawing SVG centered
    buffer.pop();
  }

  buffer.pop();
  // Adjust the drawing position of the buffer on the canvas to move it 200 pixels left
  // Previously, it was -1000 for x position, now it's -1200 to move 200 pixels to the left
  image(buffer, -2000, -600, 4000, 4000, 0, 0, width, height);

  if (x == 1) {
    fill(0, 0, 0, 51); // Semi-transparent overlay
    // Adjust overlay position to match the new scene position
    rect(-2400, 400, width, height);
    fill(255);
    textSize(64);
    textAlign(CENTER, CENTER);
    // Adjust play button's position to match the new scene position
    text("▶", width / 2 - 2400, height / 2 + 400);
  }

  if (isPlaying) {
    displayTimer();
  }
}

function mousePressed() {
  if (x == 1) {
    playAudio();
    x = 2; // Changing state to prevent restarting the rotations
    let currentTime1 = millis() / 1000;
    rotationStartTimes.fill(currentTime1); // Initiate rotation for the first ring
  } else if (!isPlaying) {
    playAudio();
  }
}

function setupAudioPlayer(audio) {
  audioPlayer = audio;
  audioPlayer.onended(() => {
    playNextSong();
  });
}

function playAudio() {
  if (!playlist[currentSongIndex].isPlaying()) {
    playlist[currentSongIndex].play();
    isPlaying = true;
    startTimer();
  }
}

function playNextSong() {
  currentSongIndex = (currentSongIndex + 1) % playlist.length;
  setupAudioPlayer(playlist[currentSongIndex]);
  playAudio();
}

function startTimer() {
  if (intervalId) clearInterval(intervalId);
  startTime = millis();
  intervalId = setInterval(() => {
    elapsedTime = millis() - startTime;
  }, 100);
}

function displayTimer() {
  let seconds = Math.floor(elapsedTime / 1000) % 60;
  let minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
  let hours = Math.floor(elapsedTime / (1000 * 60 * 60));
  let timerString = nf(hours, 2) + ":" + nf(minutes, 2) + ":" + nf(seconds, 2);
  fill(0);
  textSize(32);
  text(timerString, 500, 50); // Display timer text position adjusted for visibility
}
