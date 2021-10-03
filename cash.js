const MiniSearch = require('minisearch')
const LineByLineReader = require('line-by-line')
const Readable = require('stream').Readable
const TLE = require('tle')
const satellite = require('satellite.js');
const axios = require('axios').default;
const parser = require('tle-parser').parser

const catalogNumbers = [];
let lnCatalogNumbers = 0;
let miniSearch = null;


const writeObjectsToCash = async (client, objects) => {
	// store array of objects in cash based on catalogNumber
	const _fn = async (object) => {
		await client.set(object.catalogNumber, JSON.stringify(object))
		// store catalog numbers in array for easy access (looping throught objects)
		// catalogNumbers.push(object.catalogNumber)
		// object.id = object.catalogNumber
		// keeps track of count of objects
		// lnCatalogNumbers++
	}
	for (let i = 0; i < objects.length; i++) {
		await _fn(objects[i])
	}
	// console.log(lnCatalogNumbers)
	objects.forEach((object) => {
		object.id = object.catalogNumber
	});
	// create new MiniSearch obj
	miniSearch = new MiniSearch({
		fields: ['name', 'intlDesignator', 'catalogNumber'],
		storeFields: ['name', 'intlDesignator', 'catalogNumber', 'type', 'country']
	})
	// add all objects in miniSearch 
	miniSearch.addAll(objects)
	console.log('done caching')
}

const getObject = async (client, catalogNumber) => {
	// get object stored in cash based on catalogNumber (unique)
	const objectString = await client.get(catalogNumber)
	if (objectString) {
		// if exists parse string representing the object
		return JSON.parse(objectString)
	}
}

const getObjectsRequest = async (client, count = 20) => {
	// idea:
	// while still doesn't have a full `count` generated objects: 
	// 		generate random number 
	//    find out catalogNumber of it
	//    find out if it has GP data
	//        if so add it to array to return
	//        if not skip

	// check if catalogNumbers array is populated
	console.log(`lnCatalogNumber: ${lnCatalogNumbers}`)
	if (lnCatalogNumbers === 0) {
		return
	}
	// if so generate array of length:count and that contains random integers between 0 and lnCatalogNumbers 
	const res = []
	const prev = []
	while (res.length < count) {
		let r = -1
		do {
			r = Math.floor(Math.random() * lnCatalogNumbers);
			if (prev.indexOf(r) != -1) {
				r = -1;
			}
		} while (r == -1);
		const obj = await getOrbitAndInfoRequest(client, catalogNumbers[r])
		// const objWithGP = await getOrbitAndInfoRequest(client, obj.catalogNumber, new Date())
		if (obj !== -1) {
			res.push(obj)
			prev.push(r)
		}
		// res.push(obj)
		// prev.push(r)
	}

	return res
	// const randomCatalogNumbersIndex = []
	// while (randomCatalogNumbersIndex.length < count) {
	// 	let r = Math.floor(Math.random() * lnCatalogNumbers);
	// 	if (randomCatalogNumbersIndex.indexOf(r) === -1) randomCatalogNumbersIndex.push(r);
	// }
	// // retreive objects for which indexes are equal to previous random numbers (stored in cash for better speed and for persisting storage)
	// const objects = Promise.all(randomCatalogNumbersIndex.map(async (r) => {
	// 	const obj = await getObject(client, catalogNumbers[r])
	// 	// construct result array (objects doesn't have to contain all available data)

	// 	return resInt
	// }))
	// return objects
}

const getObjectsRequestExcludes = async (client, count, existing) => {
	if (lnCatalogNumbers === 0) {
		return
	}

	const res = []
	const prev = []
	while (res.length < count) {
		let r = -1
		do {
			r = Math.floor(Math.random() * lnCatalogNumbers);
			if (prev.indexOf(r) != -1) {
				r = -1;
			}
		} while (r == -1);
		const obj = await getObject(client, catalogNumbers[r])
		if (existing.indexOf(obj.catalogNumber) != -1) {
			prev.push(r)
			continue
		}
		const objWithGP = await getOrbitAndInfoRequest(client, obj.catalogNumber, new Date())
		if (objWithGP !== -1) {
			res.push(obj)
			prev.push(r)
		}
	}
	// const toReturn = res.map(obj => {
	// 	const objTrunk = {
	// 		name: obj.name,
	// 		intlDesignator: obj.intlDesignator,
	// 		catalogNumber: obj.catalogNumber,
	// 		type: obj.type,
	// 		country: obj.country,
	// 	}
	// 	return objTrunk
	// })
	return res
}

