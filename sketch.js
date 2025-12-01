let stopSheet, walkSheet, jumpSheet, pushSheet, toolSheet;

// 站立動畫的設定
const stopSpriteWidth = 699;
const stopSpriteHeight = 190;
const stopNumFrames = 8;
const stopFrameWidth = stopSpriteWidth / stopNumFrames;

// 走路動畫的設定
const walkSpriteWidth = 1019;
const walkSpriteHeight = 195;
const walkNumFrames = 8;
const walkFrameWidth = walkSpriteWidth / walkNumFrames;

// 跳躍動畫的設定
const jumpSpriteWidth = 2249;
const jumpSpriteHeight = 214;
const jumpNumFrames = 14;
const jumpFrameWidth = jumpSpriteWidth / jumpNumFrames;

// 攻擊動畫的設定
const pushSpriteWidth = 2215;
const pushSpriteHeight = 185;
const pushNumFrames = 10;
const pushFrameWidth = pushSpriteWidth / pushNumFrames;

// 投射物(武器)動畫的設定
const toolSpriteWidth = 503;
const toolSpriteHeight = 224;
const toolNumFrames = 4;
const toolFrameWidth = toolSpriteWidth / toolNumFrames;

let currentFrame = 0;
let jumpFrame = 0;
let attackFrame = 0;
const animationSpeed = 0.15; // 走路與站立的動畫速度
const jumpAnimationSpeed = 0.35; // 跳躍動畫速度，數值越大越快
const attackAnimationSpeed = 0.25; // 攻擊動畫速度

// 角色屬性
let characterX, characterY;
let characterSpeed = 5;
let state = 'idle'; // 'idle', 'walkingRight', 'walkingLeft', 'jumping', 'attacking'
let facing = 'right'; // 'right' or 'left'
let startY; // 記錄跳躍起始位置
const jumpPower = 8; // 角色向上跳躍的力度

// 投射物屬性
let projectiles = [];
const projectileSpeed = 10;

function preload() {
  // 預先載入圖片資源
  stopSheet = loadImage('1/stop/stop_1.png');
  walkSheet = loadImage('1/walk/walk_1.png');
  jumpSheet = loadImage('1/jump/jump_1.png');
  pushSheet = loadImage('1/push/push_1.png');
  toolSheet = loadImage('1/tool/tool_1.png');
}

function setup() {
  // 建立一個全視窗的畫布
  createCanvas(windowWidth, windowHeight);
  // 初始化角色位置在畫面中央
  characterX = width / 2;
  characterY = height / 2;
}

