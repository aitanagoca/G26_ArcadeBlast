const canvas = document.getElementById('gameCanvas');
const context = canvas.getContext('2d');

// Load images
const playerImg = new Image();
playerImg.src = '../images/others/naveSpaceInvaders.png';
const alienImgs = [
    '../images/others/alien1.png',
    '../images/others/alien2.png',
    '../images/others/alien3.png'
].map(src => {
    const img = new Image();
    img.src = src;
    return img;
});

// Load sounds
const shootSound = new Audio('../sounds/shoot.mp3');
const explosionSound = new Audio('../sounds/explosion.mp3');
const playerHitSound = new Audio('../sounds/player_hit.mp3');

// Game variables
const player = {
    width: 40,
    height: 40,
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    speed: 5,
    dx: 0
};
const bullet = {
    width: 5,
    height: 10,
    speed: 7,
    dy: 0
};
let bullets = [];
const invaderBullet = {
    width: 5,
    height: 10,
    speed: 4,
    dy: 4
};
let invaderBullets = [];
const invader = {
    width: 30,
    height: 30,
    speed: 2,
    dx: 2,
    dy: 20
};
let invaders = [];
let score = 0;
let lives = 3;
let level = 1;
let isShooting = false;
const maxInvaderBullets = 3; // Maximum simultaneous invader bullets

// Create invaders
function createInvaders() {
    const rows = 5;
    const cols = 10;
    const padding = 10;
    const offsetTop = 30;
    const offsetLeft = 30;

    invaders = [];
    for (let i = 0; i < rows; i++) {
        invaders[i] = [];
        for (let j = 0; j < cols; j++) {
            invaders[i][j] = {
                x: j * (invader.width + padding) + offsetLeft,
                y: i * (invader.height + padding) + offsetTop,
                width: invader.width,
                height: invader.height,
                status: 1,
                img: alienImgs[Math.floor(Math.random() * alienImgs.length)]
            };
        }
    }
}

createInvaders();

// Draw player
function drawPlayer() {
    context.drawImage(playerImg, player.x, player.y, player.width, player.height);
}

// Draw bullet
function drawBullet() {
    context.fillStyle = 'red';
    for (let i = 0; i < bullets.length; i++) {
        context.fillRect(bullets[i].x, bullets[i].y, bullet.width, bullet.height);
    }
}

// Draw invader bullets
function drawInvaderBullets() {
    context.fillStyle = 'yellow';
    for (let i = 0; i < invaderBullets.length; i++) {
        context.fillRect(invaderBullets[i].x, invaderBullets[i].y, invaderBullet.width, invaderBullet.height);
    }
}

// Draw invaders
function drawInvaders() {
    for (let i = 0; i < invaders.length; i++) {
        for (let j = 0; j < invaders[i].length; j++) {
            if (invaders[i][j].status === 1) {
                context.drawImage(invaders[i][j].img, invaders[i][j].x, invaders[i][j].y, invader.width, invader.height);
            }
        }
    }
}

// Move player
function movePlayer() {
    player.x += player.dx;

    // Wall detection
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// Move bullet
function moveBullet() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bullet.speed;

        // Remove bullets that go off screen
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;  // Adjust index after removal
        }
    }
}

// Move invader bullets
function moveInvaderBullets() {
    for (let i = 0; i < invaderBullets.length; i++) {
        invaderBullets[i].y += invaderBullet.speed;

        // Remove bullets that go off screen
        if (invaderBullets[i].y > canvas.height) {
            invaderBullets.splice(i, 1);
            i--;  // Adjust index after removal
        }
    }
}

