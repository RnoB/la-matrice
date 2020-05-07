import "./js/three.min.js";



import { GUI } from './jsm/libs/dat.gui.module.js';

import { Sky } from './jsm/objects/Sky.js';

import { OrbitControls } from './jsm/controls/OrbitControls.js';

var camera, controls, scene, renderer;

var sky, sunSphere;

//import { WebXRButton } from './js/webxr/webxr-button.js';

var scene;
var camera;
var renderer = null;

var ws;


var startDate = new Date();
var startTime = startDate.getTime()

var id = Math.random();

var connected = false;

var listPlayers = [];

var frame = 0

var geometry = new THREE.BoxGeometry();

//var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();
var cameraBox = new THREE.Mesh(geometry, material);

var geometryPlane = new THREE.PlaneGeometry( 200, 200, 8,8 );
var materialPlane = new THREE.MeshStandardMaterial( {color: 0xffff00} );
var plane = new THREE.Mesh( geometryPlane, materialPlane );
console.log(plane.rotation);


plane.rotateX(-Math.PI/2.0);
plane.position.y=-2
console.log(plane.rotation);

var simuTime;

var controls;

function initSky() {

    // Add Sky
    sky = new Sky();
    sky.scale.setScalar( 450000 );
    scene.add( sky );

    // Add Sun Helper
    sunSphere = new THREE.Mesh(
        new THREE.SphereBufferGeometry( 20000, 16, 8 ),
        new THREE.MeshBasicMaterial( { color: 0xffffff } )
    );
    sunSphere.position.y = - 700000;
    sunSphere.visible = false;
    scene.add( sunSphere );

    /// GUI

    var effectController = {
        SkyExponent1: 1,
        SkyExponent2: 1,
        SkyIntensity: 1,
        inclination: 0.49, // elevation / inclination
        azimuth: 0.25, // Facing front,
        SkyColor1: "#ffff00", // Facing front,
        SkyColor2: "#00ff00", // Facing front,
        SkyColor3: "#0011ff", // Facing front,
        sun: ! true,
        SunColor : "#0011ff",
        SunAlpha : 1.0,
        SunBeta : 1.0,
        SunIntensity : .1,
        distance : 1,
        
    };

    var distance = 400000;

   function guiChanged() {

        var uniforms = sky.material.uniforms;
        uniforms[ "SkyExponent1" ].value = effectController.SkyExponent1;
        uniforms[ "SkyExponent2" ].value = effectController.SkyExponent2;
        uniforms[ "SkyIntensity" ].value = effectController.SkyIntensity;

        uniforms[ "SkyColor1" ].value = new THREE.Color(effectController.SkyColor1);
        uniforms[ "SkyColor2" ].value = new THREE.Color(effectController.SkyColor2);
        uniforms[ "SkyColor3" ].value = new THREE.Color(effectController.SkyColor3);


        uniforms[ "SunColor" ].value = new THREE.Color(effectController.sunColor);
        uniforms[ "SunIntensity" ].value = effectController.SunIntensity;
        uniforms[ "SunAlpha" ].value = effectController.SunAlpha;
        uniforms[ "SunBeta" ].value = effectController.SunBeta;

        distance = effectController.distance;

        var theta = Math.PI * ( effectController.inclination - 0.5 );
        var phi = 2 * Math.PI * ( effectController.azimuth - 0.5 );

        sunSphere.position.x = distance * Math.cos( phi );
        sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
        sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

        sunSphere.visible = effectController.sun;

        uniforms[ "SunVector" ].value.copy( sunSphere.position );





    }

    var gui = new GUI();

    gui.add( effectController, "SkyIntensity", 0.0, 5.0, 0.01 ).onChange( guiChanged );
    gui.add( effectController, "SkyExponent1", 0.0, 5.0, 0.01 ).onChange( guiChanged );
    gui.add( effectController, "SkyExponent2", 0.0, 5.0, 0.001 ).onChange( guiChanged );

    gui.add( effectController, "inclination", 0, 1, 0.0001 ).onChange( guiChanged );
    gui.add( effectController, "azimuth", 0, 1, 0.0001 ).onChange( guiChanged );
    gui.add( effectController, "sun" ).onChange( guiChanged );
    gui.addColor( effectController, "SkyColor1").onChange( guiChanged );
    gui.addColor( effectController, "SkyColor2").onChange( guiChanged );
    gui.addColor( effectController, "SkyColor3").onChange( guiChanged );
    gui.addColor( effectController, "SunColor").onChange( guiChanged );
    gui.add( effectController, "SunIntensity", .0, 1.0, 0.001 ).onChange( guiChanged );
    gui.add( effectController, "SunAlpha", 0.0, 500.0, 0.01 ).onChange( guiChanged );
    gui.add( effectController, "SunBeta", 0.0, 10.0, 0.001 ).onChange( guiChanged );
    gui.add( effectController, "distance", 0.0, 10.0, 0.001 ).onChange( guiChanged );
    
    guiChanged();

}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);
    
    cameraBox.visible = false;
    camera.add(cameraBox);
    camera.position.y = 1.5
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);



    scene.add(plane);


}


function setUpWorld()
{
    console.log("Setting up World")
    var light = new THREE.PointLight(0x00ff00, 1, 1000);
    light.position.set(50, 50, 50);
    var light2 = new THREE.PointLight(0x00ff, 1, 1000);
    light2.position.set(0, 50, 50);
    scene.add(light2);
    scene.add(light);
    initSky();
    controls = new OrbitControls( camera, renderer.domElement );
}


var xSpeed = 0.1;
var ySpeed = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    if (keyCode == 87) {
        camera.position.z += ySpeed;
    } else if (keyCode == 83) {
        camera.position.z -= ySpeed;
    } else if (keyCode == 65) {
        camera.position.x -= xSpeed;
    } else if (keyCode == 68) {
        camera.position.x += xSpeed;
    } else if (keyCode == 32) {
        camera.position.set(0, 0, 0);
    }
    
};










function animate() {
    renderer.setAnimationLoop(render);    
}
function render() {
    var t = new Date().getTime();




   controls.update();

    for (var player of listPlayers)
    {

        if (player.id !== id)
        {
            player.mesh.position.set(player.position.x,player.position.y,player.position.z);
            player.mesh.quaternion.set(player.rotation._x,player.rotation._y,player.rotation._z,player.rotation._w);
            
        }
    }
    
    
   renderer.render(scene, camera);
   frame++;

}


setup();
setUpWorld();
animate();