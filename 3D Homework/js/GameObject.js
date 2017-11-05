"use strict"; 
let GameObject = function(mesh, shadowMaterial) { 
  this.mesh = mesh;
  this.shadowMaterial = shadowMaterial;

  this.position = new Vec3(0, 0, 0); 
  this.orientation = 0;
  this.yaw = 0;
  this.pitch = 0;
  this.right = new Vec3(0,0,1);
  this.scale = new Vec3(1,1,1); 
  this.modelMatrix = new Mat4(); 
  this.speed = 0;
  this.velocity = new Vec3(0,0,0);
  this.updateOrientation();
};

GameObject.prototype.updateModelMatrix = function() { 
  this.modelMatrix.set().rotate(this.yaw + this.orientation,0,1,0)
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

GameObject.prototype.draw = function(camera){ 
  this.updateModelMatrix();
  Material.modelMatrix.set(this.modelMatrix);
  Material.modelMatrixInverse.set(new Mat4(this.modelMatrix).invert());
  Material.modelViewProjMatrix.set(this.modelMatrix).mul(camera.viewProjMatrix);
  Material.cameraPos.set(camera.position);
  this.mesh.draw(); 
  this.drawShadow(camera);
};


GameObject.prototype.drawShadow = function(camera){ 
  if (this.shadowMaterial) {
    Material.modelMatrix.set(this.modelMatrix).scale(new Vec3(1,0,1)).translate(new Vec3(0,.3,0));
    Material.modelViewProjMatrix.set(this.modelMatrix).scale(new Vec3(1,0,1)).translate(new Vec3(0,.3,0)).mul(camera.viewProjMatrix);
    this.mesh.drawShadow(this.shadowMaterial); 
  }
};

GameObject.prototype.updateOrientation = function() {
  this.ahead = new Vec3(
     -Math.sin(this.yaw)*Math.cos(this.pitch),
      Math.sin(this.pitch),
     -Math.cos(this.yaw)*Math.cos(this.pitch) ); 
  this.right.setVectorProduct(this.ahead, PerspectiveCamera.worldUp); 
  this.right.normalize();
};

GameObject.prototype.move = function(dt) {
  this.position.addScaled(dt * this.speed, this.velocity);
};