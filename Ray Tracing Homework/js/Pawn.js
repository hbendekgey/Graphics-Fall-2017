let Pawn = function(brdfStartIndex, quadricStartIndex, row, col) {
  let sphere = new ClippedQuadric(new Mat4(), new Mat4());
  sphere.setUnitSphere();
  sphere.transform(new Mat4().scale(.15).translate(-3.5 + col,.4,3.5 - row));

  let cone = new ClippedQuadric(new Mat4(), new Mat4());
  cone.setUnitCone();
  cone.transform(new Mat4().scale(new Vec3(0.2,0.4,0.2)).translate(-3.5 + col,.4,3.5 - row));

  Material.quadrics.at(quadricStartIndex).set(sphere.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+1).set(sphere.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex).set(new Vec4(0,0,0,1));
  Material.quadrics.at(quadricStartIndex+2).set(cone.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+3).set(cone.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+1).set(new Vec4(0,0,0,1));
}