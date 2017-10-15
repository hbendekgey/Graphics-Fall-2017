"use strict";
let Scene = function(gl) {
  this.vsIdle = new Shader(gl, gl.VERTEX_SHADER, "idle_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsIdle, this.fsSolid);

  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);
  this.texture2D = new Texture2D(gl, "media/boom.png");

  this.staticMaterial = new Material(gl, this.solidProgram);
  this.staticMaterial.time.set(0);

  this.textureMaterial = new Material(gl, this.textureProgram);
  this.textureMaterial.colorTexture.set(this.texture2D);
  this.textureMaterial.boomPhase.set(new Vec2(0,0));
  this.boomCounter = 0;
  this.timeAtLastFrame = new Date().getTime();

  this.triangleGeometry = new TriangleGeometry(gl);
  this.textureGeometry = new TexturedQuadGeometry(gl);

  this.camera = new OrthoCamera();
  this.camera.updateViewProjMatrix();

  this.gameObject = new GameObject(new Mesh(this.textureGeometry, this.textureMaterial));
};

Scene.prototype.update = function(gl, keysPressed) {

  //jshint bitwise:false
  //jshint unused:false
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  // animate boom
  this.textureMaterial.boomPhase.set((Math.floor(this.boomCounter)%6), Math.floor(this.boomCounter/6)).mul(1/6);
  this.boomCounter = (this.boomCounter + dt * 20) % 36

  // clear the screen
  gl.clearColor(0.2, 0, 0.2, 1.0);
  gl.clearDepth(0.5);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.gameObject.draw(this.camera);
};