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
console.log(plane.rotation);


plane.rotateX(-Math.PI/2.0);
console.log(plane.rotation);

var simuTime = 0;


var controllers = [];

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
    for (let i = 0; i < 2; ++i) {
        const controller = renderer.xr.getController(i);
        var controllerMesh = new THREE.Mesh( geometry, material );
        controllerMesh.scale.set(.01,.1,.1);
        controller.add( controllerMesh);
        scene.add(controller);
        controllers.push(controller);

    }
}



function connect()
{
    ws = new WebSocket('wss://matricematrice.xyz:6785'); 
    connected = true;

}




function receiver(msg)
{
    var data = JSON.parse(msg);
    
    if('world' in data)
    {
        console.log(data)
        id = data.id;

        for (let j = 0; j < data.playerIds.length; ++j) 
        {


            var playerInfo = {"id" : data.playerIds[j],
            "position" : new THREE.Vector3(),
            "rotation" : new THREE.Quaternion(),
            "mesh" : new THREE.Mesh(geometry, material),
            "controllers" : data.controllers};
            
            for (let k = 0; k < data.playerControllers[j]; ++k) 
            {
                var controllerMesh = new THREE.Mesh( geometry, material );
                controllerMesh.scale.set(.01,.1,.1);
                playerInfo["controller"+k.toString()+"Position"] = new THREE.Vector3();
                playerInfo["controller"+k.toString()+"Rotation"] = new THREE.Quaternion();
                playerInfo["controller"+k.toString()+"Mesh"] = controllerMesh;
                scene.add(controllerMesh);
            }
            
            listPlayers.push(playerInfo);
            listPlayers[listPlayers.length-1].mesh.scale.set(.3,.3,.3);
            
            scene.add(listPlayers[listPlayers.length-1].mesh);
        }
        setUpWorld();
    }
    else if('newPlayer' in data)
    {

            playerInfo = {"id" : data.newPlayer,
            "position" : new THREE.Vector3(),
            "rotation" : new THREE.Quaternion(),
            "mesh" : new THREE.Mesh(geometry, material),
            "controllers" : data.controllers};

            for (let k = 0; k < data.controllers; ++k) 
            {
                var controllerMesh = new THREE.Mesh( geometry, material );
                controllerMesh.scale.set(.01,.1,.1);
                playerInfo["controller"+k.toString()+"Position"] = new THREE.Vector3();
                playerInfo["controller"+k.toString()+"Rotation"] = new THREE.Quaternion();
                playerInfo["controller"+k.toString()+"Mesh"] = controllerMesh;
                scene.add(controllerMesh);
            }

            listPlayers.push(playerInfo);
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
            for (let k = 0; k < listPlayers[idx].controllers; ++k) 
            {
                var controllerMesh = new THREE.Mesh( geometry, material );
                controllerMesh.scale.set(.01,.1,.1);
                listPlayers[idx]["controller"+k.toString()+"Position"] = data["controller"+k.toString()+"Position"];
                listPlayers[idx]["controller"+k.toString()+"Rotation"] = data["controller"+k.toString()+"Rotation"];
                scene.add(controllerMesh);
            }

        }
    }
}

async function sender()
{
    var direction = new THREE.Vector3();
    var rotation = new THREE.Quaternion();
    
    var msg = {
        controllers: controllers.length
    };
    ws.send(JSON.stringify(msg));
    while(true)
    {
        camera.children[0].getWorldPosition( direction );
        camera.children[0].getWorldQuaternion( rotation );

        var msg = {
            id: id,
            position: direction,
            rotation: rotation
        };
        for (let k = 0; k < controllers.length; ++k) 
        {
            msg["controller"+k.toString()+"Position"] = controllers[k].position;
            msg["controller"+k.toString()+"Rotation"] = controllers[k].quaternion;
            
        }
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
            for (let k = 0; k < player.controllers; ++k) 
            {

                player["controller"+k.toString()+"Mesh"].position.set(player["controller"+k.toString()+"Position"].x,
                                                                    player["controller"+k.toString()+"Position"].y,
                                                                    player["controller"+k.toString()+"Position"].z,);
                player["controller"+k.toString()+"Mesh"].quaternion.set(data["controller"+k.toString()+"Rotation"]._x,
                                                                    data["controller"+k.toString()+"Rotation"]._y,
                                                                    data["controller"+k.toString()+"Rotation"]._z,
                                                                    data["controller"+k.toString()+"Rotation"]._w);

            }
            console.log(player);
            
        }
    }
    
    
    renderer.render(scene, camera);
    frame++;
}


setup();
network();
animate();