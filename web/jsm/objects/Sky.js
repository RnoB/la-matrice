/**
 * @author zz85 / https://github.com/zz85
 *
 * Based on "A Practical Analytic Model for Daylight"
 * aka The Preetham Model, the de facto standard analytic skydome model
 * http://www.cs.utah.edu/~shirley/papers/sunsky/sunsky.pdf
 *
 * First implemented by Simon Wallner
 * http://www.simonwallner.at/projects/atmospheric-scattering
 *
 * Improved by Martin Upitis
 * http://blenderartists.org/forum/showthread.php?245954-preethams-sky-impementation-HDR
 *
 * Three.js integration by zz85 http://twitter.com/blurspline
*/



import "../../js/three.min.js";

var Sky = function () {

	var shader = Sky.SkyShader;

	var material = new THREE.ShaderMaterial( {
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: THREE.UniformsUtils.clone( shader.uniforms ),
		side: THREE.BackSide,
		depthWrite: false
	} );

	THREE.Mesh.call( this, new THREE.BoxBufferGeometry( 1, 1, 1 ), material );

};

Sky.prototype = Object.create( THREE.Mesh.prototype );

Sky.SkyShader = {

	uniforms: {
		"SkyColor1": { value: new THREE.Color( 1, 1, 0 ) },
		"SkyColor2": { value: new THREE.Color( 0, 1, 0 ) },
		"SkyColor3": { value: new THREE.Color( 0, 1, 1 ) },
		"sunPosition": { value: new THREE.Vector3() },
		"up": { value: new THREE.Vector3( 0, 1, 0 ) },
		"SkyExponent1": { value: 0.8 },
		"SkyExponent2": { value: 0.2 },
		"SkyIntensity": { value: 1.0 }

	},

	vertexShader: [


		'varying vec3 vWorldPosition;',



		'void main() {',

		'	vec4 worldPosition = modelMatrix * vec4( position, 1.0 );',
		'	vWorldPosition = worldPosition.xyz;',

		'	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );',
		'	gl_Position.z = gl_Position.w;', // set z to camera.far

		'}'
	].join( '\n' ),

	fragmentShader: [
		'varying vec3 vWorldPosition;',


		'uniform vec3 SkyColor1;',
		'uniform vec3 SkyColor2;',
		'uniform vec3 SkyColor3;',
		'uniform float mieDirectionalG;',
		'uniform float colorR;',
		'uniform float colorG;',
		'uniform float colorB;',
		'uniform vec3 up;',
		'uniform float SkyExponent1;',
		'uniform float SkyExponent2;',
		'uniform float SkyIntensity;',

		'const vec3 cameraPos = vec3( 0.0, 0.0, 0.0 );',

		// constants for atmospheric scattering
		'const float pi = 3.141592653589793238462643383279502884197169;',

	
		'void main() {',

		'	vec3 direction = normalize( vWorldPosition - cameraPos );',


		
		'   vec3 SunColor = vec3(1.0,1.0,0.2);',
		'   vec3 SunVector = up;',
		'   float SunAlpha = 1.0;',
		'   float SunBeta = 1.0;',
		'   float SunIntensity = 1.0;',
		

		'	float p = direction.y;',
		'	float p1 = 1.0 - pow(min(1.0, 1.0 - p), SkyExponent1);',
		'	float p3 = 1.0 - pow(min(1.0, 1.0 + p), SkyExponent2);',
		'	float p2 = 1.0 - p1 - p3;',

		'	vec3 c_sky = SkyColor1 * p1 + SkyColor2 * p2 + SkyColor3 * p3;',
		'	vec3 c_sun = SunColor * min(pow(max(0.0, dot(direction, SunVector)), SunAlpha) * SunBeta, 1.0);',
		// optical length
		// cutoff angle at 90 to avoid singularity in next formula.
		'	float zenithAngle = acos( max( 0.0, dot( up, direction ) ) );',


		'	vec3 retColor =c_sky * SkyIntensity + c_sun * SunIntensity;',

		'	gl_FragColor = vec4( retColor, 1.0 );',

		'}'
	].join( '\n' )

};

export { Sky };
