"use strict";
let Scene = function(gl) {
  this.vsGem = new Shader(gl, gl.VERTEX_SHADER, "gem_vs.essl");
  this.fsGem = new Shader(gl, gl.FRAGMENT_SHADER, "gem_fs.essl");
  this.gemProgram = new Program(gl, this.vsGem, this.fsGem);

  this.heartMaterial = new Material(gl, this.gemProgram);
  this.heartMaterial.time.set(0);
  this.staticMaterial = new Material(gl, this.gemProgram);
  this.staticMaterial.time.set(0);

  this.starGeometry = new StarGeometry(gl);
  this.heartGeometry = new HeartGeometry(gl);
  this.crossGeometry = new CrossGeometry(gl);
  this.diamondGeometry = new DiamondGeometry(gl);
  this.gearGeometry = new GearGeometry(gl);

  this.camera = new OrthoCamera();
  this.camera.position.add(new Vec3(1.5, 1.1, 0));
  this.camera.updateViewProjMatrix();

  this.gameObjects = [];
  this.gemsToCheck = [];
  this.gemsToRemove = [];
  this.gemsToFall = [];
  this.timeAtLastFrame = new Date().getTime();

  this.numCols = 6;
  this.numRows = 12;

  this.cursorGeometry = new CursorGeometry(gl);
  this.cursor = new Cursor(this.cursorGeometry, this.staticMaterial, 5, 5);
  for (var i = 0; i < this.numCols; i++) {
    this.gameObjects.push([]);
    for (var j = 0; j < this.numRows; j++) {
      this.setNewGem(i,j);
      this.gemsToCheck.push(this.gameObjects[i][j]);
    }
  }
};

Scene.prototype.setNewGem = function(i, j) {
  var gemTypeIndex = Math.floor(Math.random() * 5);
  if (gemTypeIndex == 4) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.diamondGeometry, this.staticMaterial), "Diamond", i, j);
  } else if (gemTypeIndex == 3) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.crossGeometry, this.staticMaterial), "Cross", i, j);
  } else if (gemTypeIndex == 2) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.heartGeometry, this.heartMaterial), "Heart", i, j);
  } else if (gemTypeIndex == 1) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.starGeometry, this.staticMaterial), "Star", i, j);
  } else {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.gearGeometry, this.staticMaterial), "Gear", i, j);
  }
  this.setLocation(i,j);
}

// i represents the col, j represents the row
Scene.prototype.setLocation = function(i,j) {
  this.gameObjects[i][j].i = i;
  this.gameObjects[i][j].j = j;
  this.gameObjects[i][j].position.set().addScaled(i, new Vec3(0.2, 0, 0)).addScaled(j, new Vec3(0, 0.2, 0));
}

Scene.prototype.shouldFall = function(i,j) {
  return j > 0 && (!this.gameObjects[i][j-1].gemType || this.gameObjects[i][j-1].falling);
}

Scene.prototype.queueAboveToFall = function(i,j) {
  for (var fallIndex = j+1; fallIndex < this.numRows &&
                              this.gameObjects[i][fallIndex].gemType &&
                              !this.gameObjects[i][fallIndex].falling &&
                              !this.gameObjects[i][fallIndex].toRemove;
                              fallIndex++) {
    this.gameObjects[i][fallIndex].falling = true;
    this.gemsToFall.push(this.gameObjects[i][fallIndex])
  }
}

