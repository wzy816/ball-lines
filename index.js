const NUM_UNIT = 9;
const UNIT_LEN = 60;
const GRID_WIDTH = NUM_UNIT * UNIT_LEN;
const GRID_HEIGHT = NUM_UNIT * UNIT_LEN;
const GRID_MARGIN = UNIT_LEN / 30;
const GRID_COLOR = "#EFEFEF";
const HINT_WIDTH = 3 * UNIT_LEN;
const HINT_HEIGHT = UNIT_LEN;
const BALL_MARGIN = UNIT_LEN / 10;
const BALL_COLOR = [
  "#ff595e", //0
  "#FFA660", //1
  "#fee440", //2
  "#8ac926", //3
  "#4cc9f0", //4
  "#1982c4", //5
  "#6a4c93", //6
  "#FFFFFF", //7
];
const BALL7_PROB = 0.02;
const BALL_BORDER = "#bcbcbc";
const BALL_MOVE_SPEED = 80;

const INIT_HINT_RUN = 5;

const SLOTS_CANDIDATE = [
  //rows
  [0, 1, 2, 3, 4, 5, 6, 7, 8],
  [9, 10, 11, 12, 13, 14, 15, 16, 17],
  [18, 19, 20, 21, 22, 23, 24, 25, 26],
  [27, 28, 29, 30, 31, 32, 33, 34, 35],
  [36, 37, 38, 39, 40, 41, 42, 43, 44],
  [45, 46, 47, 48, 49, 50, 51, 52, 53],
  [54, 55, 56, 57, 58, 59, 60, 61, 62],
  [63, 64, 65, 66, 67, 68, 69, 70, 71],
  [72, 73, 74, 75, 76, 77, 78, 79, 80],
  //   columns
  [0, 9, 18, 27, 36, 45, 54, 63, 72],
  [1, 10, 19, 28, 37, 46, 55, 64, 73],
  [2, 11, 20, 29, 38, 47, 56, 65, 74],
  [3, 12, 21, 30, 39, 48, 57, 66, 75],
  [4, 13, 22, 31, 40, 49, 58, 67, 76],
  [5, 14, 23, 32, 41, 50, 59, 68, 77],
  [6, 15, 24, 33, 42, 51, 60, 69, 78],
  [7, 16, 25, 34, 43, 52, 61, 70, 79],
  [8, 17, 26, 35, 44, 53, 62, 71, 80],
  // diagonal
  [36, 46, 56, 66, 76],
  [27, 37, 47, 57, 67, 77],
  [18, 28, 38, 48, 58, 68, 78],
  [9, 19, 29, 39, 49, 59, 69, 79],
  [0, 10, 20, 30, 40, 50, 60, 70, 80],
  [1, 11, 21, 31, 41, 51, 61, 71],
  [2, 12, 22, 32, 42, 52, 62],
  [3, 13, 23, 33, 43, 53],
  [4, 14, 24, 34, 44],
  [4, 12, 20, 28, 36],
  [5, 13, 21, 29, 37, 45],
  [6, 14, 22, 30, 38, 46, 54],
  [7, 15, 23, 31, 39, 47, 55, 63],
  [8, 16, 24, 32, 40, 48, 56, 64, 72],
  [17, 25, 33, 41, 49, 57, 65, 73],
  [26, 34, 42, 50, 58, 66, 74],
  [35, 43, 51, 59, 67, 75],
  [44, 52, 60, 68, 76],
];

const SCORE = {
  5: 100,
  6: 150,
  7: 300,
  8: 500,
  9: 1000,
};

class Ball {
  constructor(canvas, index) {
    this.canvas = canvas;
    this._g = this.canvas.group(); //[rect,circle]

    this._index = index; // 0:NUM_UNIT-1
    this._j = this._index % NUM_UNIT;
    this._i = (this._index - this._j) / NUM_UNIT;

    this._state = "empty";
    this._color = null;
    this.plotRect();
  }
  get index() {
    return this._index;
  }
  get group() {
    return this._g;
  }
  get state() {
    return this._state;
  }
  set state(v) {
    this._state = v;
  }
  get color() {
    return this._color;
  }
  set color(v) {
    this._color = v;
  }

