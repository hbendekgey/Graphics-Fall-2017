"use strict";
let Scene = function(gl) {
  this.vsTexture = new Shader(gl, gl.VERTEX_SHADER, "texture_vs.essl");
  this.fsTexture = new Shader(gl, gl.FRAGMENT_SHADER, "texture_fs.essl");
  this.textureProgram = new TexturedProgram(gl, this.vsTexture, this.fsTexture);

  this.mirrorTexture = new Texture2D(gl, "media/probe2017fall1.png");

  this.gameObjects = []

  this.vsEnvironment = new Shader(gl, gl.VERTEX_SHADER, "environment_vs.essl");
  this.fsEnvironment = new Shader(gl, gl.FRAGMENT_SHADER, "environment_fs.essl");
  this.environmentProgram = new Program(gl, this.vsEnvironment, this.fsEnvironment);

  this.environmentMaterial = new Material(gl, this.environmentProgram);
  this.environmentMaterial.probeTexture.set(this.mirrorTexture);
  this.gameObjects.push(new GameObject(new Mesh(new QuadGeometry(gl), this.environmentMaterial)));


  Material.lightPos.at(0).set(new Vec4(0.5,1,-0.5,0).normalize());
  Material.spotMainDir.at(0).set(new Vec3(Material.lightPos.at(0)).mul(-1));
  Material.lightPowerDensity.at(0).set(new Vec3(1,1,1));

  let sphere = new ClippedQuadric(new Mat4(), new Mat4());
  let cone = new ClippedQuadric(new Mat4(), new Mat4());
  sphere.setUnitSphere();
  cone.setUnitCone();
  sphere.transform(new Mat4().translate(0,2,0));
  cone.transform(new Mat4().translate(0,2,0));

  Material.quadrics.at(0).set(sphere.surfaceCoeffMatrix);
  Material.quadrics.at(1).set(sphere.clipperCoeffMatrix);
  Material.quadrics.at(2).set(cone.surfaceCoeffMatrix);
  Material.quadrics.at(3).set(cone.clipperCoeffMatrix);

  Material.quadrics.at(4).set(0, 0, 0, 0,
            0, 0, 0, 1,
            0, 0, 0, 0,
            0, 0, 0, 0);
  
  Material.quadrics.at(5).set(1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, -100);

  this.camera = new PerspectiveCamera();

  gl.enable(gl.DEPTH_TEST);

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
  for (var i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }
};
