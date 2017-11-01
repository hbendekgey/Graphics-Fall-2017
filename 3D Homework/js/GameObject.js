"use strict"; 
let GameObject = function(mesh) { 
  this.mesh = mesh;

  this.position = new Vec3(0, 0, 0); 
  this.yaw = 0;
  this.pitch = 0;
  this.right = new Vec3(0,0,1);
  this.scale = new Vec3(1,1,1); 

  this.modelMatrix = new Mat4(); 
};

GameObject.prototype.updateModelMatrix = function() { 
  this.modelMatrix.set().rotate(this.yaw,0,1,0)
                        .rotate(this.pitch,this.right)
                        .scale(this.scale)
                        .translate(this.position);

  if (this.parent) {
    this.modelMatrix.rotate(this.parent.yaw,0,1,0)
                    .rotate(this.parent.pitch,this.parent.right)
                    .scale(this.parent.scale)
                    .translate(this.parent.position);
  }
};

GameObject.prototype.draw = function(camera, lightDirection){ 
  this.updateModelMatrix();
  Material.lightDirection.set(lightDirection); // 0 if directional and 1 if point for vec4
  Material.modelMatrix.set(this.modelMatrix);
  Material.modelMatrixInverse.set(new Mat4(this.modelMatrix).invert());
  Material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
  this.mesh.draw(); 
};