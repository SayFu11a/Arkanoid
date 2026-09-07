import { Application, Graphics, Text } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({
    width: 960,
    height: 720,
    background: "#1099bb",
    antialias: true,
  });
  document.getElementById("pixi-container").appendChild(app.canvas);
  const clearBricksButton = document.getElementById("clear-bricks-button");

  const paddleWidth = 140;
  const paddleHeight = 24;
  const paddleBottomOffset = 70;
  const paddleSpeed = 480;
  const ballRadius = 10;
  const brickRows = 5;
  const brickColumns = 8;
  const brickHeight = 28;
  const brickGap = 6;
  const brickTopOffset = 90;
  const brickSidePadding = 80;
  const brickColors = [0xe94f64, 0xf79d41, 0xf7dc6f, 0x66c7a5, 0x4ea5d9];

  const paddle = new Graphics()
    .roundRect(0, 0, paddleWidth, paddleHeight, 8)
    .fill(0xde3249);

  const ball = new Graphics().circle(0, 0, ballRadius).fill(0xffffff);
  const scoreText = new Text({
    text: "SCORE: 0",
    style: {
      fill: 0xffffff,
      fontFamily: "Arial",
      fontSize: 24,
      fontWeight: "bold",
    },
  });
  scoreText.position.set(24, 24);

  const winOverlay = new Graphics()
    .rect(0, 0, app.screen.width, app.screen.height)
    .fill({ color: 0x000000, alpha: 0.65 });
  winOverlay.visible = false;

  const winText = new Text({
    text: "YOU WIN!\nAll bricks destroyed",
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
  winText.position.set(app.screen.width / 2, app.screen.height / 2);
  winText.visible = false;

  const keys = {};
  const bricks = [];
  const ballVelocity = { x: 260, y: -360 };
  let isLaunched = false;
  let gameWon = false;
  let score = 0;

  const putBallOnPaddle = () => {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ballRadius;
  };

  const placePaddle = () => {
    paddle.x = (app.screen.width - paddle.width) / 2;
    paddle.y = app.screen.height - paddleBottomOffset;
    putBallOnPaddle();
  };

  const createBricks = () => {
    const brickWidth =
      (app.screen.width - brickSidePadding * 2 - brickGap * (brickColumns - 1)) /
      brickColumns;

    for (let row = 0; row < brickRows; row += 1) {
      for (let column = 0; column < brickColumns; column += 1) {
        const brick = new Graphics()
          .roundRect(0, 0, brickWidth, brickHeight, 5)
          .fill(brickColors[row]);

        brick.x = brickSidePadding + column * (brickWidth + brickGap);
        brick.y = brickTopOffset + row * (brickHeight + brickGap);

        bricks.push(brick);
        app.stage.addChild(brick);
      }
    }
  };

  const showWinScreen = () => {
    gameWon = true;
    isLaunched = false;
    winOverlay.visible = true;
    winText.visible = true;
  };

  clearBricksButton.addEventListener("click", () => {
    const destroyedBrickCount = bricks.length;

    while (bricks.length > 0) {
      const brick = bricks.pop();
      app.stage.removeChild(brick);
      brick.destroy();
    }

    score += destroyedBrickCount * 10;
    scoreText.text = `SCORE: ${score}`;
    showWinScreen();
  });

  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "Space" && !isLaunched && !gameWon) {
      event.preventDefault();
      isLaunched = true;
    }
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  app.stage.addChild(paddle, ball);
  placePaddle();
  createBricks();
  app.stage.addChild(scoreText, winOverlay, winText);

  app.ticker.add((ticker) => {
    const deltaSeconds = ticker.deltaMS / 1000;

    if (gameWon) {
      return;
    }

    if (keys.ArrowLeft || keys.KeyA) {
      paddle.x -= paddleSpeed * deltaSeconds;
    }
    if (keys.ArrowRight || keys.KeyD) {
      paddle.x += paddleSpeed * deltaSeconds;
    }

    paddle.x = Math.max(0, Math.min(paddle.x, app.screen.width - paddle.width));

    if (!isLaunched) {
      putBallOnPaddle();
      return;
    }

    ball.x += ballVelocity.x * deltaSeconds;
    ball.y += ballVelocity.y * deltaSeconds;

    if (ball.x - ballRadius <= 0) {
      ball.x = ballRadius;
      ballVelocity.x = Math.abs(ballVelocity.x);
    }
    if (ball.x + ballRadius >= app.screen.width) {
      ball.x = app.screen.width - ballRadius;
      ballVelocity.x = -Math.abs(ballVelocity.x);
    }
    if (ball.y - ballRadius <= 0) {
      ball.y = ballRadius;
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

    // В "Арканоиде" низ - не стена: здесь позднее будут отниматься жизни.
    if (ball.y - ballRadius > app.screen.height) {
      isLaunched = false;
      putBallOnPaddle();
    }
  });
})();
