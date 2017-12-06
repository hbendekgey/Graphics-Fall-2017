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
      this.gemsToRemove.shift();
      index--;
    }
  }

  // count the number of falling gems and make them fall
  var gemsFalling = false;
  var fallingSpeed = 0.01;
  for (var i = 0; i < this.gameObjects.length; i++) {
    for (var j = 0; j < this.gameObjects[i].length - 1; j++) {
      if (!this.gameObjects[i][j].gemType && this.gameObjects[i][j+1].gemType) {
        // if there's a non-empty gem above an empty gem, make it and everything above it fall
        for (var fallIndex = j+1; fallIndex < this.numRows && this.gameObjects[i][fallIndex].gemType; fallIndex++) {
          if (this.gameObjects[i][fallIndex].fallen < 0.2) { // and it hasn't fallen .2 yet...
            gemsFalling = true;
            this.gameObjects[i][fallIndex].position.sub(new Vec3(0, fallingSpeed, 0));
            this.gameObjects[i][fallIndex].fallen += fallingSpeed;
          } else {
            this.gameObjects[i][fallIndex-1] = this.gameObjects[i][fallIndex];
            this.gameObjects[i][fallIndex] = this.emptyGem;
            this.setLocation(i,fallIndex-1);
            this.gameObjects[i][fallIndex-1].fallen = 0;
            if (this.gameObjects[i][fallIndex-1].gemType && !this.gemsToCheck.includes(this.gameObjects[i][fallIndex-1])) {
              this.gemsToCheck.push(this.gameObjects[i][fallIndex-1]);
            }
          }
        }
      }
    }
  }

  // if there are no shrinking or falling gems, check gems that have been moved recently
  if (!this.gemsToRemove.length && !gemsFalling) {
    if (!this.gemsToCheck.length) {
      this.disableListeners = false;
    }
    while(this.gemsToCheck.length > 0) {
      this.checkForLine(this.gemsToCheck[0].i,this.gemsToCheck[0].j);
      this.gemsToCheck.shift();
    }
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
                        this.gameObjects[index][j].gemType == thisGemType;
                        index++) {
    inRow++;
    colsToRemove.push(index);
  }
  for(var index = i - 1; index >= 0 &&
                         this.gameObjects[index][j].gemType &&
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
                         this.gameObjects[i][index].gemType == thisGemType;
                         index++) {
    inCol++;
    rowsToRemove.push(index);
  }
  for(var index = j - 1; index >= 0 &&
                         this.gameObjects[i][index].gemType &&
                         this.gameObjects[i][index].gemType == thisGemType;
                         index--) {
    inCol++;
    rowsToRemove.push(index);
  }
  if(inRow >= 3) {
    for (var index = 0; index < colsToRemove.length; index++) {
      if (!this.gemsToRemove.includes(this.gameObjects[colsToRemove[index]][j])) {
        this.gemsToRemove.push(this.gameObjects[colsToRemove[index]][j]);
      }
    }
  }
  if(inCol >= 3) {
    for (var index = 0; index < rowsToRemove.length; index++) {
      if (!this.gemsToRemove.includes(this.gameObjects[i][rowsToRemove[index]])) {
        this.gemsToRemove.push(this.gameObjects[i][rowsToRemove[index]]);
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
  this.setLocation(leftI, j);
  this.setLocation(rightI, j);
  this.checkForLine(leftI,j);
  this.checkForLine(rightI,j)
}
