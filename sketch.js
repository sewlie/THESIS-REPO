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
let overlayOpacity = 100; // Start fully opaque
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
  let currentTime = millis() / 1000;
  buffer.push();
  buffer.translate(2000 - 500, 2000 + 400); // Adjust as needed

  for (let i = 0; i < svgImages.length; i++) {
    buffer.push(); // Isolate the rotation for each SVG
    // Check if it's time for this ring to start rotating based on the playlist sequence
    if (x > 1) {
      let timeSinceStart = currentTime - rotationStartTimes[i];
      // Only start rotating if the current time is past the start time for this ring
      if (timeSinceStart >= 0) {
        let rotationProgress = (timeSinceStart % animationDurations[i]) / animationDurations[i];
        rotationAngles[i] = rotationProgress * TWO_PI * -1;
        // Ensure the rotation only starts after its respective song starts playing
        if (i > currentSongIndex) rotationAngles[i] = 0; // This ensures the next ring doesn't start early
      }
    }
    buffer.rotate(rotationAngles[i]);
    buffer.image(svgImages[i], -2000, -2000, 4000, 4000);
    buffer.pop();
  }

  buffer.pop();
  image(buffer, -2000, -600, 4000, 4000, 0, 0, width, height);

  // Overlay and play button logic, including fade effect
  if (x == 1 && fade) {
    overlayOpacity -= 5; // Faster fade effect
    overlayOpacity = max(overlayOpacity, 0); // Prevent negative opacity
  }

  if (x == 1) {
    fill(0, 0, 0, overlayOpacity); // Apply fading to overlay
    rect(0, 0, width, height);
    fill(255, overlayOpacity); // Apply fading to play button text
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
    fade = true; // Initiate fading
    x = 2; // Change state to prevent restarting the rotations
    let currentTime = millis() / 1000;
    // Calculate and set start times for each ring based on the end of the previous song
    rotationStartTimes[0] = currentTime; // First ring starts immediately
    for (let i = 1; i < rotationStartTimes.length; i++) {
      rotationStartTimes[i] = rotationStartTimes[i - 1] + animationDurations[i - 1];
    }
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
  text(timerString, 0, 200); // Display timer text position adjusted for visibility
}
