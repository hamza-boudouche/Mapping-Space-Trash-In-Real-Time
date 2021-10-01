require("dotenv").config();
const axios = require('axios').default;
const spacetrack = require('spacetrack');
const satellite = require('satellite.js');
const redis = require('async-redis')

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
	console.log(body)
	return body.split('\r\n');
}

const getPosAndVel = async (catalogNumber, date) => {
	const [line1, line2] = await getTle(catalogNumber)
	console.log([line1, line2])
	const satrec = satellite.twoline2satrec(line1, line2);
	const positionAndVelocity = satellite.propagate(satrec, date);
	const positionEci = positionAndVelocity.position;
	const velocityEci = positionAndVelocity.velocity;
	const gmst = satellite.gstime(date);
	positionGd = satellite.eciToGeodetic(positionEci, gmst);
	const longitude = positionGd.longitude;
	const latitude = positionGd.latitude;
	const height = positionGd.height;

	return {
		longitude,
		latitude,
		height,
		velocityEci,
	}
}

module.exports = { getPosAndVel, getObjects }