import { Application, Assets, Sprite, Container, Graphics } from "pixi.js";

(async () => {
  // Create a new application
  const app = new Application();

  // Initialize the application
  await app.init({ background: "#1099bb", resizeTo: window });

  // Append the application canvas to the document body
  document.getElementById("pixi-container").appendChild(app.canvas);

  // Load the bunny texture
  const texture = await Assets.load("/assets/bunny.png");



  // Create a bunny Sprite
  const bunny = new Sprite(texture);

  // Center the sprite's anchor point
  bunny.anchor.set(0.5);

  // Create and add a container to the stage
  const container = new Container();

  app.stage.addChild(container);


  // Move the sprite to the center of the screen
  bunny.position.set(app.screen.width / 2, app.screen.height / 2);

  // Add the bunny to the stage

  app.stage.addChild(bunny);

   // Create a 5x5 grid of bunnies in the container
  for (let i = 0; i < 25; i++) {
    const bunny = new Sprite(texture);

    bunny.x = (i % 5) * 40;
    bunny.y = Math.floor(i / 5) * 40;
    container.addChild(bunny);
  }

  

  // Move the container to the center
  container.x = app.screen.width / 2
  container.y = app.screen.height / 2;




  const rectangle = new Graphics().rect(0, 0, 100, 100).fill(0xDE3249);
  // Установим начальную позицию
  rectangle.x = 100;
  rectangle.y = 100;
  app.stage.addChild(rectangle);

  // 2. Объект для отслеживания нажатых клавиш
  const keys = {};

  window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
  });

  window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
  });

  // 3. Скорость движения (пикселей за кадр)
  const speed = 5;

  // 4. Главный игровой цикл обновления позиции
  app.ticker.add(() => {
      if (keys['ArrowUp'] || keys['KeyW']) {
          rectangle.y -= speed;
      }
      if (keys['ArrowDown'] || keys['KeyS']) {
          rectangle.y += speed;
      }
      if (keys['ArrowLeft'] || keys['KeyA']) {
          rectangle.x -= speed;
      }
      if (keys['ArrowRight'] || keys['KeyD']) {
          rectangle.x += speed;
      }
  });

  // Listen for animate update
  app.ticker.add((time) => {
    // Just for fun, let's rotate mr rabbit a little.
    // * Delta is 1 if running at 100% performance *
    // * Creates frame-independent transformation *
    bunny.rotation += 0.1 * time.deltaTime;
  });
})();
