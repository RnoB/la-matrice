import { Sky } from '../../jsm/objects/Sky.js';



export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export class InitSky
{

    constructor(SkyExponent1=1.0,SkyExponent2=1.0,SkyIntensity = 1.0,
                SkyColor1 = "#0000ff" ,SkyColor2 = "#ff00ff",SkyColor3 = "#ff0000",
                SunColor = "#ff1100", SunIntensity =1,SunAlpha = 1.0, SunBeta = 1.0,
                SunVector = new THREE.Vector3(0,1,0))
    {
        this.SkyExponent1 = SkyExponent1;
        this.SkyExponent2 = SkyExponent2;
        this.SkyIntensity = SkyIntensity;
        this.SkyColor1 = SkyColor1;
        this.SkyColor2 = SkyColor2;
        this.SkyColor3 = SkyColor3;
        this.SunColor = SunColor;
        this.SunIntensity = SunIntensity;
        this.SunAlpha = SunAlpha;
        this.SunBeta = SunBeta;
        this.SunVector = SunVector;
        this.sky = new Sky();
        this.updateShader();
    }


    addToScene(scene)
    {


        this.sky.scale.setScalar( 450000 );
        scene.add(this.sky);
        var sunSphere = new THREE.Mesh(
            new THREE.SphereBufferGeometry( 20000, 16, 8 ),
            new THREE.MeshBasicMaterial( { color: 0xffffff } )
        );
        sunSphere.position.y = - 700000;
        sunSphere.visible = false;
        scene.add( sunSphere );
    }

    sunPosition(inclination, azimuth)
    {

        var theta = 2 * Math.PI * ( inclination  );
        var phi = 2 * Math.PI * ( azimuth );
        this.SunVector.x =  Math.cos( phi ) * Math.cos( theta );
        this.SunVector.y =  Math.sin( theta );
        this.SunVector.z = Math.sin( phi ) * Math.cos( theta ); 
        this.sky.material.uniforms[ "SunVector" ].value.copy( this.SunVector );    
    }

    updateShader()
    {
        var uniforms = this.sky.material.uniforms;
        uniforms[ "SkyExponent1" ].value = this.SkyExponent1;
        uniforms[ "SkyExponent2" ].value = this.SkyExponent2;
        uniforms[ "SkyIntensity" ].value = this.SkyIntensity;

        uniforms[ "SkyColor1" ].value = new THREE.Color(this.SkyColor1);
        uniforms[ "SkyColor2" ].value = new THREE.Color(this.SkyColor2);
        uniforms[ "SkyColor3" ].value = new THREE.Color(this.SkyColor3);


        uniforms[ "SunColor" ].value = new THREE.Color(this.SunColor);
        uniforms[ "SunIntensity" ].value = this.SunIntensity;
        uniforms[ "SunAlpha" ].value = this.SunAlpha;
        uniforms[ "SunBeta" ].value = this.SunBeta;

        uniforms[ "SunVector" ].value.copy( this.SunVector );

    }





}

export class InitFloor
{
    constructor(metalness,roughness)
    {

        this.geometryPlane = new THREE.PlaneGeometry( 200, 200, 8,8 );
        this.materialPlane = new THREE.MeshStandardMaterial( {color: 0xff00ff} );
        this.materialPlane.metalness = metalness;
        this.materialPlane.roughness = roughness;
        this.plane = new THREE.Mesh( this.geometryPlane, this.materialPlane );
        this.plane.receiveShadow = true;

        this.plane.rotateX(-Math.PI/2.0);
    }
    addToScene(scene)
    {

        scene.add(this.plane);
    }

}


function worlder(scene,ambientColor ="#00ff00",ambientIntensity = .3,
        SkyExponent1= 1,SkyExponent2= 1,SkyIntensity= 1,inclination= 0.49,azimuth= 0.25, 
        SkyColor1= "#ffff00",SkyColor2= "#00ff00",SkyColor3= "#0011ff", 
        SunColor = "#0011ff",SunAlpha = 1.0,SunBeta = 1.0,SunIntensity = .1,
        LightIntensity1 = 1.0,LightIntensity2 = 1.0,
        LightColor1 = '#00ff00',LightColor2 = '#00ff36',
        FogColor = '#000000',FogNear = 10,FogFar = 100, 
        planeColor = '#ffffff',metalness=0.0,roughness = 0.0)
{
    scene.fog = new THREE.Fog(FogColor, FogNear, FogFar);
    var sky,floor;
    var light = new THREE.DirectionalLight(LightColor1, 1);
    
    light.castShadow = true;
    light.shadow.mapSize.width = 512;  // default   
    light.shadow.mapSize.height = 512; // default
    light.shadow.camera.near = 0.5;    // default
    light.shadow.camera.far = 500;     // default
    //var light2 = new THREE.PointLight(0x00ff, 1, 1000);
    //light2.position.set(0, 50, 50);
    
    //scene.add(light2);
    light.shadow.bias = 0.0001

    //light.shadow.camera.top = 1000;
    //light.shadow.camera.bottom = 1000;
    var ambientLight = new THREE.AmbientLight( ambientColor, ambientIntensity );
    scene.add( ambientLight );
    scene.add(light);  
//    let helper = new THREE.CameraHelper ( light.shadow.camera );
//    scene.add( helper );
    sky = new InitSky(SkyExponent1,SkyExponent2,SkyIntensity,
                SkyColor1,SkyColor2,SkyColor3,
                SunColor, SunIntensity,SunAlpha, SunBeta,
                new THREE.Vector3(0,1,0));
    sky.sunPosition(inclination, azimuth);
    light.position.set(sky.SunVector.x,sky.SunVector.y,sky.SunVector.z);
    sky.addToScene(scene);    
    floor = new InitFloor(metalness,roughness);
    floor.addToScene(scene);
}


