"use strict";
let Scene = function(gl) {
  // program for all textured objects
  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);

  // program for all solid-color objects: like rotor and shadows
  this.vsSolid = new Shader(gl, gl.VERTEX_SHADER, "solid_vs.essl");
  this.fsSolid = new Shader(gl, gl.FRAGMENT_SHADER, "solid_fs.essl");
  this.solidProgram = new Program(gl, this.vsSolid, this.fsSolid);

  // for shadow
  this.fsShadow = new Shader(gl, gl.FRAGMENT_SHADER, "shadow_fs.essl"); 
  this.shadowProgram = new Program(gl, this.vsSolid, this.fsShadow);

  // for shiny
  this.fsShiny = new Shader(gl, gl.FRAGMENT_SHADER, "shiny_texture_fs.essl"); 
  this.shinyProgram = new TexturedProgram(gl, this.vsTexture, this.fsShiny);

  // create and initialize avatar
  this.heliTexture = new Texture2D(gl, "media/heli/heli.png");
  this.heliMaterials = [];
  this.heliMaterials.push(new Material(gl, this.shinyProgram));
  this.heliMaterials[0].colorTexture.set(this.heliTexture);
  this.heliMultiMesh = new MultiMesh(gl, "media/heli/heli1.json", this.heliMaterials);
  this.avatar = new GameObject(this.heliMultiMesh, new Material(gl, this.shadowProgram));
  this.avatar.scale.mul(0.5);
  this.avatar.position.set(new Vec3(0,10,0));
  this.avatar.orientation = Math.PI;
  this.avatar.speed = 50;

  // create and initialize rotor
  this.rotorMaterials = [new Material(gl, this.solidProgram), new Material(gl, this.solidProgram)];
  this.rotorMaterials[0].color.set(new Vec3(0.7,0.7,0.7));
  this.rotorMaterials[1].color.set(new Vec3(0.7,0.7,0.7));

  this.rotorMultiMesh = new MultiMesh(gl, "media/heli/mainrotor.json", this.rotorMaterials);
  this.avatar.rotor = new GameObject(this.rotorMultiMesh, new Material(gl, this.shadowProgram));
  this.avatar.rotor.position.set(new Vec3(0,14,0));
  this.avatar.rotor.parent = this.avatar;

  // create and initialize ground
  this.groundMaterial = new Material(gl, this.textureProgram);
  this.groundMaterial.colorTexture.set(new Texture2D(gl, "media/sand.png"));
  this.textureGeometry = new TexturedQuadGeometry(gl);
  this.ground = new GameObject(new Mesh(this.textureGeometry, this.groundMaterial));

  // create and initialize trees
  this.gameObjects = [];
  this.treeTexture = new Texture2D(gl, "media/tree/tree.png");
  this.treeMaterials = [];
  this.treeMaterials.push(new Material(gl, this.textureProgram));
  this.treeMaterials[0].colorTexture.set(this.treeTexture);
  this.treeMultiMesh = new MultiMesh(gl, "media/tree/tree.json", this.treeMaterials);

  for (var i = 0; i < 30; i++) {
    this.gameObjects.push(new GameObject(this.treeMultiMesh, new Material(gl, this.shadowProgram)));
    this.gameObjects[i].position.addScaled(Math.random() - 0.5, new Vec3(1000,0,0));
    this.gameObjects[i].position.addScaled(Math.random() - 0.5, new Vec3(0,0,1000));
  }

  // for building slowpokes
  this.slowpokeBodyTexture = new Texture2D(gl, "media/slowpoke/body.png");
  this.slowpokeEyeTexture = new Texture2D(gl, "media/slowpoke/eye.png");
  this.slowpokeMaterials = [new Material(gl, this.textureProgram), new Material(gl, this.textureProgram)];
  this.slowpokeMaterials[0].colorTexture.set(this.slowpokeBodyTexture);
  this.slowpokeMaterials[1].colorTexture.set(this.slowpokeEyeTexture);
  this.slowpokeMultiMesh = new MultiMesh(gl, "media/slowpoke/Slowpoke.json", this.slowpokeMaterials);
  this.gameObjects.push(new GameObject(this.slowpokeMultiMesh, new Material(gl, this.shadowProgram)));
  this.gameObjects[30].orientation = Math.PI;

  // create and initialize camera
  this.camera = new PerspectiveCamera();
  gl.enable(gl.DEPTH_TEST);

  // initialize sunshine
  Material.lightPos.at(0).set(new Vec4(0,1,0,0));
  Material.spotMainDir.at(0).set(new Vec3(0,-1,0));
  Material.lightPowerDensity.at(0).set(new Vec3(1,1,1));
  // Note: initialization of spotlight is below in moveAvatar

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

  // rotate the rotor
  this.avatar.rotor.yaw += 0.1;

  // move the camera (and the avatar + spotlight)
  this.moveAvatar(dt, keysPressed);
  this.camera.move(dt, keysPressed, this.avatar);

  // moves the slowpokes
  this.moveOnCurve(this.gameObjects[30], 0);

  // draw everything
  this.ground.draw(this.camera);
  this.avatar.draw(this.camera);
  this.avatar.rotor.draw(this.camera);
  for (var i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }

};

