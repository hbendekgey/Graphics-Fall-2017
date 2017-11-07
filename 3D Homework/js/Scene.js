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

  // for wooden balloons
  this.fsWood = new Shader(gl, gl.FRAGMENT_SHADER, "wood_fs.essl");
  this.woodProgram = new Program(gl, this.vsSolid, this.fsWood);

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

  // array containing trees, wooden balloons and slowpokes
  this.gameObjects = [];

  // create and initialize trees
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

  // create and initialize wooden balloons
  this.balloonTexture = new Texture2D(gl, "media/balloon/balloon.png");
  this.balloonMaterials = [];
  this.balloonMaterials.push(new Material(gl, this.woodProgram));
  this.balloonMultiMesh = new MultiMesh(gl, "media/balloon/balloon.json", this.balloonMaterials);
  
  for (var i = 30; i < 50; i++) {
    this.gameObjects.push(new GameObject(this.balloonMultiMesh, new Material(gl, this.shadowProgram)));
    this.gameObjects[i].position.addScaled(Math.random() - 0.5, new Vec3(1000,0,0));
    this.gameObjects[i].position.addScaled(Math.random(), new Vec3(0,500,0));
    this.gameObjects[i].position.addScaled(Math.random() - 0.5, new Vec3(0,0,1000));
  }

  // create and initialize slowpokes
  this.slowpokeBodyTexture = new Texture2D(gl, "media/slowpoke/body.png");
  this.slowpokeEyeTexture = new Texture2D(gl, "media/slowpoke/eye.png");
  this.slowpokeMaterials = [new Material(gl, this.textureProgram), new Material(gl, this.textureProgram)];
  this.slowpokeMaterials[0].colorTexture.set(this.slowpokeBodyTexture);
  this.slowpokeMaterials[1].colorTexture.set(this.slowpokeEyeTexture);
  this.slowpokeMultiMesh = new MultiMesh(gl, "media/slowpoke/Slowpoke.json", this.slowpokeMaterials);

  for (var i = 50; i < 53; i++) {
    this.gameObjects.push(new GameObject(this.slowpokeMultiMesh, new Material(gl, this.shadowProgram)));
    this.gameObjects[i].orientation = Math.PI;
    this.gameObjects[i].scale = new Vec3(5,5,5);
  }

  // create and initialize camera
  this.camera = new PerspectiveCamera();
  this.trackingTime = 0;

  gl.enable(gl.DEPTH_TEST);

  // initialize sunshine
  Material.lightPos.at(0).set(new Vec4(0.5,1,-0.5,0).normalize());
  Material.spotMainDir.at(0).set(new Vec3(Material.lightPos.at(0)).mul(-1));
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

  // move the avatar
  this.moveAvatar(dt, keysPressed);

  // move the camera
  this.camera.move(dt, keysPressed, this.avatar);
  if (this.isTracking) {
    this.trackCamera(dt);
  } 

  // moves the slowpokes
  this.moveOnCurve(this.gameObjects[50], 0);
  this.moveOnCurve(this.gameObjects[51], 2 * Math.PI / 3.0);
  this.moveOnCurve(this.gameObjects[52], 4 * Math.PI / 3.0);

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
  this.spotLightPos = new Vec3(this.avatar.position).addScaled(11, this.avatar.ahead).add(new Vec3(0,7,0));
  Material.lightPos.at(1).set(new Vec4(this.spotLightPos, 1));
  Material.spotMainDir.at(1).set(this.avatar.ahead);
};

Scene.prototype.moveOnCurve = function(gameObject, initialTime) {
  let t = (this.timeAtLastFrame / 1000 + initialTime) % (2 * Math.PI);
  let xPos = 100 * Math.cos(t);
  let yPos = 100 * Math.sin(3 * t) + 10;
  let zPos = 100 * Math.sin(t);
  gameObject.position = new Vec3(xPos, yPos, zPos);

  let xVel = -1 * Math.sin(t);
  let yVel = 3 * Math.cos(3 * t);
  let zVel = 1 * Math.cos(t);
  let velocity = new Vec3(xVel, yVel, zVel).normalize();

  gameObject.pitch = Math.asin(velocity.y);
  gameObject.yaw = -1 * t + Math.PI;
  gameObject.updateOrientation();
};

Scene.prototype.trackCamera = function(dt) {
  this.trackingTime = this.trackingTime + dt;
  this.camera.trackingRight = 16 * Math.pow(Math.sin(this.trackingTime), 3);
  this.camera.trackingUp = 13 * Math.cos(this.trackingTime) - 
                           5 * Math.cos(2 * this.trackingTime) - 
                           2 * Math.cos(3 * this.trackingTime) - 
                           Math.cos(4 * this.trackingTime) - 5;
};