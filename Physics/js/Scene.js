"use strict";
let Scene = function(gl) {
  this.vsTrafo = new Shader(gl, gl.VERTEX_SHADER, "trafo_vs.essl");
  this.vsBackground = new Shader(gl, gl.VERTEX_SHADER, "background_vs.essl");  
  this.fsTextured = new Shader(gl, gl.FRAGMENT_SHADER, "textured_fs.essl");
  this.texturedProgram = new TexturedProgram(gl, this.vsTrafo, this.fsTextured);
  this.backgroundProgram = new TexturedProgram(gl, this.vsBackground, this.fsTextured);  

  this.quadGeometry = new TexturedQuadGeometry(gl);

  this.gameObjects = [];

  this.backgroundMaterial = new Material(gl, this.backgroundProgram);
  this.backgroundMaterial.colorTexture.set(new Texture2D(gl, "media/background.jpg"));
  this.backgroundMesh = new Mesh(this.quadGeometry, this.backgroundMaterial);
  this.background = new GameObject( this.backgroundMesh );
  this.gameObjects.push(this.background);

  this.raiderMaterial = new Material(gl, this.texturedProgram);
  this.raiderMaterial.colorTexture.set(new Texture2D(gl, "media/raider.png"));
  this.raiderMesh = new Mesh(this.quadGeometry, this.raiderMaterial);
  this.avatar = new GameObject( this.raiderMesh );
  this.gameObjects.push(this.avatar);

  this.asteroidMaterial = new Material(gl, this.texturedProgram);
  this.asteroidMaterial.colorTexture.set(new Texture2D(gl, "media/asteroid.png"));
  this.asteroidMesh = new Mesh(this.quadGeometry, this.asteroidMaterial);

  let genericMove = function(t, dt){
    this.orientation += dt * this.angularMomentum * this.invAngularMass;
    this.position.add(this.momentum.times(dt * this.invAngularMass));
    this.angularMomentum *= Math.pow(this.angularDrag, dt);
  };

  let circularMove = function(t,dt){
    let mt = t * this.angularMomentum * this.invAngularMass;
    this.position = this.staticPosition.plus(new Vec3(Math.cos(mt), Math.sin(mt), 0));
    this.orientation = mt % (2 * Math.PI);
  }

  for(var i=0; i < 64; i++){
    let asteroid = new GameObject( this.asteroidMesh );
    asteroid.position.setRandom(new Vec3(-12, -12, 0.5), new Vec3(12, 12, 0.5) );
    asteroid.momentum.setRandom(new Vec3(-2, -2, 0), new Vec3(2, 2, 0));
    asteroid.angularMomentum = (Math.random() - 0.5) * 100.0;
    this.gameObjects.push(asteroid);
    //asteroid.staticPosition = asteroid.position;
    asteroid.angularDrag = 0.8;
    asteroid.move = genericMove;
  }

  this.avatar.backDrag = 0.9;
  this.avatar.sideDrag = 0.5;
  this.avatar.angularDrag = 0.5;
  this.avatar.control = function(t, dt, keysPressed, gameObjects){
    // PRACTICAL TODO
    let thrust = 0;
    //this.force = ahead.times(this.thrust); 
    this.torque = 0;
  };  
  this.avatar.move = genericMove;

  this.camera = new OrthoCamera();
  this.timeAtLastFrame = new Date().getTime();

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

};

Scene.prototype.update = function(gl, keysPressed) {
  //jshint bitwise:false
  //jshint unused:false
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  // clear the screen
  gl.clearColor(0.6, 0.0, 0.3, 1.0);
  gl.clearDepth(1.0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  for (let i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].control(timeAtThisFrame, dt, keysPressed, this.gameObjects);
  }

  for (let i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].move(timeAtThisFrame / 1000.0, dt);
  }

  this.camera.position = this.avatar.position;
  this.camera.updateViewProjMatrix();

  Material.viewProjMatrixInverse.set(this.camera.viewProjMatrix).invert();

  for (let i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }

};


