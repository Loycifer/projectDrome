/**
 *
 * The .settings, .resources, and .main functions can be placed in seperate files if desired.
 * Make sure to prepend each file with the following line: /* global L */

/* global L */

L.game.settings = function() {
    //This is where you may adjust your initial game settings

    //Set the internal resolution of your game (width, height)
    L.system.setResolution(900, 500);

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
    L.load.texture("grassTile01.bmp", "temple");
    L.load.texture("sky.jpg", "sky");
    L.load.texture("tree01.png", "tree");
    L.load.texture("tree01-yellow.png", "treeMaskYellow");
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
    testArena.bgFill = "rgb(226,157,38)";
    // testArena.motionBlur = 0.8;
    var testLayer = testArena.newLayer("testLayer");

    var skyLayer = testArena.layers.background;

    var sky = new L.objects.Sprite("sky");
    sky.x = 0;
    sky.y = 0;

    sky.handle.x = 0;
    sky.handle.y = 0;
    sky.scale.x = L.system.width / sky.width;
    sky.scale.y = L.system.height / (sky.height * 2);
    skyLayer.addObject(sky);

    var sky2 = new L.objects.Sprite("sky");
    sky2.x = 0;
    sky2.y = L.system.height / 2;

    sky2.handle.x = 0;
    sky2.handle.y = sky.height;
    sky2.scale.x = L.system.width / sky.width;
    sky2.scale.y = -L.system.height / (sky.height);
    // skyLayer.addObject(sky2);

    var floorWidth = 128;

    var camera = {};
    camera.x = 0;
    camera.y = 1.2;
    camera.z = -10;
    camera.yaw = Math.PI;
    camera.pitch = 0;
    camera.focalLength = 800;
    camera.distance = 15;
    camera.distanceDecay = 0;
    camera.viewAngle = L.system.width / camera.focalLength;
    camera.color = [226, 157, 38, 1];
    camera.speed = 3;

    testArena.camera = camera;

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
	this.hasShadow = true;
	this.highTextureDistance = 3;
	this.backfaceCulling = false;
	this.isOnScreen = false;
	this.vertices = [
	    [-0.501, 0, -0.501],
	    [0.501, 0, -0.501],
	    [0.501, 0, 0.501],
	    [-0.501, 0, 0.501]
	];
	this.coords = [];
	this.shadow = 0;
	this.distance = 0
	this.xMin = 0;
	this.xMax = 0;
	this.yMin = 0;
	this.yMax = 0;
    };
    texel.prototype.update = function(dt)
    {

	var Math = window.Math;
	var rotatePoint = Math.rotatePoint;
	var pow = Math.pow;
	var width = L.system.width;
	var height = L.system.height;
	var focal_length = camera.focalLength;
	var worldX = this.x, worldY = this.y, worldZ = this.z;
	var cameraX = camera.x, cameraY = camera.y, cameraZ = camera.z;
	var xRel = worldX - cameraX;
	var yRel = worldY - cameraY;
	var zRel = worldZ - cameraZ;

	var distance = this.distance = Math.sqrt(xRel * xRel + yRel * yRel + zRel * zRel);



	this.shadow = distance / camera.distance;
	if (this.shadow >= 1)
	{
	    return;
	}

	var relativeCoords = rotatePoint(xRel, zRel, camera.yaw - (Math.PI / 2));

	if (relativeCoords.x < -2)
	{
	    this.shadow = 1;
	    return;
	}

	var relativeAngle = Math.atan(-(relativeCoords.y) / (relativeCoords.x + 2));

	if ((Math.abs(relativeAngle) > camera.viewAngle / 2) && (distance > 2))
	{
	    this.shadow = 1;
	    return;
	}





// Need to combine all the following for loops into one for loop... no point in running a bunch of loops nearly the same size.
	var x, y, z, x0, y0, z0, xCoord, yCoord;
	var xMin, xMax, yMin, yMax;
	var vertices = this.vertices;
	var numberOfCoords = vertices.length + 1;
	var coords = [];

	for (var i = 0; i < numberOfCoords; i++)
	{
	    if (i === numberOfCoords - 1)
	    {
		x = worldX;
		y = worldY + (vertices[0][1] + vertices[1][1] + vertices[2][1] + vertices[3][1]) / 4;
		z = worldZ;
	    }
	    else
	    {
		x = vertices[i][0]*1.01 + worldX;
		y = vertices[i][1] *1.01 + worldY;
		z = vertices[i][2] *1.01 + worldZ;
	    }
	    var rotatedPoint;
	    if (camera.yaw !== 0)
	    {
		rotatedPoint = rotatePoint(x - cameraX, z - cameraZ, camera.yaw);
		x = rotatedPoint.x + cameraX;
		z = rotatedPoint.y + cameraZ;
	    }
	    if (camera.pitch !== 0)
	    {
		rotatedPoint = rotatePoint(y - cameraY, z - cameraZ, camera.pitch);
		y = rotatedPoint.x + cameraY;
		z = rotatedPoint.y + cameraZ;
	    }
	    x0 = x - cameraX;
	    y0 = y - cameraY;
	    z0 = z - cameraZ;
	    if (z0 >= 0) {

		this.shadow = 1;
		return;
	    }
	    xCoord = focal_length * x0 / z0 + width / 2;
	    yCoord = focal_length * y0 / z0 + height / 2;

	    if (i === 0)
	    {
		xMin = xCoord;
		xMax = xCoord;
		yMin = yCoord;
		yMax = yCoord;
	    }
	    else
	    {
		xMin = Math.min(xCoord, xMin);
		xMax = Math.max(xCoord, xMax);
		yMin = Math.min(yCoord, yMin);
		yMax = Math.max(yCoord, yMax);
	    }
	    coords[i] = [xCoord, yCoord];
	}

	//var coordsLength = coords.length - 1;

	if (yMin > height || yMax < 0 || xMin > width || xMax < 0)
	{
	    this.shadow = 1;
	    return;
	}

	this.coords = coords;


	this.xMin = xMin;
	this.xMax = xMax;
	this.yMin = yMin;
	this.yMax = yMax;


	/*

	 if (this.backfaceCulling)
	 {
	 var edgeSum = 0;

	 for (var edgeCount = 0; edgeCount < coordsLength; edgeCount++)
	 {
	 if (edgeCount === coordsLength - 1)
	 {
	 var nextIndex = 0;

	 }
	 else
	 {
	 var nextIndex = edgeCount + 1;
	 }
	 edgeSum += (this.coords[nextIndex][0] - this.coords[edgeCount][0]) * (this.coords[nextIndex][1] + this.coords[edgeCount][1]);

	 }
	 if (edgeSum < 0)
	 {
	 this.shadow = 1;
	 return;
	 }

	 }*/


    };
    texel.prototype.draw = function(ctx, camera)
    {



	var shadow = this.shadow;
	if (shadow >= 1)
	{
	    return;
	}
	var width = L.system.width;
	var height = L.system.height;
	var coords = this.coords;


	if (this.texture !== undefined)
	{

	    var texture = this.texture;
	    var texCoords = this.texCoords;
	    var tris = [];
	    var trisLength = 0;
	    if (this.distance > this.highTextureDistance)
	    {
		tris = [[0, 1, 2], [2, 3, 0]]; // Split in two triangles
	    }
	    else
	    {
		tris = [[0, 1, 4], [1, 2, 4], [2, 3, 4], [3, 0, 4]];
	    }
	    trisLength = tris.length;
	    var fogColor = camera.color;
	    var fogColorString = "rgba(" + fogColor[0] + "," + fogColor[1] + "," + fogColor[2] + "," + (fogColor[3] * Math.pow(shadow, 0.5)) + ")";
	    ctx.fillStyle = fogColorString;

	    var pp, pp0, pp1, pp2;
	    var x0, x1, x2;
	    var y0, y1, y2;
	    var u0, u1, u2;
	    var v0, v1, v2;
	    var deltaRecip;
	    var hScale, hSkew, vSkew, vScale, hMove, vMove;
	    for (var t = 0; t < trisLength; t++) {
		pp = tris[t];
		pp0 = pp[0];
		pp1 = pp[1];
		pp2 = pp[2];
		x0 = coords[pp0][0], x1 = coords[pp1][0], x2 = coords[pp2][0];
		y0 = coords[pp0][1], y1 = coords[pp1][1], y2 = coords[pp2][1];
		u0 = texCoords[pp0][0], u1 = texCoords[pp1][0], u2 = texCoords[pp2][0];
		v0 = texCoords[pp0][1], v1 = texCoords[pp1][1], v2 = texCoords[pp2][1];

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

		//var u0v1 = u0 * v1;
		//var u1v2 = u1 * v2;
		//var v0u1 = v0 * u1;
		deltaRecip = 1 / (u0 * v1 + v0 * u2 + u1 * v2 - v1 * u2 - v0 * u1 - u0 * v2);
		hScale = (x0 * v1 + v0 * x2 + x1 * v2 - v1 * x2 - v0 * x1 - x0 * v2) * deltaRecip;
		hSkew = (y0 * v1 + v0 * y2 + y1 * v2 - v1 * y2 - v0 * y1 - y0 * v2) * deltaRecip;
		vSkew = (u0 * x1 + x0 * u2 + u1 * x2 - x1 * u2 - x0 * u1 - u0 * x2) * deltaRecip;
		vScale = (u0 * y1 + y0 * u2 + u1 * y2 - y1 * u2 - y0 * u1 - u0 * y2) * deltaRecip;
		hMove = (u0 * v1 * x2 + v0 * x1 * u2 + x0 * u1 * v2 - x0 * v1 * u2
		- v0 * u1 * x2 - u0 * x1 * v2) * deltaRecip;
		vMove = (u0 * v1 * y2 + v0 * y1 * u2 + y0 * u1 * v2 - y0 * v1 * u2 - v0 * u1 * y2 - u0 * y1 * v2) * deltaRecip;
		ctx.save();
		// Draw the transformed image
		ctx.transform(hScale, hSkew, vSkew, vScale, hMove, vMove);
		ctx.drawImage(texture, 0, 0);

		ctx.restore();
		if (this.hasShadow)
		{

		    // ctx.fillStyle = fogColorString;
		    x1 = this.xMin - 2;
		    y1 = this.yMin - 2;
		    x2 = (this.xMax - x1) + 2;
		    y2 = (this.yMax - y1) + 2;

		    ctx.fillRect(x1, y1, x2, y2);
		    // ctx.fillRect(0,0, width, height);
		}


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
    for (var i = 0; i < 16; i++)
    {
	for (var j = 0; j < 64; j++)
	{
	    var tex1 = new texel(i + 0.5 - 8, 0, j + 0.5 - 32);
	    // var tex2 = new texel(i * 2 + 1, 0, -j * 2 + 1);

	    tex1.rgba = [100 + (Math.random() * 100), 100 + (Math.random() * 100), 30, 1];
	    tex1.texture = L.texture.grass;
	    tex1.texCoords = [
		[0, 0],
		[L.texture.grass.width, 0],
		[L.texture.grass.width, L.texture.grass.height],
		[0, L.texture.grass.height],
		[L.texture.grass.width / 2, L.texture.grass.height / 2]
	    ];

	    // tex2.rgba = [255,255,255,1];

	    testLayer.addObject(tex1);

	    // testLayer.addObject(tex2);
	}
    }


    /*
     for (var i = 0; i < 2; i++)
     {
     for (var j = 0; j < 32; j++)
     {
     var tex1 = new texel(i + 0.5 - 1, 2, j + 0.5);
     // var tex2 = new texel(i * 2 + 1, 0, -j * 2 + 1);

     tex1.rgba = [100 + (Math.random() * 100), 100 + (Math.random() * 100), 30, 1];
     tex1.texture = L.texture.temple;
     tex1.texCoords = [
     [0, 0],
     [L.texture.temple.width, 0],
     [L.texture.temple.width, L.texture.temple.height],
     [0, L.texture.temple.height]
     ];

     // tex2.rgba = [255,255,255,1];

     testLayer.addObject(tex1);

     // testLayer.addObject(tex2);
     }
     }
     */

    var sortables = {};
    sortables.objects = [];
    sortables.update = function(dt)
    {
	this.objects.update(dt);
	this.objects.sortBy("distance", -1);
    };
    sortables.draw = function(ctx, camera)
    {
	var objArray = this.objects;
	var arrayLength = objArray.length;
	var currentObject = {};
	for (var i = 0; i < arrayLength; i++)
	{
	    currentObject = objArray[i];
	    if (currentObject.shadow < 1)
	    {
		objArray[i].draw(ctx, camera);
	    }
	}
	//this.objects.draw(ctx);
    };
    var wall = function(x1, z1, x2, z2, height, color)
    {
	for (var i = 0; i < 2; i++)
	{
	    var x = (x1 + x2) / 2;
	    var z = (z1 + z2) / 2;
	    var newWall = new texel(x, 0, z);
	    newWall.color = color;
	    newWall.texture = L.texture.stone;

	    newWall.vertices = [
		[x1 - x, 0, z1 - z],
		[x2 - x, 0, z2 - z],
		[x2 - x, 1, z2 - z],
		[x1 - x, 1, z1 - z]
	    ];
	    newWall.texCoords = [
		[0, 0],
		[L.texture.stone.width, 0],
		[L.texture.stone.width, L.texture.stone.height],
		[0, L.texture.stone.height],
		[L.texture.stone.width / 2, L.texture.stone.height / 2]
	    ];

	    return newWall;
	}
    };
    var stonePattern = L.system.bufferContext[0].createPattern(L.texture.stone, "repeat");
    var tileColor = "grey";
    var wallrgba = [255, 255, 255, 1];
    for (var row = 0; row < 2; row++)
    {
	for (var walls = 0; walls < 32; walls++)
	{
	    var wall1 = new wall(-1 + row * 2, -0.01 + walls, -1 + row * 2, 1.01 + walls, 2, tileColor);
	    var grey = 200 + Math.random() * 55;
	    wall1.rgba = [255, 0, 0, 1];
	    sortables.objects.push(wall1);
	}
    }

    for (var joiner = 0; joiner < 2; joiner++)
    {
	for (var fence = 0; fence < 2; fence++)
	{
	    var wall1 = new wall(-3 + fence + joiner * 4, 0, -2 + fence + joiner * 4, 0, 2, tileColor);
	    sortables.objects.push(wall1);
	}
    }

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

    var Sprite3D = function()
    {
	this.x = 0;
	this.y = 0;
	this.z = 0;
	this.height = 1;
	this.texture;
	this.shadow = L.texture.treeMaskYellow;
	this.handle = {
	    x: 0,
	    y: 0
	};
	this.coords = [];
	this.shadow = 0;
	this.distance = 0;
	this.zScale = 0;
    };

    Sprite3D.prototype.setTexture = function(textureName)
    {
	this.texture = L.texture[textureName];
	this.handle.x = this.texture.width / 2;
	this.handle.y = this.texture.height;
    };
    Sprite3D.prototype.update = function(dt)
    {
	this.shadow = 1;
	var focalLength = camera.focalLength;
	var xRel = this.x - camera.x;
	var yRel = this.y - camera.y;
	var zRel = this.z - camera.z;

	var distance = this.distance = Math.sqrt(Math.pow(xRel, 2) + Math.pow(yRel, 2) + Math.pow(zRel, 2));
//this.zScale = 1/(camera.focalLength/(this.distance + this.distance));



//objectPixelHeight=(height/distance)/focalLength* Camera.main.pixelHeight);



	this.shadow = distance / camera.distance;
	if (this.shadow >= 1)
	{
	    return;
	}

	var relativeCoords = Math.rotatePoint(xRel, zRel, camera.yaw - (Math.PI / 2));







	/*
	 object height (pixels)) = focal length (mm) * real height of the object (mm) * image height (pixels)
	 ---------------------------------------------------------------------------
	 distance to object (mm)* sensor height (mm)
	 */




	/*
	 if (relativeCoords.x < -2)
	 {
	 this.shadow = 1;
	 return;
	 }

	 var relativeAngle = Math.atan(-(relativeCoords.y) / (relativeCoords.x + 1));

	 if ((Math.abs(relativeAngle) > camera.viewAngle / 2) && (distance > 2))
	 {
	 this.shadow = 1;
	 return;
	 }
	 */









	var x, y, z, x0, y0, z0, xCoord, yCoord;
	for (var i = 0; i < 2; i++)
	{
	    if (i === 0)
	    {
		x = this.x;
		y = this.y;
		z = this.z;
	    }
	    else
	    {
		x = this.x;
		y = this.y;//this.y + this.height;
		z = this.z;
	    }



	    var rotatedPoint;
	    if (camera.yaw !== 0)
	    {
		rotatedPoint = Math.rotatePoint(x - camera.x, z - camera.z, camera.yaw);
		x = rotatedPoint.x + camera.x;
		z = rotatedPoint.y + camera.z;
	    }

	    if (camera.pitch !== 0)
	    {
		rotatedPoint = Math.rotatePoint(y - camera.y, z - camera.z, camera.pitch);
		y = rotatedPoint.x + camera.y;
		z = rotatedPoint.y + camera.z;
	    }

	    x0 = x - camera.x;
	    y0 = y - camera.y;
	    z0 = z - camera.z;

	    if (i === 0)
	    {
		//this.zScale = (L.system.height / -z0 / camera.focalLength);
	    }
	    else
	    {
		y0 += 1;
	    }



	    if (z0 >= 0) {

		this.shadow = 1;
		return;
	    }

	    xCoord = focalLength * x0 / z0 + L.system.width / 2;
	    yCoord = focalLength * y0 / z0 + L.system.height / 2;

	    this.coords[i] = [xCoord, yCoord];

	}
	//var coordsLength = this.coords.length;
	//var anyOnScreen = false;
	/*
	 var xMin = this.coords[0][0];
	 var xMax = this.coords[0][0];
	 var yMin = this.coords[0][1];
	 var yMax = this.coords[0][1];
	 for (var coordPair = 1; coordPair < coordsLength; coordPair++)
	 {
	 var coords = this.coords[coordPair];
	 var x = coords[0];
	 var y = coords[1];

	 xMin = Math.min(x, xMin);
	 xMax = Math.max(x, xMax);
	 yMin = Math.min(y, yMin);
	 yMax = Math.max(y, yMax);

	 }
	 if (yMin > L.system.height || yMax < 0 || xMin > L.system.width || xMax < 0)
	 {
	 this.shadow = 1;
	 return;
	 }
	 */
    };
    Sprite3D.prototype.draw = function(ctx)
    {

	ctx.globalAlpha = 1;
	var x0 = this.coords[0][0];
	var y0 = this.coords[0][1];
	var x1 = this.coords[1][0];
	var y1 = this.coords[1][1];

	var proportion = (y0 - y1) * this.height / this.texture.height;
	//var proportion = this.zScale;
	//var proportion =
	var height = proportion * this.texture.height;
	var width = proportion * this.texture.width;

	ctx.save();
	ctx.translate(x0, y0);
	ctx.scale(proportion, proportion);
	ctx.drawImage(L.texture.treeMaskYellow, -this.handle.x, -this.handle.y);
	var distanceFade = this.distance / camera.distance;
	if (distanceFade >= 1) {
	    distanceFade = 1;
	}
	ctx.globalAlpha = 1 - distanceFade;
	ctx.drawImage(this.texture, -this.handle.x, -this.handle.y);
	ctx.globalAlpha = 1;
	ctx.restore();
    };
    for (var treeRows = 0; treeRows < 1; treeRows++)
    {
	for (var treeCount = 0; treeCount < 1; treeCount++)
	{
	    var tree01 = new Sprite3D();
	    tree01.setTexture("tree");
	    tree01.handle = {
		x: 327,
		y: 692
	    };
	    tree01.height = 4;
	    tree01.x = -2 + treeCount * 4;
	    tree01.z = -1.5 + treeRows * 3;
	    // sortables.objects.push(tree01);
	}
    }






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
    cameraControl.bindKey("numpad1", "keydown", function() {
	camera.pitch -= 0.1;
    });
    cameraControl.bindKey("numpad3", "keydown", function() {
	camera.pitch += 0.1;
    });

    testArena.keymap = cameraControl;

};

