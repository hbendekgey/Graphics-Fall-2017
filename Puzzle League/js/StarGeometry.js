"use strict";
let StarGeometry = function(gl) {
  this.gl = gl;

  // vertex buffer
  this.vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

  let vertices = new Float32Array(33);
  vertices[0] = 0;
  vertices[1] = 0;
  vertices[2] = 1;
  for (var i = 1; i <= 10; i++) {
    vertices[3 * i] = x(i);
    vertices[3 * i + 1] = y(i);
    vertices[3 * i + 2] = 1;
  }

  gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

  function x(t) {
    if (t % 2) {
      return 0.08 * Math.cos(t * Math.PI / 5);
    }
    return 0.04 * Math.cos(t * Math.PI / 5);
  }

  function y(t) {
    if (t % 2) {
      return 0.08 * Math.sin(t * Math.PI / 5);
    }
    return 0.04 * Math.sin(t * Math.PI / 5);
  }

  // color buffer
  this.colorBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);

  let colors = new Float32Array(33);
  colors[0] = 0.25;
  colors[1] = 1;
  colors[2] = 0.75;
  for (var i = 1; i <= 10; i++) {
    colors[3 * i] = 0.1;
    colors[3 * i + 1] = 0.5;
    colors[3 * i + 2] = 0.4;
  }

  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);

  // index buffer
  this.indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  let indices = new Uint16Array(30);
  for (var i = 0; i < 10; i++) {
    indices[3 * i] = 0;
    indices[3 * i + 1] = i + 1;
    indices[3 * i + 2] = (i + 1) % 10 + 1;
  }

  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
};


StarGeometry.prototype.draw = function() {
  let gl = this.gl;
  // set vertex buffer to pipeline input
  gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );

  gl.bindBuffer(gl.ARRAY_BUFFER, this.colorBuffer);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1,
    3, gl.FLOAT, //< three pieces of float
    false, //< do not normalize (make unit length)
    0, //< tightly packed
    0 //< data starts at array start
  );

  // set index buffer to pipeline input
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

  gl.drawElements(gl.TRIANGLES, 30, gl.UNSIGNED_SHORT, 0);
};
