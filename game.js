/*
 *
 * Conway Fray
 *
 */

var thingsToLoad = ['reticle.png'];

var numCellW = 7;
var numcellH = 7;

var g = hexi(numCellW * 20, numcellH * 20, setup, thingsToLoad, load);

//g.scaleToWindow('white'); //prints scaling object to console
g.backgroundColor = 'black';

g.start();

var c_grid = undefined,
    Cell = undefined,
    ConwayGrid = undefined,
    ptr = undefined,
    reticle = undefined,
    stepTimer = undefined,
    running = undefined;

function load() {
  g.loadingBar()
}

function setup() {
  Cell = class {
    constructor(x, y, csz) {
      this.csz = csz;
      this.deadClr = 'grey';
      this.liveClr = 'lime';
      this.rect = g.rectangle(csz * 0.5, csz * 0.5, this.deadClr);
      this.rect.setPivot(0.5, 0.5);
      this.rect.setPosition(x + 0.5 * csz, y + 0.5 * csz);
      this.active = false;
    } // constructor()

    shrink() {
      this.rect.width = this.csz * 0.5;
      this.rect.height = this.csz * 0.5;
      this.rect.fillStyle = this.deadClr;
      this.active = false;
    } // shrink()

    grow() {
      this.rect.width = this.csz * 0.8;
      this.rect.height = this.csz * 0.8;
      this.rect.fillStyle = this.liveClr;
      this.active = true;
    } // grow()
  } // Cell class

  ConwayGrid = class {
    constructor(x, y, w, h, csz) {
      this.x = x;
      this.y = y;
      this.w = w;
      this.h = h;
      this.csz = csz;

      // populate grid with cells
      this.grid = [];
      for(let row = 0; row < h; row++) {
        this.grid.push([]);
        for(let col = 0; col < w; col++) {
          this.grid[row].push(new Cell(col * csz, row * csz, csz));
        }
      }
    } // constructor

    step() {
      // create matrix of 0/1 based on if cell should live or die
      let newGrid = [];
      for (let row = 0; row < this.h; row++) {
        newGrid.push([]);
        for (let col = 0; col < this.w; col++) {
          newGrid[row].push(this.evalCell(row, col));
        }
      }

      // loop thru this.grid and call grow() or shrink() on each cell
      for (let row = 0; row < this.h; row++) {
        for (let col = 0; col < this.w; col++) {
          //console.log(row, col)
          if (newGrid[row][col] === false)
            this.grid[row][col].shrink();
          else
            this.grid[row][col].grow();
        }
      }
    } // step()

    evalCell(row, col) {     
      let nborCount = 0;
      for (let dy = -1; dy < 2; dy++) {
        for (let dx = -1; dx < 2; dx ++) {
          let notCenter = dy !== 0 || dx !== 0;
          let rowExists = (this.grid[row + dy] !== undefined);
          let colExists = rowExists &&
                          (this.grid[row + dy][col + dx] !== undefined);
          let nborActive  = colExists &&
                          (this.grid[row + dy][col + dx].active);
          if (notCenter && nborActive)
            nborCount++;
        }
      } // count neighbors

      // decide to live or die
      let cond1 = nborCount === 3;
      let cond2 = this.grid[row][col].active && nborCount === 2;
      return (cond1 || cond2);
    } // evalCell()

    toggleCell(col, row) {
      if (this.grid[row][col].active)
        this.grid[row][col].shrink();
      else
        this.grid[row][col].grow();
    }

  } // ConwayGrid class

  c_grid = new ConwayGrid(0, 0, numCellW, numcellH, 20);
  reticle = g.sprite('reticle.png');
  ptr = g.makePointer();
  ptr.press = () => {
    c_grid.toggleCell(Math.floor(ptr.x / 20), Math.floor(ptr.y / 20));
  };

  running = false;
  document.addEventListener('keydown', (e)=>{if(e.key === 's') c_grid.step()})

  g.state = play;
} // setup()

function play() {
  if (!running)
    reticle.setPosition(ptr.x - (ptr.x % 20), ptr.y - (ptr.y % 20));
}