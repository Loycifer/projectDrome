/**
 *
 * The .settings, .resources, and .main functions can be placed in seperate files if desired.
 * Make sure to prepend each file with the following line: /* global L */

/* global L */

L.game.settings = function() {
    //This is where you may adjust your initial game settings

    //Set the internal resolution of your game (width, height)
    L.system.setResolution(900, 600);

    //Set the desired DOM location of the game's canvas
    L.system.setCanvasLocation(document.body);

    //Set whether the canvas should resize to fullscreen
    L.system.setFullscreen(true);

    //Set the screen orientation of the game on handheld devices
    L.system.setOrientation("landscape");

    //Set whether the game should pause when switching to other tabs or windows
    L.system.setAutoPause(true);

    L.system.resourcePath = "games/projectDrome/resources/";

};


L.game.resources = function() {
    //This is where you load resources such as textures and audio
    //Textures are stored in L.texture[x], where x is the texture's name
    //Sounds and music are stored in L.sound[x]

    //eg. L.load.texture("littleDude.png", "little-dude");
    //    L.load.audio("audioFile", "audioName");
    L.load.texture("grassTile01.jpg", "grass");
};


L.game.main = function() {
    //This is where to build game logic such as scenes, sprites,
    //behaviours, and input handling
    //Scenes are stored in L.scene[x], where x is the name of the scene

    //eg. mainScene = new L.objects.Scene("mainScene");
    //    mainScene.layers.background.addObject(someExistingObject);
    //    mainScene.setScene();
    var testArena = new L.objects.Scene("testArena");
    testArena.bgFill = "black";
    // testArena.motionBlur = 0.8;
    var testLayer = testArena.newLayer("testLayer");
    var floorWidth = 128;

    var camera = {};
    camera.x = 64;
    camera.y = 1;
    camera.z = -64;
    camera.yaw = 0;

    var texel = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.color = "white";
	this.resolution = 2;
	this.width = 1;
	this.vertices = [
	    [-0.5, 0, -0.5],
	    [0.5, 0, -0.5],
	    [0.5, 0, 0.5],
	    [-0.5, 0, 0.5]
	];
	this.coords = [];
	this.shadow = 0;
	this.distance = 0;
    };
    texel.prototype.update = function(dt)
    {
	//var coords = this.coords;
	var focal_length = 900;
	var distance = Math.sqrt(Math.pow(this.x - camera.x, 2) + Math.pow(this.z - camera.z, 2));
	this.distance = distance;
	this.shadow = distance / 15;
	if (this.shadow >= 1)
	{
	    return;
	}


	for (var i = 0; i < 4; i++)
	{
	    var x = this.vertices[i][0] + this.x;
	    var y = this.vertices[i][1] + this.y;
	    var z = this.vertices[i][2] + this.z;

	    if (camera.yaw !== 0)
	    {
		var rotatedPoint = Math.rotatePoint(x - camera.x, z - camera.z, camera.yaw);
		x = rotatedPoint.x + camera.x;
		z = rotatedPoint.y + camera.z;
	    }

	    var x0 = x - camera.x;
	    var y0 = y - camera.y;
	    var z0 = z - camera.z;
	    if (z0 >= 0) {
		this.shadow = 1;
		return;
	    }
	    var xCoord = focal_length * x0 / z0 + L.system.width / 2;
	    var yCoord = focal_length * y0 / z0 + L.system.height / 2;
	    this.coords[i] = [xCoord, yCoord];
	}
    };
    texel.prototype.draw = function(ctx)
    {


	var coords = this.coords;
	var shadow = this.shadow;
	if (shadow >= 1)
	{
	    return;
	}
	ctx.beginPath();
	ctx.moveTo(coords[3][0], coords[3][1]);
	for (var i = 0; i < 4; i++)
	{
	    ctx.lineTo(coords[i][0], coords[i][1]);
	}

	ctx.closePath();
	var pat = ctx.createPattern(L.texture.grass, "repeat");
	ctx.globalAlpha = 1;
	ctx.fillStyle = this.color;
	ctx.fill();
	ctx.globalAlpha = shadow;
	ctx.fillStyle = '#000';
	ctx.strokeStyle = "#000";
	ctx.lineWidth = 1.5;
	ctx.stroke();
	ctx.fill();

    };

    for (var i = 0; i < 64; i++)
    {
	for (var j = 0; j < 64; j++)
	{
	    testLayer.addObject(new texel(i * 2, 0, -j * 2));
	    testLayer.addObject(new texel(i * 2 + 1, 0, -j * 2 + 1));
	}
    }
    var wall = function(x, z, angle, height, color)
    {
	var newWall = new texel(x, 0, z);
	newWall.color = color;
	var verts = Math.rotatePoint(0.5,0,angle);
	var vertX = verts.x;
	var vertZ = verts.y;
	newWall.vertices = [
	    [vertX, 0, vertZ],
	    [-vertX, 0, -vertZ],
	    [-vertX, 2, -vertZ],
	    [vertX, 2, vertZ]
	];
	return newWall;
    };
    var wall1 = wall(64,-64,0,2,"turquoise");
    var wall2 = wall(65,-64,0,2,"turquoise");
    var wall3 = wall(65.5,-63.5,Math.PI/2,2,"turquoise");
    var wall4 = wall(65.5,-62.5,Math.PI/2,2,"red");
    var wall5 = wall(63.5,-62.5,Math.PI/2,2,"turquoise");
    var wall6 = wall(63.5,-63.5,Math.PI/2,2,"turquoise");
var sortables = {};
sortables.objects = [];
sortables.update = function(dt)
{
    this.objects.update(dt);
    this.objects.sortBy("distance",-1);
};
sortables.draw = function(ctx)
{
    this.objects.draw(ctx);
};
sortables.objects = [wall1,wall2,wall3,wall4,wall5,wall6];

    testLayer.addObject(sortables);
    /* for (var i = 0; i < 64; i++)
     {
     for (var j = 0; j < 64; j++)
     {
     var plate = new texel(i * 2, 20, -j * 2);
     var colors = ["red", "orange", "yellow", "lime", "turquoise", "blueviolet", "magenta"];
     plate.color = colors[Math.floor(Math.random() * 7)];
     testLayer.addObject(plate);
     var plate2 = new texel(i * 2 + 1, 20, -j * 2 + 1);
     plate2.color = colors[Math.floor(Math.random() * 7)];
     testLayer.addObject(plate2);
     }
     }
     */


    testArena.setScene();

    var moveCamera = function(distance,strafe)
    {
	var yaw = camera.yaw;
	if (strafe)
	{
	    yaw -= Math.PI/2;
	}
	var xMove = Math.sin(yaw) * distance;
	var zMove = -Math.cos(yaw) * distance;
	camera.x += xMove;
	camera.z += zMove;
    };

    var cameraControl = new L.keyboard.Keymap();
    cameraControl.bindKey("numpad9", "keydown", function() {
	camera.yaw -= Math.PI / 128;
    });
    cameraControl.bindKey("numpad7", "keydown", function() {
	camera.yaw += Math.PI / 128;
    });
    cameraControl.bindKey("numpad8", "keydown", function() {
	moveCamera(0.1);
    });
    cameraControl.bindKey("numpad2", "keydown", function() {
	moveCamera(-0.1);
    });
     cameraControl.bindKey("numpad6", "keydown", function() {
	moveCamera(0.1,true);
    });
     cameraControl.bindKey("numpad4", "keydown", function() {
	moveCamera(-0.1,true);
    });

    testArena.keymap = cameraControl;

};

