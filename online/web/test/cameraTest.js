import "../js/three.js";




var scene;
var camera; 
var renderer;

function setup()
{
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xff0000);

    camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.01, 10000);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);
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
var geometry = new THREE.ConeGeometry();

//var material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
var material = new THREE.MeshStandardMaterial();

var cube = new THREE.Mesh(geometry, material);
scene.add(cube);
var cube2 = new THREE.Mesh(geometry, material);
scene.add(cube2);

//camera.position.y = 10;
//camera.rotation.x = -Math.PI/2.0;


var startDate = new Date();
var startTime = startDate.getTime()

cube.rotation.z = -Math.PI/2.0;
cube2.rotation.z = -Math.PI/2.0;

let csvContent = "data:text/csv;charset=utf-8,";

var frame = 0;

//setup();

function writeCsv(t)
{
    csvContent+="1,1000,"+t+","+camera.position.x+","+camera.position.y+","+camera.position.z+","+camera.quaternion.x+","+camera.quaternion.y+","+camera.quaternion.z+","+camera.quaternion.w+"\n";
    csvContent+="2,1000,"+t+","+cube.position.x+","+cube.position.y+","+cube.position.z+","+cube.quaternion.x+","+cube.quaternion.y+","+cube.quaternion.z+","+cube.quaternion.w+"\n";
    csvContent+="3,2000,"+t+","+cube2.position.x+","+cube2.position.y+","+cube2.position.z+","+cube2.quaternion.x+","+cube2.quaternion.y+","+cube2.quaternion.z+","+cube2.quaternion.w+"\n";
}


function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
    var t = new Date().getTime();
    cube.position.x = 4*Math.sin(2*Math.PI*(t - startTime) / 10000);
    cube.position.z = 4*Math.cos(2*Math.PI*(t - startTime) / 10000);
    //cube2.position.x = 6*Math.sin(2*Math.PI*(t - startTime) / 10000);
    //cube2.position.z = 6*Math.cos(2*Math.PI*(t - startTime) / 10000);
    cube.rotation.y = 2*Math.PI*(t - startTime) / 10000;
    cube2.rotation.y = 2*Math.PI*(t - startTime) / 10000;
    camera.lookAt(cube.position)
    camera.position.x = 12*Math.cos(2*Math.PI*(t - startTime) / 15489);
    camera.position.z = 12*Math.cos(2*Math.PI*(t - startTime) / 11568);
    camera.position.y = 2*Math.cos(2*Math.PI*(t - startTime) / 11268);
    cube2.position.x = camera.position.x;
    cube2.position.z = camera.position.z;
    cube2.lookAt(cube.position);
    cube2.translateX(-5); 
    //cube.scale.x = .1;
    //cube2.scale.x = .1;
    //cube.rotation.y += 0.01;
    //cube.rotation.z += 0.005;
    //cube.position.x = 5 * Math.sin((t - startTime) / 10000)
    //cube.position.z =2* Math.cos((t - startTime) / 10000)
    //cube.scale.x += 0.01;
    //cube2.scale.x = Math.sin((t - startTime) / 6737);
    //cube2.rotation.y = Math.sin((t - startTime) / 5624);
    //cube2.rotation.z = Math.sin((t - startTime) / 7864);
    //cube2.rotation.z = Math.sin((t - startTime) / 3457);
    writeCsv( (t - startTime) / 1000)
    if (frame == 3600)
    {
        var encodedUri = encodeURI(csvContent);
        window.open(encodedUri);
    }
    frame++;
}

animate();