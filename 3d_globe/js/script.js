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

//setUp() 



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

// stary space
const loader = new THREE.CubeTextureLoader();
const space_texture = loader.load([
	'resources/space_cubemap/stars.png',
	'resources/space_cubemap/stars.png',
	'resources/space_cubemap/stars.png',
	'resources/space_cubemap/stars.png',
	'resources/space_cubemap/stars.png',
	'resources/space_cubemap/stars.png',
]);
scene.background = space_texture;
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// generate globe
const globe_geometry = new THREE.SphereGeometry(20, 100, 100);
const globe_texture = new THREE.TextureLoader().load('resources/blue_marble/aug.jpg');
const globe_material = new THREE.MeshStandardMaterial({ map: globe_texture });
const globe_sphere = new THREE.Mesh(globe_geometry, globe_material);
scene.add(globe_sphere);
// generate cloud layer
const cloud_geometry = new THREE.SphereGeometry(20.1, 100, 100);
const cloud_texture = new THREE.TextureLoader().load('resources/layers/cloud.jpg');
const cloud_material = new THREE.MeshStandardMaterial({ map: cloud_texture, transparent: true, opacity: 0.2 });
const cloud_sphere = new THREE.Mesh(cloud_geometry, cloud_material);
scene.add(cloud_sphere);

//lights
const light = new THREE.PointLight(0xffffff, 1.4, 0, 2); // sun sim
scene.add(light);
const amb_light = new THREE.AmbientLight(0xffffff, 0.2); // soft white light
scene.add(amb_light);

//orbitals
const orbitals = new THREE.Group();
scene.add(orbitals);

//add debris & rotate it
function addDebris(lat,long,alt){
const debris_geometry = new THREE.SphereGeometry(1, 100, 100);
const debris_material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const debris = new THREE.Mesh(debris_geometry, debris_material);
debris.position.set(lat,long, alt);
var debris_angle = 0.00;
orbitals.add(debris);
}
/* function animate_debris() {

	requestAnimationFrame(animate_debris);
	debris_angle += Math.PI / 180;
	debris.position.set(30 * Math.cos(debris_angle), 30 * Math.sin(debris_angle), 0);
	renderer.render(scene, camera);

}
animate_debris();*/


//satellite import
var my_satellite;

const object_loader = new GLTFLoader();

object_loader.load(
	'resources/3d_models/satellite/10477_Satellite_v1_L3.glb',
	function (gltf) {

		console.log('GLTF Loaded');
		my_satellite = gltf.scene.getObjectByName('10477_Satellite_v1_SG');;
		function animate_satellite() {

			requestAnimationFrame(animate_satellite);
			satellite_angle += Math.PI / 180;
			my_satellite.position.set(25 * Math.cos(satellite_angle), 0, 25 * Math.sin(satellite_angle));
			renderer.render(scene, camera);

		}
		orbitals.add(my_satellite);
		my_satellite.scale.set(0.001, 0.001, 0.001);
		my_satellite.position.set(25, 0, 25);
		//animate_satellite();


	},
	// called while loading is progressing
	function (xhr) {

		console.log((xhr.loaded / xhr.total * 100) + '% loaded');

	},
	// called when loading has errors
	function (error) {

		console.log('An error happened');

	}
);

//orbit generator
const material = new THREE.LineBasicMaterial({
	color: 0x0000ff
});

const points = [];
const resolution = 10000;
const a = 30;
const b = 30;
for (let i = 0; i <= resolution; i++) {
	points.push(new THREE.Vector3(a * Math.cos(2 * Math.PI * i / resolution), b * Math.sin(2 * Math.PI * i / resolution), 0));
}

const geometry = new THREE.BufferGeometry().setFromPoints(points);

const line = new THREE.Line(geometry, material);
scene.add(line);

console.log('afin');
//camera mouse control and init pos
const controls = new OrbitControls(camera, renderer.domElement);
controls.zoomSpeed = 0.5;
controls.rotateSpeed = 0.5;
camera.position.z = 50;
camera.position.y = 0;
camera.position.x = 0;
var sun_angle = 0.00;
var satellite_angle = 0.00;

function animate() {

	requestAnimationFrame(animate);


	sun_angle += (2 / (60 * 86400)) * Math.PI;
	light.position.set(5000 * Math.cos(sun_angle), 0, 5000 * Math.sin(sun_angle));

	renderer.render(scene, camera);

}
animate();


// on hover thingz
let INTERSECTED;
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2().set(100, 100);
const mouse_adapted = new THREE.Vector2().set(100, 100);
function onMouseMove(event) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	document.getElementById('tooltip').style.left = mouse.x + 'px';
	document.getElementById('tooltip').style.top = mouse.y + 'px';
	mouse.x = event.clientX;
	mouse.y = event.clientY;
	mouse_adapted.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse_adapted.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function render() {
	requestAnimationFrame(render);

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera(mouse_adapted, camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(orbitals.children);

	if (intersects.length > 0) {
		// on hover
		if (INTERSECTED != intersects[0].object) {
			if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
			// highlight
			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
			INTERSECTED.material.emissive.setHex(0xffff00);
			INTERSECTED.material.emissiveIntensity = 0.4;
			// coordinates tooltip
			document.getElementById('tooltip').innerHTML = "X : " + INTERSECTED.position.x.toString() + "<br> Y : " + INTERSECTED.position.y.toString() + "<br> Z : " + INTERSECTED.position.z.toString();
			document.getElementById('tooltip').style.display = 'block';
		}
		else {
			document.getElementById('tooltip').innerHTML = "X : " + INTERSECTED.position.x.toString() + "<br> Y : " + INTERSECTED.position.y.toString() + "<br> Z : " + INTERSECTED.position.z.toString();
		}
	}
	//on leave 
	else {
		// highlight
		if (INTERSECTED) {
			INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
			//coordinates tooltip
			document.getElementById('tooltip').style.display = 'none';
		}
		INTERSECTED = null;
	}
	renderer.render(scene, camera);
}

window.addEventListener('mousemove', onMouseMove, false);

render();

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

// POV switch
/* function follow_debris(){
	requestAnimationFrame(follow_debris);
	camera.position.z = my_satellite.position.z;
	camera.position.x = my_satellite.position.x;
	camera.position.y = my_satellite.position.y;
}
follow_debris(); */