export function worldBuilder(world,scene)
{
    var ambientColor;
    var ambientIntensity;
    var SkyExponent1;
    var SkyExponent2;
    var SkyIntensity;
    var inclination;
    var azimuth;
    var SkyColor1;
    var SkyColor2;
    var SkyColor3;
    var SunColor;
    var SunAlpha;
    var SunBeta;
    var SunIntensity;
    var LightIntensity1;
    var LightIntensity2;
    var LightColor1;
    var LightColor2;
    var FogColor;
    var FogNear;
    var FogFar;
    var planeColor;
    var metalness;
    var roughness;
    var sky,floor;
    switch(world)
    {

        case 0:
            ambientColor ="#bb00ac";
            ambientIntensity = .3;
            
            SkyExponent1= 2.81;
            SkyExponent2= 1;
            SkyIntensity= 0.96;
            inclination= 0.4314;
            azimuth= 0.25;
             
            SkyColor1= "#ff00c4";
            SkyColor2= "#9500ff";
            SkyColor3= "#0011ff";
             
            SunColor = "#00ffff";
            SunAlpha = 225;
            SunBeta = 40;
            SunIntensity = .345;
            
            LightIntensity1 = 3.7;
            LightIntensity2 = 0.0;
            
            LightColor1 = '#7800ff';
            LightColor2 = '#00ff36';
            
            FogColor = '#8e00f2';
            FogNear = 0;
            FogFar = 150;
             
            planeColor = '#ffffff';
            metalness=0.6;
            roughness = 0.84;
            break;
        case 1:
            ambientColor ="#00ff00";
            ambientIntensity = .3;
            
            SkyExponent1= 1;
            SkyExponent2= 1;
            SkyIntensity= 1;
            inclination= 0.49;
            azimuth= 0.25;
             
            SkyColor1= "#ffff00";
            SkyColor2= "#00ff00";
            SkyColor3= "#0011ff";
             
            SunColor = "#0011ff";
            SunAlpha = 1.0;
            SunBeta = 1.0;
            SunIntensity = .1;
            
            LightIntensity1 = 1.0;
            LightIntensity2 = 1.0;
            
            LightColor1 = '#00ff00';
            LightColor2 = '#00ff36';
            
            FogColor = '#000000';
            FogNear = 10;
            FogFar = 100;
             
            planeColor = '#ffffff';
            metalness=0.0;
            roughness = 0.0;

            break;
    }
    worlder(scene,ambientColor,ambientIntensity,
        SkyExponent1,SkyExponent2,SkyIntensity,inclination,azimuth, 
        SkyColor1,SkyColor2,SkyColor3, 
        SunColor,SunAlpha,SunBeta,SunIntensity,
        LightIntensity1,LightIntensity2,
        LightColor1,LightColor2,
        FogColor,FogNear,FogFar, 
        planeColor,metalness,roughness);
}


export function worldGeometry(world)
{
    worldGeometry = []

    switch(world)
    {
        case 0:
            var geometry = new THREE.BoxGeometry();
            var material = new THREE.MeshStandardMaterial();
            worldGeometry.push({"type" : 1000, "geometry" : geometry,"material" : material,
                                                "geometryController" : geometry,"material":material});
            worldGeometry.push({"type" : 2000, "geometry" : geometry,"material" : material});
            worldGeometry.push({"type" : "controllers", "geometry" : geometry,"material" : material});
        break;
        case 1:
            var geometry = new THREE.SphereGeometry();
            var material = new THREE.MeshStandardMaterial();
            worldGeometry.push({"type" : 1000, "geometry" : geometry,"material" : material,
                                                "geometryController" : geometry,"materialController":material});
            worldGeometry.push({"type" : 2000, "geometry" : geometry,"material" : material});
            worldGeometry.push({"type" : "controllers", "geometry" : geometry,"material" : material});
        
        break;
    }
    return worldGeometry;
    
}