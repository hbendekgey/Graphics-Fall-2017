"use strict";
let GameObject = function(mesh, gemType, i, j) {
  this.mesh = mesh;
  this.gemType = gemType;
  this.position = new Vec3(0, 0, 0);
  this.orientation = 0;
  this.scale = 1;
  this.i = i;
  this.j = j;
  this.modelMatrix = new Mat4();
  this.fallen = 0;
  this.swapping = false;
  this.swapped = 0;
  this.toCheck = true; // initialized to true for initial check
  this.toRemove = false;
  this.falling = false;
};

GameObject.prototype.updateModelMatrix =
                              function(){
  this.modelMatrix.set().rotate(this.orientation).scale(this.scale).translate(this.position);
};

GameObject.prototype.draw = function(camera){
  this.updateModelMatrix();
  this.mesh.material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
  this.mesh.draw();
};
