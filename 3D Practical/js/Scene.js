"use strict";
let Scene = function(gl) {
  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);
  this.texture2DEye = new Texture2D(gl, "media/YadonEyeDh.png");
  this.texture2DBody = new Texture2D(gl, "media/YadonDh.png");

  this.materials = [];
  this.materials.push(new Material(gl, this.textureProgram));
  this.materials.push(new Material(gl, this.textureProgram));
  this.materials[0].colorTexture.set(this.texture2DBody);
  this.materials[1].colorTexture.set(this.texture2DEye);

  this.multiMesh = new MultiMesh(gl, "media/Slowpoke.json", this.materials);
  this.gameObject = new GameObject(this.multiMesh);
  
  this.camera = new PerspectiveCamera();
  gl.enable(gl.DEPTH_TEST);
  Material.lightDirection.set(new Vec3(0,1,0));

  this.timeAtLastFrame = new Date().getTime();
};

Scene.prototype.update = function(gl, keysPressed) {

  //jshint bitwise:false
  //jshint unused:false
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  // clear the screen
  gl.clearColor(0.2, 0, 0.2, 1.0);
  gl.clearDepth(1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.camera.move(dt, keysPressed);
  this.gameObject.draw(this.camera);
};