const getTle = async (catalogNumber) => {
	const response = await axios.get(`https://celestrak.com/NORAD/elements/gp.php?CATNR=${catalogNumber}&FORMAT=2LE`)
	console.log('requested celestrak ' + catalogNumber)
	const body = response.data;
	if (body === 'No GP data found') {
		console.log(catalogNumber + ' failed')
		return -1;
	}
	const res = body.split('\r\n')
	return [res[0], res[1]];
}

const autoSuggest = (query) => {
	// get auto suggestions using miniSearch
	// fuzzy attribute forgives small typos
	const res = miniSearch.autoSuggest(`${query}`, { fuzzy: 0.2 })
	return res
}

const searchByName = (query) => {
	const res = miniSearch.search(`${query}`)
	return res
}

const getPosAndVel = async (catalogNumber, date) => {
	const tle = await getTle(catalogNumber)
	if (tle === -1) {
		return -1;
	}
	return parseTle(tle, date)
}

const parseTle = ([line1, line2], date) => {
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

const getTleFileAndParse = async (client, link) => {
	let response = await axios.get(link)
	let s = new Readable()
	s.push(response.data)
	s.push(null)

	let lr = new LineByLineReader(s);
	let [line1, line2, line3] = ['.', '.', '.'];
	lr.on('line', async (line) => {
		// pause emitting of lines...
		// console.log(line)
		lr.pause();
		console.log(`[${line1},${line2},${line3}]`)
		// ...do your asynchronous line processing..
		if (line1 == '.') {
			line1 = line
			console.log(line)
			console.log(' --------- assigned to 1')
		} else if (line2 == '.') {
			line2 = line
			console.log(line)
			console.log(' --------- assigned to 2')
		} else if (line3 == '.') {
			line3 = line
			console.log(line)
			console.log(' --------- assigned to 3')
			// const posAndVel = parseTle(line2, line3)
			// else retreive data from celestrack api (stored in cash)
			// const catalogNumber = TLE.parse(`${line1}\r\n${line2}\r\n${line3}`).number
			const tle = `${line1}\n${line2}\n${line3}`
			console.log(tle)
			const catalogNumber = parser(tle).catalog_number
			// const obj = await getObject(client, catalogNumber)
			const res = {
				firstLine: line2,
				secondLine: line3
			}
			await client.set(`tle-${catalogNumber}`, JSON.stringify(res))
			line1 = '.'
			line2 = '.'
			line3 = '.'
			catalogNumbers.push(catalogNumber)
			console.log(catalogNumber)
			// keeps track of count of objects
			lnCatalogNumbers++
		}
		lr.resume();
	})
}

const getOrbitAndInfoRequest = async (client, catalogNumber, date = new Date()) => {
	// check if object data has already been requested
	const existing = await client.get(`tle-${catalogNumber}`)
	const info = await client.get(catalogNumber)
	// if so return cashed object data
	if (existing && info) {
		const firstPart = JSON.parse(existing)
		const secondPart = JSON.parse(info)
		return { ...firstPart, ...secondPart }
	}
	return -1
	// // else retreive data from celestrack api (and store it in cash)
	// const obj = await getObject(client, catalogNumber)
	// const posAndVel = await getPosAndVel(catalogNumber, date)
	// if (posAndVel === -1) {
	// 	return -1;
	// }
	// const res = { ...obj, ...posAndVel }
	// await client.set(`tle-${catalogNumber}`, JSON.stringify(res))
	// return res
}

module.exports = {
	writeObjectsToCash,
	getObject,
	getOrbitAndInfoRequest,
	getObjectsRequest,
	getObjectsRequestExcludes,
	autoSuggest,
	searchByName,
	getPosAndVel,
	getTleFileAndParse,
	parseTle
}