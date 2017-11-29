let Rook = function(brdfStartIndex, quadricStartIndex, row, col) {
  let rook = new ClippedQuadric(new Mat4(), new Mat4(), new Mat4());
  rook.setUnitCylinder();
  rook.secondClipperCoeffMatrix.set(1, 0, 0, 0,
    0, -2, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1);
  rook.transform(new Mat4().scale(.5).translate(0,.5,0));

  rook.transformSecondClipper(new Mat4().scale(new Vec3(.5,.5,.5)).translate(new Vec3(0,.25,0)));
  rook.transform(new Mat4().scale(.75).translate(-3.5 + col,0,3.5 - row))

  Material.quadrics.at(quadricStartIndex).set(rook.secondClipperCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 1).set(rook.surfaceCoeffMatrix);
  Material.brdfs.at(brdfStartIndex).set(new Vec4(0,0,0,3));

  Material.quadrics.at(quadricStartIndex + 2).set(rook.clipperCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 3).set(rook.surfaceCoeffMatrix);
  Material.brdfs.at(brdfStartIndex + 1).set(new Vec4(0,0,0,3));

  Material.quadrics.at(quadricStartIndex + 4).set(rook.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 5).set(rook.clipperCoeffMatrix);
  Material.quadrics.at(quadricStartIndex + 6).set(rook.secondClipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex + 2).set(new Vec4(0,0,0,3));
}