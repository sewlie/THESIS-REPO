
let svgImages = [];
let playlist = [];
let currentSongIndex = 0;
let isPlaying = false;
let startTime, elapsedTime = 0, intervalId;
let rotationAngles = [0, 0, 0, 0, 0];
let rotationStartTimes = [0, 0, 0, 0, 0]; // Initialize with zeros
let animationDurations = [170, 232, 209, 342, 220];

var x = 1;



function preload() {
  svgImages.push(loadImage('assets/Asset10.svg'));
  svgImages.push(loadImage('assets/Asset17.svg'));
  // Add other SVGs as needed...

  playlist.push(loadSound('assets/Circles.mp3'));
  playlist.push(loadSound('assets/Complicated.mp3'));
  // Add other tracks to the playlist... 
}

function setup() {
  createCanvas(2000, 2000);
  background(255);
  setupAudioPlayer(playlist[0]);
}

var x = 1; // Initial state

function draw() {
  background(255);

  let currentTime = millis() / 1000;

  // Always draw the rings first
  for (let i = 0; i < svgImages.length; i++) {
      push(); // Isolate transformations for each ring
      translate(width / 2, height / 2); // Move to the center of the canvas

      // Apply rotation based on the current time and user interaction
      if (x > 1) {
          let elapsedTime = currentTime - rotationStartTimes[i];
          let smoothStartTime = 2; // Adjust for smoother start duration
          // Only start calculating rotation after the initial click
          if (currentTime >= rotationStartTimes[i] && elapsedTime <= smoothStartTime) {
              let smoothProgress = elapsedTime / smoothStartTime;
              rotationAngles[i] = TWO_PI * smoothProgress * (animationDurations[i] / 360); // Adjusted for smooth start
          } else if (currentTime > rotationStartTimes[i] + smoothStartTime) {
              // Full rotation based on duration after smooth start period
              if (currentTime <= animationStartTimes[i] + animationDurations[i]) {
                  let progress = (currentTime - (rotationStartTimes[i] + smoothStartTime)) / animationDurations[i];
                  rotationAngles[i] = TWO_PI * progress;
              }
          }
          rotate(rotationAngles[i]);
      }

      // Draw the SVG centered on the canvas
      image(svgImages[i], -1000, -1000, 2000, 2000);
      pop(); // End of isolation
  }

  // Overlay and play button logic, displayed only at the start
  if (x == 1) {
      fill(0, 0, 0, 51); // Semi-transparent overlay
      rect(-width / 2, -height / 2, width, height);
      fill(255);
      textSize(64);
      text('▶', 0, 0); // Draw play button at the center
  }

  // Display timer if audio is playing
  if (isPlaying) {
      displayTimer();
  }
}


function mousePressed() {
  if (x == 1) {
      playAudio();
      x = 2;
      let currentTime = millis() / 1000;
      for (let i = 0; i < rotationStartTimes.length; i++) {
          rotationStartTimes[i] = currentTime; // Record start time for rotation
      }
  } else if (!isPlaying) {
      playAudio();
  } else {
      pauseAudio();
  }
}




function setupAudioPlayer(audio) {
  audioPlayer = audio;
  audioPlayer.onended(playNextSong);
}

function playAudio() {
  if (playlist[currentSongIndex].isPlaying()) {
    playlist[currentSongIndex].pause();
  } else {
    playlist[currentSongIndex].play();
    isPlaying = true;
    startTimer();
  }
}

function pauseAudio() {
  playlist[currentSongIndex].pause();
  isPlaying = false;
}

function playNextSong() {
  currentSongIndex++;
  if (currentSongIndex >= playlist.length) {
    currentSongIndex = 0;
  }
  setupAudioPlayer(playlist[currentSongIndex]);
  playAudio();
}

function startTimer() {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
  startTime = millis();
  intervalId = setInterval(() => {
    elapsedTime = millis() - startTime;
    // Optional: Update timer display logic here
  }, 100);
}

function displayTimer() {
  let seconds = Math.floor(elapsedTime / 1000) % 60;
  let minutes = Math.floor(elapsedTime / (1000 * 60)) % 60;
  let hours = Math.floor(elapsedTime / (1000 * 60 * 60)) % 24;

  let timerString = nf(hours, 2) + ':' + nf(minutes, 2) + ':' + nf(seconds, 2);
  fill(0);
  textSize(32);
  text(timerString, 50, 50);
}