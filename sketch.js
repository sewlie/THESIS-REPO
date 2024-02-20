let svgImages = [];
let playlist = [];
let currentSongIndex = 0;
let isPlaying = false;
let startTime, elapsedTime = 0, intervalId;
let rotationAngles = [0, 0, 0, 0, 0];
let rotationStartTimes = [0, 0, 0, 0, 0];
let animationDurations = [5, 10, 15, 953, 1273]; // Corrected: Durations are in seconds
let x = 1; // Control state
let fade = false; // Control fade effect
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
  pixelDensity(2);
  createCanvas(2000, 2000);
  buffer = createGraphics(4000, 4000, P2D);
  background(255);
  setupAudioPlayer(playlist[0]);
}

function calculateRotationAngle(currentTime, startTime, duration) {
  const elapsedTime = currentTime - startTime;
  const phaseThreshold = duration * 0.22; // 20% of the total duration for the slow phase
  let rotationProgress;

  if (elapsedTime < phaseThreshold) {
      // Slow phase: Use a smaller portion of the rotation
      const slowPhaseProgress = elapsedTime / phaseThreshold;
      // Example of easing in: quadratic easing for smoother start
      rotationProgress = (slowPhaseProgress * slowPhaseProgress) * (TWO_PI * -0.01);
  } else {
      // Fast phase: Complete the rest of the rotation
      const fastPhaseDuration = duration - phaseThreshold;
      const fastPhaseElapsedTime = elapsedTime - phaseThreshold;
      // Linear progress for simplicity, adjust as needed for different easing
      const fastPhaseProgress = fastPhaseElapsedTime / fastPhaseDuration;
      // Ensure the rotation completes the remaining 80% of the full circle
      rotationProgress = (TWO_PI * -0.01) + (fastPhaseProgress * (TWO_PI * -0.99));
  }

  return rotationProgress;
}


function draw() {
  background(255);
  buffer.clear();
  let currentTime = millis() / 1000;
  buffer.push();
  buffer.translate(2000 - 500, 2000 + 400);

  for (let i = 0; i < svgImages.length; i++) {
      buffer.push();
      if (x > 1) {
          // Calculate rotation angle with the custom function
          if (currentTime >= rotationStartTimes[i] && currentTime <= rotationStartTimes[i] + animationDurations[i]) {
              rotationAngles[i] = calculateRotationAngle(currentTime, rotationStartTimes[i], animationDurations[i]);
          } else if (currentTime > rotationStartTimes[i] + animationDurations[i]) {
              // Ensure the rotation does not revert after completing
              rotationAngles[i] = -TWO_PI; // Adjust if your direction or completion state differs
          }
      }
      buffer.rotate(rotationAngles[i]);
      buffer.image(svgImages[i], -2000, -2000, 4000, 4000);
      buffer.pop();
  }

  buffer.pop();
  image(buffer, -2000, -600, 4000, 4000, 0, 0, width, height);

  // Implementing the overlay and play button logic with fade effect
  if (x == 1 && fade) {
    overlayOpacity -= 5; // Adjust for a faster fade effect
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
    x = 2; // Change state
    let currentTime = millis() / 1000; // Current time in seconds
    // Set the initial start time for the first ring
    rotationStartTimes[0] = currentTime;
    // Calculate and set start times for each ring based on the actual durations
    for (let i = 1; i < rotationStartTimes.length; i++) {
      rotationStartTimes[i] = rotationStartTimes[i - 1] + animationDurations[i - 1]; // No conversion needed, already in seconds
    }
  } else if (!isPlaying) {
    playAudio();
  }
}

function setupAudioPlayer(audio) {
  audio.onended(() => {
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
  if (currentSongIndex < playlist.length) {
    setupAudioPlayer(playlist[currentSongIndex]);
    playAudio();
  }
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
  text(timerString, width / 2, height / 2 + 200);
}
