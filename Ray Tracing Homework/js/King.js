let King = function(brdfStartIndex, quadricStartIndex, row, col) {
  let feet = new ClippedQuadric(new Mat4(), new Mat4());
  feet.setUnitCone();
  feet.transform(new Mat4().scale(new Vec3(.5,1,.5)).translate(-3.5+col,1,3.5-row));

  let body = new ClippedQuadric(new Mat4(), new Mat4());
  body.setUnitCylinder();
  body.transform(new Mat4().scale(new Vec3(.3,.5,.3)).translate(-3.5+col,.7,3.5-row));

  let throat = new ClippedQuadric(new Mat4(), new Mat4());
  throat.setUnitCylinder();
  throat.transform(new Mat4().scale(new Vec3(.5,.05,.5)).translate(-3.5+col,1.25,3.5-row));

  let lowerNeck = new ClippedQuadric(new Mat4(), new Mat4());
  lowerNeck.surfaceCoeffMatrix.set(0, 0, 0, 0,
    0, 0, 0, 1,
    0, 0, 0, 0,
    0, 0, 0, 0);
  lowerNeck.clipperCoeffMatrix.set(1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1);
  lowerNeck.transform(new Mat4().scale(.5).translate(-3.5+col,1.2,3.5-row));

  let upperNeck = new ClippedQuadric(new Mat4(), new Mat4());
  upperNeck.surfaceCoeffMatrix.set(0, 0, 0, 0,
    0, 0, 0, 1,
    0, 0, 0, 0,
    0, 0, 0, 0);
  upperNeck.clipperCoeffMatrix.set(1, 0, 0, 0,
    0, 0, 0, 0,
    0, 0, 1, 0,
    0, 0, 0, -1);
  upperNeck.transform(new Mat4().scale(.5).translate(-3.5+col,1.3,3.5-row));

  let head = new ClippedQuadric(new Mat4(), new Mat4());
  head.setUnitSphere();
  head.transform(new Mat4().scale(.3).translate(-3.5+col,1.5,3.5-row));

  let crown = new ClippedQuadric(new Mat4(), new Mat4());
  crown.setUnitSphere();
  crown.surfaceCoeffMatrix.set(1, 0, 0, 0,
    0, 0, 0, 1,
    0, 0, 1, 0,
    0, 0, 0, 0);
  crown.transform(new Mat4().scale(0.3,0.8,0.3).translate(-3.5+col,2.3,3.5-row));

  let mu = new Vec3(.21, .485, 1.29);
  let k = new Vec3(3.13, 2.23, 1.76);

  let numerator = mu.minus(new Vec3(1,1,1)).times(mu.minus(new Vec3(1,1,1))).plus(k.times(k));
  let denominator = mu.plus(new Vec3(1,1,1)).times(mu.minus(new Vec3(1,1,1))).plus(k.times(k));
  let r0 = numerator.over(denominator);

  Material.quadrics.at(quadricStartIndex).set(feet.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+1).set(feet.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex).set(new Vec4(r0.x,r0.y,r0.z,4));

  Material.quadrics.at(quadricStartIndex+2).set(body.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+3).set(body.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+1).set(new Vec4(r0.x,r0.y,r0.z,4));

  Material.quadrics.at(quadricStartIndex+4).set(throat.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+5).set(throat.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+2).set(new Vec4(r0.x,r0.y,r0.z,4));

  Material.quadrics.at(quadricStartIndex+6).set(lowerNeck.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+7).set(lowerNeck.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+3).set(new Vec4(r0.x,r0.y,r0.z,4));

  Material.quadrics.at(quadricStartIndex+8).set(upperNeck.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+9).set(upperNeck.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+4).set(new Vec4(r0.x,r0.y,r0.z,4));

  Material.quadrics.at(quadricStartIndex+10).set(head.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+11).set(head.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+5).set(new Vec4(r0.x,r0.y,r0.z,4));

  Material.quadrics.at(quadricStartIndex+12).set(crown.surfaceCoeffMatrix);
  Material.quadrics.at(quadricStartIndex+13).set(crown.clipperCoeffMatrix);
  Material.brdfs.at(brdfStartIndex+6).set(new Vec4(r0.x,r0.y,r0.z,4));


}