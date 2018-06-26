/*
 *
 * Cellular Automata Toy
 *
 */

var thingsToLoad = ['images/deadCell.png', 
                    'images/liveCell.png',
                    'images/cell-buttons.png',
                    'images/birth-pressed.png',
                    'images/survive-pressed.png',
                    'puzzler.otf'
                    ];

var numCellW = 20;
var numcellH = 20;
var csz = 20;
var btnsz = 40;
var thgt = 40;

var g = hexi(numCellW * csz, numcellH * csz + 300, setup, thingsToLoad, load);

g.scaleToWindow('white'); //prints scaling object to console
g.backgroundColor = 'black';

g.start();

var myPlane = undefined,
    Cell = undefined,
    Plane = undefined,
    surviveVals = undefined,
    birthVals = undefined,
    CellBtn = undefined,
    running = undefined,
    stepTimer = undefined,
    timerThresh = undefined,
    ruleName = undefined,
    RunBtn = undefined;

function load() {
  g.loadingBar()
} // load()

function setup() {
  // ---- Create Birth/Survive buttons
  birthVals =   [0, 0, 0, 1, 0, 0, 0, 0, 0, 0];
  surviveVals = [0, 0, 1, 1, 0, 0, 0, 0, 0, 0];

  // special rule names
  let msg = g.text('Special name', '18px puzzler', '#ffff00', 0, 410 + thgt * 2 + btnsz * 2);
  msg.setPivot(0.5, 0.5);
  msg.x = 200;

  ruleName = g.text('N/A', '18px puzzler', '#ffff00', 0, 410 + thgt * 2 + btnsz * 2 + 30);
  ruleName.setPivot(0.5, 0.5);
  ruleName.x = 200;
  determineName();

  CellBtn = class {
    constructor(x, y, type, id) {
      let pressedImg = type ? 'images/survive-pressed.png' : 'images/birth-pressed.png'
      this.btn = g.sprite([g.frame('images/cell-buttons.png', id * btnsz, 0, btnsz, btnsz),
                            g.frame(pressedImg, id * btnsz, 0, btnsz, btnsz)
                          ]);
      this.btn.setPosition(x, y);
      
      this.ary = type ? surviveVals : birthVals;
      this.id = id;
      this.set(this.ary[this.id]);

      g.makeInteractive(this.btn);
      this.btn.press = () => this.set(1 - this.ary[this.id]);   
    }

    set(state) {
      this.btn.show(state);
      this.ary[this.id] = state;
      determineName();
    }
  }

  // birth and survive selection
  msg = g.text('Birth rule', '18px puzzler', '#ff00ff', 0, 410);
  msg.setPivot(0.5, 0.5);
  msg.x = 200;

  msg = g.text('Survive rule', '18px puzzler', '#00ffff', 0, 410 + thgt + btnsz);
  msg.setPivot(0.5, 0.5);
  msg.x = 200;
  for (let i = 0; i < 10; i++) {
    new CellBtn(i * btnsz, 400 + thgt, 0, i);
    new CellBtn(i * btnsz, 400 + 2 * thgt + btnsz, 1, i);
  }
  
  // ---- Create Grid ----
  Cell = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      
      this.rect = g.sprite(['images/deadCell.png', 'images/liveCell.png']);  
      this.rect.setPosition(x * csz, y * csz);
      this.active = 0;
      this.set(0);
      
      g.makeInteractive(this.rect);
      this.rect.press = () => this.set(1 - this.active);   
    } // constructor()

    set(state) {
      this.rect.show(state);
      this.active = state;
    } // set()

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
    }// getNborLocs()

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
          newGrid[row].push(this.eval(col, row));
        }
      }

      // loop thru this.grid and set each cell
      for (let row = 0; row < this.h; row++) {
        for (let col = 0; col < this.w; col++) {
          this.grid[row][col].set(newGrid[row][col]);
        }
      }
    } // step()

    eval(col, row) {     
      let nborCount = 0;
      let nborLocs = this.grid[row][col].getNborLocs();
      for (let n of nborLocs)
        nborCount += this.grid[n[1]][n[0]].active;

      // decide to survive/ birth
      let aryToCheck = this.grid[row][col].active ? surviveVals : birthVals;
      return aryToCheck[nborCount];
    } // eval()
  } // Plane class

  myPlane = new Plane(0, 0, numCellW, numcellH);

  // ---- Create Start/Stop button ----
  running = false;
  stepTimer = 0;
  timerThresh = 8;
  document.addEventListener('keydown', (e)=>{if(e.key === 's') running = !running});

  RunBtn = {rect: g.rectangle(380, 60, 'lime', 'black', 0, 10, 630),
            txt: g.text('START!', '30px puzzler', 'white',0, 646)
            };
  RunBtn.txt.setPivot(0.5, 0.5);
  RunBtn.txt.x = 200;

  g.makeInteractive(RunBtn.rect);
  RunBtn.rect.press = () => {
    running = !running;
    RunBtn.txt.content = running ? 'STOP!' : 'START!';
    RunBtn.rect.fillStyle = running ? 'red' : 'lime';
  }

  g.state = play;
} // setup()

function play() {
  if (running && (++stepTimer > timerThresh)) {
    myPlane.step();
    stepTimer = 0;
  }
} // play()

function determineName() {
  let key = birthVals.join('') + surviveVals.join('');
  ruleName.content = '\'' + (names[key] ? names[key] : 'N/A') + '\'';
}

var mod = (n, m) => ((n % m) + m) % m;