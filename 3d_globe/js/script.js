import { OrbitControls } from "./OrbitControls.js"
import { GLTFLoader } from "./GLTFLoader.js"
import { Object3D, Vector3 } from "./three.module.js";

const scene = new THREE.Scene();

const initialNum = 10
const currentState = {
	allDebris: [],
	selectedDebris: null, // last clicked on debris
	searchedDebris: [],
}

const fetchRandomDebris = async (count) => {
	const res = await fetch(`https://emicatronic.com/api/objects/${count}`)
	const objects = await res.json()
	return objects
}
var DebrisArray = fetchRandomDebris(185);
var DebrisCoords = DebrisArray.forEach(debris => addDebris(debris.latitude,debris.longitude,debris.altitude));
const fetchDebrisData = async (catalogNumber, date = new Date()) => {
	const res = await fetch(`https://emicatronic.com/api/orbit/${catalogNumber}/${date}`)
	const data = await res.json()
	return data
}

const autoSuggest = async (query) => {
	const res = await fetch(`https://emicatronic.com/api/objects/autoSuggest/${query}`)
	const data = await res.json()
	return data
}

const search = async (query) => {
	const res = await fetch(`https://emicatronic.com/api/objects/search/${query}`)
	const data = await res.json()
	return data
}

const renderInfo = () => {
	// get html elements by id 
	// render info
}

const onSubmitSearch = (e) => {
	e.preventDefault()
	const searchQuery = document.getElementById('searchField')
	const debris = search(searchQuery)
	currentState.searchedDebris = debris
}

const onChangeSearch = (e) => {
	const searchQuery = document.getElementById('searchField')
	const debris = autoSuggest(searchQuery)
	currentState.searchedDebris = debris
}

const setUp = async () => {
	currentState.selectedDebris = await fetchRandomDebris(initialNum)
	currentDebris = currentState.selectedDebris[0]
}

/*setUp() 



const myTree = new Quadtree({
	x: 0,
	y: 0,
	width: 400,
	height: 300
});

const myObjects = [];

for (var i = 0; i < 200; i = i + 1) {
	myObjects.push({
		x: randMinMax(0, 640),
		y: randMinMax(0, 480),
		width: randMinMax(10, 20),
		height: randMinMax(10, 20),
		vx: randMinMax(-0.5, 0.5),
		vy: randMinMax(-0.5, 0.5),
		check: false
	});
}

function loop() {
	//remove all objects and subnodes 
	myTree.clear();
	//update myObjects and insert them into the tree again
	for (var i = 0; i < myObjects.length; i = i + 1) {
		myObjects[i].x += myObjects[i].vx;
		myObjects[i].y += myObjects[i].vy;
		myTree.insert(myObjects[i]);
	}
	//call next frame
	requestAnimationFrame(loop);
}

var myCursor = {
	x: mouseX,
	y: mouseY,
	width: 20,
	height: 20
};

var candidates = myTree.retrieve(myCursor);

const toCheck = []

for (var i = 0; i < candidates.length; i = i + 1) {
	candidates[i]
}
*/
import {OrbitControls} from "./OrbitControls.js"
import {GLTFLoader} from "./GLTFLoader.js"
import { Object3D, Vector3 } from "./three.module.js";


class BlueMarble {

constructor(withSun,withClouds,withGrid){
	this.scene.background = this.space_texture;
	this.renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( this.renderer.domElement );
	this.controls.zoomSpeed=0.5;
this.controls.rotateSpeed=0.5;  
	this.scene.add( this.globe_sphere );
	this.scene.add( this.amb_light );
	this.scene.add(this.orbitals);
	this.scene.add(this.orbits);
	if (withClouds) this.scene.add( this.cloud_sphere );
	if(withSun)	{
		this.light.position.set(5000,0,5000);
		this.scene.add( this.light );
		this.sun_animate();		
			}
		this.animate();
		
	}
scene = new THREE.Scene();
camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
renderer = new THREE.WebGLRenderer();
orbitals = new THREE.Group();
orbits = new THREE.Group();
addOrbital(object){
	this.orbitals.add(object);
}
addOrbit(object){
	this.orbits.add(object);
}
removeOrbital(object){
	this.orbitals.remove(object);
}
removeOrbit(object){
	this.orbits.remove(object);
}



// generate globe
globe_geometry = new THREE.SphereGeometry( 20, 100, 100 );
globe_texture = new THREE.TextureLoader().load( 'resources/blue_marble/aug.jpg' );
globe_material = new THREE.MeshStandardMaterial( { map: this.globe_texture } );
globe_sphere = new THREE.Mesh( this.globe_geometry, this.globe_material );
// generate cloud layer
cloud_geometry = new THREE.SphereGeometry( 20.1, 100, 100 );
cloud_texture = new THREE.TextureLoader().load( 'resources/layers/cloud.jpg' );
cloud_material = new THREE.MeshStandardMaterial( { map: this.cloud_texture ,transparent:true,opacity:0.2} );
cloud_sphere = new THREE.Mesh( this.cloud_geometry, this.cloud_material );
//sun & lights	
light = new THREE.PointLight( 0xffffff,1.4 , 0 ,2); // sun sim

amb_light = new THREE.AmbientLight( 0xffffff,0.2 ); // soft white light
// stary space
loader = new THREE.CubeTextureLoader();
space_texture = this.loader.load([
  'resources/space_cubemap/stars.png',
  'resources/space_cubemap/stars.png',
  'resources/space_cubemap/stars.png',
  'resources/space_cubemap/stars.png',
  'resources/space_cubemap/stars.png',
  'resources/space_cubemap/stars.png',
]);
//camera mouse control and init pos
controls = new OrbitControls( this.camera, this.renderer.domElement );

animate = () =>  {
	requestAnimationFrame( this.animate );
	this.renderer.render( this.scene, this.camera );
}
sun_angle = 0;
sun_animate = () => {
	requestAnimationFrame( this.sun_animate );
    this.sun_angle += (2/360)* Math.PI;
    this.light.position.set( 5000*Math.cos(this.sun_angle), 0, 5000*Math.sin(this.sun_angle) );

}


}