  plotRect() {
    this._g.clear();
    this._g
      .rect(UNIT_LEN - 2 * GRID_MARGIN, UNIT_LEN - 2 * GRID_MARGIN)
      .fill(GRID_COLOR)
      .move(UNIT_LEN * this._j + GRID_MARGIN, UNIT_LEN * this._i + GRID_MARGIN);
    // this._g
    //   .text(this._index.toString())
    //   .move(UNIT_LEN * this._j + GRID_MARGIN, UNIT_LEN * this._i + GRID_MARGIN);
  }
  setEmpty() {
    this.removeCircle();
    this.state = "empty";
    this.color = null;
  }
  addShadow() {
    if (this._g.children().length == 2) {
      this._g.get(1).addClass("filter");
    }
  }
  removeShadow() {
    if (this._g.children().length == 2) {
      this._g.get(1).removeClass("filter");
    }
  }

  setBall(color) {
    this.color = color;
    this.state = "ball";
    this.plotCircle();
  }
  setBallWithHover(color) {
    this.setBall(color);
    this.hoverCircle();
  }
  plotCircle() {
    this._g
      .circle(UNIT_LEN - 2 * BALL_MARGIN)
      .fill(BALL_COLOR[this._color])
      .move(UNIT_LEN * this._j + BALL_MARGIN, UNIT_LEN * this._i + BALL_MARGIN);
  }
  hoverCircle() {
    const self = this;
    this._g.mouseover(function () {
      self.group
        .get(1)
        .attr({ stroke: BALL_BORDER, "stroke-width": GRID_MARGIN / 2 });
    });
    this._g.mouseout(function () {
      self.group.get(1).attr({ stroke: null, "stroke-width": 0 });
    });
  }
  removeCircle() {
    if (this._g.children().length == 2) {
      this._g.get(1).remove();
    }
    this._g.off("mouseover mouseout");
  }
  neighbours(allBalls) {
    const neighbours = [];
    if (this._i > 0) {
      const up = allBalls[this._index - NUM_UNIT];
      if (up.state == "empty") {
        neighbours.push(up);
      }
    }
    if (this._i < NUM_UNIT - 1) {
      const down = allBalls[this._index + NUM_UNIT];
      if (down.state == "empty") {
        neighbours.push(down);
      }
    }
    if (this._j > 0) {
      const left = allBalls[this._index - 1];
      if (left.state == "empty") {
        neighbours.push(left);
      }
    }
    if (this._j < NUM_UNIT - 1) {
      const right = allBalls[this._index + 1];
      if (right.state == "empty") {
        neighbours.push(right);
      }
    }
    return neighbours;
  }
}

