const canvas = document.querySelector("canvas");
const c = canvas.getContext("2d");

canvas.width = innerWidth;
canvas.height = innerHeight;

class Player {
  constructor() {
    this.width = 128;
    this.height = 128;

    this.position = {
      x: canvas.width / 2 - this.width / 2,
      y: canvas.height - this.height - 20,
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.speed = 15;

    this.img = new Image();
    this.img.src = "./assets/jet.png";
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }

  draw() {
    if (this.img.complete) {
      c.drawImage(
        this.img,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );
    } else {
      c.fillStyle = "red";
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }
}

class Bullets {
  constructor(position, velocity) {
    this.position = position;
    this.velocity = velocity;
    this.radius = 5;
    this.speed = 10;
  }

  draw() {
    c.beginPath();
    c.arc(this.position.x, this.position.y, this.radius, 0, Math.PI * 2);
    c.fillStyle = "red";
    c.fill();
    c.closePath();
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
  }
}

class Invader {
  constructor({ position }) {
    this.width = 128;
    this.height = 128;

    this.position = {
      x: position.x,
      y: position.y,
    };

    this.velocity = {
      x: 0,
      y: 0,
    };

    this.img = new Image();
    this.img.src = "./assets/invader.png";
  }

  update({ velocity }) {
    this.draw();
    this.position.x += velocity.x;
    this.position.y += velocity.y;
  }

  draw() {
    if (this.img.complete) {
      c.drawImage(
        this.img,
        this.position.x,
        this.position.y,
        this.width,
        this.height,
      );
    } else {
      c.fillStyle = "red";
      c.fillRect(this.position.x, this.position.y, this.width, this.height);
    }
  }
}

class Grid {
  constructor({ velocity }) {
    this.position = {
      x: 100,
      y: 100,
    };
    this.velocity = {
      x: velocity.x,
      y: 0,
    };
    this.invaders = [
      new Invader({ position: { x: this.position.x, y: this.position.y } }),
    ];

    this.row = Math.floor(Math.random() * 5) + 3;

    this.width = this.row * 100;

    for (let i = 0; i < this.row; i++) {
      this.invaders.push(
        new Invader({
          position: { x: this.position.x + i * 100, y: this.position.y },
        }),
      );
    }
  }
  update() {
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;
    this.velocity.y = 0;

    if (this.position.x + this.width >= canvas.width || this.position.x < 0) {
      this.velocity.x = -this.velocity.x;
      this.velocity.y = 100;
    }
  }
}

// collision detection both axis ========================================

function bulletHitsInvader(bullet, invader) {
  return (
    bullet.position.x + bullet.radius >= invader.position.x &&
    bullet.position.x - bullet.radius <= invader.position.x + invader.width &&
    bullet.position.y + bullet.radius >= invader.position.y &&
    bullet.position.y - bullet.radius <= invader.position.y + invader.height
  );
}

const player = new Player();
const gridsArray = [];
const BulletArray = [];

//keys ====================================================================

const keys = {
  ArrowLeft: {
    pressed: false,
  },
  ArrowRight: {
    pressed: false,
  },
};
let frames = 0;
let randomInterval = Math.floor(Math.random() * 500 + 100);

//game loop ====================================================================

function animate() {
  requestAnimationFrame(animate);

  // clear
  c.clearRect(0, 0, canvas.width, canvas.height);

  // update logic
  if (keys.ArrowLeft.pressed && player.position.x > 0) {
    player.velocity.x = -player.speed;
  } else if (
    keys.ArrowRight.pressed &&
    player.position.x + player.width <= canvas.width
  ) {
    player.velocity.x = player.speed;
  } else {
    player.velocity.x = 0;
  }

  //Spawning grid and moving grid
  gridsArray.forEach((grid, gridIdx) => {
    grid.update();
    for (i = grid.invaders.length - 1; i >= 0; i--) {
      const invader = grid.invaders[i];
      invader.update({ velocity: grid.velocity });

      for (j = BulletArray.length - 1; j >= 0; j--) {
        const bullet = BulletArray[j];

        //removing bullets and invaders
        if (bulletHitsInvader(bullet, invader)) {
          grid.invaders.splice(i, 1);
          BulletArray.splice(j, 1);

          //changing grid width if far invaders are removed
          if (grid.invaders.length > 0) {
            const firstIn = grid.invaders[0];
            const lastIn = grid.invaders[grid.invaders.length - 1];
            grid.width = lastIn.position.x - firstIn.position.x + 100;

          } else if (grid.invaders.length == 0) {

            //removing grid if all invader is removed
            gridsArray.splice(gridIdx, 1);
          }
        }
      }
    }
  });
  
  BulletArray.forEach((bullet, index) => {
    // removing bullets
    if (bullet.position.y + bullet.radius < 0) {
      BulletArray.splice(index, 1);
    } else {
      bullet.update();
    }
  });


  // render
  player.update();

  //Spawning invaders
  if (frames % randomInterval === 0) {
    gridsArray.push(
      new Grid({ velocity: { x: Math.floor(Math.random()) + 10 } }),
    );
    frames = 0;
  }
  frames++;
}

//starting =====================================================================
player.img.onload = () => {
  // animate();
};

//listners =======================================================================
window.addEventListener("keydown", ({ key }) => {
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = true;
      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = true;
      break;
    case " ":
      break;
  }
});

window.addEventListener("keyup", ({ key }) => {
  switch (key) {
    case "ArrowLeft":
      keys.ArrowLeft.pressed = false;

      break;
    case "ArrowRight":
      keys.ArrowRight.pressed = false;
      break;
    case " ":
      BulletArray.push(
        new Bullets(
          {
            x: player.position.x + player.width / 2,
            y: player.position.y + 20,
          },
          {
            x: 0,
            y: -15,
          },
        ),
      );
      break;
  }
});
