"use strict";
let Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);

  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);
  this.texture2D = new Texture2D(gl, "media/boom.png");

  this.heartMaterial = new Material(gl, this.solidProgram);
  this.heartMaterial.time.set(0);
  this.staticMaterial = new Material(gl, this.solidProgram);
  this.staticMaterial.time.set(0);
  this.textureMaterial = new Material(gl, this.textureProgram);
  this.textureMaterial.colorTexture.set(this.texture2D);
  this.textureMaterial.boomPhase.set(new Vec2(0,0));

  this.starGeometry = new StarGeometry(gl);
  this.heartGeometry = new HeartGeometry(gl);
  this.crossGeometry = new CrossGeometry(gl);
  this.diamondGeometry = new DiamondGeometry(gl);
  this.triangleGeometry = new TriangleGeometry(gl);
  this.gearGeometry = new GearGeometry(gl);
  this.textureGeometry = new TexturedQuadGeometry(gl);

  this.camera = new OrthoCamera();
  this.camera.position.add(new Vec3(0.9, 0.9, 0));
  this.camera.updateViewProjMatrix();

  this.gameObjects = [];
  this.gemsToCheck = [];
  this.gemsToRemove = [];
  this.gemsToFall = [];
  this.timeAtLastFrame = new Date().getTime();
  this.selected = {};
  this.stableRotation = 0;
  this.boomCounter = 0;

  for (var i = 0; i < 10; i++) {
    this.gameObjects.push([]);
    this.gemsToFall.push([]);
    for (var j = 0; j < 10; j++) {
      this.gemsToFall[i].push(0);
      this.setNewGem(i,j);
      this.gemsToCheck.push(this.gameObjects[i][j]);
    }
  }
};

Scene.prototype.setNewGem = function(i, j) {
  var gemTypeIndex = Math.floor(Math.random() * 7);
  if (gemTypeIndex == 6) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.textureGeometry, this.textureMaterial), "Asteroid", i, j);
  } else if (gemTypeIndex == 5) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.diamondGeometry, this.staticMaterial), "Diamond", i, j);
  } else if (gemTypeIndex == 4) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.crossGeometry, this.staticMaterial), "Cross", i, j);
  } else if (gemTypeIndex == 3) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.heartGeometry, this.heartMaterial), "Heart", i, j);
  } else if (gemTypeIndex == 2) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.starGeometry, this.staticMaterial), "Star", i, j);
  } else if (gemTypeIndex == 1) {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.triangleGeometry, this.staticMaterial), "Triangle", i, j);
  } else {
    this.gameObjects[i][j] = new GameObject(new Mesh(this.gearGeometry, this.staticMaterial), "Gear", i, j);
  }
  this.setLocation(i,j);
}

Scene.prototype.setLocation = function(i,j) {
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
  gl.clearDepth(0.5);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  // add time for pulsating heart

  // if quaking, rotate the screen
  if (this.quake) {
    this.camera.rotation = this.stableRotation + Math.cos(timeAtThisFrame / 100.0) / 15;
    this.camera.updateViewProjMatrix();
  }

  // if there are gems to remove, disable player interactions
  if (this.gemsToRemove.length > 0) {
    this.disableListeners = true;
  }

  // if any gems are in set to be removed, slowly shrink and rotate them. If shrinking is done,
  // set a new gem, and set all gems above to fall
  for (var index = 0; index < this.gemsToRemove.length; index++) {
    let a = this.gemsToRemove[index];
    if (this.gameObjects[a.i][a.j].scale > 0.1) {
      this.gameObjects[a.i][a.j].scale += -0.03;
      this.gameObjects[a.i][a.j].orientation += 0.15;
    } else if (index == 0) {
      this.gemsToFall[a.i].splice(a.j, 1);
      this.gemsToFall[a.i].push(this.gemsToFall[a.i][8]);
      this.gameObjects[a.i].splice(a.j, 1);
      this.setNewGem(a.i,9);
      this.gameObjects[a.i][9].j++;
      for (var fallIndex = a.j; fallIndex < 10; fallIndex++) {
        this.gameObjects[a.i][fallIndex].j--;
        this.gemsToFall[a.i][fallIndex]++;
      }
      this.setLocation(a.i,9);
      this.gameObjects[a.i][9].position.addScaled(this.gemsToFall[a.i][9], new Vec3(0, 0.2, 0));
      this.gemsToRemove.shift();
      index--;
    }
  }

  // count the number of falling gems and make them fall
  var fallingGems = 0;
  var fallingSpeed = 0.01;
  for (var i = 0; i < this.gemsToFall.length; i++) {
    for (var j = 0; j < this.gemsToFall[i].length; j++) {
      if (this.gemsToFall[i][j] > 0) {
        if (this.gemsToFall[i][j] <= 5 * fallingSpeed && !this.gemsToCheck.includes(this.gameObjects[i][j])) {
            this.setLocation(i,j);
            this.gemsToCheck.push(this.gameObjects[i][j]);
        }
        fallingGems++;
        this.gameObjects[i][j].position.sub(new Vec3(0, fallingSpeed, 0));
        this.gemsToFall[i][j] -= 5 * fallingSpeed;
      } 
    }
  }

  // if there are no shrinking or falling gems, check gems that have been moved recently
  if (!this.gemsToRemove.length && !fallingGems) {
    if (!this.gemsToCheck.length) {
      this.disableListeners = false;      
    }
    while(this.gemsToCheck.length > 0) {
      this.checkForLine(this.gemsToCheck[0].i,this.gemsToCheck[0].j);
      this.gemsToCheck.shift();
    }
  }

  // animate boom
  this.textureMaterial.boomPhase.set((Math.floor(this.boomCounter)%6), Math.floor(this.boomCounter/6)).mul(1/6);
  this.boomCounter = (this.boomCounter + dt * 20) % 36;

  // draw all gems, rotating the gears and deleting some if quaking
  for (var i = 0; i < this.gameObjects.length; i++) {
    for (var j = 0; j < this.gameObjects[i].length; j++) {
      if (this.gameObjects[i][j].gemType == "Gear") {
        this.gameObjects[i][j].orientation += dt;
      }
      if (this.quake && Math.random() > 0.999) {
        if (!this.gemsToRemove.includes(this.gameObjects[i][j])) {
          this.gemsToRemove.push(this.gameObjects[i][j]);
        }
      }
      this.gameObjects[i][j].draw(this.camera);
    }
  }
};

