require("dotenv").config();
const axios = require('axios').default;
const spacetrack = require('spacetrack');
const Quadtree = require('@timohausmann/quadtree-js');

const {
	writeObjectsToCash,
	getObject,
	getObjectsRequest,
	getObjectsRequestExcludes,
	autoSuggest,
	searchByName,
	getPosAndVel,
	getTleFileAndParse,
	parseTle,
	getOrbitAndInfoRequest
} = require('./cash')

spacetrack.login({
	username: process.env.SPACE_TRACK_USERNAME,
	password: process.env.SPACE_TRACK_PASSWORD,
});


const getObjects = async (limit, offset) => {
	const options = {
		controller: 'basicspacedata',
		action: 'query',
		type: 'satcat',
		limit,
		offset,
	};

	const res = await spacetrack.get(options);
	return res;
}

const getTle = async (catalogNumber) => {
	const response = await axios.get(`https://celestrak.com/NORAD/elements/gp.php?CATNR=${catalogNumber}&FORMAT=2LE`)
	const body = response.data;
	if (body === 'No GP data found') {
		console.log(catalogNumber + ' failed')
		return -1;
	}
	const res = body.split('\r\n')
	return [res[0], res[1]];
}



const getColliding = (client, tracked, date) => {
	let myTree = new Quadtree({
		x: 0,
		y: 0,
		width: 15,
		height: 15
	}, 4);
	for (let i = 0; i < tracked; i++) {
		let obj = {
			catalogNumber: tracked[i].catalogNumber,
			x
		}
		myTree.insert()
	}
}

module.exports = {
	getPosAndVel,
	getObjects,
	getTleFileAndParse,
	writeObjectsToCash,
	getObjectsRequest,
	getObjectsRequestExcludes,
	getOrbitAndInfoRequest,
	autoSuggest,
	searchByName,
}