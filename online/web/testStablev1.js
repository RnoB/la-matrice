import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';


import { GUI } from './jsm/libs/dat.gui.module.js';

import { Sky } from './jsm/objects/Sky.js';

import './js/controls/PointerLockControls.js'
var camera, controls, scene, renderer;

var sky, sunSphere;

//import { WebXRButton } from './js/webxr/webxr-button.js';

var scene;
var camera;
var renderer = null;
var polyfill = new WebXRPolyfill();

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
var materialPlane = new THREE.MeshStandardMaterial( {color: 0xff00ff} );
var plane = new THREE.Mesh( geometryPlane, materialPlane );



plane.rotateX(-Math.PI/2.0);


var simuTime = 0;

function initSky(turbidity = 10,
        rayleigh = 2,
        mieCoefficient = 0.005,
        mieDirectionalG = 0.8,
        luminance = 1,
        inclination = 0.49, // elevation / inclination
        azimuth = 0.25, // Facing front,
        colorR = 0, // Facing front,
        colorG = 0, // Facing front,
        colorB = 0, // Facing front,
        sun =  ! true) {

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



    var distance = 400000;

    var uniforms = sky.material.uniforms;
    uniforms[ "turbidity" ].value = turbidity;
    uniforms[ "rayleigh" ].value = rayleigh;
    uniforms[ "mieCoefficient" ].value = mieCoefficient;
    uniforms[ "mieDirectionalG" ].value = mieDirectionalG;
    uniforms[ "luminance" ].value = luminance;
    uniforms[ "colorR" ].value = colorR;
    uniforms[ "colorG" ].value = colorG;
    uniforms[ "colorB" ].value = colorB;

    var theta = Math.PI * ( inclination - 0.5 );
    var phi = 2 * Math.PI * ( azimuth - 0.5 );

    sunSphere.position.x = distance * Math.cos( phi );
    sunSphere.position.y = distance * Math.sin( phi ) * Math.sin( theta );
    sunSphere.position.z = distance * Math.sin( phi ) * Math.cos( theta );

    sunSphere.visible = sun;

    uniforms[ "sunPosition" ].value.copy( sunSphere.position );







}


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

var controls
function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);
    
    cameraBox.visible = false;
    camera.add(cameraBox);
    camera.position.y = 1.5
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));
    scene.add(plane);


    var turbidity = 10;
    var rayleigh = 2;
    var mieCoefficient = 0.005;
    var mieDirectionalG = 0.8;
    var luminance = 1;
    var inclination = 0.49; // elevation / inclination
    var azimuth = 0.25; // Facing front;
    var colorR = 5; // Facing front;
    var colorG = 0.098; // Facing front;
    var colorB = 4.81; // Facing front;
    var sun =  ! true;

    initSky(turbidity,rayleigh,
        mieCoefficient,
        mieDirectionalG ,
        luminance,
        inclination , // elevation / inclination
        azimuth , // Facing front,
        colorR , // Facing front,
        colorG , // Facing front,
        colorB, // Facing front,
        sun )

controls = new THREE.PointerLockControls( camera, document.body );
controls.lock = true;
}



function connect()
{
    ws = new WebSocket('wss://matricematrice.xyz:6799'); 
    connected = true;

}




function receiver(msg)
{
    var data = JSON.parse(msg);

    if('world' in data)
    {
        id = data.id;

        for (const player of data.playerIds)
        {



            listPlayers.push({"id" : player,
            "position" : {"x":0,"y":0,"z":0},
            "rotation" : {"_x":0,"_y":0,"_z":0,"_order":"XYZ"},
            "mesh" : new THREE.Mesh(geometry, material)});
            listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
            
            scene.add(listPlayers[listPlayers.length-1].mesh);
        }
        setUpWorld();
    }
    else if('newPlayer' in data)
    {

            listPlayers.push({"id" : data.newPlayer,
            "position" : {"x":0,"y":0,"z":0},
            "rotation" : {"_x":0,"_y":0,"_z":0,"_order":"XYZ"},
            "mesh" : new THREE.Mesh(geometry, material)});
            listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
            scene.add(listPlayers[listPlayers.length-1].mesh);
    }    
    else if('remPlayer' in data)
    {

            var idx = listPlayers.findIndex(x => x.id == data.remPlayer);

            if (idx>-1)
            {

                scene.remove(listPlayers[idx].mesh);

                listPlayers.splice(idx);


            }


            
    }
    else
    {
        var idx = listPlayers.findIndex(x => x.id == data.id);
        if (idx>-1)
        {

            listPlayers[idx].position = data.position;
            listPlayers[idx].rotation = data.rotation;

        }
    }
}

async function sender()
{
    var direction = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
        
    while(true)
    {
        camera.children[0].getWorldPosition( direction );
        camera.children[0].getWorldQuaternion( rotation );

        var msg = {
            id: id,
            position: direction,
            rotation: rotation
        };
        ws.send(JSON.stringify(msg));
        await sleep(10);
    }
}



function setUpWorld()
{
    console.log("Setting up World")
    var light = new THREE.PointLight(0xab0000, 1, 1000);
    light.position.set(50, 50, 50);
    var light2 = new THREE.PointLight(0x00ff, 1, 1000);
    light2.position.set(0, 50, 50);
    scene.add(light2);
    scene.add(light);
}


var xSpeed = 0.1;
var ySpeed = 0.1;

document.addEventListener("keydown", onDocumentKeyDown, false);
function onDocumentKeyDown(event) {
    var keyCode = event.which;

    if (keyCode == 87) {
        camera.position.z -= ySpeed;
    }
    if (keyCode == 83) {
        camera.position.z += ySpeed;
    }
    if (keyCode == 65) {
        camera.position.x -= xSpeed;
    }
    if (keyCode == 68) {
        camera.position.x += xSpeed;
    }
    if (keyCode == 32) {
        camera.position.set(0, 0, 0);
    }
    
};

function network()
{
    connect();
    ws.onmessage = function (event) {receiver(event.data);}
    ws.onopen =  function(event){sender(); }
    
}











//setup();

function animate() {
    renderer.setAnimationLoop(render);    
}
function render() {
    var t = new Date().getTime();





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
network();
animate();