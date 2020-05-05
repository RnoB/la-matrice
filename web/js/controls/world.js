import { Sky } from '../../jsm/objects/Sky.js';



export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class InitSky
{

    constructor(turbidity=10,rayleigh=2,mieCoefficient = 0.005,
        mieDirectionalG=0.8 ,luminance=1,inclination=0.49 ,azimuth=0.25 ,
        colorR =5, colorG =0.098,colorB = 4.81, sun = false)
    {
        this.turbidity = turbidity;
        this.rayleigh = rayleigh;
        this.mieCoefficient = mieCoefficient;
        this.mieDirectionalG = mieDirectionalG;
        this.luminance = luminance;
        this.inclination = inclination;
        this.azimuth = azimuth;
        this.colorB = colorB;
        this.colorG = colorG;
        this.colorR = colorR;
        this.sun = sun;
        this.sky = new Sky();
        this.sky.scale.setScalar( 450000 );
        this.sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } ));
        this.sunSphere.position.y = - 700000;
        this.sunSphere.visible = sun;
        this.distance = 700000;
        this.updateShader();
    }


    addToScene(scene)
    {

        scene.add(this.sky);
        scene.add(this.sunSphere);
    }

    updateShader()
    {

        var uniforms = this.sky.material.uniforms;
        uniforms[ "turbidity" ].value = this.turbidity;
        uniforms[ "rayleigh" ].value = this.rayleigh;
        uniforms[ "mieCoefficient" ].value = this.mieCoefficient;
        uniforms[ "mieDirectionalG" ].value = this.mieDirectionalG;
        uniforms[ "luminance" ].value = this.luminance;
        uniforms[ "colorR" ].value = this.colorR;
        uniforms[ "colorG" ].value = this.colorG;
        uniforms[ "colorB" ].value = this.colorB;    

        
        var theta = Math.PI * ( this.inclination - 0.5 );
        var phi = 2 * Math.PI * ( this.azimuth - 0.5 );

        this.sunSphere.position.x = this.distance * Math.cos( phi );
        this.sunSphere.position.y = this.distance * Math.sin( phi ) * Math.sin( theta );
        this.sunSphere.position.z = this.distance * Math.sin( phi ) * Math.cos( theta );

        this.sunSphere.visible = this.sun;

        uniforms[ "sunPosition" ].value.copy( this.sunSphere.position );

    }





}

export class InitFloor
{
    constructor()
    {

        this.geometryPlane = new THREE.PlaneGeometry( 200, 200, 8,8 );
        this.materialPlane = new THREE.MeshStandardMaterial( {color: 0xff00ff} );
        this.plane = new THREE.Mesh( this.geometryPlane, this.materialPlane );
        this.plane.receiveShadow = true;

        this.plane.rotateX(-Math.PI/2.0);
    }
    addToScene(scene)
    {

        scene.add(this.plane);
    }

}

export function worldBuilder(world,scene)
{
    
    var sky,floor;
    switch(world)
    {

        case 0:
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
            break;
        case 1:
            var light = new THREE.DirectionalLight(0x00cc00, 1);
            light.position.set(1, 10, 1);
            light.castShadow = true;
            light.shadow.mapSize.width = 512;  // default   
            light.shadow.mapSize.height = 512; // default
            light.shadow.camera.near = 0.5;    // default
            light.shadow.camera.far = 500;     // default
            var light2 = new THREE.PointLight(0x00ff00, 1, 1000);
            light2.position.set(0, 50, 50);
            
            scene.add(light2);
            light.shadow.bias = 0.0001

            //light.shadow.camera.top = 1000;
            //light.shadow.camera.bottom = 1000;
            var ambientLight = new THREE.AmbientLight( 0x00ab00, 0.3 );
            scene.add( ambientLight );
            scene.add(light);  
        //    let helper = new THREE.CameraHelper ( light.shadow.camera );
        //    scene.add( helper );
            sky = new InitSky(undefined,undefined,undefined,undefined,undefined,undefined,undefined,
                .2, 6, .12);
            sky.addToScene(scene);    
            floor = new InitFloor();
            floor.addToScene(scene);
            break;
    }
}