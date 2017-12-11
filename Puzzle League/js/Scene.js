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
  this.swappingGems = [];
  this.nextRow = [];
  this.timeAtLastFrame = new Date().getTime();

  this.numCols = 6;
  this.numRows = 12;

  this.emptyGem = new GameObject();
  this.emptyGem.draw = () => {};

  this.cursorGeometry = new CursorGeometry(gl);
  this.cursor = new Cursor(this.cursorGeometry, this.staticMaterial, 3, 5, this.numRows, this.numCols);
  for (var i = 0; i < this.numCols; i++) {
    this.gameObjects.push([]);
    for (var j = 0; j < this.numRows / 2; j++) {
      this.setNewGem(i,j);
      this.gemsToCheck.push(this.gameObjects[i][j]);
    }
    for (var j = this.numRows / 2; j < this.numRows; j++) {
      this.gameObjects[i][j] = this.emptyGem;
    }
  }
};

Scene.prototype.setNewGem = function(i, j) {
  var gemTypeIndex = Math.floor(Math.random() * 5);
  var newGem;
  if (gemTypeIndex == 4) {
    newGem = new GameObject(new Mesh(this.diamondGeometry, this.staticMaterial), "Diamond", i, j);
  } else if (gemTypeIndex == 3) {
    newGem = new GameObject(new Mesh(this.crossGeometry, this.staticMaterial), "Cross", i, j);
  } else if (gemTypeIndex == 2) {
    newGem = new GameObject(new Mesh(this.heartGeometry, this.heartMaterial), "Heart", i, j);
  } else if (gemTypeIndex == 1) {
    newGem = new GameObject(new Mesh(this.starGeometry, this.staticMaterial), "Star", i, j);
  } else {
    newGem = new GameObject(new Mesh(this.gearGeometry, this.staticMaterial), "Gear", i, j);
  }
  if (i+1 || j+1) {
    this.gameObjects[i][j] = newGem;
    this.setLocation(i,j);
  }
  return newGem;
}

// i represents the col, j represents the row
Scene.prototype.setLocation = function(i,j) {
  this.gameObjects[i][j].i = i;
  this.gameObjects[i][j].j = j;
  this.gameObjects[i][j].position.set().addScaled(i, new Vec3(0.2, 0, 0)).addScaled(j, new Vec3(0, 0.2, 0));
}

Scene.prototype.shouldFall = function(i,j) {
  return j > 0 && this.gameObjects[i][j].gemType &&
      (!this.gameObjects[i][j-1].gemType || this.gameObjects[i][j-1].falling);
}

Scene.prototype.queueAboveToFall = function(i,j,toFall) {
  for (var fallIndex = j+1; fallIndex < this.numRows &&
                              this.gameObjects[i][fallIndex].gemType &&
                              this.gameObjects[i][fallIndex].falling != toFall &&
                              !this.gameObjects[i][fallIndex].toRemove;
                              fallIndex++) {
    this.gameObjects[i][fallIndex].falling = toFall;
    if (toFall) {
      this.gemsToFall.push(this.gameObjects[i][fallIndex]);
    } else {
      this.gameObjects[i][fallIndex].fallen = 0;
      this.setLocation(i,fallIndex);
      this.gemsToCheck.push(this.gameObjects[i][fallIndex]);
      this.gameObjects[i][fallIndex].toCheck = true;
    }
  }
}

Scene.prototype.swapGems = function(dt) {
  let swappingSpeed = dt;
  for (var index = 0; index < this.swappingGems.length; index+=2) {
    let a = this.swappingGems[index];
    let b = this.swappingGems[index+1];
    if (a.swapped < 0.2) { // if they haven't swapped .2 yet...
      a.position.add(new Vec3(swappingSpeed, 0, 0));
      a.swapped += swappingSpeed;
      b.position.sub(new Vec3(swappingSpeed, 0, 0));
      b.swapped += swappingSpeed;
    } else {
      a.swapping = false;
      a.swapped = 0;
      b.swapping = false;
      b.swapped = 0;
      this.finishSwap(a,b);
      this.swappingGems.splice(index, 2);
      index-=2;
    }
  }
}