class Orbit extends THREE.Line{
constructor(res,color){
	super();
	this.color=color;

	for (let i=0;i<=res;i++){
		this.points.push( new THREE.Vector3(40*Math.cos(2*Math.PI*i/res), 40*Math.sin(2*Math.PI*i/res),0) );
		}
		this.material = new THREE.LineBasicMaterial({color: color});
		this.geometry = new THREE.BufferGeometry().setFromPoints( this.points );
		
}

points = [];


}

class Debris extends THREE.Mesh{
	constructor(pos,color){
			super();
			this.setPosition(modelCoords(pos));
			this.color=color;
			this.geometry = new THREE.SphereGeometry( 0.05, 1, 2 );
			this.material = new THREE.MeshStandardMaterial( { color: this.color } ) ;
			this.orbit = new Orbit(1000,this.color);			
		}

setPosition = (vect) => {
	this.position.set(vect.x,vect.y,vect.z);
}

}

var myMarble = new BlueMarble(true,true,true);
myMarble.camera.position.z = 80;

myMarble.addOrbital(new Debris([0.593412,0.10472,6371],0xffff00));
myMarble.addOrbital(new Debris([0.20943951,-0.139626,6371],0xff0000));

// Tooltip
let INTERSECTED;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2().set(100,100);
const mouse_adapted = new THREE.Vector2().set(100,100);
function onMouseMove( event ) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	document.getElementById('tooltip').style.left =mouse.x+2+'px' ;
	document.getElementById('tooltip').style.top=mouse.y+2+'px' ;
	mouse.x = event.clientX ;
	mouse.y = event.clientY;
	mouse_adapted.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse_adapted.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function render() {
	requestAnimationFrame(render);
	
	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera( mouse_adapted, myMarble.camera );

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects( myMarble.orbitals.children );


	if ( intersects.length > 0 ) {

			
		// on hover
		if ( INTERSECTED != intersects[ 0 ].object ) {

			if ( INTERSECTED ) {INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex )
			myMarble.removeOrbit(INTERSECTED.orbit);}
			;

			 // highlight
			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			
			INTERSECTED.material.emissive.setHex( 0xffff00 );
			INTERSECTED.material.emissiveIntensity =0.4;
			// coordinates tooltip
			document.getElementById('tooltip').innerHTML = "X : "+INTERSECTED.position.x.toString() +"<br> Y : "+INTERSECTED.position.y.toString()+ "<br> Z : "+INTERSECTED.position.z.toString();

			document.getElementById('tooltip').style.display = 'block';		
			myMarble.addOrbit(INTERSECTED.orbit);

		}
		else {	
			document.getElementById('tooltip').innerHTML = "X : "+INTERSECTED.position.x.toString() +"<br> Y : "+INTERSECTED.position.y.toString()+ "<br> Z : "+INTERSECTED.position.z.toString();
			
			
		}

	} 
				//on leave 
		else {
			// highlight
			if ( INTERSECTED ) {INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );
			//coordinates tooltip
			document.getElementById('tooltip').style.display = 'none';	
			myMarble.removeOrbit(INTERSECTED.orbit);
		}
		INTERSECTED = null;

	}


}
window.addEventListener( 'mousemove', onMouseMove, false );

render();

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}
window.addEventListener( 'resize', onWindowResize );

function modelCoords(realCoords){
	var x,y,z;
	var prop =  (realCoords[2]/6371)*20;
	y= Math.sin(realCoords[0]) * prop;
	var intr = Math.abs(Math.cos(realCoords[0]) * prop);
	x= intr * Math.cos(realCoords[1]+0.015);
	z= intr * Math.sin(realCoords[1]+0.015);

return(new THREE.Vector3(x,y,z));
}


/*
//satellite import
var my_satellite;

const object_loader = new GLTFLoader();

object_loader.load(
	'resources/3d_models/satellite/10477_Satellite_v1_L3.glb',
	function ( gltf ) {

				console.log('GLTF Loaded');
				my_satellite = gltf.scene.getObjectByName('10477_Satellite_v1_SG');;
				function animate_satellite() {

							requestAnimationFrame( animate_satellite );
						satellite_angle+= Math.PI/180;
						my_satellite.position.set( 25*Math.cos(satellite_angle), 0, 25*Math.sin(satellite_angle) );
							renderer.render( scene, camera );

				}
			orbitals.add(my_satellite);
				my_satellite.scale.set(0.001,0.001,0.001);
				my_satellite.position.set(25,0,25);
			//animate_satellite();
				

	},
	// called while loading is progressing
	function ( xhr ) {

		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	},
	// called when loading has errors
	function ( error ) {

		console.log( 'An error happened' );

	}
);


camera.position.z = 80;
camera.position.y = 0;
camera.position.x = 0;
var sun_angle =   0.00;
var satellite_angle =   0.00;






// POV switch
/* function follow_debris(){
	requestAnimationFrame(follow_debris);
	camera.position.z = my_satellite.position.z;
	camera.position.x = my_satellite.position.x;
	camera.position.y = my_satellite.position.y;

}
follow_debris(); */


