// App constructor
let App = function(canvas, overlay) {
	this.canvas = canvas;
	this.overlay = overlay;

	// if no GL support, cry
	this.gl = canvas.getContext("experimental-webgl");
	if (this.gl === null) {
		throw new Error("Browser does not support WebGL");
	}

	this.gl.pendingResources = {};
	this.keysPressed = {};

	this.scene = new Scene(this.gl);
	this.resize();
};

// match WebGL rendering resolution and viewport to the canvas size
App.prototype.resize = function() {
	this.canvas.width = this.canvas.clientWidth;
	this.canvas.height = this.canvas.clientHeight;
	this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
	this.scene.camera.setAspectRatio(
  	this.canvas.clientWidth /
  	this.canvas.clientHeight );
};

App.prototype.registerEventHandlers = function() {
	let theApp = this;
	document.onkeydown = function(event) {
		if (keyboardMap[event.keyCode] == 'Q') {
			if (theApp.mouseDown) {
				theApp.scene.dropGem(0,0);
			}
			theApp.mouseDown = false;
			theApp.scene.quake = true;
		} else if (!theApp.scene.disableListeners && !theApp.scene.quake && keyboardMap[event.keyCode] == 'A') {
			theApp.scene.rotateRight();
		} else if (!theApp.scene.disableListeners && !theApp.scene.quake && keyboardMap[event.keyCode] == 'D') {
			theApp.scene.rotateLeft();
		} else {
			theApp.keysPressed[keyboardMap[event.keyCode]] = true;
		}
	};
	document.onkeyup = function(event) {
		if (keyboardMap[event.keyCode] == 'Q') {
			theApp.scene.quake = false;
			theApp.scene.camera.rotation = theApp.scene.stableRotation;
			theApp.scene.camera.updateViewProjMatrix();
		} else {
			theApp.keysPressed[keyboardMap[event.keyCode]] = false;
		}
	};
	this.canvas.onmousedown = function(event) {
		if (!theApp.scene.disableListeners && !theApp.scene.quake) {
			var x = (event.clientX / theApp.canvas.clientWidth - 0.5) * 2;
			var y = (event.clientY / theApp.canvas.clientHeight - 0.5) * -2;
			var coordinates = new Vec4(x,y,0,1).times(new Mat4(theApp.scene.camera.viewProjMatrix).invert());
			if (theApp.keysPressed.B) {
				theApp.scene.bomb(coordinates.x, coordinates.y);
			} else {
		 		theApp.scene.pickupGem(coordinates.x,coordinates.y);
		 		theApp.mouseDown = true;
			}
		}
	};
	this.canvas.onmousemove = function(event) {
		var x = (event.clientX / theApp.canvas.clientWidth - 0.5) * 2;
		var y = (event.clientY / theApp.canvas.clientHeight - 0.5) * -2;
		var coordinates = new Vec4(x,y,0,1).times(theApp.scene.camera.viewProjMatrix.invert());
		theApp.scene.camera.viewProjMatrix.invert();

		//jshint unused:false
		if (theApp.mouseDown) {
			theApp.scene.dragGem(coordinates.x,coordinates.y);
		}
		event.stopPropagation();
	};
	this.canvas.onmouseout = function(event) {
		//jshint unused:false
		if (theApp.mouseDown) {
			theApp.scene.dropGem(0,0);
		}
		theApp.mouseDown = false;
	};
	this.canvas.onmouseup = function(event) {
		var x = (event.clientX / theApp.canvas.clientWidth - 0.5) * 2;
		var y = (event.clientY / theApp.canvas.clientHeight - 0.5) * -2;
		var coordinates = new Vec4(x,y,0,1).times(theApp.scene.camera.viewProjMatrix.invert());
		theApp.scene.camera.viewProjMatrix.invert();

		if (theApp.mouseDown) {
			theApp.scene.dropGem(coordinates.x,coordinates.y);
		}
		theApp.mouseDown = false;
	};
	window.addEventListener('resize', function() {
		theApp.resize();
	});
	window.requestAnimationFrame(function() {
		theApp.update();
	});
};

// animation frame update
App.prototype.update = function() {

	let pendingResourceNames = Object.keys(this.gl.pendingResources);
	if (pendingResourceNames.length === 0) {
		// animate and draw scene
		this.scene.update(this.gl, this.keysPressed);
		this.overlay.innerHTML = "Ready.";
	} else {
		this.overlay.innerHTML = "Loading: " + pendingResourceNames;
	}

	// refresh
	let theApp = this;
	window.requestAnimationFrame(function() {
		theApp.update();
	});
};

// entry point from HTML
window.addEventListener('load', function() {
	let canvas = document.getElementById("canvas");
	let overlay = document.getElementById("overlay");
	overlay.innerHTML = "WebGL";

	let app = new App(canvas, overlay);
	app.registerEventHandlers();
});