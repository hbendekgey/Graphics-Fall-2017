"use strict";
let Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);
  this.material = new Material(gl, this.solidProgram);
  this.material.solidColor.set(1, 1, 1);
  this.triangleGeometry = new TriangleGeometry(gl);
  this.timeAtLastFrame = new Date().getTime();
  this.gameObjects = [];
  this.camera = new OrthoCamera();
  this.gameObjects.push(new GameObject(new Mesh(this.triangleGeometry, this.material)));
  this.gameObjects.push(new GameObject(new Mesh(this.triangleGeometry, this.material)));
};

Scene.prototype.update = function(gl, keysPressed) {

  //jshint bitwise:false
  //jshint unused:false
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  // clear the screen
  gl.clearColor(1, 0.5, 0.3, 1.0);
  gl.clearDepth(0.5);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
  if(keysPressed.W) {
    this.gameObjects[0].position.addScaled(dt, new Vec3(0, 0.5, 0)); 
    this.gameObjects[1].position.addScaled(dt, new Vec3(0, -0.5, 0)); 
  }
  if(keysPressed.A) {
    this.gameObjects[0].position.addScaled(dt, new Vec3(-0.5, 0, 0)); 
    this.gameObjects[1].position.addScaled(dt, new Vec3(0.5, 0, 0)); 
  } 
  if(keysPressed.S) {
    this.gameObjects[0].position.addScaled(dt, new Vec3(0, -0.5, 0)); 
    this.gameObjects[1].position.addScaled(dt, new Vec3(0, 0.5, 0)); 
  }
  if(keysPressed.D) {
    this.gameObjects[0].position.addScaled(dt, new Vec3(0.5, 0, 0)); 
    this.gameObjects[1].position.addScaled(dt, new Vec3(-0.5, 0, 0)); 
  }
  if(keysPressed.Z) {
    this.gameObjects[0].scale.add(0.1, 0.1, 0); 
    this.gameObjects[1].scale.add(0.1, 0.1, 0); 
  }
  if(keysPressed.X) {
    this.gameObjects[0].scale.sub(0.1, 0.1, 0); 
    this.gameObjects[1].scale.sub(0.1, 0.1, 0); 
  }
  if(keysPressed.O) {
    this.gameObjects[0].orientation += 0.1; 
    this.gameObjects[1].orientation += 0.1; 
  }
  if(keysPressed.P) {
    this.gameObjects[0].orientation += -0.1; 
    this.gameObjects[1].orientation += -0.1; 
  }

  for (var i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }
};