// Move invaders
function moveInvaders() {
    for (let i = 0; i < invaders.length; i++) {
        for (let j = 0; j < invaders[i].length; j++) {
            if (invaders[i][j].status === 1) {
                invaders[i][j].x += invader.dx;

                // Change direction and move down
                if (invaders[i][j].x + invader.width > canvas.width || invaders[i][j].x < 0) {
                    invader.dx = -invader.dx;
                    for (let k = 0; k < invaders.length; k++) {
                        for (let l = 0; l < invaders[k].length; l++) {
                            invaders[k][l].y += invader.dy;
                            // Check if invaders reach the bottom
                            if (invaders[k][l].y + invader.height > canvas.height) {
                                playerHit();
                            }
                        }
                    }
                }

                // Randomly fire bullets from invaders based on level
                const fireChance = 0.0001 + (0.00005 * level); // Further reduced fire chance
                if (Math.random() < fireChance && invaderBullets.length < maxInvaderBullets) {
                    invaderBullets.push({
                        x: invaders[i][j].x + invader.width / 2 - invaderBullet.width / 2,
                        y: invaders[i][j].y + invader.height,
                        dy: invaderBullet.speed
                    });
                }
            }
        }
    }
}

// Bullet collision with invader
function collisionDetection() {
    for (let i = 0; i < bullets.length; i++) {
        const b = bullets[i];
        if (!b) continue; // Skip if bullet is undefined
        for (let j = 0; j < invaders.length; j++) {
            for (let k = 0; k < invaders[j].length; k++) {
                const inv = invaders[j][k];
                if (inv.status === 1) {
                    if (b.x > inv.x && b.x < inv.x + inv.width && b.y > inv.y && b.y < inv.y + inv.height) {
                        inv.status = 0;
                        bullets.splice(i, 1);
                        i--;  // Adjust index after removal
                        score += 10;
                        explosionSound.play();
                        if (allInvadersCleared()) {
                            levelUp();
                        }
                        break;
                    }
                }
            }
        }
    }
}

// Invader bullet collision with player
function invaderBulletCollision() {
    for (let i = 0; i < invaderBullets.length; i++) {
        const b = invaderBullets[i];
        if (b.x > player.x && b.x < player.x + player.width && b.y > player.y && b.y < player.y + player.height) {
            invaderBullets.splice(i, 1);
            i--;  // Adjust index after removal
            playerHit();
        }
    }
}

// Player hit by invader or invader reaching the bottom
function playerHit() {
    lives--;
    playerHitSound.play();
    if (lives <= 0) {
        alert('Game Over! Your score: ' + score);
        document.location.reload();
    } else {
        player.x = canvas.width / 2 - player.width / 2;
        player.y = canvas.height - 60;
        invaderBullets = [];
    }
}

// Check if all invaders are cleared
function allInvadersCleared() {
    for (let i = 0; i < invaders.length; i++) {
        for (let j = 0; j < invaders[i].length; j++) {
            if (invaders[i][j].status === 1) {
                return false;
            }
        }
    }
    return true;
}

// Level up
function levelUp() {
    level++;
    invader.speed += 0.5;  // Increase invader speed
    createInvaders();  // Create new invaders
}

// Draw score
function drawScore() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Score: ' + score, 8, 20);
}

// Draw lives
function drawLives() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Lives: ' + lives, canvas.width - 100, 20);
}

// Draw level
function drawLevel() {
    context.fillStyle = 'white';
    context.font = '20px Arial';
    context.fillText('Level: ' + level, canvas.width / 2 - 50, 20);
}

// Update game canvas
function update() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    drawPlayer();
    drawBullet();
    drawInvaderBullets();
    drawInvaders();
    drawScore();
    drawLives();
    drawLevel();

    movePlayer();
    moveBullet();
    moveInvaderBullets();
    moveInvaders();

    collisionDetection();
    invaderBulletCollision();

    requestAnimationFrame(update);
}

update();

// Keydown event
function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    } else if (e.key === ' ' && !isShooting) {
        bullets.push({
            x: player.x + player.width / 2 - bullet.width / 2,
            y: player.y,
            dy: bullet.speed
        });
        isShooting = true;
        shootSound.play();  // Play shooting sound
        setTimeout(() => {
            isShooting = false;
        }, 200);  // Fire rate limit
    }
}

// Keyup event
function keyUp(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right' || e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

