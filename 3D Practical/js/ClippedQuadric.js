let ClippedQuadric = function(surfaceCoeffMatrix, clipperCoeffMatrix) {
  this.surfaceCoeffMatrix = surfaceCoeffMatrix;
  this.clipperCoeffMatrix = clipperCoeffMatrix;
}

ClippedQuadric.prototype.setUnitSphere = function(){
  this.surfaceCoeffMatrix.set(	1, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, -1);
  this.clipperCoeffMatrix.set(	0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, -1);
}

ClippedQuadric.prototype.setUnitCylinder = function(){
  this.surfaceCoeffMatrix.set(	1, 0, 0, 0,
		0, 0, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, -1);
  this.clipperCoeffMatrix.set(0, 0, 0, 0,
		0, 1, 0, 0,
		0, 0, 0, 0,
		0, 0, 0, -1);
}

ClippedQuadric.prototype.setUnitCone = function(){
  this.surfaceCoeffMatrix.set(1, 0, 0, 0,
		0, -1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, -1);
  this.clipperCoeffMatrix.set(0, 0, 0, 0,
		0, 1, 0, 2,
		0, 0, 0, 0,
		0, 0, 0, 0);
}

ClippedQuadric.prototype.transform = function(transformationMatrix){
  let inverseT = new Mat4(transformationMatrix).invert();
  let inverseTTranspose = new Mat4(inverseT).transpose();
  this.surfaceCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
  this.clipperCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
}

ClippedQuadric.prototype.transformClipper = function(transformationMatrix){
  let inverseT = new Mat4(transformationMatrix).invert();
  let inverseTTranspose = new Mat4(inverseT).transpose();
  this.clipperCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
}
