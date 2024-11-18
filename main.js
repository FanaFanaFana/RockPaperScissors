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
let playerScore = 0;
let computerScore = 0;
let gameOver = false; // Track if the game is over

// Update the scoreboard on the page
function updateScoreboard() {
  document.getElementById('playerScore').textContent = playerScore;
  document.getElementById('computerScore').textContent = computerScore;
}

// Check if the game is over
function checkGameOver() {
  const totalRoundsPlayed = playerScore + computerScore;
  if (totalRoundsPlayed >= maxRounds) {
    gameOver = true; // Set game over flag
    const winner =
      playerScore > computerScore
        ? 'Player'
        : playerScore < computerScore
        ? 'Computer'
        : 'No one';
    alert(`${winner} wins the game!`);
    
    // After showing the alert, play the winner animation
    if (playerScore > computerScore) {
      playWinAnimation("/anim/player1wins.mp4");
    } else if (playerScore < computerScore) {
      playWinAnimation("/anim/player2wins.mp4");
    }

    // Reset scores and update the scoreboard
    playerScore = 0;
    computerScore = 0;
    updateScoreboard();
  }
}

// Random computer choice
function getRandomChoice() {
  const choices = ['rock', 'paper', 'scissors'];
  return choices[Math.floor(Math.random() * choices.length)];
}

// Function to play the video based on user choice
function playVideo(userChoice) {
  // Disable buttons to prevent multiple clicks during video playback
  document.getElementById('rockButton').disabled = true;
  document.getElementById('paperButton').disabled = true;
  document.getElementById('scissorsButton').disabled = true;

  const computerChoice = getRandomChoice();
  const videoPath = `/anim/${userChoice}_${computerChoice}.mp4`;
  console.log(`Playing video: ${videoPath}`);

  videoElement.src = videoPath;
  videoElement.load();

  // Event listener for when the video is ready to play
  videoElement.addEventListener('canplay', () => {
    console.log('Video ready to play');
    videoElement.play();
  });

  // Event listener for when the video ends
  const handleVideoEnded = () => {
    console.log('Video ended');
    videoElement.removeEventListener('ended', handleVideoEnded);

    // Get the video filename
    const videoName = videoPath.split('/').pop(); // Get video file name

    // Check the video name and update the score accordingly
    let winner = null;
    if (videoName === "rock_rock.mp4" || videoName === "scissors_scissors.mp4" || videoName === "paper_paper.mp4") {
      console.log("It's a draw!");
    } else if (videoName === "rock_scissors.mp4" || videoName === "paper_rock.mp4" || videoName === "scissors_paper.mp4") {
      playerScore++;
      console.log("Player wins this round!");
      winner = "player"; // Player wins
    } else if (videoName === "rock_paper.mp4" || videoName === "scissors_rock.mp4" || videoName === "paper_scissors.mp4") {
      computerScore++;
      console.log("Computer wins this round!");
      winner = "computer"; // Computer wins
    }

    // Update scoreboard
    updateScoreboard();

    // Check if the game is over
    checkGameOver();

    // Re-enable the buttons after the video ends, if game is not over
    if (!gameOver) {
      document.getElementById('rockButton').disabled = false;
      document.getElementById('paperButton').disabled = false;
      document.getElementById('scissorsButton').disabled = false;
    }
  };

  videoElement.addEventListener('ended', handleVideoEnded);
}

// Function to play win animations (player or computer wins)
function playWinAnimation(winAnimationPath) {
  // Disable buttons during win animation
  document.getElementById('rockButton').disabled = true;
  document.getElementById('paperButton').disabled = true;
  document.getElementById('scissorsButton').disabled = true;

  videoElement.src = winAnimationPath;
  videoElement.load();

  // Event listener for when the win animation is ready to play
  videoElement.addEventListener('canplay', () => {
    console.log('Win animation ready to play');
    videoElement.play();
  });

  // Re-enable buttons after win animation ends
  const handleWinAnimationEnded = () => {
    console.log('Win animation ended');
    videoElement.removeEventListener('ended', handleWinAnimationEnded);

    document.getElementById('rockButton').disabled = false;
    document.getElementById('paperButton').disabled = false;
    document.getElementById('scissorsButton').disabled = false;
  };

  videoElement.addEventListener('ended', handleWinAnimationEnded);
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
  document.getElementById('rockButton').addEventListener('click', () => playVideo('rock'));
  document.getElementById('paperButton').addEventListener('click', () => playVideo('paper'));
  document.getElementById('scissorsButton').addEventListener('click', () => playVideo('scissors'));
});
