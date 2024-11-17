import * as THREE from 'three';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('threejs-canvas') });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Video Texture
const videoElement = document.createElement('video');
videoElement.crossOrigin = "anonymous";
videoElement.loop = false;
videoElement.muted = true; // Muting to handle autoplay restrictions

const videoTexture = new THREE.VideoTexture(videoElement);
const videoMaterial = new THREE.MeshBasicMaterial({ map: videoTexture });

const planeGeometry = new THREE.PlaneGeometry(16, 9); // Initial plane dimensions
const videoPlane = new THREE.Mesh(planeGeometry, videoMaterial);
videoPlane.position.set(0, 0, -5);
scene.add(videoPlane);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

// Game state
let maxRounds = parseInt(localStorage.getItem('gameRounds'), 10) || 5;
let player1Score = 0;
let player2Score = 0;
let player1Choice = null;
let player2Choice = null;
let gameOver = false; // Track if the game is over

// Update the scoreboard on the page
function updateScoreboard() {
  document.getElementById('player1Score').textContent = player1Score;
  document.getElementById('player2Score').textContent = player2Score;
}

// Check if the game is over
function checkGameOver() {
  const totalRoundsPlayed = player1Score + player2Score;
  if (totalRoundsPlayed >= maxRounds) {
    gameOver = true; // Set game over flag
    const winner =
      player1Score > player2Score
        ? 'Player 1'
        : player1Score < player2Score
        ? 'Player 2'
        : 'No one';
    alert(`${winner} wins the game!`);
    
    // After showing the alert, play the winner animation
    if (player1Score > player2Score) {
      playWinnerAnimation('player1wins');
    } else if (player2Score > player1Score) {
      playWinnerAnimation('player2wins');
    } else {
      console.log("It's a draw!");
    }

    // Reset scores and update the scoreboard
    player1Score = 0;
    player2Score = 0;
    updateScoreboard();
  }
}

// Handle both players' choices and play the video
function playRound() {
  if (player1Choice && player2Choice) {
    const videoPath = `/anim/${player1Choice}_${player2Choice}.mp4`;
    console.log(`Playing video: ${videoPath}`);

    videoElement.src = videoPath;
    videoElement.load();

    videoElement.addEventListener('canplay', () => {
      console.log('Video ready to play');
      videoElement.play();
    });

    videoElement.addEventListener('ended', () => {
      console.log('Video ended');

      // Determine the winner of the round
      if (player1Choice === player2Choice) {
        console.log("It's a draw!");
      } else if (
        (player1Choice === 'rock' && player2Choice === 'scissors') ||
        (player1Choice === 'paper' && player2Choice === 'rock') ||
        (player1Choice === 'scissors' && player2Choice === 'paper')
      ) {
        player1Score++;
        console.log('Player 1 wins this round!');
      } else {
        player2Score++;
        console.log('Player 2 wins this round!');
      }

      // Reset choices
      player1Choice = null;
      player2Choice = null;

      // Update scoreboard
      updateScoreboard();

      // Check if the game is over
      checkGameOver();

      // Re-enable buttons for both players
      if (!gameOver) {
        enableButtons();
      }
    });
  }
}

// Play the winner animation (either player1wins or player2wins)
function playWinnerAnimation(winnerAnimation) {
  const videoPath = `/anim/${winnerAnimation}.mp4`;
  console.log(`Playing winner animation: ${videoPath}`);

  videoElement.src = videoPath;
  videoElement.load();

  videoElement.addEventListener('canplay', () => {
    console.log('Winner animation ready to play');
    videoElement.play();
  });

  videoElement.addEventListener('ended', () => {
    console.log('Winner animation ended');
    // Optionally, reset or clean up here after the animation ends
  });
}

// Disable all buttons for a specific player
function disablePlayerButtons(player) {
  document.getElementById(`rockButton${player}`).disabled = true;
  document.getElementById(`paperButton${player}`).disabled = true;
  document.getElementById(`scissorsButton${player}`).disabled = true;
}

// Enable all buttons for both players
function enableButtons() {
  ['rockButton1', 'paperButton1', 'scissorsButton1', 'rockButton2', 'paperButton2', 'scissorsButton2'].forEach(
    (buttonId) => {
      document.getElementById(buttonId).disabled = false;
    }
  );
}

// Event listeners for player choices
function handlePlayer1Choice(choice) {
  player1Choice = choice;
  console.log(`Player 1 chooses: ${choice}`);
  disablePlayerButtons(1); // Disable Player 1 buttons
  if (player2Choice) {
    playRound();
  }
}

function handlePlayer2Choice(choice) {
  player2Choice = choice;
  console.log(`Player 2 chooses: ${choice}`);
  disablePlayerButtons(2); // Disable Player 2 buttons
  if (player1Choice) {
    playRound();
  }
}

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

// Responsive handling
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// Add event listeners to buttons after DOM is ready
window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('rockButton1').addEventListener('click', () => handlePlayer1Choice('rock'));
  document.getElementById('paperButton1').addEventListener('click', () => handlePlayer1Choice('paper'));
  document.getElementById('scissorsButton1').addEventListener('click', () => handlePlayer1Choice('scissors'));

  document.getElementById('rockButton2').addEventListener('click', () => handlePlayer2Choice('rock'));
  document.getElementById('paperButton2').addEventListener('click', () => handlePlayer2Choice('paper'));
  document.getElementById('scissorsButton2').addEventListener('click', () => handlePlayer2Choice('scissors'));
});
