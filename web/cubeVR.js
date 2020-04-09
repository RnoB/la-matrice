import "./js/three.min.js";
import { VRButton } from './js/webxr/VRButton.js';

//import { WebXRButton } from './js/webxr/webxr-button.js';

var scene;
var camera;
var renderer = null;
var polyfill = new WebXRPolyfill();



function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.xr.enabled = true;
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);


    document.body.appendChild(VRButton.createButton(renderer));


}

setup();



/*Lights*/
var light = new THREE.PointLight(0x00ff00, 1, 1000);
light.position.set(50, 50, 50);
var light2 = new THREE.PointLight(0x00ff, 1, 1000);
light2.position.set(0, 50, 50);
scene.add(light2);
scene.add(light);

/*Cube*/
var geometry = new THREE.BoxGeometry();

//var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
var cube2 = new THREE.Mesh(geometry, material);
scene.add(cube2);

camera.position.z = 5;


var startDate = new Date();
var startTime = startDate.getTime()




//setup();

function animate() {
    renderer.setAnimationLoop(render);
}
function render() {
    var t = new Date().getTime();
    cube.rotation.x = Math.sin((t - startTime) / 4909);
    cube.rotation.x += 0.03;
    cube.rotation.y += 0.02;
    cube.rotation.z += 0.05;
    cube.position.x = 4 * Math.sin((t - startTime) / 5000);
    cube.position.z = 1 * Math.cos((t - startTime) / 5000);
    cube.scale.x = 1 +5 * (1 + Math.sin((t - startTime) / 7000))/2 ;
    cube.scale.z = 1 - .8 * (1 + Math.sin((t - startTime) / 7000)) / 2;
    cube.scale.y = 1 - .8 * (1 + Math.sin((t - startTime) / 7000)) / 2;
    cube2.scale.x = Math.sin((t - startTime) / 6737);
    cube2.rotation.x = Math.sin((t - startTime) / 5624);
    cube2.rotation.y = Math.sin((t - startTime) / 7864);
    cube2.rotation.z = Math.sin((t - startTime) / 3457);
    renderer.render(scene, camera);
    light.position.x = 50 * Math.sin((t - startTime) / 1209);
    light.position.y = 50 * Math.cos((t - startTime) / 1209);
    
}

 
animate();