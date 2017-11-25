let Bishop = function(brdfStartIndex, quadricStartIndex, row, col, lightIndex) {
  let hyperboloid = new ClippedQuadric(new Mat4(), new Mat4());
  hyperboloid.setUnitHyperboloid();
  hyperboloid.transform(new Mat4().scale(new Vec3(.15,.3,.15)).translate(-3.5 + col,.9,3.5 - row));

  let head = new ClippedQuadric(new Mat4(), new Mat4());
  head.setUnitSphere();
  head.clipperCoeffMatrix.set(-1, 0, 0, 0,
    0, -1, 0, 0,
    0, 0, 0, 0,
    0, 0, 0, 0.25);
  head.transform(new Mat4().scale(new Vec3(.2,.2,.2)).translate(-3.5 + col,1.0,3.5 - row));

  let hole = new ClippedQuadric(new Mat4(), new Mat4());
  hole.surfaceCoeffMatrix.set(head.clipperCoeffMatrix);
  hole.clipperCoeffMatrix.set(head.surfaceCoeffMatrix);
  
  let hat = new ClippedQuadric(new Mat4(), new Mat4());
  hat.setUnitSphere();
  hat.transform(new Mat4().scale(new Vec3(.1,.05,.1)).translate(-3.5 + col,1.2,3.5 - row));

  // commit materials
  Material.quadrics.at(quadricStartIndex).set(hyperboloid.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 1).set(hyperboloid.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex).set(new Vec4(0,0,0,2));
  Material.quadrics.at(quadricStartIndex + 2).set(head.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 3).set(head.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex + 1).set(new Vec4(0,0,0,2));
  Material.quadrics.at(quadricStartIndex + 4).set(hole.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 5).set(hole.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex + 2).set(new Vec4(0,0,0,2));
  Material.quadrics.at(quadricStartIndex + 6).set(hat.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 7).set(hat.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex + 3).set(new Vec4(0,0,0,2));

  Material.lightPos.at(lightIndex).set(new Vec4(-3.5 + col,1.5,3.5 - row,1));
  Material.lightPowerDensity.at(lightIndex).set(new Vec3(5,5,5));

}