Scene.prototype.update = function(gl, keysPressed) {

  //jshint bitwise:false
  //jshint unused:false
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;
  this.heartMaterial.time.add(dt);

  // clear the screen
  gl.clearColor(0.2, 0, 0.2, 1.0);
  gl.clearDepth(0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // if there are gems to remove, disable player interactions
  if (this.gemsToRemove.length) {
    this.disableListeners = true;
  }

  this.emptyGem = new GameObject();
  this.emptyGem.draw = () => {};

  // if any gems are in set to be removed, slowly shrink and rotate them.
  // If shrinking is done, set all gems above to fall
  for (var index = 0; index < this.gemsToRemove.length; index++) {
    let a = this.gemsToRemove[index];
    if (this.gameObjects[a.i][a.j].scale > 0.1) {
      this.gameObjects[a.i][a.j].scale += -0.03;
      this.gameObjects[a.i][a.j].orientation += 0.15;
    } else if (index == 0) {
      this.gameObjects[a.i][a.j] = this.emptyGem;
      this.queueAboveToFall(a.i,a.j);
      this.gemsToRemove.shift();
      index--;
    }
  }

  // for all falling gems...
  var fallingSpeed = 0.01;
  for (var index = 0; index < this.gemsToFall.length; index++) {
    let a = this.gemsToFall[index];
    if (this.gameObjects[a.i][a.j].fallen < 0.2) { // if they haven't fallen .2 yet...
      this.gameObjects[a.i][a.j].position.sub(new Vec3(0, fallingSpeed, 0));
      this.gameObjects[a.i][a.j].fallen += fallingSpeed;
    } else {
      // set this into the new position
      this.gameObjects[a.i][a.j-1] = this.gameObjects[a.i][a.j];
      this.gameObjects[a.i][a.j] = this.emptyGem;
      this.gameObjects[a.i][a.j-1].fallen = 0;
      this.setLocation(a.i,a.j-1); // this updates a.j <- a.j - 1 and puts it in correct place
      if (!this.shouldFall(a.i,a.j)) {
        this.gameObjects[a.i][a.j].falling = false;
        if (this.gameObjects[a.i][a.j].gemType && !this.gameObjects[a.i][a.j].toCheck) {
          this.gemsToCheck.push(this.gameObjects[a.i][a.j]);
          this.gameObjects[a.i][a.j].toCheck = true;
        }
        this.gemsToFall.splice(index, 1);
        index--;
      }
    }
  }

  if (keysPressed.SHIFT) {
    console.log(this.shouldFall(this.cursor.i,this.cursor.j));
    console.log(this.gameObjects[this.cursor.i][this.cursor.j].falling);
    console.log(this.gameObjects[this.cursor.i][this.cursor.j].fallen);
  }

  // if there are no shrinking or falling gems, check gems that have been moved recently
  if (!this.gemsToCheck.length) {
    this.disableListeners = false;
  }
  while(this.gemsToCheck.length > 0) {
    this.gemsToCheck[0].toCheck = false;
    this.checkForLine(this.gemsToCheck[0].i,this.gemsToCheck[0].j);
    this.gemsToCheck.shift();
  }

  // move the cursor
  let dx = 0;
  let dy = 0;
  if (keysPressed.UP) {
    dy += 1;
  }
  if (keysPressed.DOWN) {
    dy -= 1;
  }
  if (keysPressed.RIGHT) {
    dx += 1;
  }
  if (keysPressed.LEFT) {
    dx -= 1;
  }
  if (dx != 0 || dy != 0) {
    this.cursor.move(dx, dy, timeAtThisFrame);
  }

  // draw all gems, rotating the gears and deleting some if quaking
  for (var i = 0; i < this.gameObjects.length; i++) {
    for (var j = 0; j < this.gameObjects[i].length; j++) {
      this.gameObjects[i][j].draw(this.camera);
    }
  }

  this.cursor.draw(this.camera, timeAtThisFrame);
};

Scene.prototype.checkForLine = function(i,j) {
  let thisGemType = this.gameObjects[i][j].gemType;
  var inRow = 1;
  var colsToRemove = [];
  colsToRemove.push(i);
  for(var index = i + 1; index < this.numCols &&
                        this.gameObjects[index][j].gemType &&
                        !this.gameObjects[i][index].falling &&
                        !this.gameObjects[i][index].toRemove &&
                        this.gameObjects[index][j].gemType == thisGemType;
                        index++) {
    inRow++;
    colsToRemove.push(index);
  }
  for(var index = i - 1; index >= 0 &&
                         this.gameObjects[index][j].gemType &&
                         !this.gameObjects[i][index].falling &&
                         !this.gameObjects[i][index].toRemove &&
                         this.gameObjects[index][j].gemType == thisGemType;
                         index--) {
    inRow++;
    colsToRemove.push(index);
  }
  var inCol = 1;
  var rowsToRemove = [];
  rowsToRemove.push(j);
  for(var index = j + 1; index < this.numRows &&
                         this.gameObjects[i][index].gemType &&
                         !this.gameObjects[i][index].falling &&
                         !this.gameObjects[i][index].toRemove &&
                         this.gameObjects[i][index].gemType == thisGemType;
                         index++) {
    inCol++;
    rowsToRemove.push(index);
  }
  for(var index = j - 1; index >= 0 &&
                         this.gameObjects[i][index].gemType &&
                         !this.gameObjects[i][index].falling &&
                         !this.gameObjects[i][index].toRemove &&
                         this.gameObjects[i][index].gemType == thisGemType;
                         index--) {
    inCol++;
    rowsToRemove.push(index);
  }
  if(inRow >= 3) {
    for (var index = 0; index < colsToRemove.length; index++) {
      if (!this.gameObjects[colsToRemove[index]][j].toRemove && !this.gameObjects[colsToRemove[index]][j].falling) {
        this.gemsToRemove.push(this.gameObjects[colsToRemove[index]][j]);
        this.gameObjects[colsToRemove[index]][j].toRemove = true;
      }
    }
  }
  if(inCol >= 3) {
    for (var index = 0; index < rowsToRemove.length; index++) {
      if (!this.gameObjects[i][rowsToRemove[index]].toRemove && !this.gameObjects[i][rowsToRemove[index]].toRemove) {
        this.gemsToRemove.push(this.gameObjects[i][rowsToRemove[index]]);
        this.gameObjects[i][rowsToRemove[index]].toRemove = true;
      }
    }
  }
  return (inRow >= 3 || inCol >= 3);
}

Scene.prototype.swap = function() {
  let leftI = this.cursor.i;
  let rightI = this.cursor.i+1;
  let j = this.cursor.j;
  let temp = this.gameObjects[leftI][j];
  this.gameObjects[leftI][j] = this.gameObjects[rightI][j];
  this.gameObjects[rightI][j] = temp;
  if (this.shouldFall(leftI,j)) {
    this.gameObjects[leftI][j].falling = true;
    this.gemsToFall.push(this.gameObjects[leftI][j])
  }
  if (this.shouldFall(rightI,j)) {
    this.gameObjects[rightI][j].falling = true;
    this.gemsToFall.push(this.gameObjects[rightI][j])
  }
  this.setLocation(leftI, j);
  this.setLocation(rightI, j);
  this.checkForLine(leftI,j);
  this.checkForLine(rightI,j)
}
