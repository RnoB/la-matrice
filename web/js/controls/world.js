import { Sky } from '../../jsm/objects/Sky.js';

export class InitSky
{

    constructor(turbidity=10,rayleigh=2,mieCoefficient = 0.005,
        mieDirectionalG=0.8 ,luminance=1,inclination=0.49 ,azimuth=0.25 ,
        colorR =5, colorG =0.098,colorB = 4.81, sun =!true)
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

        this.updateShader();
    }


    addToScene(scene)
    {
        console.log(scene);
        console.log(this.sky)
        scene.add(this.sky);
        scene.add(this.sunSphere);
    }

    updateShader()
    {
        console.log("here");
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