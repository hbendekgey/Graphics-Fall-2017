"use strict";
let Scene = function(gl) {
  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);

  this.heliTexture = new Texture2D(gl, "media/heli/heli.png");

  this.heliMaterials = [];
  this.heliMaterials.push(new Material(gl, this.textureProgram));
  this.heliMaterials[0].colorTexture.set(this.heliTexture);

  this.heliMultiMesh = new MultiMesh(gl, "media/heli/heli1.json", this.heliMaterials);
  this.avatar = new GameObject(this.heliMultiMesh);
  this.avatar.scale.mul(0.5);
  this.avatar.position.set(new Vec3(0,10,0));

  this.groundMaterial = new Material(gl, this.textureProgram);
  this.groundMaterial.colorTexture.set(new Texture2D(gl, "media/sand.png"));
  this.textureGeometry = new TexturedQuadGeometry(gl);
  this.ground = new GameObject(new Mesh(this.textureGeometry, this.groundMaterial));

  this.camera = new PerspectiveCamera();
  this.camera.pitch = -0.1;
  this.camera.isDragging = true;
  this.camera.move(1, [], this.avatar);
  this.camera.isDragging = false;

  this.gameObjects = [];

  this.vsSolid = new Shader(gl, gl.VERTEX_SHADER, "solid_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new TexturedProgram(gl, this.vsSolid, this.fsSolid);

  this.rotorMaterials = [];
  for (var i = 0; i < 2; i++) {
    this.rotorMaterials.push(new Material(gl, this.solidProgram));
    this.rotorMaterials[i].color.set(new Vec3(0.7,0.7,0.7));
  }
  this.rotorMultiMesh = new MultiMesh(gl, "media/heli/mainrotor.json", this.rotorMaterials);
  this.gameObjects.push(new GameObject(this.rotorMultiMesh));
  this.gameObjects[0].position.set(new Vec3(0,14,0));
  this.gameObjects[0].parent = this.avatar;

  this.treeTexture = new Texture2D(gl, "media/tree/tree.png");
  this.treeMaterials = [];
  this.treeMaterials.push(new Material(gl, this.textureProgram));
  this.treeMaterials[0].colorTexture.set(this.treeTexture);
  this.treeMultiMesh = new MultiMesh(gl, "media/tree/tree.json", this.treeMaterials);

  for (var i = 1; i < 10; i++) {
    this.gameObjects.push(new GameObject(this.treeMultiMesh));
    this.gameObjects[i].position.addScaled(Math.random() - 0.5, new Vec3(1000,0,0));
    this.gameObjects[i].position.addScaled(Math.random() - 0.5, new Vec3(0,0,1000));
  }

  gl.enable(gl.DEPTH_TEST);

  Material.lightPos.at(0).set(new Vec4(0,1,0,0)); // 0 if directional and 1 if point for vec4
  Material.lightPowerDensity.at(0).set(new Vec3(1,1,1));
  Material.lightPos.at(1).set(new Vec4(0,0,0,1)); // 0 if directional and 1 if point for vec4
  Material.lightPowerDensity.at(1).set(new Vec3(5000,5000,5000));



  this.timeAtLastFrame = new Date().getTime();
};

Scene.prototype.update = function(gl, keysPressed) {

  //jshint bitwise:false
  //jshint unused:false
  let timeAtThisFrame = new Date().getTime();
  let dt = (timeAtThisFrame - this.timeAtLastFrame) / 1000.0;
  this.timeAtLastFrame = timeAtThisFrame;

  // clear the screen
  gl.clearColor(0.5, 0.8, 0.92, 1.0);
  gl.clearDepth(1);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  this.camera.move(dt, keysPressed, this.avatar);
  this.avatar.draw(this.camera);
  this.ground.draw(this.camera);
  this.gameObjects[0].yaw += 0.1;
  
  for (var i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }
  // this.gameObjects[0].draw(this.camera);

  // this.shadowMaterial = new Material(gl,this.solidProgram);
  // this.shadowMaterial.commit();
  // this.avatar.drawShadow(this.camera);
  // for (var i = 0; i < this.gameObjects.length; i++) {
  //   this.gameObjects[i].drawShadow(this.camera);
  // }
};