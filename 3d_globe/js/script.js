import { OrbitControls } from "./OrbitControls.js"
import { GLTFLoader } from "./GLTFLoader.js"
import { Object3D, Vector3 } from "./three.module.js";

const initialNum = 10
const currentState = {
	allDebris: [],
	selectedDebris: null, // last clicked on debris
	searchedDebris: [],
	suggestions: [],
}

const fetchRandomDebris = async (count) => {
	console.log('fetching ...')
	const res = await fetch(`http://localhost:5001/api/objects/${count}`)
	const objects = await res.json()
	console.log('done')
	return objects
}
/* var DebrisArray = fetchRandomDebris(50);

var DebrisCoords = DebrisArray.map(debris => {

	let coord = fetchDebrisData(debris.catalogNumber,new Date());
	return({...debris,...coord})

});
currentState.allDebris = DebrisCoords;*/

const fetchDebrisData = async (catalogNumber, date = new Date()) => {
	const res = await fetch(`http://localhost:5001/api/orbit/${catalogNumber}/${date}`)
	const data = await res.json()
	return data
}

const autoSuggest = async (query) => {
	const res = await fetch(`http://localhost:5001/api/objects/autoSuggest/${query}`)
	const data = await res.json()
	return data
}

const search = async (query) => {
	const res = await fetch(`http://localhost:5001/api/objects/search/${query}`)
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

// for (var i = 0; i < 200; i = i + 1) {
// 	myObjects.push({
// 		x: randMinMax(0, 640),
// 		y: randMinMax(0, 480),
// 		width: randMinMax(10, 20),
// 		height: randMinMax(10, 20),
// 		vx: randMinMax(-0.5, 0.5),
// 		vy: randMinMax(-0.5, 0.5),
// 		check: false
// 	});
// }

// function loop() {
// 	//remove all objects and subnodes 
// 	myTree.clear();
// 	//update myObjects and insert them into the tree again
// 	for (var i = 0; i < myObjects.length; i = i + 1) {
// 		myObjects[i].x += myObjects[i].vx;
// 		myObjects[i].y += myObjects[i].vy;
// 		myTree.insert(myObjects[i]);
// 	}
// 	//call next frame
// 	requestAnimationFrame(loop);
// }

// var myCursor = {
// 	x: mouseX,
// 	y: mouseY,
// 	width: 20,
// 	height: 20
// };

// var candidates = myTree.retrieve(myCursor);

// const toCheck = []

// for (var i = 0; i < candidates.length; i = i + 1) {
// 	candidates[i]
// }

const fetchRandomDebrisCoords = async (objects) => {
	const res = Promise.all(objects.map(obj => fetchDebrisData(obj.catalogNumber, new Date())))
	return res
}

const checkForProbableCollissions = (objectsWithCoords) => {
	const myTree = new Quadtree({
		x: 0,
		y: 0,
		width: 400,
		height: 300
	});
}
*/


class BlueMarble {

	constructor(withSun, withClouds, withGrid) {
		//this.scene.background = this.space_texture;
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		document.body.appendChild(this.renderer.domElement);
		this.controls.zoomSpeed = 0.5;
		this.controls.rotateSpeed = 0.5;
		this.globe.add(this.globe_sphere);
		this.globe.add(this.morocco_sphere);
		this.scene.add(this.amb_light);
		this.scene.add(this.orbits);
		if (withClouds) this.globe.add(this.cloud_sphere);
		if (withSun) {
			this.light.position.set(5000, 0, 5000);
			this.scene.add(this.light);

		}
		this.scene.add(this.globe);
		this.animate();
	}
	selected = false;
	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
	renderer = new THREE.WebGLRenderer();
	globe = new THREE.Group();
	orbitals = new THREE.Group();
	orbits = new THREE.Group();
	addOrbital(object) {
		this.orbitals.add(object);
	}
	addOrbit(object) {
		this.orbits.add(object);
	}
	removeOrbital(object) {
		this.orbitals.remove(object);
	}
	removeOrbit(object) {
		this.orbits.remove(object);
	}



	// generate globe
	globe_geometry = new THREE.SphereGeometry(20, 100, 100);
	globe_texture = new THREE.TextureLoader().load('resources/blue_marble/aug.jpg');
	globe_material = new THREE.MeshStandardMaterial({ map: this.globe_texture });
	globe_sphere = new THREE.Mesh(this.globe_geometry, this.globe_material);
	// generate cloud layer
	cloud_geometry = new THREE.SphereGeometry(20.1, 100, 100);
	cloud_texture = new THREE.TextureLoader().load('resources/layers/cloud.jpg');
	cloud_material = new THREE.MeshStandardMaterial({ map: this.cloud_texture, transparent: true, opacity: 0.2 });
	cloud_sphere = new THREE.Mesh(this.cloud_geometry, this.cloud_material);
	morocco_geometry = new THREE.SphereGeometry(20.1, 100, 100);
	morocco_texture = new THREE.TextureLoader().load('resources/layers/morocco_layer.png');
	morocco_material = new THREE.MeshStandardMaterial({ map: this.morocco_texture, transparent: true,opacity:0.8});
	morocco_sphere = new THREE.Mesh(this.morocco_geometry, this.morocco_material);
	//sun & lights	
	light = new THREE.PointLight(0xffffff, 1.4, 0, 2); // sun sim

	amb_light = new THREE.AmbientLight(0xffffff, 0.2); // soft white light
	// stary space
	//loader = new THREE.CubeTextureLoader();
	/*space_texture = this.loader.load([
		'resources/space_cubemap/stars.png',
		'resources/space_cubemap/stars.png',
		'resources/space_cubemap/stars.png',
		'resources/space_cubemap/stars.png',
		'resources/space_cubemap/stars.png',
		'resources/space_cubemap/stars.png',
	]);*/
	//camera mouse control and init pos
	controls = new OrbitControls(this.camera, this.renderer.domElement);

	animate = () => {
		requestAnimationFrame(this.animate);
		this.renderer.render(this.scene, this.camera);
	}
	sun_angle = 0;
	sun_animate = () => {
		requestAnimationFrame(this.sun_animate);
		this.sun_angle += (2 / 360) * Math.PI;
		this.light.position.set(5000 * Math.cos(this.sun_angle), 0, 5000 * Math.sin(this.sun_angle));

	}

	earthRot = () => {
		requestAnimationFrame(this.earthRot);
		this.globe.rotation.y += 0.01;


	}
	entrance = () => {
		requestAnimationFrame(this.entrance);

		if (this.globe.position.x > 0) { this.globe.position.x -= 0.25; this.camera.position.z += 0.1; this.globe.rotation.y += 0.04; }
		else (this.scene.add(this.orbitals))

	}

}

class Orbit extends THREE.Line {
	constructor(apo, per, color) {
		super();
		this.color = color;
		this.curve = new THREE.EllipseCurve(
			10 * ((apo + 6371) - (per + 6371)) / 6371, 0,            // ax, aY
			10 * ((apo + 6371) + (per + 6371)) / 6371, Math.sqrt((apo + 6371) * (per + 6371)) * 20 / 6371,              // xRadius, yRadius
			0, 2 * Math.PI,  // aStartAngle, aEndAngle
			false,            // aClockwise
			0                 // aRotation
		);
		this.points = this.curve.getPoints(1000);

		this.material = new THREE.LineBasicMaterial({ color: color });
		this.geometry = new THREE.BufferGeometry().setFromPoints(this.points);

	}

	points = [];


}

class Debris extends THREE.Mesh {
	constructor(data, color) {
		super();
		this.data = data
		this.color = color;
		this.geometry = new THREE.SphereGeometry(0.05, 1, 2);
		this.material = new THREE.MeshStandardMaterial({ color: this.color });
		this.orbit = new Orbit(Number(this.data.apogee),Number( this.data.perigee), this.color);
		this.orbit.rotation.x += Math.PI / 2;
		//rotation

	}

	init = () => {
		this.setPosition();
		this.velocity = satellite.propagate(satellite.twoline2satrec(this.data.firstLine, this.data.secondLine), new Date()).velocity;
		this.velocity = Math.sqrt(this.velocity.x ** 2 + this.velocity.y ** 2 + this.velocity.z ** 2);
	}

	setPosition = () => {
		const vect = modelCoords(satellite.propagate(satellite.twoline2satrec(this.data.firstLine, this.data.secondLine), new Date()))
		// console.log('///')
		// console.log(vect)
		this.position.set(vect.x, vect.y, vect.z);
	}

}

// function calc(apo, per) {
// 	console.log(10 * ((apo + 6371) + (per + 6371)) / 6371); console.log(Math.sqrt((apo + 6371) * (per + 6371)) * 20 / 6371)
// }
// calc(10051, 5);


function onMouseMove(event, mouse, mouse_adapted) {

	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	document.getElementById('tooltip').style.left = mouse.x + 2 + 'px';
	document.getElementById('tooltip').style.top = mouse.y + 2 + 'px';
	mouse.x = event.clientX;
	mouse.y = event.clientY;
	mouse_adapted.x = (event.clientX / window.innerWidth) * 2 - 1;
	mouse_adapted.y = - (event.clientY / window.innerHeight) * 2 + 1;
}

function render(raycaster, mouse_adapted, myMarble, INTERSECTED) {
	requestAnimationFrame(() => render(raycaster, mouse_adapted, myMarble, INTERSECTED));

	// update the picking ray with the camera and mouse position
	raycaster.setFromCamera(mouse_adapted, myMarble.camera);

	// calculate objects intersecting the picking ray
	const intersects = raycaster.intersectObjects(myMarble.orbitals.children);


	if (intersects.length > 0) {


		// on hover
		if (INTERSECTED != intersects[0].object) {

			if (INTERSECTED) {
				INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
				if (!INTERSECTED.selected) myMarble.removeOrbit(INTERSECTED.orbit)
			}


			// highlight
			INTERSECTED = intersects[0].object;
			INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();

			INTERSECTED.material.emissive.setHex(0xffff00);
			INTERSECTED.material.emissiveIntensity = 0.4;
			// coordinates tooltip
			document.getElementById('tooltip').innerHTML = INTERSECTED.data.name + " " + INTERSECTED.data.intlDesignator;

			document.getElementById('tooltip').style.display = 'block';
			myMarble.addOrbit(INTERSECTED.orbit);

		}
		else {
			document.getElementById('tooltip').innerHTML = INTERSECTED.data.name + " " + INTERSECTED.data.intlDesignator;
			document.body.style.cursor = "pointer";
		}

	}
	//on leave 
	else {
		// highlight
		if (INTERSECTED) {
			INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
			//coordinates tooltip
			document.getElementById('tooltip').style.display = 'none';
			if (!INTERSECTED.selected) myMarble.removeOrbit(INTERSECTED.orbit);
		}
		INTERSECTED = null;
		document.body.style.cursor = "default";

	}


}

function updateBox(debris) {

	document.getElementById('debris_name').innerHTML = debris.data.name + " " + debris.data.intlDesignator;
	document.getElementById('debris_lDate').innerHTML = debris.data[0];
	document.getElementById('debris_country').innerHTML = debris.data.country;
	document.getElementById('debris_longitude').innerHTML = debris.position[0];
	document.getElementById('debris_latitude').innerHTML = debris.position[1];
	document.getElementById('debris_altitude').innerHTML = debris.position[2];
	document.getElementById('debris_velocity').innerHTML = debris.velocity;


}




//getElementById('').addEventListener( 'onchange', funct1, false );
//getElementById('').addEventListener( 'onchange', funct1, false );

function onWindowResize(event, myMarble) {
	myMarble.camera.aspect = window.innerWidth / window.innerHeight;
	myMarble.camera.updateProjectionMatrix();

	myMarble.renderer.setSize(window.innerWidth, window.innerHeight);

}

function modelCoords(realCoords) {
	console.log(realCoords);
	var x, y, z;

	var prop = ((realCoords.position.z + 6371) / 6371) * 20;
	y = Math.sin(realCoords.position.x) * prop;
	var intr = Math.abs(Math.cos(realCoords.position.x) * prop);
	x = intr * Math.cos(realCoords.position.y + 0.015);
	z = intr * Math.sin(realCoords.position.y + 0.015);
	const res = new THREE.Vector3(x, y, z)
	return res
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
follow_debris(); *//*
(async () => {
	currentState.allDebris = await fetchRandomDebris(200);

*/
var myMarble = new BlueMarble(true, true, true);
myMarble.globe.position.x = 30;
myMarble.camera.position.z = 80;
	// Tooltip
	let INTERSECTED, ACTIVE;
	const raycaster = new THREE.Raycaster();
	const mouse = new THREE.Vector2().set(100, 100);
	const mouse_adapted = new THREE.Vector2().set(100, 100);

	currentState.allDebris.forEach(element => {
		// console.log('---')
		const deb = new Debris(element, 0xff0000)
		deb.init();
		myMarble.addOrbital(deb);
		// console.log(element)
	});
	window.addEventListener('mousemove', (event) => onMouseMove(event, mouse, mouse_adapted), false);
	window.addEventListener('resize', (event) => onWindowResize(event, myMarble));
	window.addEventListener("click", () => {
		if (INTERSECTED) {
			if (ACTIVE && ACTIVE != INTERSECTED) { ACTIVE.selected = false; myMarble.removeOrbit(ACTIVE.orbit); }
			document.getElementById('debris-info').style.display = 'block';
			ACTIVE = INTERSECTED;
			console.log(ACTIVE.color);
			ACTIVE.selected = true;
			updateBox(ACTIVE);
		}
	}
	);
	$(document).ready(
		function () {
			$('.spinner').click(
				function () {
					$('.main').animate({
						left: '-1500px',
						opacity: '0',
					}, 2000);
					$('#menu-btn').show(2000);
					myMarble.entrance();
				}
			);
		}
	);
	render(raycaster, mouse_adapted, myMarble, INTERSECTED);