Scene.prototype.checkForLine = function(i,j) {
  let thisGemType = this.gameObjects[i][j].gemType;
  var inRow = 1;
  var colsToRemove = [];
  colsToRemove.push(i);
  for(var index = i + 1; index < 10 && this.gameObjects[index][j].gemType == thisGemType; index++) {
    inRow++;
    colsToRemove.push(index);
  }
  for(var index = i - 1; index >= 0 && this.gameObjects[index][j].gemType == thisGemType; index--) {
    inRow++;
    colsToRemove.push(index);
  }
  var inCol = 1;
  var rowsToRemove = [];
  rowsToRemove.push(j);
  for(var index = j + 1; index < 10 && this.gameObjects[i][index].gemType == thisGemType; index++) {
    inCol++;
    rowsToRemove.push(index);
  }
  for(var index = j - 1; index >= 0 && this.gameObjects[i][index].gemType == thisGemType; index--) {
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

Scene.prototype.pickupGem = function(x,y) {
  let i = Math.floor(5 * x + .5);
  let j = Math.floor(5 * y + .5);
  if (i >= 0 && i < 10 && j >= 0 && j < 10) {
    this.selected.Gem = this.gameObjects[i][j];
    this.selected.i = i;
    this.selected.j = j;
    this.currentPosition = new Vec3(x,y,0);
  } else {
    this.selected.Gem = null;
  }
}

Scene.prototype.dragGem = function(x,y) {
  if(this.selected.Gem) {
    this.selected.Gem.position.sub(this.currentPosition).add(new Vec3(x,y,0));
  }
  this.currentPosition = new Vec3(x,y,0);
}

Scene.prototype.dropGem = function(x,y) {
  if (this.selected.Gem) {
  let i = Math.floor(5 * x + .5);
  let j = Math.floor(5 * y + .5);
  if (i >= 0 && i < 10 && j >= 0 && j < 10) {
    if ((Math.abs(i - this.selected.i) == 1 && j == this.selected.j) || 
        (i == this.selected.i && Math.abs(j - this.selected.j) == 1)) {
      this.gameObjects[this.selected.i][this.selected.j] = this.gameObjects[i][j];
      this.gameObjects[this.selected.i][this.selected.j].i = this.selected.i;
      this.gameObjects[this.selected.i][this.selected.j].j = this.selected.j;
      this.gameObjects[i][j] = this.selected.Gem;
      this.gameObjects[i][j].i = i;
      this.gameObjects[i][j].j = j;
      let draggedGemFormLine = this.checkForLine(i,j);
      let destinationGemFormLine = this.checkForLine(this.selected.i,this.selected.j)
      if (!draggedGemFormLine && !destinationGemFormLine) {
        this.gameObjects[i][j] = this.gameObjects[this.selected.i][this.selected.j];
        this.gameObjects[this.selected.i][this.selected.j] = this.selected.Gem;
      }
      this.setLocation(i, j);
    }
  }
  this.setLocation(this.selected.i, this.selected.j);
  }
}

Scene.prototype.bomb = function(x,y) {
  let i = Math.floor(5 * x + .5);
  let j = Math.floor(5 * y + .5);
  if (i >= 0 && i < 10 && j >= 0 && j < 10) {
    if (!this.gemsToRemove.includes(this.gameObjects[i][j])) {
      this.gemsToRemove.push(this.gameObjects[i][j]);
    }
  }
}

Scene.prototype.rotateRight = function() {
  this.camera.rotation += Math.PI/2;
  this.stableRotation += Math.PI/2;
  this.camera.updateViewProjMatrix();
}

Scene.prototype.rotateLeft = function() {
  this.camera.rotation -= Math.PI/2;
  this.stableRotation -= Math.PI/2;
  this.camera.updateViewProjMatrix();
}