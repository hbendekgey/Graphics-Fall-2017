let Queen = function(brdfStartIndex, quadricStartIndex, row, col) {
  let body = new ClippedQuadric(new Mat4(), new Mat4());
  body.setUnitCylinder();
  body.transform(new Mat4().scale(new Vec3(0.2, 0.75, 0.2)).translate(new Vec3(-3.5+col,0.75,3.5-row)));

  let head = new ClippedQuadric(new Mat4(), new Mat4());
  head.setUnitSphere();
  head.transform(new Mat4().scale(.3).translate(-3.5+col,1.5,3.5-row));

  let hyperboloid = new ClippedQuadric(new Mat4(), new Mat4());
  hyperboloid.setUnitHyperboloid();
  hyperboloid.transformClipper(new Mat4().translate(new Vec3(0,2,0)));
  hyperboloid.transform(new Mat4().scale(new Vec3(0.25, 0.5, 0.25)).translate(new Vec3(-3.5+col,0.5,3.5-row)));

  Material.quadrics.at(quadricStartIndex).set(body.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+1).set(body.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex).set(new Vec4(0,0,0,1));

  Material.quadrics.at(quadricStartIndex+2).set(head.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+3).set(head.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+1).set(new Vec4(0,0,0,1));

  Material.quadrics.at(quadricStartIndex+4).set(hyperboloid.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+5).set(hyperboloid.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+2).set(new Vec4(0.4,0.4,0.4,2));
}