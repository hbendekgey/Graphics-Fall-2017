"use strict"; 
let Mesh = function(geometry, material) {
  this.geometry = geometry;
  this.material = material;
};
 
Mesh.prototype.setUniform = function(uniformName, uniformVal){
	this.material[uniformName].set(uniformVal);
};

Mesh.prototype.draw = function(){
  this.material.commit();
  this.geometry.draw();
};