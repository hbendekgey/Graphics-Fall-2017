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
	// create a simple scene
	this.scene = new Scene(this.gl);

	this.resize();


	this.keysPressed = {};
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
		if (keyboardMap[event.keyCode] == 'T' && !theApp.keysPressed.T) {
			theApp.scene.trackingTime = 0;
			theApp.scene.isTracking = true;
		}
		theApp.keysPressed[keyboardMap[event.keyCode]] = true;
	};
	document.onkeyup = function(event) {
		if (keyboardMap[event.keyCode] == 'T') {
			theApp.scene.isTracking = false;
			theApp.scene.camera.trackingUp = 0;
			theApp.scene.camera.trackingRight = 0;
		}
		theApp.keysPressed[keyboardMap[event.keyCode]] = false;
	};
	this.canvas.onmousedown = function(event) {
		theApp.scene.camera.mouseDown();

	};
	this.canvas.onmousemove = function(event) {
		theApp.scene.camera.mouseMove(event);
		event.stopPropagation();
	};
	this.canvas.onmouseout = function(event) {
		//jshint unused:false

	};
	this.canvas.onmouseup = function(event) {
		theApp.scene.camera.mouseUp();

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