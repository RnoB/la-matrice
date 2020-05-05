import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';

import { networkCode,objectsType } from "./js/network/networkCode.js"
import { Client } from "./js/network/network.js"
import {InputKey} from "./js/controls/inputKey.js" 
import {sleep,InitSky,InitFloor} from "./js/controls/world.js" 


if (navigator.xr == null)
{
    var polyfill = new WebXRPolyfill();
}



var camera, controls, scene, renderer;

var sky, floor;


var scene;
var camera;
var renderer = null;


var ws;


var startDate = new Date();
var startTime = startDate.getTime()

var id = -1;

var connected = false;



var frame = 0

var geometry = new THREE.BoxGeometry();

//var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();
var cameraBox = new THREE.Mesh(geometry, material);



var simuTime = 0;


var controllers = [];


var inputs = new InputKey();

var updateFrequency = 20;

var world = 0;
var noRotation = false;
var noControllers = false;

var client;

/* Setup World */
async function setUpWorld()
{
    await sleep(10000);
    //while (Object.keys(client.worldInfo).length === 0)
    //{
        console.log(client.worldInfo);
        
    //}

    console.log("Setting up World")
    var light = new THREE.DirectionalLight(0xab00ac, 1);
    light.position.set(1, 10, 1);
    light.castShadow = true;
    light.shadow.mapSize.width = 512;  // default   
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;    // default
    light.shadow.camera.far = 500;     // default
    var light2 = new THREE.PointLight(0x00ff, 1, 1000);
    light2.position.set(0, 50, 50);
    
    scene.add(light2);
    light.shadow.bias = 0.0001

    //light.shadow.camera.top = 1000;
    //light.shadow.camera.bottom = 1000;
    var ambientLight = new THREE.AmbientLight( 0xaa00ff, 0.3 );
    scene.add( ambientLight );
    scene.add(light);  
//    let helper = new THREE.CameraHelper ( light.shadow.camera );
//    scene.add( helper );
    sky = new InitSky();
    sky.addToScene(scene);    
    floor = new InitFloor();
    floor.addToScene(scene);

    
}

function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);
    
    cameraBox.visible = false;
    camera.add(cameraBox);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));
    if  ( 'xr' in navigator ) 
    {

        navigator.xr.isSessionSupported('immersive-vr').then(
            function(isSupported)
            {

                if(isSupported)
                {
                    for (let i = 0; i < 2; ++i) 
                    {
                        const controller = renderer.xr.getController(i);
                        var controllerMesh = new THREE.Mesh( geometry, material );
                        controllerMesh.scale.set(.01,.1,.1);
                        controllerMesh.castShadow = true;
                        controller.add( controllerMesh);
                        scene.add(controller);
                        controllers.push(controller);
                    }
                }
            }
        );
    }



    client = new Client("matricematrice.xyz",6785,20,scene,
                            camera,controllers)
    
    setUpWorld()


}

/* rendering */

function animate() {
    renderer.setAnimationLoop(render);    
}

function render() {
    var t = new Date().getTime();



    inputs.inputPlayer(camera);

    for (var player of client.listPlayers)
    {

        if (player.id !== id)
        {
            //console.log(player.mesh.position);
            player.mesh.position.lerp(player.position,.5);
            player.mesh.quaternion.slerp(player.rotation,.5);
            for (let k = 0; k < player.controllers; ++k) 
            {

                player["meshC"+k.toString()].position.lerp(player["posC"+k.toString()],0.5);
                player["meshC"+k.toString()].quaternion.slerp(player["rotC"+k.toString()],0.5);
                
            }
            
            
        }
    }
    for (var obj of client.listObjects)
    {

            obj.mesh.position.lerp(obj.position,.5);
            obj.mesh.quaternion.slerp(obj.rotation,.5);

    }
    
    renderer.render(scene, camera);
    frame++;

}


/*Program Start*/
setup();
animate();