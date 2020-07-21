import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';

import {InputKey} from "./js/controls/inputKey.js" 
import {sleep,worldBuilder} from "./js/controls/world.js" 


if (navigator.xr == null)
{
    var polyfill = new WebXRPolyfill();
}



var camera, controls, scene, renderer;




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

var bounds;
/* Setup World */
async function setUpWorld()
{



    console.log("Setting up World")
    worldBuilder(world,scene);


    
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
    renderer.shadowMap.enabled = false;
    //renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    document.body.appendChild(renderer.domElement);

    var button = VRButton.createButton(renderer);
    document.body.appendChild(button['button']);

    bounds = button['bounds'];
    //let referenceSpace = renderer.xr.getReferenceSpace();
    //let session = renderer.xr.getSession();
   
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




    
    setUpWorld()


}

/* rendering */

function animate() {
    renderer.setAnimationLoop(render);    
}

function render() {
    var t = new Date().getTime();



    inputs.inputPlayer(camera);


    //console.log(bounds);

    renderer.render(scene, camera);


    frame++;

}


/*Program Start*/
setup();
animate();