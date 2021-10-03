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

const getColliding = (client, tracked, date, longitude, latitude) => {
	let myTree = new Quadtree({
		x: 0,
		y: 0,
		width: 20,
		height: 20
	}, 4);
	for (let i = 0; i < tracked; i++) {
		const obj = {
			catalogNumber: tracked[i].catalogNumber,
			x: tracked[i].longitude - 20,
			y: tracked[i].latitude + 40,
			width: 1,
			height: 1
		}
		myTree.insert(obj)
	}
	const myCursor = {
		x: longitude - 20,
		y: latitude + 40,
		width: 20,
		height: 20
	}

	const candidates = myTree.retrieve(myCursor);
	return candidates.map(candidate => candidate.catalogNumber)
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