"use strict"; 
let GameObject = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0; 
  this.rotationAxis = new Vec3(0,0,1);
  this.scale = new Vec3(1,1,1); 

  this.modelMatrix = new Mat4(); 
};

GameObject.prototype.updateModelMatrix =
                              function(){ 
  this.modelMatrix.set().rotate(this.orientation, this.rotationAxis).scale(this.scale).translate(this.position); 
};

GameObject.prototype.draw = function(camera, lightDirection){ 
  this.updateModelMatrix();
  Material.lightDirection.set(lightDirection); // 0 if directional and 1 if point for vec4
  Material.modelMatrix.set(this.modelMatrix);
  Material.modelMatrixInverse.set(new Mat4(this.modelMatrix).invert());
  Material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
  Material.cameraPos.set(camera.position);
  Material.rayDirMatrix.set().translate(camera.position).mul(camera.viewProjMatrix).invert();
  this.mesh.draw(); 
};