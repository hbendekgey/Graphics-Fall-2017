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

ClippedQuadric.prototype.transform = function(transformationMatrix){
  let currentSurface = this.surfaceCoeffMatrix;
  let currentClipper = this.clipperCoeffMatrix
  let inverseT = new Mat4(transformationMatrix).invert();
  let inverseTTranspose = new Mat4(inverseT).transpose();
  this.surfaceCoeffMatrix.set(inverseT).mul(currentSurface).mul(inverseTTranspose);
  this.clipperCoeffMatrix.set(inverseT).mul(currentClipper).mul(inverseTTranspose);
}

ClippedQuadric.prototype.transformClipper = function(transformationMatrix){
  let currentClipper = this.clipperCoeffMatrix
  let inverseT = new Mat4(transformationMatrix).invert();
  this.clipperCoeffMatrix.set(inverseT).mul(currentClipper).mul(inverseT.transpose());
}
