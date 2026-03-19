const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElem = document.getElementById('score');
const livesElem = document.getElementById('lives');

const TILE_SIZE = 30; // Más grande para mejor visibilidad
const ROWS = 15;
const COLS = 19;
canvas.width = COLS * TILE_SIZE;
canvas.height = ROWS * TILE_SIZE;

let score = 0;
let lives = 3;
let gameOver = false;

// 1: Pared, 0: Punto, 2: Vacío
const map = [
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,0,1,1,1,1,1,0,1,0,1,1,0,1],
    [1,0,0,0,0,1,0,0,0,1,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,0,1,1,1,2,2,2,1,1,1,0,1,1,1,1],
    [2,2,2,1,0,1,2,2,2,2,2,2,2,1,0,1,2,2,2], // Túnel central
    [1,1,1,1,0,1,1,1,1,1,1,1,1,1,0,1,1,1,1],
    [1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,1],
    [1,0,1,1,0,1,1,1,0,1,0,1,1,1,0,1,1,0,1],
    [1,0,0,1,0,0,0,0,0,0,0,0,0,0,0,1,0,0,1],
    [1,1,0,1,0,1,0,1,1,1,1,1,0,1,0,1,0,1,1],
    [1,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,1],
    [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
];

const pacman = { x: 1, y: 1, dx: 0, dy: 0, nextDx: 0, nextDy: 0, speed: 0.15 };
const ghosts = [
    { x: 9, y: 7, color: '#ff0000', dx: 1, dy: 0 },
    { x: 9, y: 7, color: '#ffb8ff', dx: -1, dy: 0 },
    { x: 9, y: 7, color: '#00ffff', dx: 0, dy: -1 }
];

function draw() {
    if (gameOver) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Dibujar Mapa
    for(let r=0; r<ROWS; r++) {
        for(let c=0; c<COLS; c++) {
            let x = c * TILE_SIZE, y = r * TILE_SIZE;
            if(map[r][c] === 1) {
                ctx.fillStyle = '#0033ff';
                ctx.fillRect(x+2, y+2, TILE_SIZE-4, TILE_SIZE-4);
            } else if(map[r][c] === 0) {
                ctx.fillStyle = '#ffb8ae';
                ctx.beginPath();
                ctx.arc(x+TILE_SIZE/2, y+TILE_SIZE/2, 2, 0, 7);
                ctx.fill();
            }
        }
    }

    // Mover y Dibujar Pacman
    moveEntity(pacman, true);
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(pacman.x*TILE_SIZE + TILE_SIZE/2, pacman.y*TILE_SIZE + TILE_SIZE/2, 10, 0.2*Math.PI, 1.8*Math.PI);
    ctx.lineTo(pacman.x*TILE_SIZE + TILE_SIZE/2, pacman.y*TILE_SIZE + TILE_SIZE/2);
    ctx.fill();

    // Mover y Dibujar Fantasmas
    ghosts.forEach(g => {
        moveEntity(g, false);
        ctx.fillStyle = g.color;
        ctx.fillRect(g.x*TILE_SIZE+5, g.y*TILE_SIZE+5, TILE_SIZE-10, TILE_SIZE-10);
        
        // Colisión con Pacman
        if(Math.hypot(pacman.x - g.x, pacman.y - g.y) < 0.6) {
            handleDeath();
        }
    });

    requestAnimationFrame(draw);
}

function moveEntity(ent, isPlayer) {
    let nx = ent.x + ent.dx * (ent.speed || 0.08);
    let ny = ent.y + ent.dy * (ent.speed || 0.08);

    if(map[Math.round(ny)][Math.round(nx)] !== 1) {
        ent.x = nx; ent.y = ny;
        if(isPlayer && map[Math.round(ny)][Math.round(nx)] === 0) {
            map[Math.round(ny)][Math.round(nx)] = 2;
            score += 10;
            scoreElem.innerText = score;
        }
    } else if(!isPlayer) { // Fantasmas cambian dirección al chocar
        const dirs = [[0,1],[0,-1],[1,0],[-1,0]];
        let d = dirs[Math.floor(Math.random()*4)];
        ent.dx = d[0]; ent.dy = d[1];
    }
}

function handleDeath() {
    lives--;
    livesElem.innerText = "❤️".repeat(lives);
    pacman.x = 1; pacman.y = 1; 
    pacman.dx = 0; pacman.dy = 0;
    if(lives <= 0) {
        alert("GAME OVER - Score: " + score);
        location.reload();
    }
}

window.onkeydown = (e) => {
    if(e.key === 'ArrowUp')    { pacman.dx = 0;  pacman.dy = -1; }
    if(e.key === 'ArrowDown')  { pacman.dx = 0;  pacman.dy = 1;  }
    if(e.key === 'ArrowLeft')  { pacman.dx = -1; pacman.dy = 0;  }
    if(e.key === 'ArrowRight') { pacman.dx = 1;  pacman.dy = 0;  }
};

draw();