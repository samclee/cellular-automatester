/*
 *
 * Conway Fray
 *
 */

var thingsToLoad = ['deadCell.png', 'liveCell.png'];

var numCellW = 40;
var numcellH = 20;
var csz = 20;

var g = hexi(numCellW * csz, numcellH * csz, setup, thingsToLoad, load);

//g.scaleToWindow('white'); //prints scaling object to console
g.backgroundColor = 'black';

g.start();

var c_grid = undefined,
    Cell = undefined,
    Plane = undefined,
    ptr = undefined,
    stepTimer = undefined,
    running = undefined;

function load() {
  g.loadingBar()
}

function setup() {
  Cell = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.rect = g.sprite(['deadCell.png', 'liveCell.png']);  
      this.rect.setPosition(x * csz, y * csz);
      this.set(0);
    } // constructor()

    set(state) {
      this.rect.show(state);
      this.active = state;
    }

    toggle() {
      this.rect.show(1 - this.active);
      this.active = 1 - this.active;
    }

    getNborLocs() {
      let nborLocs = [];
      for (let dy = -1; dy < 2; dy++) {
        for (let dx = -1; dx < 2; dx ++) {
          let nborY = mod(this.y + dy, numcellH);
          let nborX = mod(this.x + dx, numCellW);
          if (dy !== 0 || dx !== 0)
            nborLocs.push([nborX, nborY]);
        }
      } 
      return nborLocs;
    }// return neighbor locations

  } // Cell class

  Plane = class {
    constructor(x, y, w, h) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;

      // populate grid with cells
      this.grid = [];
      for(let row = 0; row < h; row++) {
        this.grid.push([]);
        for(let col = 0; col < w; col++) {
          this.grid[row].push(new Cell(col, row));
        }
      }
    } // constructor

    step() {
      // create matrix of 0/1 based on if cell should live or die
      let newGrid = [];
      for (let row = 0; row < this.h; row++) {
        newGrid.push([]);
        for (let col = 0; col < this.w; col++) {
          newGrid[row].push(this.conwayEval(col, row));
        }
      }

      // loop thru this.grid and set each cell
      for (let row = 0; row < this.h; row++) {
        for (let col = 0; col < this.w; col++) {
          this.grid[row][col].set(newGrid[row][col]);
        }
      }
    } // step()

    conwayEval(col, row) {     
      let nborCount = 0;
      let nborLocs = this.grid[row][col].getNborLocs();
      for (let n of nborLocs) {
        if (this.grid[n[1]][n[0]].active)
          nborCount++;
      }

      // decide to live or die
      let live = (nborCount === 3) || (this.grid[row][col].active && nborCount === 2);
      return (live ? 1 : 0);
    } // conwayEval()

    toggleCell(col, row) {
      this.grid[row][col].toggle();
    }

  } // Plane class

  c_grid = new Plane(0, 0, numCellW, numcellH, 20);
  ptr = g.makePointer();
  ptr.press = () => {
    c_grid.toggleCell(Math.floor(ptr.x / 20), Math.floor(ptr.y / 20));
  };

  running = false;
  document.addEventListener('keydown', (e)=>{if(e.key === 's') c_grid.step()})

  g.state = play;
} // setup()

function play() {

}

var mod = (n, m) => ((n % m) + m) % m;