Scene.prototype.removeGems = function(dt) {
  for (var index = 0; index < this.gemsToRemove.length; index++) {
    let shrinkingSpeed = 2 * dt;
    let turningSpeed = 10 * dt;
    let a = this.gemsToRemove[index];
    if (this.gameObjects[a.i][a.j].scale > 0.1) {
      this.gameObjects[a.i][a.j].scale -= shrinkingSpeed;
      this.gameObjects[a.i][a.j].orientation += turningSpeed;
    } else if (index == 0) {
      this.gameObjects[a.i][a.j] = this.emptyGem;
      this.queueAboveToFall(a.i,a.j,true);
      this.gemsToRemove.shift();
      index--;
    }
  }
}

Scene.prototype.makeGemsFall = function(dt) {
  // for all falling gems...
  var fallingSpeed = 0.5 * dt;
  for (var index = 0; index < this.gemsToFall.length; index++) {
    let a = this.gemsToFall[index];
    if (!a.falling) {
      this.gemsToFall.splice(index, 1);
      index--;
    } else if (a.fallen <= 0.1 && a.fallen + fallingSpeed > 0.1) {
      if (a.j > 0 && !this.gameObjects[a.i][a.j-1].gemType) {
        this.gameObjects[a.i][a.j-1] = a;
        this.gameObjects[a.i][a.j] = this.emptyGem;
        a.position.sub(new Vec3(0, fallingSpeed, 0));
        a.fallen += fallingSpeed;
      }
    } else if (a.fallen < 0.2) { // if they haven't fallen .2 yet...
      a.position.sub(new Vec3(0, fallingSpeed, 0));
      a.fallen += fallingSpeed;
    } else {
      // set this into the new position
      a.fallen = 0;
      this.setLocation(a.i,a.j-1); // this updates a.j <- a.j - 1 and puts it in correct place
      if (!this.shouldFall(a.i,a.j)) {
        a.falling = false;
        if (a.gemType && !a.toCheck) {
          this.gemsToCheck.push(a);
          a.toCheck = true;
        }
        this.gemsToFall.splice(index, 1);
        index--;
      }
    }
  }
}

Scene.prototype.checkGems = function() {
  for (var index = 0; index < this.gemsToCheck.length; index++) {
    this.gemsToCheck[index].toCheck = false;
    this.checkForLine(this.gemsToCheck[index].i,this.gemsToCheck[index].j);
    this.gemsToCheck.shift();
    index--;
  }
}

Scene.prototype.moveCursor = function(keysPressed, timeAtThisFrame) {
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
}

Scene.prototype.draw = function(timeAtThisFrame) {
  for (var i = 0; i < this.numCols; i++) {
    for (var j = 0; j < this.numRows; j++) {
      this.gameObjects[i][j].draw(this.camera);
    }
  }
  for (var i = 0; i < this.nextRow.length; i++) {
    this.nextRow[i].draw(this.camera);
  }
  this.cursor.draw(this.camera, timeAtThisFrame);
}

Scene.prototype.pushAllGemsUp = function () {
  for (var i = 0; i < this.numCols; i++) {
    for (var j = this.numRows - 1; j > 0; j--) {
      this.gameObjects[i][j] = this.gameObjects[i][j-1];
      this.gameObjects[i][j].j++;
      this.gameObjects[i][j].position.add(new Vec3(0,0.2,0));
    }
    this.gameObjects[i][0] = this.nextRow[i];
    this.setLocation(i,0);
    this.gemsToCheck.push(this.gameObjects[i][0]);
  }
  this.cursor.resetTimer();
  this.cursor.move(0, 1, 300);
  this.nextRow = [];
}

Scene.prototype.rise = function(dt) {
  if (!this.nextRow.length) {
    for (var i = 0; i < this.numCols; i++) {
      this.nextRow[i] = this.setNewGem();
      this.nextRow[i].i = i;
      this.nextRow[i].j = -1;
      this.nextRow[i].position.set().addScaled(i, new Vec3(0.2, 0, 0)).sub(new Vec3(0, 0.2, 0));
    }
  }

  let risingSpeed = 0.05 * dt;
  console.log(this.camera.position.y);
  if (this.camera.position.y >= 0.9 && this.camera.position.y - risingSpeed < 0.9) {
      this.camera.position.set(new Vec3(1.5, 1.1, 0));
      this.pushAllGemsUp();
  }
  this.camera.position.sub(new Vec3(0,risingSpeed,0));
  this.camera.updateViewProjMatrix();
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

  this.swapGems(dt);
  this.removeGems(dt);
  this.makeGemsFall(dt);
  this.checkGems();
  this.moveCursor(keysPressed, timeAtThisFrame);
  this.rise(dt);
  this.draw(timeAtThisFrame);
};

