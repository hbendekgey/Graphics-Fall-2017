"use strict"; 
let GameObject = function(mesh) { 
	this.mesh = mesh;

	this.position = new Vec3(0, 0, 0); 
	this.orientation = 0; 
	this.scale = new Vec3(1, 1, 1); 

	this.modelMatrix = new Mat4(); 

	this.parent = null;

	this.move = function(){};
	this.control = function(){};
	this.force = new Vec3();
	this.torque = 0;
	this.momentum = new Vec3();
	this.invMass = 1;
	this.backDrag = 1;
	this.sideDrag = 1;
	this.invAngularMass = 1;
	this.angularMomentum = 0;
	this.angularDrag = 1;
};

GameObject.prototype.updateModelMatrix =
                              function(){ 
	this.modelMatrix.set();
	this.modelMatrix.scale(this.scale);
	this.modelMatrix.rotate(this.orientation);
	this.modelMatrix.translate(this.position);

	if (this.parent) {
		this.parent.updateModelMatrix();
		this.modelMatrix.mul(this.parent.modelMatrix);
	}

};

GameObject.prototype.draw = function(camera){ 
  this.updateModelMatrix();

  Material.modelViewProjMatrix.
    set(this.modelMatrix).
    mul(camera.viewProjMatrix);
  Material.modelMatrix.set(this.modelMatrix);

  this.mesh.draw(); 
};