Scene.prototype.moveAvatar = function(dt, keysPressed) {
  this.avatar.velocity.set();
  this.isRotated = false;
  if(keysPressed.LEFT) {
    this.avatar.yaw += dt; 
    this.isRotated = true;
  }
  if(keysPressed.UP) {
    this.avatar.pitch -= dt; 
    this.isRotated = true;
  }
  if(keysPressed.RIGHT) {
    this.avatar.yaw -= dt; 
    this.isRotated = true;
  }
  if(keysPressed.DOWN) {
    this.avatar.pitch += dt; 
    this.isRotated = true;
  }
  if(this.avatar.pitch > 3.14/2.0) { 
      this.avatar.pitch = 3.14/2.0; 
    } 
    if(this.avatar.pitch < -3.14/2.0) { 
      this.avatar.pitch = -3.14/2.0; 
  }
  if (this.isRotated) {
    this.avatar.updateOrientation();
  }
  if(keysPressed.W) { 
    this.avatar.velocity.add(this.avatar.ahead); 
  } 
  if(keysPressed.S) {
    this.avatar.velocity.sub(this.avatar.ahead); 
  } 
  if(keysPressed.D) { 
    this.avatar.velocity.add(this.avatar.right); 
  } 
  if(keysPressed.A) { 
    this.avatar.velocity.sub(this.avatar.right); 
  } 
  if(keysPressed.E) { 
    this.avatar.velocity.add(PerspectiveCamera.worldUp); 
  } 
  if(keysPressed.Q) { 
    this.avatar.velocity.sub(PerspectiveCamera.worldUp); 
  }
  this.avatar.move(dt);
  this.spotLightPos = new Vec3(this.avatar.position).addScaled(15, this.avatar.ahead).add(new Vec3(0,10,0));
  Material.lightPos.at(1).set(new Vec4(this.spotLightPos, 1));
  Material.spotMainDir.at(1).set(this.avatar.ahead);
};

Scene.prototype.moveOnCurve = function(gameObject, initialTime) {
  let xPos = 10 * Math.cos(this.timeAtLastFrame / 1000 + initialTime);
  let yPos = 10 * Math.sin(3 * this.timeAtLastFrame / 1000 + initialTime) + 10;
  let zPos = 10 * Math.sin(this.timeAtLastFrame / 1000 + initialTime);
  gameObject.position = new Vec3(xPos, yPos, zPos);
  let xVel = -1 * Math.sin(this.timeAtLastFrame / 1000 + initialTime);
  let yVel = 3 * Math.cos(3 * this.timeAtLastFrame / 1000 + initialTime);
  let zVel = 1 * Math.cos(this.timeAtLastFrame / 1000 + initialTime);
  let velocity = new Vec3(xVel, yVel, zVel).normalize();
  gameObject.pitch = Math.asin(velocity.y);
  gameObject.yaw = Math.atan(-1 * velocity.x / Math.cos(gameObject.pitch));
  gameObject.updateOrientation();
};