Scene.prototype.isValidAndSameType = function(i,j,gemType) {
  if (i < this.numCols && i >= 0 && j < this.numRows && j >= 0) {
    let gem = this.gameObjects[i][j];
    return gem.gemType && !gem.falling && !gem.swapping && !gem.toRemove &&
      gem.gemType == gemType;
  }
  return false;
}

Scene.prototype.checkForLine = function(i,j) {
  let thisGemType = this.gameObjects[i][j].gemType;
  var inRow = 1;
  var colsToRemove = [];
  colsToRemove.push(i);
  for(var index = i + 1; this.isValidAndSameType(index,j,thisGemType); index++) {
    inRow++;
    colsToRemove.push(index);
  }
  for(var index = i - 1; this.isValidAndSameType(index,j,thisGemType); index--) {
    inRow++;
    colsToRemove.push(index);
  }
  var inCol = 1;
  var rowsToRemove = [];
  rowsToRemove.push(j);
  for(var index = j + 1; this.isValidAndSameType(i,index,thisGemType); index++) {
    inCol++;
    rowsToRemove.push(index);
  }
  for(var index = j - 1; this.isValidAndSameType(i,index,thisGemType); index--) {
    inCol++;
    rowsToRemove.push(index);
  }
  if(inRow >= 3) {
    for (var index = 0; index < colsToRemove.length; index++) {
      if (!this.gameObjects[colsToRemove[index]][j].toRemove) {
        this.gemsToRemove.push(this.gameObjects[colsToRemove[index]][j]);
        this.gameObjects[colsToRemove[index]][j].toRemove = true;
      }
    }
  }
  if(inCol >= 3) {
    for (var index = 0; index < rowsToRemove.length; index++) {
      if (!this.gameObjects[i][rowsToRemove[index]].toRemove) {
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

  let leftGem = this.gameObjects[leftI][j];
  let rightGem = this.gameObjects[rightI][j];

  // only allow swaps to happen if neither is queued to be removed or swapping
  if (!leftGem.toRemove && !rightGem.toRemove &&
      !leftGem.swapping && !rightGem.swapping) {

    leftGem.swapping = true;
    leftGem.falling = false;
    leftGem.fallen = 0;
    this.swappingGems.push(leftGem);
    if (leftGem.gemType) {
      this.queueAboveToFall(rightI,j,false);
    }

    rightGem.swapping = true;
    rightGem.falling = false;
    rightGem.fallen = 0;
    this.swappingGems.push(rightGem);
    if (rightGem.gemType) {
      this.queueAboveToFall(leftI,j,false);
    }
  }
}

Scene.prototype.finishSwap = function(oldLeftGem,oldRightGem) {
  if (!oldLeftGem.gemType && !oldRightGem.gemType) {
    return;
  }

  const rightI = oldRightGem.i || (oldLeftGem.i + 1);
  const leftI = rightI - 1;
  const j = oldLeftGem.j || oldRightGem.j;

  if (oldLeftGem.falling && oldLeftGem.fallen > 0.1) {
    oldLeftGem.j--;
    leftJ--;
  }

  if (oldRightGem.falling && oldRightGem.fallen > 0.1) {
    oldRightGem.j--;
    rightJ--;
  }

  // swap their positions
  this.gameObjects[leftI][j] = oldRightGem;
  this.gameObjects[rightI][j] = oldLeftGem;

  let leftGem = oldRightGem;
  let rightGem = oldLeftGem;

  if (!leftGem.gemType) {
    this.queueAboveToFall(leftI,j,true);
  } else {
    this.setLocation(leftI, j);
    if (this.shouldFall(leftI,j)) {
      leftGem.falling = true;
      this.gemsToFall.push(leftGem);
      this.queueAboveToFall(leftI,j,true);
    } else {
      this.gemsToCheck.push(leftGem);
      leftGem.toCheck = true;
    }
  }

  if (!rightGem.gemType) {
    this.queueAboveToFall(rightI,j,true);
  } else {
    this.setLocation(rightI, j);
    if (this.shouldFall(rightI,j)) {
      rightGem.falling = true;
      this.gemsToFall.push(rightGem);
      this.queueAboveToFall(rightI,j,true);
    } else {
      this.gemsToCheck.push(rightGem);
      rightGem.toCheck = true;
    }
  }
}
