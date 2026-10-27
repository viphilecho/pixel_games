
(() => {
  const canvas = document.getElementById('screen');
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const message = document.getElementById('message');
  const giftCard = document.getElementById('giftCard');

  const W = 360, H = 160, FLOOR = 137;

  const player = {
    x: 34,
    y: FLOOR - 24,
    w: 16,
    h: 24
  };

  const gift = {
    x: 302,
    y: FLOOR - 20,
    w: 18,
    h: 20
  };

  let collected = false;
  let sparkleFrame = 0;

  let keys = { left: false, right: false };

  // Animasi lompatan
  let isJumping = false;
  let jumpHeight = 0;
  let jumpVelocity = 0;
  let jumpDirection = 0;

  const gravity = 0.35;
  const jumpPower = 2.5;
  const jumpSpeed = 0.9;

  // Animasi tutup kado
  let lidOffset = 0;
  let lidVelocity = 0;
  let lidFlying = false;

  // Warna dasar
  const white = '#ffffff';
  const black = '#050505';
  const gray = '#bdbdbd';

  // Palet siang
  const skyBlue = '#87ceeb';
  const skyLight = '#c9f0ff';
  const sunYellow = '#ffe477';
  const cloudWhite = '#ffffff';
  const grassGreen = '#8fcf83';
  const grassDark = '#5eaa66';

  // Palet kelinci setelah hadiah ditemukan
  const bunnyFur = '#fff0f5';
  const bunnyPink = '#ff8fb1';
  const bunnyInnerEar = '#ffc0d2';
  const bunnyCheek = '#ff8fa3';

  function rect(x, y, w, h, color = white) {
    ctx.fillStyle = color;
    ctx.fillRect(
      Math.round(x),
      Math.round(y),
      w,
      h
    );
  }

  // Kelinci pixel art
  function drawPlayer() {
    const x = Math.round(player.x);
    const y = Math.round(player.y - jumpHeight);

    const fur = collected ? bunnyFur : white;
    const ear = collected ? bunnyPink : white;

    // Telinga
    rect(x + 4, y - 4, 3, 6, ear);
    rect(x + 10, y - 4, 3, 4, ear);
    rect(x + 5, y - 6, 4, 2, ear);
    rect(x + 11, y - 6, 5, 2, ear);

    // Bagian dalam telinga
    if (collected) {
      rect(x + 5, y - 3, 1, 4, bunnyInnerEar);
      rect(x + 11, y - 3, 1, 3, bunnyInnerEar);
    }

    // Kepala
    rect(x + 4, y, 8, 2, fur);
    rect(x + 2, y + 2, 12, 2, fur);
    rect(x + 2, y + 4, 12, 5, fur);

    // Mata
    rect(x + 6, y + 5, 2, 2, black);
    rect(x + 12, y + 5, 2, 2, black);

    // Pipi saat hadiah ditemukan
    if (collected) {
      rect(x + 3, y + 7, 3, 2, bunnyCheek);
      rect(x + 11, y + 7, 3, 2, bunnyCheek);
    }

    // Badan
    rect(x + 5, y + 8, 6, 4, fur);
    rect(x + 3, y + 10, 10, 6, fur);

    // Tangan
    rect(x + 1, y + 12, 3, 5, fur);
    rect(x + 12, y + 12, 3, 5, fur);

    // Kaki
    rect(x - 1, y + 16, 10, 8, fur);
    rect(x + 8, y + 20, 5, 4, fur);
    rect(x + 6, y + 18, 5, 2, fur);

    // Ekor
    rect(x - 4, y + 19, 5, 3, fur);
    //rect(x - 3, y + 18, 3, 2, fur);
  }

  // Menggambar kado
  function drawGift() {
    const x = gift.x;
    const y = gift.y;

    if (!collected) {
      const phase = Math.floor(sparkleFrame / 18) % 2;

      rect(x + 8, y - 7, 2, 2, sunYellow);
      rect(x + 5 - phase * 2, y - 4, 2, 2, white);
      rect(x + 14 + phase * 2, y - 4, 2, 2, white);
    }

    // Badan kado
    rect(x + 2, y + 5, 14, 13, white);
    rect(x, y + 3, 18, 4, white);

    // Pita badan
    rect(x + 7, y + 7, 4, 11, collected ? bunnyPink : black);

    // Detail badan
    rect(x + 2, y + 10, 5, 2, gray);
    rect(x + 11, y + 10, 5, 2, gray);

    ctx.save();

    if (collected) {
      // Tutup terangkat
      ctx.translate(x + 15, y + 10 - lidOffset);
      ctx.rotate(Math.PI / 4);

      rect(0, -3, 18, 4, white);

      // Pita tutup
      rect(5, -6, 4, 3, bunnyPink);
      rect(9, -5, 4, 3, bunnyPink);
      rect(8, -4, 3, 3, bunnyPink);
      rect(7, -3, 4, 4, black);
    } else {
      // Tutup tertutup
      rect(x, y + 3, 18, 4, white);

      rect(x + 5, y, 4, 3, white);
      rect(x + 9, y + 1, 4, 3, white);
      rect(x + 8, y + 2, 3, 3, white);
      rect(x + 7, y + 3, 4, 4, black);
    }

    ctx.restore();
  }

  // Matahari
  function drawSun() {
    rect(284, 12, 12, 12, sunYellow);
    rect(281, 15, 18, 6, sunYellow);
    rect(287, 9, 6, 18, sunYellow);

    // Sinar matahari
    rect(289, 5, 2, 3, sunYellow);
    rect(289, 28, 2, 3, sunYellow);
    rect(277, 17, 3, 2, sunYellow);
    rect(300, 17, 3, 2, sunYellow);
    rect(281, 9, 2, 2, sunYellow);
    rect(297, 9, 2, 2, sunYellow);
    rect(281, 25, 2, 2, sunYellow);
    rect(297, 25, 2, 2, sunYellow);
  }

  // Awan pixel
  function drawCloud(x, y, scale = 1) {
    const c = cloudWhite;

    rect(x + 4 * scale, y, 8 * scale, 3 * scale, c);
    rect(x, y + 3 * scale, 16 * scale, 4 * scale, c);
    rect(x + 3 * scale, y + 7 * scale, 11 * scale, 3 * scale, c);
    rect(x + 7 * scale, y - 2 * scale, 5 * scale, 3 * scale, c);
  }

  // Wortel pixel art berwarna
  function drawCarrot(x, y, angle = 0) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    const leaf = '#70c878';
    const leafLight = '#a1e5a0';
    const orange = '#ff9d32';
    const orangeLight = '#ffc16b';

    // Daun hijau
    rect(1, 0, 3, 5, leaf);
    rect(5, 1, 3, 4, leafLight);
    rect(8, 0, 3, 5, leaf);
    rect(4, 4, 4, 3, leaf);

    // Badan wortel
    rect(2, 6, 8, 3, orange);
    rect(3, 9, 6, 3, orange);
    rect(4, 12, 4, 3, orange);
    rect(5, 15, 2, 2, orange);

    // Detail wortel
    rect(4, 8, 3, 1, orangeLight);
    rect(5, 11, 2, 1, orangeLight);

    ctx.restore();
  }

  // Pesan hadiah dan wortel
  function drawGiftMessage() {
    if (!collected) return;

    // Kotak pesan di langit
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(64, 34, 232, 49);

    rect(64, 34, 232, 1, grassDark);
    rect(64, 82, 232, 1, grassDark);
    rect(64, 34, 1, 49, grassDark);
    rect(295, 34, 1, 49, grassDark);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#333333';

    ctx.font = 'bold 10px monospace';
    ctx.fillText('✦ YOU  ✦', W / 2, 45);

    ctx.font = '7px monospace';
    ctx.fillText('KAMU MENEMUKAN', W / 2, 60);
    ctx.fillText('HADIAH RAHASIA!', W / 2, 71);

    // Dekorasi bintang
    rect(74, 43, 2, 2, sunYellow);
    rect(286, 43, 2, 2, sunYellow);

    // Tumpukan wortel
    drawCarrot(139, 96, -0.35);
    drawCarrot(181, 96, -0.15);
    drawCarrot(223, 96, -0.25);

    drawCarrot(151, 109, 0.2);
    drawCarrot(201, 109, 0.15);
  }

  // Menggambar scene
  function drawScene() {
    ctx.clearRect(0, 0, W, H);

    // LANGIT: malam sebelum hadiah, siang setelah hadiah
    ctx.fillStyle = collected ? skyLight : black;
    ctx.fillRect(0, 0, W, H);

    if (collected) {
      // Gradasi sederhana berupa pita warna langit
      rect(0, 0, W, 38, skyLight);

      // Awan bergerombol
      drawCloud(25, 29, 1);
      drawCloud(100, 16, 1);
      drawCloud(210, 30, 1);
      drawCloud(150, 55, 1);

      // Matahari
      drawSun();

      // Awan kecil tambahan
      drawCloud(315, 48, 1);
    } else {
      // Bintang malam
      const stars = [
        [25, 24], [74, 42], [121, 18], [168, 36],
        [210, 20], [266, 39], [328, 22], [48, 72],
        [144, 63], [244, 73], [320, 61]
      ];

      stars.forEach((star, i) => {
        rect(
          star[0],
          star[1],
          i % 3 === 0 ? 2 : 1,
          i % 3 === 0 ? 2 : 1,
          i % 2 === 0 ? white : gray
        );
      });

      // Bulan pixel
      rect(278, 17, 8, 2, white);
      rect(276, 19, 12, 7, white);
      rect(278, 26, 8, 2, white);
      rect(286, 19, 2, 7, black);
      rect(283, 19, 4, 6, black);
    }

    // Tanah berubah hijau saat siang
    if (collected) {
      rect(0, FLOOR, W, 2, grassGreen);
      rect(0, FLOOR + 2, W, H - FLOOR - 2, grassDark);

      for (let x = 4; x < W; x += 18) {
        rect(x, FLOOR + 5, 5, 1, '#c1e8a5');
      }
    } else {
      rect(0, FLOOR, W, 1, white);

      for (let x = 4; x < W; x += 18) {
        rect(x, FLOOR + 5, 5, 1, gray);
      }
    }

    // Detail tanah
    rect(22, FLOOR - 2, 2, 2, collected ? grassGreen : white);
    rect(23, FLOOR - 4, 1, 2, collected ? grassGreen : white);
    rect(206, FLOOR - 2, 2, 2, collected ? grassGreen : white);
    rect(207, FLOOR - 4, 1, 2, collected ? grassGreen : white);

    // Label gift
    if (!collected) {
      rect(293, FLOOR - 1, 1, 7, gray);

      ctx.font = '6px monospace';
      ctx.textAlign = 'start';
      ctx.textBaseline = 'alphabetic';
      ctx.fillStyle = white;
      ctx.fillText('GIFT', gift.x - 1, gift.y - 12);
    }

    drawGift();
    drawPlayer();
    drawGiftMessage();
  }

  // Periksa sentuhan gift
  function checkGift() {
    const touching =
      player.x + player.w >= gift.x - 2 &&
      player.x <= gift.x + gift.w;

    if (touching && !collected) {
      collected = true;

      lidOffset = 0;
      lidVelocity = 2.5;
      lidFlying = true;

      // Tidak menampilkan pop-up HTML
      giftCard.classList.add('hidden');

      message.textContent = 'GIFT TERBUKA! ☀';

      stopMovement();
    }
  }

  // Memulai lompatan
  function move(direction) {
    if (collected || isJumping) return;

    isJumping = true;
    jumpVelocity = jumpPower;
    jumpDirection = direction;
  }

  function stopMovement() {
    keys.left = false;
    keys.right = false;
  }

  // Kontrol tombol HP
  const leftButton = document.getElementById('left');
  const rightButton = document.getElementById('right');

  leftButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (collected) return;

    stopMovement();
    keys.left = true;
    move(-1);
  });

  rightButton.addEventListener('pointerdown', event => {
    event.preventDefault();
    if (collected) return;

    stopMovement();
    keys.right = true;
    move(1);
  });

  ['pointerup', 'pointerleave', 'pointercancel'].forEach(type => {
    leftButton.addEventListener(type, stopMovement);
    rightButton.addEventListener(type, stopMovement);
  });

  window.addEventListener('pointerup', stopMovement);
  window.addEventListener('blur', stopMovement);

  // Kontrol keyboard
  document.addEventListener('keydown', event => {
    const key = event.key.toLowerCase();

    const left =
      event.key === 'ArrowLeft' || key === 'a';

    const right =
      event.key === 'ArrowRight' || key === 'd';

    if (!left && !right) return;

    event.preventDefault();

    if (collected || event.repeat) return;

    stopMovement();

    if (left) {
      keys.left = true;
      move(-1);
    } else {
      keys.right = true;
      move(1);
    }
  });

  document.addEventListener('keyup', event => {
    const key = event.key.toLowerCase();

    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      key === 'a' ||
      key === 'd'
    ) {
      stopMovement();
    }
  });

  // Reset game
  document.getElementById('reset').addEventListener('click', () => {
    stopMovement();

    player.x = 34;

    isJumping = false;
    jumpHeight = 0;
    jumpVelocity = 0;
    jumpDirection = 0;

    collected = false;

    lidOffset = 0;
    lidVelocity = 0;
    lidFlying = false;

    giftCard.classList.add('hidden');

    message.textContent =
      'TEMUKAN GIFT DI SEBELAH KANAN.';

    drawScene();
  });

  // Tombol tutup kartu tetap aman
  const closeGift = document.getElementById('closeGift');

  if (closeGift) {
    closeGift.addEventListener('click', () => {
      giftCard.classList.add('hidden');
    });
  }

  // Game loop
  function render() {
    sparkleFrame++;

    if (isJumping) {
      player.x += jumpDirection * jumpSpeed;

      jumpHeight += jumpVelocity;
      jumpVelocity -= gravity;

      player.x = Math.max(
        4,
        Math.min(W - player.w - 4, player.x)
      );

      if (jumpHeight <= 0 && jumpVelocity < 0) {
        jumpHeight = 0;
        jumpVelocity = 0;
        isJumping = false;
      }

      checkGift();
    }

    if (!isJumping && !collected) {
      if (keys.right) {
        move(1);
      } else if (keys.left) {
        move(-1);
      }
    }

    // Tutup kado naik lalu berhenti di udara
    if (lidFlying) {
      lidOffset += lidVelocity;
      lidVelocity -= 0.12;

      if (lidVelocity <= 0) {
        lidVelocity = 0;
        lidFlying = false;
      }
    }

    drawScene();
    requestAnimationFrame(render);
  }

  render();
})();
