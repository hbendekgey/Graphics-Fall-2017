"use strict";
let Cursor = function(geometry, material, i, j, numRows, numCols) {
  this.i = i;
  this.j = j;
  this.lastMove = 0;
  this.numRows = numRows;
  this.numCols = numCols;

  this.cursors = [];
  for (let k = 0; k < 4; k++) {
    this.cursors.push(new GameObject(new Mesh(geometry, material), "Cursor", i, j));
    this.cursors[k].position.set().addScaled(i, new Vec3(0.2, 0, 0)).addScaled(j, new Vec3(0, 0.2, 0));
    this.cursors[k].orientation = Math.PI * k / 2;
  }
  for (let k = 4; k < 8; k++) {
    this.cursors.push(new GameObject(new Mesh(geometry, material), "Cursor", i, j));
    this.cursors[k].position.set().addScaled(i+1, new Vec3(0.2, 0, 0)).addScaled(j, new Vec3(0, 0.2, 0));
    this.cursors[k].orientation = Math.PI * k / 2;
  }

};

Cursor.prototype.draw = function(camera, t){
  for (let k = 0; k < this.cursors.length; k++) {
    this.cursors[k].scale = 1 + 0.25 * Math.cos(t / 100.0);
    this.cursors[k].draw(camera);
  }
};

Cursor.prototype.resetTimer = function() {
  this.lastMove = 0;
}

Cursor.prototype.move = function(dx, dy, t) {
  if (this.i + dx >= this.numCols - 1 || this.i + dx < 0) {
    dx = 0;
  }
  if (this.j + dy >= this.numRows - 1 || this.j + dy < 0) {
    dy = 0;
  }
  if (t - this.lastMove > 200) {
    this.lastMove = t;
    for (let k = 0; k < this.cursors.length; k++) {
      this.cursors[k].position.addScaled(0.2, new Vec3(dx, dy, 0));
    }
    this.i += dx;
    this.j += dy;
  }
};
