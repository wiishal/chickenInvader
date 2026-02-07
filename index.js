const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

const loadingScreen = document.getElementById("loading");
const scoreEl = document.getElementById("score");
const startGameScreenEl = document.getElementById("startGameScreen");
const playBtn = document.getElementById("playBtn");

playBtn.addEventListener("click", startGame);
let score = 0;

function addScore(points = 10) {
  score += points;
  scoreEl.textContent = `Score: ${score}`;
}

const images = {
  player: "./assets/jet.png",
  invader: "./assets/chicken.png",
  egg: "./assets/egg.png",
  silverEgg: "./assets/silverEgg.png",
};

const loadedImages = {};
let loadedCount = 0;

const totalImages = Object.keys(images).length;

function loadImages(callback) {
  Object.entries(images).forEach(([key, src]) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      loadedImages[key] = img;
      loadedCount++;

      if (loadedCount === totalImages) {
        callback();
      }
    };
  });
}

// ========================== classes =======================
class Player {
  constructor() {
    this.width = 70;
    this.height = 40;

    this.position = {
      x: canvas.width / 2 - this.width / 2,
      y: canvas.height - this.height - 20,
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.speed = 15;
    this.opacity = 1;

    this.img = loadedImages.player;
    this.width = this.img.width * 0.1;
    this.height = this.img.height * 0.1;
  }

  update() {
    this.draw();

    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // clamp X
    this.position.x = Math.max(
      0,
      Math.min(canvas.width - this.width, this.position.x),
    );

    // clamp Y
    this.position.y = Math.max(
      canvas.height / 2,
      Math.min(canvas.height - this.height, this.position.y),
    );
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.drawImage(
      this.img,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
    c.restore();
  }
}

class Eggs {
  constructor({ position }) {
    this.position = {
      x: position.x,
      y: position.y,
    };
    this.velocity = {
      x: 0,
      y: 5,
    };
    this.radius = 5;
    this.speed = 10;
    this.width = 50;
    this.height = 30;
    this.img = loadedImages.egg;
  }

  draw() {
    c.drawImage(
      this.img,
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height,
    );
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
// =========================== Bullets ====================
class Bullets {
  constructor({ position }) {
    this.position = { ...position };
    this.velocity = {
      x: 0,
      y: -15,
    };
    this.radius = 5;
    this.speed = 10;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "black";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}
class BigBullets {
  constructor({ position }) {
    this.position = {
      x: position.x,
      y: position.y,
    };
    this.xVelocity = Math.floor(Math.random() * 2) == 1 ? -2 : 2;

    this.velocity = {
      x: this.xVelocity,
      y: 1,
    };
    this.radius = 5;

    this.speed = 10;
    this.width = 100;
    this.height = 60;
    this.img = loadedImages.silverEgg;
  }

  draw() {
    c.drawImage(
      this.img,
      this.position.x - this.width / 2,
      this.position.y - this.height / 2,
      this.width,
      this.height,
    );
  }
  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    if (this.position.x + this.width >= canvas.width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
    }
  }
}

class Invader {
  constructor({ position }) {
    this.position = { ...position };
    this.velocity = { x: 0, y: 0 };

    this.img = loadedImages.invader;
    this.width = this.img.width * 0.1;
    this.height = this.img.height * 0.1;
  }

  update({ velocity }) {
    this.draw();
    this.position.x += velocity.x;
    this.position.y += velocity.y;
  }

  draw() {
    c.drawImage(
      this.img,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
  }
}

class Grid {
  constructor() {
    this.position = {
      x: 10,
      y: 10,
    };
    this.velocity = {
      x: 8,
      y: 0,
    };
    this.invaders = [];

    this.columns = Math.floor(Math.random() * 5) + 3; // 3–7
    this.rows = Math.floor(Math.random() * 3) + 2; // 2–4

    const spacingX = 105;
    const spacingY = 80;

    this.width = this.columns * spacingX;

    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.columns; col++) {
        this.invaders.push(
          new Invader({
            position: {
              x: this.position.x + col * spacingX,
              y: this.position.y + row * spacingY,
            },
          }),
        );
      }
    }
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    if (this.position.x + this.width >= canvas.width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
    }
  }
}

class Particles {
  constructor({ position, velocity, radius, color }) {
    this.position = { ...position };
    this.velocity = { ...velocity };
    this.radius = radius;
    this.speed = 10;
    this.opacity = 1;
    this.color = color;
  }

  draw() {
    c.save();
    c.globalAlpha = this.opacity;
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = this.color;
    c.fill();
    c.closePath();
    c.restore();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.opacity -= 0.02;
  }
}
// ============================= COLLISION DETECTION BOTH AXIS ========================================

function bulletHitsInvader(bullet, invader) {
  return (
    bullet.position.x + bullet.radius >= invader.position.x &&
    bullet.position.x - bullet.radius <= invader.position.x + invader.width &&
    bullet.position.y + bullet.radius >= invader.position.y &&
    bullet.position.y - bullet.radius <= invader.position.y + invader.height
  );
}

function projectileHitsPlayer(projectile, player) {
  return (
    projectile.position.x + projectile.radius >= player.position.x &&
    projectile.position.x - projectile.radius <=
      player.position.x + player.width &&
    projectile.position.y + projectile.radius >= player.position.y &&
    projectile.position.y - projectile.radius <=
      player.position.y + player.height
  );
}
//  ============================= PARTICLE EFFECT LOOP =======================================

function createParticleEffect({ object, color }) {
  for (let i = 0; i < 15; i++) {
    ParticlesArray.push(
      new Particles({
        position: {
          x: object.position.x + object.width / 2,
          y: object.position.y + object.height / 2,
        },
        velocity: {
          x: (Math.random() - 0.5) * 2,
          y: (Math.random() - 0.5) * 2,
        },
        radius: Math.random() * 2,
        color: color,
      }),
    );
  }
}
//  ============================= SHOOTING BULLET =======================================

function shootBullets(player) {
  BulletArray.push(
    new Bullets({
      position: {
        x: player.position.x + player.width / 2,
        y: player.position.y + 20,
      },
    }),
  );
}

//  ============================= SCREENS =======================================
function gamePauseScreen() {
  c.fillStyle = "rgba(0,0,0,0.4)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "white";
  c.font = "40px sans-serif";
  c.fillText("PAUSED", canvas.width / 2 - 70, canvas.height / 2);
  c.fillText(
    "press ESC for START",
    canvas.width / 2 - 200,
    canvas.height / 2 + 100,
  );
}
function gameOverScreen() {
  c.fillStyle = "rgba(0,0,0,0.4)";
  c.fillRect(0, 0, canvas.width, canvas.height);
  c.fillStyle = "white";
  c.font = "40px sans-serif";
  c.fillText(`SCORE ${score}`, canvas.width / 2 - 100, canvas.height / 2 - 100);

  c.fillText("GAME OVER", canvas.width / 2 - 70, canvas.height / 2);
  c.fillText(
    "press R for RESTART",
    canvas.width / 2 - 200,
    canvas.height / 2 + 100,
  );
}

//  ============================= KEYS =======================================

const keys = {
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
  ArrowUp: {
    pressed: false,
  },
  ArrowDown: {
    pressed: false,
  },
};

// ================================= CONSTANTS ===================================

let gamePaused = false;
const gridsArray = [];
const BulletArray = [];
const BigBulletsArray = [];
const EggsArray = [];
const ParticlesArray = [];
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 50);
let eggInterval = 50;
let bigBulletInterval = 200;
let game = { over: false, active: true, pause: false };
let powerUp = true;
let player;

// ================================= RESTART ===================================

function resetGame() {
  score = 0;
  scoreEl.textContent = "Score: 0";

  Object.values(keys).forEach((key) => (key.pressed = false));

  player = new Player();
  player.opacity = 1;

  gridsArray.length = 0;
  BulletArray.length = 0;
  EggsArray.length = 0;
  BigBulletsArray.length = 0;
  ParticlesArray.length = 0;

  frames = 0;

  game.over = false;
  game.active = true;
  game.pause = false;

  gridsArray.push(new Grid());
  animate();
}
// ================================= GAME LOOP ===================================

function animate() {
  if (!game.active) {
    gameOverScreen();
  }
  if (!game.active) return;
  requestAnimationFrame(animate);

  // clear
  c.clearRect(0, 0, canvas.width, canvas.height);

  // DRAWING EVERYTHING
  gridsArray.forEach((grid) => {
    grid.invaders.forEach((invader) => invader.draw());
  });

  BulletArray.forEach((bullet) => bullet.draw());
  EggsArray.forEach((egg) => egg.draw());
  BigBulletsArray.forEach((bigBullet) => bigBullet.update());
  player.draw();

  // USE OVERLAY (visual only)
  if (game.pause) {
    gamePauseScreen();
    return;
  }

  // ================= UPDATE LOGIC =================

  player.velocity.x = 0;
  player.velocity.y = 0;

  if (keys.ArrowLeft.pressed) player.velocity.x = -player.speed;
  if (keys.ArrowRight.pressed) player.velocity.x = player.speed;
  if (keys.ArrowUp.pressed) player.velocity.y = -player.speed;
  if (keys.ArrowDown.pressed) player.velocity.y = player.speed;

  player.update();
  ParticlesArray.forEach((particle, particleIdx) => {
    if (particle.opacity <= 0) {
      ParticlesArray.splice(particleIdx, 1);
    }
    particle.update();
  });

  if (gridsArray.length === 0) {
    gridsArray.push(new Grid());
  }

 

  gridsArray.forEach((grid, gridIdx) => {
    grid.update();

    if (frames % eggInterval === 0 && grid.invaders.length > 0) {
      const randomInvader =
        grid.invaders[Math.floor(Math.random() * grid.invaders.length)];

      EggsArray.push(
        new Eggs({
          position: {
            x: randomInvader.position.x + randomInvader.width / 2,
            y: randomInvader.position.y + randomInvader.height,
          },
        }),
      );
    }

    if (frames % bigBulletInterval === 0 && grid.invaders.length > 0) {
      const randomInvader =
        grid.invaders[Math.floor(Math.random() * grid.invaders.length)];

      BigBulletsArray.push(
        new BigBullets({
          position: {
            x: randomInvader.position.x + randomInvader.width / 2,
            y: randomInvader.position.y + randomInvader.height,
          },
        }),
      );
    }

    for (let i = grid.invaders.length - 1; i >= 0; i--) {
      const invader = grid.invaders[i];
      invader.update({ velocity: grid.velocity });

      for (let j = BulletArray.length - 1; j >= 0; j--) {
        const bullet = BulletArray[j];
        if (bulletHitsInvader(bullet, invader)) {
          grid.invaders.splice(i, 1);
          BulletArray.splice(j, 1);
          createParticleEffect({ object: invader, color: "red" });
          addScore();
        }
      }
    }

    if (grid.invaders.length === 0) {
      gridsArray.splice(gridIdx, 1);
    }
  });

  BulletArray.forEach((bullet, i) => {
    if (bullet.position.y + bullet.radius < 0) {
      BulletArray.splice(i, 1);
    } else {
      bullet.update();
    }
  });

  EggsArray.forEach((egg, i) => {
    if (projectileHitsPlayer(egg, player)) {
      createParticleEffect({ object: player, color: "blue" });
      EggsArray.splice(i, 1);
      player.opacity = 0;
      game.over = true;
      setTimeout(() => {
        game.active = false;
      }, 2000);
    }
    if (egg.position.y > canvas.height) {
      EggsArray.splice(i, 1);
    } else {
      egg.update();
    }
  });

  BigBulletsArray.forEach((bigBullet, i) => {
    if (projectileHitsPlayer(bigBullet, player)) {
      createParticleEffect({ object: player });
      BigBulletsArray.splice(i, 1);
      player.opacity = 0;
      game.over = true;
      setTimeout(() => {
        game.active = false;
      }, 2000);
    }
    if (bigBullet.position.y > canvas.height) {
      BigBulletsArray.splice(i, 1);
    } else {
      bigBullet.update();
    }
  });

  frames++;
}

function startGame() {
  startGameScreenEl.style.display = "none";
  animate();
}

function displayStartGameScreen() {
  startGameScreenEl.style.display = "flex";
}
// ================================ STARTING =====================================

loadImages(() => {
  loadingScreen.style.display = "none";
  player = new Player();
  displayStartGameScreen();
  // animate();
});

//==================================== LISTENER ===================================

window.addEventListener("keydown", ({ key }) => {
  if (key === "r" && game.over && !game.active) {
    resetGame();
    return;
  }

  if (game.over) return;
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = true;
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = true;
      break;
    case " ":
      break;

    case "Escape":
      game.pause = !game.pause;
  }
});

window.addEventListener("keyup", ({ key }) => {
  if (game.over) return;

  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case "ArrowUp":
      keys.ArrowUp.pressed = false;
      break;
    case "ArrowDown":
      keys.ArrowDown.pressed = false;
      break;
    case " ":
      shootBullets(player);
      break;
  }
});