function draw() {
  // 設定背景顏色
  background('#faedcd');

  // 1. 根據狀態更新角色
  if (state === 'jumping') {
    // --- 跳躍狀態邏輯 ---
    jumpFrame += jumpAnimationSpeed;
    let frameIndex = floor(jumpFrame);

    if (frameIndex < 8) { // 動畫前8張，角色上升
      characterY -= jumpPower;
    } else { // 動畫後段，角色下降
      // 為了讓下降更自然，可以稍微增加速度或使用重力模擬
      // 這裡我們先用一個簡單的方式讓它回到原位
      let remainingFrames = jumpNumFrames - 8;
      let descentPerFrame = (characterY - startY) / remainingFrames;
      characterY -= descentPerFrame;
    }

    if (frameIndex >= jumpNumFrames) { // 跳躍動畫結束
      state = 'idle';
      characterY = startY; // 確保角色回到精確的起始高度
    }
  } else if (state === 'attacking') {
    // --- 攻擊狀態邏輯 ---
    attackFrame += attackAnimationSpeed;
    let frameIndex = floor(attackFrame);

    // 當動畫播放到最後一格時，產生投射物
    if (frameIndex === pushNumFrames - 1) {
       projectiles.push({
        x: characterX,
        y: characterY,
        facing: facing
      });
    }

    if (frameIndex >= pushNumFrames) { // 攻擊動畫結束
      state = 'idle';
    }
  } else {
    // --- 其他狀態邏輯 (站立/走路/觸發動作) ---
    if (keyIsDown(32)) { // 32是空白鍵的 keycode
      state = 'attacking';
      attackFrame = 0; // 重置攻擊動畫影格
    } else if (keyIsDown(UP_ARROW)) {
      state = 'jumping';
      jumpFrame = 0; // 重置跳躍動畫影格
      startY = characterY; // 記錄起跳高度
    } else if (keyIsDown(RIGHT_ARROW)) {
      state = 'walkingRight';
      facing = 'right';
      characterX += characterSpeed;
    } else if (keyIsDown(LEFT_ARROW)) {
      state = 'walkingLeft';
      facing = 'left';
      characterX -= characterSpeed;
    } else {
      state = 'idle';
    }
  }

  // 更新動畫影格
  currentFrame += animationSpeed;

  // 2. 根據狀態繪製角色
  push(); //儲存目前的繪圖設定
  // 將原點移動到角色的位置，方便進行翻轉
  translate(characterX, characterY);

  if (facing === 'left') {
    scale(-1, 1); // 水平翻轉畫布
  }

  // 3. 選擇並繪製對應的動畫影格
  if (state === 'idle') {
    let frameIndex = floor(currentFrame) % stopNumFrames;
    image(stopSheet, -stopFrameWidth / 2, -stopSpriteHeight / 2, stopFrameWidth, stopSpriteHeight, frameIndex * stopFrameWidth, 0, stopFrameWidth, stopSpriteHeight);
  } else if (state === 'walkingRight' || state === 'walkingLeft') {
    let frameIndex = floor(currentFrame) % walkNumFrames;
    image(walkSheet, -walkFrameWidth / 2, -walkSpriteHeight / 2, walkFrameWidth, walkSpriteHeight, frameIndex * walkFrameWidth, 0, walkFrameWidth, walkSpriteHeight);
  } else if (state === 'jumping') {
    let frameIndex = floor(jumpFrame) % jumpNumFrames;
    image(jumpSheet, -jumpFrameWidth / 2, -jumpSpriteHeight / 2, jumpFrameWidth, jumpSpriteHeight, frameIndex * jumpFrameWidth, 0, jumpFrameWidth, jumpSpriteHeight);
  } else if (state === 'attacking') {
    let frameIndex = floor(attackFrame) % pushNumFrames;
    image(pushSheet, -pushFrameWidth / 2, -pushSpriteHeight / 2, pushFrameWidth, pushSpriteHeight, frameIndex * pushFrameWidth, 0, pushFrameWidth, pushSpriteHeight);
  }

  pop(); // 恢復原本的繪圖設定

  // 4. 更新並繪製所有投射物
  for (let i = projectiles.length - 1; i >= 0; i--) {
    let p = projectiles[i];
    if (p.facing === 'right') {
      p.x += projectileSpeed;
    } else {
      p.x -= projectileSpeed;
    }

    push(); // 儲存繪圖設定
    translate(p.x, p.y); // 移動原點到投射物位置
    if (p.facing === 'left') {
      scale(-1, 1); // 如果投射物向左，則水平翻轉
    }

    let frameIndex = floor(currentFrame) % toolNumFrames;
    // 以新的原點(0,0)為中心來繪製圖片
    image(toolSheet, -toolFrameWidth / 2, -toolSpriteHeight / 2, toolFrameWidth, toolSpriteHeight, frameIndex * toolFrameWidth, 0, toolFrameWidth, toolSpriteHeight);

    pop(); // 恢復繪圖設定
    
    // 如果投射物超出畫面，就從陣列中移除
    if (p.x > width + toolFrameWidth || p.x < -toolFrameWidth) {
      projectiles.splice(i, 1);
    }
  }
}

// 當視窗大小改變時，重新設定畫布大小
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
