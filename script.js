Array.prototype.sumOfAround = function (x,y) {
	let sum = 0
	for (let i = y-1; i <= y+1; i++) {
		for (let j = x-1; j <= x+1; j++) {
			sum += this[i][j];
		}
	}
	return sum-this[y][x];
}

class Canvas {
	constructor (canvas = document.getElementById('canvas')) {
		this.canvas = canvas // DOM element
		this.ctx = this.canvas.getContext('2d');
	}

	setWidth(w) {
		this.canvas.width = w
	}

	setHeight(h) {
		this.canvas.height = h;
	}

	clear() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
	}
}

class Game {
	constructor (canvas = document.getElementById('canvas'), pixelW = 10, pixelH = 10, gameMap = [[]], b = [3], s = [2,3]) {
		this.canvas = canvas // DOM element
		this.ctx = this.canvas.getContext('2d');
		this.pixelWidth  = pixelW;
		this.pixelHeight = pixelH;
		this.pxlsX = Math.floor(canvas.width / pixelW)
		this.pxlsY = Math.floor(canvas.height / pixelH)
		this.map = gameMap // 2d matrix, include 0 and 1
		this.b = b; // кол-во клеток, необходимое для создания клетки
		this.s = s; // кол-ва клеток для существования клетки
		this.isLife = true;
	}

	setGameMap(newMap) {
		for (let i=0; i < newMap.length; i++) {
			for (let j=0; j < newMap[i].length; j++) {
				if (i == 0 || j == 0 || i == newMap.length - 1 || j == newMap[i].length - 1) {
					newMap[i][j] = 0
				}
			}
		}
		this.map = newMap
	}

	fillMap(func) {
		let map = []
		for (let i=0; i < this.pxlsX; i++) {
			map.push([])
			for (let j=0; j < this.pxlsY; j++) {
				map[i].push(func())
			}
		}
		this.setGameMap(map)
	}

	move() {
		let newMap = [];
		newMap.push([])
		for (let i=1; i < this.map.length - 1; i++) {
			newMap.push([])
			newMap[i].push(0);
			for (let j=1; j < this.map.length - 1; j++) {
				let neightboors = this.map.sumOfAround(j,i)
				if (this.map[i][j] == 1) {
					newMap[i].push(this.s.indexOf(neightboors) != -1 ? 1 : 0);
				} else {
					newMap[i].push(this.b.indexOf(neightboors) != -1 ? 1 : 0);
				}
				
			}
			newMap[i].push(0);
		}
		newMap.push([]);
		this.map = newMap
	}

	drawGameMap() {
		for (let i=0; i < this.map.length; i++) {
			for (let j=0; j < this.map[i].length; j++) {
				if (this.map[i][j] === 1) {
					this.ctx.beginPath();
					this.ctx.fillRect(i * this.pixelWidth, j * this.pixelWidth, this.pixelWidth, this.pixelHeight);
					this.ctx.fill();
					this.ctx.closePath();
				}
			}
		}
	}

	drawGrid() {
		for (let i = this.pixelWidth; i <= this.canvas.width; i += this.pixelWidth) {
			this.ctx.beginPath();
			this.ctx.moveTo(i+0.5, 0);
			this.ctx.lineTo(i+0.5, this.canvas.height);
			this.ctx.strokeStyle = '#555'
			this.ctx.stroke();
			this.ctx.closePath();
		}
		for (let i = this.pixelHeight; i <= this.canvas.height; i += this.pixelHeight) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, i+0.5);
			this.ctx.lineTo(this.canvas.width ,i+0.5);
			this.ctx.strokeStyle = '#555'
			this.ctx.stroke();
			this.ctx.closePath();
		}
	}

	getOffset() {
		let elem = this.canvas;
		let top=0 ,left=0;
		while(elem) {
			top += parseFloat(elem.offsetTop);
			left += parseFloat(elem.offsetLeft);
			elem = elem.offsetParent
		}
		return {top : Math.round(top), left : Math.round(left)}
	}

	draw(x,y) {
		const row = Math.floor(x / this.pixelWidth);
		const col = Math.floor(y / this.pixelHeight);
		if (this.map[row][col] == 1) {
			this.map[row][col] = 0;
		} else {
			this.map[row][col] = 1
		}
	}
}

class UI {
	constructor (element) {
		this.element = element;
	}

	insertChild (elem, text, classList, event, func) {
		let child = document.createElement(elem);
		for (let i=0; i < classList.length; i++) {
			child.classList.add(classList[i])
		}
		child.textContent = text
		child.addEventListener(event, func)
		this.element.append(child);
	}

}

window.onload = function() {
	const canvas = new Canvas();
	canvas.setWidth(600)
	canvas.setHeight(600);

	const game = new Game(document.getElementById('canvas'), 5, 5, [], [3], [2,3]);
	game.drawGrid();
	game.fillMap(() => Math.floor(Math.random()*5) === 1 ? 1 : 0);
	game.drawGameMap()

	canvas.canvas.addEventListener('click', (e) => {
		game.draw(e.offsetX, e.offsetY)
	})

	const ui = new UI(document.querySelector('.u-i'));
	function clear() {game.fillMap(() => 0)}
	function generate() {game.fillMap(() => Math.floor(Math.random()*5) === 1 ? 1 : 0)}
	function toggleLife() {game.isLife = !game.isLife}
	ui.insertChild('button', 'Clear', 'btn', 'click', clear);
	ui.insertChild('button', 'Generate', 'btn', 'click', generate)
	ui.insertChild('button', ' Start/stop', 'btn', 'click', toggleLife)

	function play() {
		if (game.isLife) {
			game.move();	
		}
		canvas.clear();
		game.drawGrid();
		game.drawGameMap()
		setTimeout(play,50)
	}
	setTimeout(play,50)
}