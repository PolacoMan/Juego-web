const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const livesElem = document.getElementById('lives');

const TILE_SIZE = 30; 
const ROWS = 15;
const COLS = 19;
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

let score = 0;
let lives = 3;
let mouthAnim = 0;

const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2],
    [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const pacman = { 
    x: 1, y: 1,
    dx: 0, dy: 0,
    nextDx: 0, nextDy: 0,
    speed: 0.1,
    lastRotation: 0
};

const ghosts = [
    { x: 9, y: 7, color: '#ff0000', dx: 0, dy: 0, speed: 0.04 },
    { x: 8, y: 7, color: '#ffb8ff', dx: 0, dy: 0, speed: 0.035 },
    { x: 10, y: 7, color: '#00ffff', dx: 0, dy: 0, speed: 0.03 }
];

function isWalkable(x, y) {
    return map[y] && map[y][x] !== 1;
}

function isCentered(val) {
    return Math.abs(val - Math.round(val)) < 0.05;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            let x = c * TILE_SIZE, y = r * TILE_SIZE;
            if(map[r][c] === 1) {
                ctx.fillStyle = '#111199';
                ctx.fillRect(x+2, y+2, TILE_SIZE-4, TILE_SIZE-4);
            } else if(map[r][c] === 0) {
                ctx.fillStyle = '#ffb8ae';
                ctx.beginPath();
                ctx.arc(x+TILE_SIZE/2, y+TILE_SIZE/2, 2, 0, 7);
                ctx.fill();
            }
        }
    }

    updatePacman();
    updateGhosts();

    requestAnimationFrame(draw);
}

function updatePacman() {
    if (isCentered(pacman.x) && isCentered(pacman.y)) {
        let cx = Math.round(pacman.x);
        let cy = Math.round(pacman.y);

        if (isWalkable(cx + pacman.nextDx, cy + pacman.nextDy)) {
            pacman.dx = pacman.nextDx;
            pacman.dy = pacman.nextDy;
        }

        if (!isWalkable(cx + pacman.dx, cy + pacman.dy)) {
            pacman.dx = 0;
            pacman.dy = 0;
        }
    }

    pacman.x += pacman.dx * pacman.speed;
    pacman.y += pacman.dy * pacman.speed;

    if (pacman.dx !== 0) pacman.y = Math.round(pacman.y);
    if (pacman.dy !== 0) pacman.x = Math.round(pacman.x);

    let cx = Math.round(pacman.x);
    let cy = Math.round(pacman.y);

    if (map[cy][cx] === 0) {
        map[cy][cx] = 2;
        score += 10;
        scoreElem.innerText = score;
    }

    // Animación boca
    if (pacman.dx !== 0 || pacman.dy !== 0) {
        mouthAnim += 0.15;
    }

    let mouthOpen = (Math.sin(mouthAnim) + 1) / 2;
    let angle = mouthOpen * 0.35;

    let rotation = Math.atan2(pacman.dy, pacman.dx);

    if (pacman.dx === 0 && pacman.dy === 0) {
        rotation = pacman.lastRotation;
    } else {
        pacman.lastRotation = rotation;
    }

    let px = pacman.x * TILE_SIZE + TILE_SIZE / 2;
    let py = pacman.y * TILE_SIZE + TILE_SIZE / 2;

    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(px, py, 11, rotation + angle, rotation + (Math.PI * 2 - angle));
    ctx.lineTo(px, py);
    ctx.fill();
}

function updateGhosts() {
    ghosts.forEach((g, i) => {

        if (Math.abs(g.x - Math.round(g.x)) < 0.1 && Math.abs(g.y - Math.round(g.y)) < 0.1) {
            let cx = Math.round(g.x);
            let cy = Math.round(g.y);

            const directions = [
                {dx: 1, dy: 0}, {dx: -1, dy: 0},
                {dx: 0, dy: 1}, {dx: 0, dy: -1}
            ];

            const opposite = { dx: -g.dx, dy: -g.dy };

            let validDirs = directions.filter(d => {
                if (d.dx === opposite.dx && d.dy === opposite.dy) return false;
                return map[cy + d.dy][cx + d.dx] !== 1;
            });

            let targetX = pacman.x;
            let targetY = pacman.y;

            if (i === 1) {
                targetX = pacman.x + pacman.dx * 3;
                targetY = pacman.y + pacman.dy * 3;
            }

            if (i === 2 && Math.random() < 0.3) {
                targetX = Math.random() * COLS;
                targetY = Math.random() * ROWS;
            }

            validDirs.sort((a, b) => {
                let distA = Math.hypot((cx + a.dx) - targetX, (cy + a.dy) - targetY);
                let distB = Math.hypot((cx + b.dx) - targetX, (cy + b.dy) - targetY);
                return distA - distB;
            });

            if (validDirs.length > 0) {
                g.dx = validDirs[0].dx;
                g.dy = validDirs[0].dy;
            }
        }

        g.x += g.dx * g.speed;
        g.y += g.dy * g.speed;

        let px = g.x * TILE_SIZE + TILE_SIZE / 2;
        let py = g.y * TILE_SIZE + TILE_SIZE / 2;

        // cuerpo
        ctx.fillStyle = g.color;
        ctx.beginPath();
        ctx.arc(px, py, 11, Math.PI, 0);
        ctx.lineTo(px + 11, py + 11);
        ctx.lineTo(px - 11, py + 11);
        ctx.closePath();
        ctx.fill();

        // ojos
        let eyeOffsetX = g.dx * 3;
        let eyeOffsetY = g.dy * 3;

        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(px - 4, py - 2, 4, 0, Math.PI * 2);
        ctx.arc(px + 4, py - 2, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(px - 4 + eyeOffsetX, py - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
        ctx.arc(px + 4 + eyeOffsetX, py - 2 + eyeOffsetY, 2, 0, Math.PI * 2);
        ctx.fill();

        if(Math.hypot(pacman.x - g.x, pacman.y - g.y) < 0.5) {
            handleDeath();
        }
    });
}

function handleDeath() {
    lives--;
    livesElem.innerText = "❤️".repeat(lives);

    pacman.x = 1; 
    pacman.y = 1;
    pacman.dx = 0; 
    pacman.dy = 0;
    pacman.nextDx = 0;
    pacman.nextDy = 0;

    ghosts.forEach(g => { g.x = 9; g.y = 7; });
    
    if(lives <= 0) {
        alert("¡PERDISTE! Puntuación: " + score);
        location.reload();
    }
}

window.onkeydown = (e) => {
    const key = e.key;
    if(key === 'ArrowUp')    { pacman.nextDx = 0;  pacman.nextDy = -1; }
    if(key === 'ArrowDown')  { pacman.nextDx = 0;  pacman.nextDy = 1;  }
    if(key === 'ArrowLeft')  { pacman.nextDx = -1; pacman.nextDy = 0;  }
    if(key === 'ArrowRight') { pacman.nextDx = 1;  pacman.nextDy = 0;  }
};

draw();