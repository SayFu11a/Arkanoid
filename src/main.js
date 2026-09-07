import { Application, Graphics, Text } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({
    width: 960,
    height: 720,
    background: "#000000",
    antialias: true,
  });
  document.getElementById("pixi-container").appendChild(app.canvas);
  const clearBricksButton = document.getElementById("clear-bricks-button");

  const paddleWidth = 140;
  const paddleHeight = 24;
  const paddleBottomOffset = 70;
  const paddleSpeed = 480;
  const ballRadius = 10;
  const playfieldLeft = 54;
  const playfieldTop = 42;
  const playfieldWidth = 650;
  const playfieldHeight = 648;
  const playfieldRight = playfieldLeft + playfieldWidth;
  const playfieldBottom = playfieldTop + playfieldHeight;
  const brickRows = 5;
  const brickColumns = 8;
  const brickHeight = 28;
  const brickGap = 6;
  const brickTopOffset = playfieldTop + 75;
  const brickSidePadding = 30;
  const brickColors = [0xe94f64, 0xf79d41, 0xf7dc6f, 0x66c7a5, 0x4ea5d9];

  const paddle = new Graphics()
    .roundRect(0, 0, paddleWidth, paddleHeight, 8)
    .fill(0xde3249);

  const ball = new Graphics().circle(0, 0, ballRadius).fill(0xffffff);
  const playfieldBackground = new Graphics()
    .rect(playfieldLeft, playfieldTop, playfieldWidth, playfieldHeight)
    .fill(0x0b3e18);
  const frame = new Graphics()
    .roundRect(playfieldLeft - 18, playfieldTop - 24, playfieldWidth + 36, 20, 4)
    .fill(0xd6ded9)
    .rect(playfieldLeft - 18, playfieldTop - 4, 18, playfieldHeight + 18)
    .fill(0xd6ded9)
    .rect(playfieldRight, playfieldTop - 4, 18, playfieldHeight + 18)
    .fill(0xd6ded9)
    .rect(playfieldLeft - 3, playfieldTop - 5, playfieldWidth + 6, 5)
    .fill(0x52605a);
  const scoreText = new Text({
    text: "SCORE: 0",
    style: {
      fill: 0xffffff,
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
    },
  });
  scoreText.position.set(playfieldRight + 38, 110);

  const livesText = new Text({
    text: "LIVES: 3",
    style: {
      fill: 0xffffff,
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
    },
  });
  livesText.position.set(playfieldRight + 38, 150);

  const endOverlay = new Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0x000000, alpha: 0.65 });
  endOverlay.visible = false;

  const winText = new Text({
    text: "YOU WIN!\nAll bricks destroyed\nPress R to restart",
    style: {
      align: "center",
      fill: 0xffffff,
      fontFamily: "Arial",
      fontSize: 42,
      fontWeight: "bold",
      lineHeight: 56,
    },
  });
  winText.anchor.set(0.5);
  winText.position.set(playfieldLeft + playfieldWidth / 2, playfieldTop + playfieldHeight / 2);
  winText.visible = false;

  const gameOverText = new Text({
    text: "GAME OVER\nPress R to restart",
    style: {
      align: "center",
      fill: 0xffffff,
      fontFamily: "Arial",
      fontSize: 48,
      fontWeight: "bold",
      lineHeight: 56,
    },
  });
  gameOverText.anchor.set(0.5);
  gameOverText.position.set(playfieldLeft + playfieldWidth / 2, playfieldTop + playfieldHeight / 2);
  gameOverText.visible = false;

  const keys = {};
  const bricks = [];
  const ballVelocity = { x: 260, y: -360 };
  let isLaunched = false;
  let gameWon = false;
  let gameOver = false;
  let lives = 3;
  let score = 0;

  const putBallOnPaddle = () => {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ballRadius;
  };

  const placePaddle = () => {
    paddle.x = playfieldLeft + (playfieldWidth - paddle.width) / 2;
    paddle.y = playfieldBottom - paddleBottomOffset;
    putBallOnPaddle();
  };

  const createBricks = () => {
    const brickWidth =
      (playfieldWidth - brickSidePadding * 2 - brickGap * (brickColumns - 1)) /
      brickColumns;

    for (let row = 0; row < brickRows; row += 1) {
      for (let column = 0; column < brickColumns; column += 1) {
        const brick = new Graphics()
          .roundRect(0, 0, brickWidth, brickHeight, 5)
          .fill(brickColors[row]);

        brick.x = playfieldLeft + brickSidePadding + column * (brickWidth + brickGap);
        brick.y = brickTopOffset + row * (brickHeight + brickGap);

        bricks.push(brick);
        app.stage.addChild(brick);
      }
    }
  };

  const createWallDetail = (x, y, width, height) => {
    const wallDetail = new Graphics()
      .roundRect(0, 0, width, height, 3)
      .fill(0xcfd7d1)
      .rect(0, 7, width, 4)
      .fill(0x53605a)
      .rect(0, 15, width, 4)
      .fill(0x53605a)
      .rect(0, height - 11, width, 4)
      .fill(0xffffff);

    wallDetail.position.set(x, y);
    app.stage.addChild(wallDetail);
  };

  const createWallDetails = () => {
    const wallBlockHeight = 52;
    const wallBlockWidth = 18;
    const rows = [playfieldTop + 115, playfieldTop + 280, playfieldTop + 445];

    rows.forEach((y) => {
      createWallDetail(playfieldLeft - wallBlockWidth, y, wallBlockWidth, wallBlockHeight);
      createWallDetail(playfieldRight, y, wallBlockWidth, wallBlockHeight);
    });
  };

  const removeAllBricks = () => {
    while (bricks.length > 0) {
      const brick = bricks.pop();
      app.stage.removeChild(brick);
      brick.destroy();
    }
  };

  const showWinScreen = () => {
    gameWon = true;
    isLaunched = false;
    app.stage.addChild(endOverlay, winText);
    endOverlay.visible = true;
    winText.visible = true;
  };

  const showGameOverScreen = () => {
    gameOver = true;
    isLaunched = false;
    app.stage.addChild(endOverlay, gameOverText);
    endOverlay.visible = true;
    gameOverText.visible = true;
  };

  const restartGame = () => {
    removeAllBricks();
    score = 0;
    lives = 3;
    gameWon = false;
    gameOver = false;
    isLaunched = false;
    ballVelocity.x = 260;
    ballVelocity.y = -360;
    scoreText.text = "SCORE: 0";
    livesText.text = "LIVES: 3";
    endOverlay.visible = false;
    winText.visible = false;
    gameOverText.visible = false;
    createBricks();
    placePaddle();
  };

  clearBricksButton.addEventListener("click", () => {
    if (gameWon || gameOver) {
      return;
    }

    const destroyedBrickCount = bricks.length;

    removeAllBricks();

    score += destroyedBrickCount * 10;
    scoreText.text = `SCORE: ${score}`;
    showWinScreen();
  });

  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "KeyR" && (gameWon || gameOver)) {
      restartGame();
      return;
    }

    if (event.code === "Space" && !isLaunched && !gameWon && !gameOver) {
      event.preventDefault();
      isLaunched = true;
    }
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  app.stage.addChild(playfieldBackground, frame);
  createWallDetails();
  app.stage.addChild(paddle, ball);
  placePaddle();
  createBricks();
  app.stage.addChild(scoreText, livesText, endOverlay, winText, gameOverText);

  app.ticker.add((ticker) => {
    const deltaSeconds = ticker.deltaMS / 1000;

    if (gameWon || gameOver) {
      return;
    }

    if (keys.ArrowLeft || keys.KeyA) {
      paddle.x -= paddleSpeed * deltaSeconds;
    }
    if (keys.ArrowRight || keys.KeyD) {
      paddle.x += paddleSpeed * deltaSeconds;
    }

    paddle.x = Math.max(playfieldLeft, Math.min(paddle.x, playfieldRight - paddle.width));

    if (!isLaunched) {
      putBallOnPaddle();
      return;
    }

    ball.x += ballVelocity.x * deltaSeconds;
    ball.y += ballVelocity.y * deltaSeconds;

    if (ball.x - ballRadius <= playfieldLeft) {
      ball.x = playfieldLeft + ballRadius;
      ballVelocity.x = Math.abs(ballVelocity.x);
    }
    if (ball.x + ballRadius >= playfieldRight) {
      ball.x = playfieldRight - ballRadius;
      ballVelocity.x = -Math.abs(ballVelocity.x);
    }
    if (ball.y - ballRadius <= playfieldTop) {
      ball.y = playfieldTop + ballRadius;
      ballVelocity.y = Math.abs(ballVelocity.y);
    }

    for (let index = bricks.length - 1; index >= 0; index -= 1) {
      const brick = bricks[index];
      const halfBrickWidth = brick.width / 2;
      const halfBrickHeight = brick.height / 2;
      const brickCenterX = brick.x + halfBrickWidth;
      const brickCenterY = brick.y + halfBrickHeight;
      const differenceX = ball.x - brickCenterX;
      const differenceY = ball.y - brickCenterY;
      const overlapX = halfBrickWidth + ballRadius - Math.abs(differenceX);
      const overlapY = halfBrickHeight + ballRadius - Math.abs(differenceY);

      if (overlapX <= 0 || overlapY <= 0) {
        continue;
      }

      if (overlapX < overlapY) {
        ball.x = brickCenterX + Math.sign(differenceX || 1) * (halfBrickWidth + ballRadius);
        ballVelocity.x = -ballVelocity.x;
      } else {
        ball.y = brickCenterY + Math.sign(differenceY || 1) * (halfBrickHeight + ballRadius);
        ballVelocity.y = -ballVelocity.y;
      }

      app.stage.removeChild(brick);
      brick.destroy();
      bricks.splice(index, 1);
      score += 10;
      scoreText.text = `SCORE: ${score}`;

      if (bricks.length === 0) {
        showWinScreen();
      }

      break;
    }

    const hitsPaddle =
      ballVelocity.y > 0 &&
      ball.y + ballRadius >= paddle.y &&
      ball.y - ballRadius <= paddle.y + paddle.height &&
      ball.x + ballRadius >= paddle.x &&
      ball.x - ballRadius <= paddle.x + paddle.width;

    if (hitsPaddle) {
      const paddleCenter = paddle.x + paddle.width / 2;
      let hitPosition = (ball.x - paddleCenter) / (paddle.width / 2);

      // Центр - почти вертикальный отскок, края - сильнее в сторону.
      if (Math.abs(hitPosition) < 0.12) {
        hitPosition = 0.12 * Math.sign(ballVelocity.x || 1);
      }

      const maxBounceAngle = Math.PI / 3;
      const bounceAngle = hitPosition * maxBounceAngle;
      const ballSpeed = Math.hypot(ballVelocity.x, ballVelocity.y);

      ball.y = paddle.y - ballRadius;
      ballVelocity.x = ballSpeed * Math.sin(bounceAngle);
      ballVelocity.y = -ballSpeed * Math.cos(bounceAngle);
    }

    if (ball.y - ballRadius > playfieldBottom) {
      lives -= 1;
      livesText.text = `LIVES: ${lives}`;

      if (lives === 0) {
        showGameOverScreen();
      } else {
        isLaunched = false;
        putBallOnPaddle();
      }
    }
  });
})();
