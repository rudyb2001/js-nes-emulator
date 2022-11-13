import {parseROM} from './ROMParser.js';


// Snake game shit
Number.prototype.mod = function (b) {
	// Calculate
	return ((this % b) + b) % b;
}

const board_border = 'black';
const board_background = "white";
const snake_col = 'lightblue';
const snake_border = 'darkblue';

let snake = [
	{ x: 200, y: 200 },
	{ x: 190, y: 200 },
	{ x: 180, y: 200 },
	{ x: 170, y: 200 },
	{ x: 160, y: 200 },
]

const snakeboard = document.getElementById("snakeboard");
const snakeboard_ctx = snakeboard.getContext("2d");

let dx = 10;
let dy = 0;

main();

document.addEventListener("keydown", changeDirection);

function main() {
	setTimeout(function onTick() {
		clearCanvas();
		moveSnake(dx, dy);
		drawSnake();
		main();
	}, 100);
}

function clearCanvas() {
	snakeboard_ctx.fillStyle = board_background;
	snakeboard_ctx.strokeStyle = board_border;
	snakeboard_ctx.fillRect(0, 0, snakeboard.width, snakeboard.height);
	snakeboard_ctx.strokeRect(0, 0, snakeboard.width, snakeboard.height);
}

function drawSnake() {
	snake.forEach(drawSnakePart)
}

function drawSnakePart(snakePart) {
	snakeboard_ctx.fillStyle = snake_col;
	snakeboard_ctx.strokeStyle = snake_border;
	snakeboard_ctx.fillRect(snakePart.x, snakePart.y, 10, 10);
	snakeboard_ctx.strokeRect(snakePart.x, snakePart.y, 10, 10);
}

function moveSnake(dx, dy) {
	const head = {
		x: (snake[0].x + dx).mod(snakeboard.width),
		y: (snake[0].y + dy).mod(snakeboard.height)
	};
	snake.unshift(head); // Adds head to beginning of array
	snake.pop(); // Removes last element
}

function changeDirection(event) {
	const LEFT_KEY = 37;
	const RIGHT_KEY = 39;
	const UP_KEY = 38;
	const DOWN_KEY = 40;

	const keyPressed = event.keyCode;

	/*const dirVector = 37 - keyPressed;

	const newDx = -Math.cos(Math.PI / 2 * dirVector) * 10
	const newDy = -Math.sin(Math.PI / 2 * dirVector) * 10

	if (
		(newDx === -dx && newDy === 0) ||
		(newDx === 0 && newDy === -dy)
	) {
		// New direction is opposite of old direction
		return;
	}

	dx = newDx;
	dy = newDy;*/

	const goingUp = dy === -10;
	const goingDown = dy === 10;
	const goingRight = dx === 10;
	const goingLeft = dx === -10;

	if (keyPressed === LEFT_KEY && !goingRight) {
		dx = -10;
		dy = 0;
	}

	if (keyPressed === UP_KEY && !goingDown) {
		dx = 0;
		dy = -10;
	}

	if (keyPressed === RIGHT_KEY && !goingLeft) {
		dx = 10;
		dy = 0;
	}

	if (keyPressed === DOWN_KEY && !goingUp) {
		dx = 0;
		dy = 10;
	}
}

// What should happen here?
// Once file is loaded, trigger function to read file as an array
// Possible to read file both as text and byte array? Not needed

var array = null;


function parseFile() {
	var reader = new FileReader();
	const file = fileInput.files.item(0);
	
	reader.readAsArrayBuffer(file);
	reader.onloadend = function (evt) {
		if (evt.target.readyState == FileReader.DONE) {
			var arrayBuffer = evt.target.result;
			array = new Uint8Array(arrayBuffer);
			
			const RomInfo = parseROM(array);

			p.textContent = "ROM File loaded";
		}
	}
}

// File ROM stuff
const fileInput = document.getElementById("file-input")
const p = document.getElementById("text")
fileInput.addEventListener('change', parseFile);