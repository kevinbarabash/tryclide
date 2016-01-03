const {randomColor} = require("helper_functions.js");

document.body.style.margin = 0;
document.body.style.overflow = 'hidden';

const canvas = document.createElement('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
document.body.appendChild(canvas);

const ctx = canvas.getContext('2d');

ctx.fillStyle = 'black';
ctx.fillRect(0,0,window.innerWidth, window.innerHeight);

const render = () => {
    ctx.fillStyle = randomColor();
    const x = canvas.width * Math.random() | 0;
    const y = canvas.height * Math.random() | 0;
    const size = 25 * Math.random() | 0;
    ctx.fillRect(x, y, size, size);
    requestAnimationFrame(render);
};

window.addEventListener('resize', () => {
    console.log(`${window.innerWidth} x ${window.innerHeight}`);
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = 'black';
    ctx.fillRect(0,0,window.innerWidth, window.innerHeight);
});

requestAnimationFrame(render);
