"use strict"; 
let GameObject = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0; 
  this.scale = 1; 

  this.modelMatrix = new Mat4(); 
};

GameObject.prototype.updateModelMatrix =
                              function(){ 
  this.modelMatrix.set().rotate(this.orientation).scale(this.scale).translate(this.position); 
};

GameObject.prototype.draw = function(camera){ 
  this.updateModelMatrix();
  this.mesh.setUniform("modelViewProjMatrix", this.modelMatrix.mul(camera.viewProjMatrix));
  this.mesh.draw(); 
};