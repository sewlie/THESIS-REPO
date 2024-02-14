let svgImages = [];
let playlist = [];
let currentSongIndex = 0;
let isPlaying = false;
let startTime, elapsedTime = 0, intervalId;
let rotationAngles = [0, 0, 0, 0, 0];
let rotationStartTimes = [0, 0, 0, 0, 0];
let animationDurations = [170, 402, 611, 953, 1273];
let x = 1; // Use this to control the state
let fade = false; // New variable to control the fade effect
let overlayOpacity = 255; // Start fully opaque
let buffer;

function preload() {
  svgImages.push(loadImage("assets/Circles.svg"));
  svgImages.push(loadImage("assets/Complicated.svg"));
  svgImages.push(loadImage("assets/BlueWorld.svg"));
  svgImages.push(loadImage("assets/GoodNews.svg"));
  svgImages.push(loadImage("assets/ICanSee.svg"));

  playlist.push(loadSound("assets/Circles.mp3"));
  playlist.push(loadSound("assets/Complicated.mp3"));
  playlist.push(loadSound("assets/BlueWorld.mp3"));
  playlist.push(loadSound("assets/GoodNews.mp3"));
  playlist.push(loadSound("assets/ICanSee.mp3"));
  playlist.push(loadSound("assets/Everybody.mp3"));
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
  buffer.translate(2000 - 500, 2000 + 400); // Adjust as needed

  for (let i = 0; i < svgImages.length; i++) {
    buffer.push(); // Isolate the rotation for each SVG
    // Determine if the current SVG should be rotating
    if (x > 1) {
      // Calculate elapsed time since the start of the corresponding song's rotation
      let elapsedTime = currentTime1 - rotationStartTimes[i];
      // Check if the elapsed time has passed the start time for this ring
      if (elapsedTime > 0) {
        // Calculate rotation progress
        let rotationProgress = elapsedTime / animationDurations[i];
        // Calculate the target angle, ensuring it does not exceed TWO_PI
        let targetAngle = rotationProgress * TWO_PI;
        // Reverse the direction by negating the target angle and ensure it stops at 360 degrees
        rotationAngles[i] = (-targetAngle) % TWO_PI;
      }
    }
    // Apply the calculated rotation
    buffer.rotate(rotationAngles[i]);
    // Center the image at the rotation point and draw
    buffer.image(svgImages[i], -2000, -2000, 4000, 4000);
    buffer.pop();
  }

  buffer.pop();
  image(buffer, -2000, -600, 4000, 4000, 0, 0, width, height);

  // Overlay and play button logic
  if (x == 1 && fade) {
    overlayOpacity -= 1; // Decrease the opacity more significantly per frame
    overlayOpacity = max(overlayOpacity, 0); // Ensure it does not go below 0
  }
  
  if (x == 1) {
    fill(0, 0, 0, 100); // Use the updated opacity for overlay
    rect(0, 0, width, height);
    fill(20, overlayOpacity); // Use the same updated opacity for the play button text
    textSize(64);
    textAlign(CENTER, CENTER);
    text("▶", width / 2, height / 2);
  }

  if (isPlaying) {
    displayTimer();
  }
}

function mousePressed() {
  if (x == 1) {
    playAudio();
    fade = true; // Start fading
    x = 2; // Change state to prevent restarting the rotations
    rotationStartTimes.fill(millis() / 1000); // Initiate rotation for the first ring
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
