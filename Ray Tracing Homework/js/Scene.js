"use strict";
let Scene = function(gl) {
  // initialize environment
  const mirrorTexture = new Texture2D(gl, "media/probe2017fall1.png");
  const vsEnvironment = new Shader(gl, gl.VERTEX_SHADER, "environment_vs.essl");
  const fsEnvironment = new Shader(gl, gl.FRAGMENT_SHADER, "environment_fs.essl");
  const environmentProgram = new Program(gl, vsEnvironment, fsEnvironment);
  let environmentMaterial = new Material(gl, environmentProgram);
  environmentMaterial.probeTexture.set(mirrorTexture);
  this.environment = new GameObject(new Mesh(new QuadGeometry(gl), environmentMaterial));

  // sunshine
  Material.lightPos.at(0).set(new Vec4(1,0.8,1,0).normalize());
  Material.lightPowerDensity.at(0).set(new Vec3(1.2,1.2,1.2));

  Material.quadrics.at(0).set(0, 0, 0, 0,
            0, 0, 0, 1,
            0, 0, 0, 0,
            0, 0, 0, 0);
  
  Material.quadrics.at(1).set(1, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 0, -16);
  Material.quadrics.at(2).set(0, 0, 0, 0,
        0, 0, 0, 0,
        0, 0, 1, 0,
        0, 0, 0, -16);

  Material.brdfs.at(0).set(new Vec4(0,0,0,0));

  let rightPawn = new Pawn(1,3,6,6);
  let leftPawn = new Pawn(3,7,6,1);
  let leftBishop = new Bishop(5,11,7,5,1);
  let rightBishop = new Bishop(9,19,7,2,2);

  this.camera = new PerspectiveCamera();
  this.camera.position = new Vec3(0,1,0);

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
  this.environment.draw(this.camera);
};
