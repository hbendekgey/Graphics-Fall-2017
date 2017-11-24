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


  Material.lightPos.at(0).set(new Vec4(1.0,0.8,1.0,0).normalize());
  Material.spotMainDir.at(0).set(new Vec3(Material.lightPos.at(0)).mul(-1));
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


  let sphere = new ClippedQuadric(new Mat4(), new Mat4());
  let cone = new ClippedQuadric(new Mat4(), new Mat4());
  sphere.setUnitSphere();
  cone.setUnitCone();
  sphere.transform(new Mat4().scale(.15).translate(.5,.4,-2.5));
  cone.transform(new Mat4().scale(new Vec3(0.2,0.4,0.2)).translate(.5,.4,-2.5));

  Material.quadrics.at(3).set(sphere.surfaceCoeffMatrix);
  Material.quadrics.at(4).set(sphere.clipperCoeffMatrix);
  Material.brdfs.at(1).set(new Vec4(0,0,0,1));

  Material.quadrics.at(5).set(cone.surfaceCoeffMatrix);
  Material.quadrics.at(6).set(cone.clipperCoeffMatrix);
  Material.brdfs.at(2).set(new Vec4(0,0,0,1));

  let hyperboloid = new ClippedQuadric(new Mat4(), new Mat4());
  hyperboloid.setUnitHyperboloid();
  hyperboloid.transform(new Mat4().scale(new Vec3(.15,.3,.15)).translate(1.5,.9,-3.5));

  Material.quadrics.at(7).set(hyperboloid.surfaceCoeffMatrix);
  Material.quadrics.at(8).set(hyperboloid.clipperCoeffMatrix);
  console.log(hyperboloid.surfaceCoeffMatrix);
  console.log(hyperboloid.clipperCoeffMatrix);
  Material.brdfs.at(3).set(new Vec4(0,0,0,2));

  let head = new ClippedQuadric(new Mat4(), new Mat4());
  head.setUnitSphere();
  head.clipperCoeffMatrix.set(-1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0.25);
  head.transform(new Mat4().scale(new Vec3(.2,.2,.2)).translate(1.5,1.0,-3.5));

  Material.quadrics.at(9).set(head.surfaceCoeffMatrix);
  Material.quadrics.at(10).set(head.clipperCoeffMatrix);
  Material.brdfs.at(4).set(new Vec4(0,0,0,2));

  let hole = new ClippedQuadric(new Mat4(), new Mat4());
  hole.surfaceCoeffMatrix.set(head.clipperCoeffMatrix);
  hole.clipperCoeffMatrix.set(head.surfaceCoeffMatrix);
  
  Material.quadrics.at(11).set(hole.surfaceCoeffMatrix);
  Material.quadrics.at(12).set(hole.clipperCoeffMatrix);
  Material.brdfs.at(5).set(new Vec4(0,0,0,2));

  let hat = new ClippedQuadric(new Mat4(), new Mat4());
  hat.setUnitSphere();
  hat.transform(new Mat4().scale(new Vec3(.1,.05,.1)).translate(1.5,1.2,-3.5));
  Material.quadrics.at(13).set(hat.surfaceCoeffMatrix);
  Material.quadrics.at(14).set(hat.clipperCoeffMatrix);
  Material.brdfs.at(6).set(new Vec4(0,0,0,2));


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
  for (var i = 0; i < this.gameObjects.length; i++) {
    this.gameObjects[i].draw(this.camera);
  }
};
