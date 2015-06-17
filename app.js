var canvas = document.getElementById('canvas');
var canvasGrid = document.getElementById('canvasGrid');

var ctx = canvas.getContext("2d");
var ctxGrid = canvasGrid.getContext("2d");
var WIDTH;
var HEIGHT;

var canvasMinX;
var canvasMaxX;

var world;
var NROWS;
var NCOLS;
var CELLWIDTH;
var CELLHEIGHT;

var started = false;
var pause = false;

// Chargement des handlers d'evenements
window.addEventListener('load',initEventHandler,false);

// Initialisation des handlers d'evenements
function initEventHandler() {

    document.getElementById('buttonClear').click( function(e) {
        e.preventDefault();
        resetWorld();
    });

    WIDTH = canvas.width = canvasGrid.width = canvas.clientWidth;
    HEIGHT = canvas.height = canvasGrid.height = canvas.clientHeight;

    text("Click to start", 30, WIDTH/2, HEIGHT/2, true, ctx);
}

function init() {
    started = true;

    CELLWIDTH = 15;
    CELLHEIGHT = 15;
    PADDING = 1;

    NROWS = Math.floor(HEIGHT/(CELLHEIGHT+PADDING));
    NCOLS = Math.floor(WIDTH/(CELLWIDTH+PADDING));

    world = new Array(NROWS);
    for (i=0; i < NROWS; i++) {
        world[i] = new Array(NCOLS);
        for (j=0; j < NCOLS; j++) {
            world[i][j] = 0;
        }
    }

    // light some cells for test purposes
    world[11][5] = 1;
    world[9][5] = 1;
    world[10][5] = 1;
    world[11][4] = 1;
    world[10][3] = 1;

    world[20][15] = 1;
    world[20][16] = 1;
    world[21][15] = 1;
    world[21][16] = 1;


    prevWorld = JSON.parse(JSON.stringify(world));

    canvasMinX = canvas.offsetLeft;
    canvasMaxX = canvasMinX + WIDTH;

    var fps = 10;
    var fpsInterval = 1000 / fps;
    var then = Date.now();
    var now;
    var elapsed;

    drawGrid();
    draw();

    requestAnimationFrame(function animation() {
        now = Date.now();
        elapsed = now - then;

        if (elapsed > fpsInterval && !pause) {
            then = now - (elapsed % fpsInterval);
            prevWorld = JSON.parse(JSON.stringify(world));
            updateWorld();
            draw();
        }
        requestAnimationFrame(animation);
    });
}

function rect(x, y, w, h, ctx, style) {
    ctx.fillStyle = style;
    ctx.beginPath();
    ctx.rect(x,y,w,h);
    ctx.closePath();
    ctx.fill();
}

function text(text, size, x, y, center, ctx) {
    ctx.font = size+"px Arial";

    if(center)
        ctx.textAlign = "center";

    ctx.fillText(text, x, y);
    ctx.textAlign = "left";
}

function clear() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);
}

function onKeyDown(evt) {
    if (evt.keyCode == 32){
        if (!pause) {
            pause = true;
        } else {
            pause = false;
        }
    }
}

function onMouseDown(evt) {
    if(!started){
        console.log("YOU WOOT");
        init();
    }
    else {
        if (evt.pageX > canvasMinX && evt.pageX < canvasMaxX) {
            var x = Math.round((HEIGHT-(HEIGHT-evt.pageY))/(CELLHEIGHT+PADDING))-1;
            var y = Math.round((WIDTH-(WIDTH-evt.pageX))/(CELLHEIGHT+PADDING))-1;
            if (world[x][y] == 1) {
                world[x][y] = 0;
            } else{
                world[x][y] = 1;
            }
            draw();
        }
    }
}

document.addEventListener("mousedown", onMouseDown);
document.addEventListener("keydown", onKeyDown);

function draw() {
    clear();

    //draw world
    for (i=0; i < NROWS; i++) {
        for (j=0; j < NCOLS; j++) {
            if (world[i][j] == 1) {
                rect((j * (CELLWIDTH + PADDING)) + PADDING,
                (i * (CELLHEIGHT + PADDING)) + PADDING,
                CELLWIDTH, CELLHEIGHT, ctx, "#000000");
            }
        }
    }
}

function drawGrid() {
    for (i=0; i < (NROWS+1); i++) {
            rect(0,
            (i * (CELLHEIGHT + PADDING)),
            WIDTH, PADDING, ctxGrid, "#999999");
    }

    for (i=0; i < (NCOLS+1); i++) {
            rect((i * (CELLWIDTH + PADDING)),
            0,
            PADDING, HEIGHT, ctxGrid, "#999999");
    }
}

function updateWorld () {
    for (i=0; i < NROWS; i++) {
        for (j=0; j < NCOLS; j++) {
            updateCellState(i,j);
        }
    }
}

function updateCellState (x, y) {
    var neighbours = countNeighbours(x, y);

    if (neighbours == 3) {
        world[x][y] = 1;
    } else {
        if (neighbours != 2) {
            world[x][y] = 0;
        }
    }
}

function countNeighbours (x, y) {
    return coalesce(coalesce(prevWorld[x-1],0)[y], 0)
        + coalesce(prevWorld[x][y-1], 0)
        + coalesce(coalesce(prevWorld[x+1],0)[y], 0)
        + coalesce(prevWorld[x][y+1], 0)
        + coalesce(coalesce(prevWorld[x-1],0)[y-1], 0)
        + coalesce(coalesce(prevWorld[x-1],0)[y+1], 0)
        + coalesce(coalesce(prevWorld[x+1],0)[y-1], 0)
        + coalesce(coalesce(prevWorld[x+1],0)[y+1], 0);
}

function resetWorld () {

    world = new Array(NROWS);
    for (i=0; i < NROWS; i++) {
        world[i] = new Array(NCOLS);
        for (j=0; j < NCOLS; j++) {
            world[i][j] = 0;
        }
    }
    prevWorld = JSON.parse(JSON.stringify(world));

    draw();
}

function coalesce (a, b) {
    return a === undefined ? b : a;
}
