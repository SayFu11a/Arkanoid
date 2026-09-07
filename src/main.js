import { Application, Graphics } from "pixi.js";

(async () => {
  const app = new Application();

  await app.init({ background: "#1099bb", resizeTo: window });
  document.getElementById("pixi-container").appendChild(app.canvas);

  const paddleWidth = 140;
  const paddleHeight = 24;
  const paddleBottomOffset = 70;
  const paddleSpeed = 480;
  const ballRadius = 10;

  const paddle = new Graphics()
    .roundRect(0, 0, paddleWidth, paddleHeight, 8)
    .fill(0xde3249);

  const ball = new Graphics().circle(0, 0, ballRadius).fill(0xffffff);

  const keys = {};
  const ballVelocity = { x: 260, y: -360 };
  let isLaunched = false;

  const putBallOnPaddle = () => {
    ball.x = paddle.x + paddle.width / 2;
    ball.y = paddle.y - ballRadius;
  };

  const placePaddle = () => {
    paddle.x = (app.screen.width - paddle.width) / 2;
    paddle.y = app.screen.height - paddleBottomOffset;
    putBallOnPaddle();
  };

  window.addEventListener("keydown", (event) => {
    keys[event.code] = true;

    if (event.code === "Space" && !isLaunched) {
      event.preventDefault();
      isLaunched = true;
    }
  });

  window.addEventListener("keyup", (event) => {
    keys[event.code] = false;
  });

  app.stage.addChild(paddle, ball);
  placePaddle();

  app.renderer.on("resize", () => {
    paddle.y = app.screen.height - paddleBottomOffset;
    paddle.x = Math.min(paddle.x, app.screen.width - paddle.width);

    if (!isLaunched) {
      putBallOnPaddle();
    }
  });

  app.ticker.add((ticker) => {
    const deltaSeconds = ticker.deltaMS / 1000;

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

    const hitsPaddle =
      ballVelocity.y > 0 &&
      ball.y + ballRadius >= paddle.y &&
      ball.y - ballRadius <= paddle.y + paddle.height &&
      ball.x + ballRadius >= paddle.x &&
      ball.x - ballRadius <= paddle.x + paddle.width;

    if (hitsPaddle) {
      ball.y = paddle.y - ballRadius;
      ballVelocity.y = -Math.abs(ballVelocity.y);
    }

    // В "Арканоиде" низ - не стена: здесь позднее будут отниматься жизни.
    if (ball.y - ballRadius > app.screen.height) {
      isLaunched = false;
      putBallOnPaddle();
    }
  });
})();
