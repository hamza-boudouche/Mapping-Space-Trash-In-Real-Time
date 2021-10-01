const MiniSearch = require('minisearch')
const { getPosAndVel } = require('./helpers')
const catalogNumbers = [];
let lnCatalogNumbers = 0;
let miniSearch = null;


const writeObjectsToCash = async (client, objects) => {
	// store array of objects in cash based on catalogNumber
	objects.forEach(async (object) => {
		await client.set(object.catalogNumber, JSON.stringify(object))
		// store catalog numbers in array for easy access (looping throught objects)
		catalogNumbers.push(object.catalogNumber)
		object.id = object.catalogNumber
		// keeps track of count of objects
		lnCatalogNumbers++
	});
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
	console.log('done fetching')
}

const getObject = async (client, catalogNumber) => {
	// get object stored in cash based on catalogNumber (unique)
	const objectString = await client.get(catalogNumber)
	if (objectString) {
		// if exists parse string representing the object
		return JSON.parse(objectString)
	}
}

const getObjectsRequest = async (client, count = 20) => { // this really needs to be changed, it's causing problems
	// idea:
	// while still doesn't have a full `count` generated objects: 
	// 		generate random number 
	//    find out catalogNumber of it
	//    find out if it has GP data
	//        if so add it to array to return
	//        if not skip

	// check if catalogNumbers array is populated
	if (lnCatalogNumbers === 0) {
		return
	}
	// if so generate array of length:count and that contains random integers between 0 and lnCatalogNumbers 
	const randomCatalogNumbersIndex = []
	while (randomCatalogNumbersIndex.length < count) {
		let r = Math.floor(Math.random() * lnCatalogNumbers);
		if (randomCatalogNumbersIndex.indexOf(r) === -1) randomCatalogNumbersIndex.push(r);
	}
	// retreive objects for which indexes are equal to previous random numbers (stored in cash for better speed and for persisting storage)
	const objects = Promise.all(randomCatalogNumbersIndex.map(async (r) => {
		const obj = await getObject(client, catalogNumbers[r])
		// construct result array (objects doesn't have to contain all available data)
		const resInt = {
			name: obj.name,
			intlDesignator: obj.intlDesignator,
			catalogNumber: obj.catalogNumber,
			type: obj.type,
			country: obj.country,
		}
		return resInt
	}))
	return objects
}

const getOrbitAndInfoRequest = async (client, catalogNumber, date) => {
	// check if object data has already been requested
	const existing = await client.get(`tle-${catalogNumber}`)
	// if so return cashed object data
	if (existing) {
		return JSON.parse(existing)
	}
	// else retreive data from celestrack api (stored in cash)
	const obj = await getObject(client, catalogNumber)
	const posAndVel = await getPosAndVel(catalogNumber, date)
	if (posAndVel === -1) {
		return -1;
	}
	const res = { ...obj, ...posAndVel }
	await client.set(`tle-${catalogNumber}`, JSON.stringify(res), 'EX', 60 * 60)
	return res
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

module.exports = {
	writeObjectsToCash,
	getObject,
	getObjectsRequest,
	getOrbitAndInfoRequest,
	autoSuggest,
	searchByName,
}