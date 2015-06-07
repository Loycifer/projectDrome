/**
 *
 * The .settings, .resources, and .main functions can be placed in seperate files if desired.
 * Make sure to prepend each file with the following line: /* global L */

/* global L */

L.game.settings = function() {
    //This is where you may adjust your initial game settings

    //Set the internal resolution of your game (width, height)
    L.system.setResolution(600, 240);

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
    L.load.texture("stone140.jpg", "stone");
};


L.game.main = function() {
   //   L.system.bufferCanvas[0].style.imageRendering = "-moz-crisp-edges";
   //   L.system.renderCanvas[0].style.imageRendering = "-moz-crisp-edges";
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
    camera.x = 0;
    camera.y = 1;
    camera.z = -1;
    camera.yaw = Math.PI;
    camera.focalLength = 300;
    camera.distance = 10;
    camera.viewAngle = L.system.width / camera.focalLength;
    camera.speed = 3;
    camera.fwd = false;
    camera.bwd = false;
    camera.lwd = false;
    camera.rws = false;
    camera.rrt = false;
    camera.lrt = false;
    camera.update = function(dt)
    {
	if (camera.fwd)
	{
	    moveCamera(dt * camera.speed);
	}
	if (camera.bwd)
	{
	    moveCamera(dt * -camera.speed);
	}
	if (camera.rwd)
	{
	    moveCamera(dt * camera.speed * 0.6, true);
	}
	if (camera.lwd)
	{
	    moveCamera(dt * -camera.speed * 0.6, true);
	}
	if (camera.rrt)
	{
	    camera.yaw -= Math.PI / 4 * dt;
	}
	if (camera.lrt)
	{
	    camera.yaw += Math.PI / 4 * dt;
	}
    };



    var texel = function(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
	this.colorType = "rgba";
	this.color = "white";
	//this.resolution = 2;
	//this.width = 1;
	this.vertices = [
	    [-0.51, 0, -0.51],
	    [0.51, 0, -0.51],
	    [0.51, 0, 0.51],
	    [-0.51, 0, 0.51]
	];
	this.coords = [];
	this.shadow = 0;
	this.distance = 0;
    };
    texel.prototype.update = function(dt)
    {
	//var coords = this.coords;
	var focal_length = camera.focalLength;
	var xRel = this.x - camera.x;
	//var yRel = this.y - camera.y;
	var zRel = this.z - camera.z;

	var relativeCoords = Math.rotatePoint(xRel, zRel, camera.yaw - (Math.PI / 2));

	var relativeAngle = Math.atan(-relativeCoords.y / relativeCoords.x);

	if (Math.abs(relativeAngle) > camera.viewAngle)
	{
	    this.shadow = 1;
	    return;
	}



	var distance = this.distance = Math.sqrt(Math.pow(xRel, 2) + Math.pow(zRel, 2));



	this.shadow = distance / camera.distance;
	if (this.shadow >= 1)
	{
	    return;
	}

	var x, y, z, x0, y0, z0, xCoord, yCoord;
	for (var i = 0; i < 4; i++)
	{
	    x = this.vertices[i][0] + this.x;
	    y = this.vertices[i][1] + this.y;
	    z = this.vertices[i][2] + this.z;

	    if (camera.yaw !== 0)
	    {
		var rotatedPoint = Math.rotatePoint(x - camera.x, z - camera.z, camera.yaw);
		x = rotatedPoint.x + camera.x;
		z = rotatedPoint.y + camera.z;
	    }

	    x0 = x - camera.x;
	    y0 = y - camera.y;
	    z0 = z - camera.z;
	    if (z0 >= 0) {
		this.shadow = 1;
		return;
	    }
	    xCoord = focal_length * x0 / z0 + L.system.width / 2;
	    yCoord = focal_length * y0 / z0 + L.system.height / 2;
	    this.coords[i] = [xCoord, yCoord];
	}
    };
    texel.prototype.draw = function(ctx)
    {



	var shadow = this.shadow;
	if (shadow >= 1)
	{
	    return;
	}
	var coords = this.coords;

	if (this.texture !== undefined)
	{

	    var texture = this.texture;
	    var texCoords = this.texCoords || [
		[0, 0],
		[texture.width, 0],
		[texture.width, texture.height],
		[0, texture.height]
	    ];
	    var tris = [[0, 1, 2], [2, 3, 0]]; // Split in two triangles
	    for (var t = 0; t < 2; t++) {
		var pp = tris[t];
		var x0 = coords[pp[0]][0], x1 = coords[pp[1]][0], x2 = coords[pp[2]][0];
		var y0 = coords[pp[0]][1], y1 = coords[pp[1]][1], y2 = coords[pp[2]][1];
		var u0 = texCoords[pp[0]][0], u1 = texCoords[pp[1]][0], u2 = texCoords[pp[2]][0];
		var v0 = texCoords[pp[0]][1], v1 = texCoords[pp[1]][1], v2 = texCoords[pp[2]][1];

		// Set clipping area so that only pixels inside the triangle will
		// be affected by the image drawing operation
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x0, y0);
		ctx.lineTo(x1, y1);
		ctx.lineTo(x2, y2);
		ctx.closePath();
		ctx.clip();

		// Compute matrix transform

		var u0v1 = u0*v1;
		var u1v2 = u1*v2;
		var v0u1 = v0*u1;
		var delta = u0v1 + v0 * u2 + u1v2 - v1 * u2 - v0u1 - u0 * v2;
		var delta_a = x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2;
		var delta_b = u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2;
		var delta_c = u0v1 * x2 + v0 * x1 * u2 + x0 * u1v2 - x0 * v1 * u2
		- v0u1 * x2 - u0 * x1 * v2;
		var delta_d = y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2;
		var delta_e = u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2;
		var delta_f = u0v1 * y2 + v0 * y1 * u2 + y0 * u1v2 - y0 * v1 * u2
		- v0u1 * y2 - u0 * y1 * v2;
ctx.save();
		// Draw the transformed image
		var deltaRecip = 1/delta;
		ctx.transform(delta_a *deltaRecip, delta_d *deltaRecip,
		delta_b *deltaRecip, delta_e *deltaRecip,
		delta_c *deltaRecip, delta_f *deltaRecip);
		ctx.drawImage(texture, 0, 0);
ctx.restore();
		    ctx.fillStyle = "rgba(0,0,0,"+shadow+")";
		    ctx.fillRect(0,0,L.system.width,L.system.height);


		ctx.restore();
	    }
	    return;
	}





	ctx.beginPath();
	ctx.moveTo(coords[3][0], coords[3][1]);
	for (var i = 0; i < 4; i++)
	{
	    ctx.lineTo(coords[i][0], coords[i][1]);
	}

	ctx.closePath();

	ctx.globalAlpha = 1;
	if (this.colorType === "rgba")
	{
	    var lightness = Math.pow(1 - shadow, 2);
	    var rgba = this.rgba;
	    var red = rgba[0];
	    var green = rgba[1];
	    var blue = rgba[2];
	    // var avgGrey = (red+green+blue)/3 * (1-lightness);
	    // red = Math.floor((red * lightness) + avgGrey) ;
	    // green = Math.floor((green * lightness) + avgGrey) ;
	    // blue = Math.floor((blue * lightness) + avgGrey) ;
	    red = Math.floor(lightness * red);
	    green = Math.floor(lightness * green);
	    blue = Math.floor(lightness * blue);
	    var color = "rgba(" + red + "," + green + "," + blue + "," + rgba[3] + ")";
	}
	else
	{
	    var color = this.color;
	}
	ctx.fillStyle = color;
	ctx.fill();


    };
    // var grassPattern = L.system.bufferContext[0].createPattern(L.texture.grass, "repeat");
    for (var i = 0; i < 64; i++)
    {
	for (var j = 0; j < 64; j++)
	{
	    var tex1 = new texel(i + 0.5 - 32, 0, j + 0.5 - 32);
	    // var tex2 = new texel(i * 2 + 1, 0, -j * 2 + 1);

	    tex1.rgba = [100 + (Math.random() * 100), 100 + (Math.random() * 100), 30, 1];
	    tex1.texture = L.texture.grass;
	    tex1.texCoords =  [
		[0, 0],
		[L.texture.grass.width, 0],
		[L.texture.grass.width, L.texture.grass.height],
		[0, L.texture.grass.height]
	    ];

	    // tex2.rgba = [255,255,255,1];

	    testLayer.addObject(tex1);

	    // testLayer.addObject(tex2);
	}
    }
    var sortables = {};
    sortables.objects = [];
    sortables.update = function(dt)
    {
	this.objects.update(dt);
	this.objects.sortBy("distance", -1);
    };
    sortables.draw = function(ctx)
    {
	this.objects.draw(ctx);
    };
    var wall = function(x1, z1, x2, z2, height, color)
    {
	for (var i = 0; i<2;i++)
	{
	var x = (x1 + x2) / 2;
	var z = (z1 + z2) / 2;
	var newWall = new texel(x, 0, z);
	newWall.color = color;
	newWall.texture = L.texture.stone;

	newWall.vertices = [
	    [x1 - x, 0, z1 - z],
	    [x2 - x, 0, z2 - z],
	    [x2 - x, height, z2 - z],
	    [x1 - x, height, z1 - z]
	];
	return newWall;
    }
    };
    var stonePattern = L.system.bufferContext[0].createPattern(L.texture.stone, "repeat");
    var tileColor = "grey";
    var wallrgba = [255, 255, 255, 1];
    for (var walls = 0; walls < 64; walls++)
    {
	var wall1 = new wall(0, -0.01 + walls, 0, 1.01 + walls, 2, tileColor);
	var grey = 200 + Math.random() * 55;
	wall1.rgba = [255, 0, 0, 1];
	sortables.objects.push(wall1);
    }
    ;

    var tower = [];
    (function() {
	var center = [4, 4];
	var radius = 1;
	var PI2 = Math.PI * 2;
	for (var i = 0; i < 40; i++)
	{
	    var sin = Math.sin(i * PI2 / 39) * radius;
	    var cos = Math.cos(i * PI2 / 39) * radius;

	    tower.push([sin, cos]);
	}
    })();


    for (var towers = 0; towers < tower.length - 1; towers++)
    {
	var wall1 = wall(tower[towers][0], tower[towers][1], tower[towers + 1][0], tower[towers + 1][1], 8, tileColor);
	var grey = 200 + Math.random() * 55;
	wall1.rgba = [255, 0, 0, 1];
	//sortables.objects.push(wall1);
    }


    /*
     for (var i = 0; i < 64; i++)
     {
     for (var j = 0; j < 64; j++)
     {
     var plate = new texel(i , 2, -j );
     var colors = ["red", "orange", "yellow", "lime", "turquoise", "blueviolet", "magenta"];
     plate.color = colors[Math.floor(Math.random() * 7)];
     testLayer.addObject(plate);
     var plate2 = new texel(i + 1, 2, -j + 1);

     plate2.color = colors[Math.floor(Math.random() * 7)];
     testLayer.addObject(plate2);
     }
     }
     */
    testLayer.addObject(sortables);
    testLayer.addObject(camera);


    testArena.setScene();

    var moveCamera = function(distance, strafe)
    {
	var yaw = camera.yaw;
	if (strafe)
	{
	    yaw -= Math.PI / 2;
	}
	var xMove = Math.sin(yaw) * distance;
	var zMove = -Math.cos(yaw) * distance;
	camera.x += xMove;
	camera.z += zMove;
    };

    var cameraControl = new L.keyboard.Keymap();
    cameraControl.bindKey("numpad9", "keydown", function() {
	camera.rrt = true;
    });
    cameraControl.bindKey("numpad9", "keyup", function() {
	camera.rrt = false;
    });
    cameraControl.bindKey("numpad7", "keydown", function() {
	camera.lrt = true;
    });
    cameraControl.bindKey("numpad7", "keyup", function() {
	camera.lrt = false;
    });
    cameraControl.bindKey("numpad8", "keydown", function() {
	camera.fwd = true;
    });
    cameraControl.bindKey("numpad8", "keyup", function() {
	camera.fwd = false;
    });
    cameraControl.bindKey("numpad2", "keydown", function() {
	camera.bwd = true;
    });
    cameraControl.bindKey("numpad2", "keyup", function() {
	camera.bwd = false;
    });
    cameraControl.bindKey("numpad6", "keydown", function() {
	camera.rwd = true;
    });
    cameraControl.bindKey("numpad6", "keyup", function() {
	camera.rwd = false;
    });
    cameraControl.bindKey("numpad4", "keydown", function() {
	camera.lwd = true;
    });
    cameraControl.bindKey("numpad4", "keyup", function() {
	camera.lwd = false;
    });
    cameraControl.bindKey("shift", "keydown", function() {
	camera.speed = 6;
    });
    cameraControl.bindKey("shift", "keyup", function() {
	camera.speed = 3;
    });

    testArena.keymap = cameraControl;

};