new Vue({
  el: "#app",
  data: function () {
    return {
      score: 0,

      canvas: null, // svg for balls
      canvasBalls: null,
      startBall: null,
      targetBall: null,

      hint: null, // svg for next 3 hints
      hintBalls: null,
    };
  },
  mounted() {
    const self = this;
    SVG.on(document, "DOMContentLoaded", function () {
      self.init();
    });
  },
  methods: {
    init() {
      this.score = 0;

      document.getElementById("canvas").innerHTML = "";
      this.canvas = SVG().addTo("#canvas").size(GRID_WIDTH, GRID_HEIGHT);
      this.canvasBalls = Array(NUM_UNIT * NUM_UNIT);
      this.initCanvasBalls();
      this.startBall = null;
      this.targetBall = null;

      document.getElementById("next3").innerHTML = "";
      this.hint = SVG().addTo("#next3").size(HINT_WIDTH, HINT_HEIGHT);
      this.hintBalls = Array(3);
      for (let i = 0; i < 3; i++) {
        this.hintBalls[i] = new Ball(this.hint, i);
      }

      this.generateHintBalls();
      for (let i = 0; i < INIT_HINT_RUN; i++) {
        this.runNextHint();
      }
    },
    runNextHint() {
      this.applyHintBallsToCanvas();
      this.checkLinedBalls();
      this.generateHintBalls();
    },
    checkLinedBalls() {
      let lined = false;
      for (let candi of SLOTS_CANDIDATE) {
        const slot_balls = candi.map((i) => this.canvasBalls[i]);
        const line = this.searchSlot(slot_balls);
        if (line != null) {
          const s = SCORE[line.length];
          this.score = this.score + s;
          // cancel line
          for (let ball of line) {
            ball.setEmpty();
          }
          lined = true;
        }
      }
      return lined;
    },
    searchSlot(balls) {
      const lines = [];
      let line = [];
      let c = null;
      for (let ball of balls) {
        if (ball.state == "ball") {
          if (c == null) {
            c = ball.color;
          }
          // empty line or cur ball match prev ball
          if (line.length == 0 || ball.color == 7 || ball.color == c) {
            line.push(ball);
          } else {
            // ball w/ diff colors
            // so cache line and restart count
            if (line.length >= 5) {
              lines.push([...line]);
            }
            //
            let new_line = [];
            while (line.length > 0) {
              let n = line.pop();
              if (n.color == 7) {
                new_line.push(n);
              } else {
                break;
              }
            }
            line = [...new_line, ball];
            c = ball.color;
          }
        } else if (ball.state == "empty") {
          // empty
          // cache line and reset
          if (line.length >= 5) {
            lines.push([...line]);
          }
          line = [];
          c = null;
        }
      }
      if (line.length >= 5) {
        lines.push([...line]);
      }

      // return longest line
      if (lines.length == 1) {
        return lines[0];
      } else if (lines.length > 1) {
        lines.sort((a, b) => {
          b.length < a.length;
        });
        return lines[0];
      } else {
        return null;
      }
    },
    // generate random 3 colors and show on hints
    generateHintBalls() {
      for (let i = 0; i < 3; i++) {
        const c = this.randomColor();
        this.hintBalls[i].setBall(c);
      }
    },
    // match hint balls color to 3 sampled balls
    applyHintBallsToCanvas() {
      const emptyIndex = this.collectEmptyBallIndex();
      if (emptyIndex.length <= 3) {
        this.$message.error("游戏结束");
        this.init();
        return;
      }
      const targets = _.sample(emptyIndex, 3);
      for (let i = 0; i < 3; i++) {
        const c = this.hintBalls[i].color;
        this.canvasBalls[targets[i]].setBallWithHover(c);
      }
    },
    initCanvasBalls() {
      const self = this;
      for (let i = 0; i < NUM_UNIT * NUM_UNIT; i++) {
        this.canvasBalls[i] = new Ball(this.canvas, i);
        // add click handler
        const ball = this.canvasBalls[i];
        ball.group.click(function () {
          if (ball.state == "ball") {
            // unready prev ball
            if (self.startBall != null) {
              self.startBall.removeShadow();
              self.startBall = null;
            }
            // ready current ball
            ball.addShadow();
            self.startBall = ball;
          } else if (self.startBall != null && ball.state == "empty") {
            // set target only if have start
            self.targetBall = ball;
          }
          // check path
          if (self.startBall != null && self.targetBall != null) {
            // [Ball,...]
            const ballPath = self.searchBallPath(
              self.startBall,
              self.targetBall
            );
            self.startBall.removeShadow();
            if (ballPath == null) {
              self.$message.error("找不到路径");
            } else if (ballPath.length > 1) {
              // fake move ball
              self.animateBallMoving(ballPath).then(function () {
                const lined = self.checkLinedBalls();
                if (!lined) {
                  self.runNextHint();
                }
              });
            }
            self.startBall = null;
            self.targetBall = null;
          }
        });
      }
    },
    animateBallMoving(ballPath) {
      // wait for setInterval to finish
      return new Promise((resolve, reject) => {
        const pathLength = ballPath.length;

        const startBall = ballPath[0];
        let color = startBall.color;
        let step = 1;

        const repeat = setInterval(() => {
          if (step == pathLength - 1) {
            clearInterval(repeat);
            resolve();
          }
          ballPath[step - 1].setEmpty();
          if (step == pathLength - 1) {
            ballPath[step].setBallWithHover(color);
          } else {
            ballPath[step].setBall(color);
          }
          step++;
        }, BALL_MOVE_SPEED);
      });
    },
    searchBallPath(startBall, targetBall) {
      const self = this;
      function bfs(start, end) {
        const queue = [start];
        const visited = [...Array(NUM_UNIT * NUM_UNIT)].map((i) => []);
        while (queue.length > 0) {
          const curBall = queue.shift();
          if (curBall.index == targetBall.index) {
            return [...visited[curBall.index], curBall];
          }

          const neighbours = curBall.neighbours(self.canvasBalls);
          for (let n of neighbours) {
            if (visited[n.index].length == 0) {
              queue.push(n);
              visited[n.index] = [...visited[curBall.index], curBall];
            }
          }
        }
        return null;
      }
      return bfs(startBall, targetBall);
    },
    // return [[i,j],...] of balls with empty state
    collectEmptyBallIndex() {
      const ret = [];
      for (let i = 0; i < NUM_UNIT * NUM_UNIT; i++) {
        if (this.canvasBalls[i].state == "empty") {
          ret.push(i);
        }
      }
      return ret;
    },
    // return color index from 0 to 7 w/ diff prob
    randomColor() {
      const f = Math.random();
      if (f <= BALL7_PROB || f >= 1 - BALL7_PROB) {
        return BALL_COLOR.length - 1;
      } else {
        const span = (1 - 2 * BALL7_PROB) / (BALL_COLOR.length - 1);
        return Math.floor(f / span);
      }
    },
  },
});
