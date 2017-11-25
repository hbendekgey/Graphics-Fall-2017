let ClippedQuadric = function(surfaceCoeffMatrix, clipperCoeffMatrix, secondClipper) {
  this.surfaceCoeffMatrix = surfaceCoeffMatrix;
  this.clipperCoeffMatrix = clipperCoeffMatrix;
  this.secondClipperCoeffMatrix = secondClipper
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

ClippedQuadric.prototype.setUnitHyperboloid = function(){
  this.surfaceCoeffMatrix.set(1, 0, 0, 0,
		0, -1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, -1);
  this.clipperCoeffMatrix.set(0, 0, 0, 0,
		0, 1, 0, 3,
		0, 0, 0, 0,
		0, 0, 0, 0);
}

ClippedQuadric.prototype.setUnitCone = function(){
  this.surfaceCoeffMatrix.set(1, 0, 0, 0,
		0, -1, 0, 0,
		0, 0, 1, 0,
		0, 0, 0, 0);
  this.clipperCoeffMatrix.set(0, 0, 0, 0,
		0, 1, 0, 1,
		0, 0, 0, 0,
		0, 0, 0, 0);
}

ClippedQuadric.prototype.transform = function(transformationMatrix){
  let inverseT = new Mat4(transformationMatrix).invert();
  let inverseTTranspose = new Mat4(inverseT).transpose();
  this.surfaceCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
  this.clipperCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
  if (this.secondClipperCoeffMatrix) {
  	 this.secondClipperCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
  }
}

ClippedQuadric.prototype.transformClipper = function(transformationMatrix){
  let inverseT = new Mat4(transformationMatrix).invert();
  let inverseTTranspose = new Mat4(inverseT).transpose();
  this.clipperCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
}

ClippedQuadric.prototype.transformSecondClipper = function(transformationMatrix){
  let inverseT = new Mat4(transformationMatrix).invert();
  let inverseTTranspose = new Mat4(inverseT).transpose();
  this.secondClipperCoeffMatrix.premul(inverseT).mul(inverseTTranspose);
}
