require("dotenv").config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const redis = require('async-redis')
const {
	writeObjectsToCash,
	getObject,
	getObjectsRequest,
	getObjectsRequestExcludes,
	getOrbitAndInfoRequest,
	autoSuggest,
	searchByName,
} = require('./cash')
const { getPosAndVel, getObjects } = require('./helpers')

const app = express()
const port = process.env.PORT || 5000
const corsOptions = {
	origin: '*',
	optionsSuccessStatus: 200,
}
const redisCredentials = {
	host: process.env.REDIS_HOST,
	port: process.env.REDIS_PORT
}
const redisClient = redis.createClient(redisCredentials)

const setUp = async (client) => {
	const objects = await getObjects(process.env.LIMIT, process.env.OFFSET);
	await writeObjectsToCash(client, objects);
	setInterval(async () => {
		const objects = await getObjects(process.env.LIMIT, process.env.OFFSET);
		await writeObjectsToCash(client, objects);
	}, 60 * 60 * 1000);
	// const debris = await getObjectsRequest(redisClient, 20);
	// console.log(debris)
	// debris.forEach(deb => console.log(deb.catalogNumber))
}



app.use(morgan('dev'))
app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(__dirname + '/3d_globe'));

setUp(redisClient)

app.get('/test', (req, res) => {
	return res.send('working')
})

app.get('/api/objects/:count', async (req, res) => {
	const count = Number(req.params['count'])
	const result = await getObjectsRequest(redisClient, count)
	return res.json(result)
})

app.put('/api/objects/:count', async (req, res) => {
	const count = Number(req.params['count'])
	const existing = req.body.existing;
	const result = await getObjectsRequestExcludes(redisClient, count, existing)
	return res.json(result)
})

app.get('/api/orbit/:catalogNumber/:date', async (req, res) => {
	const catalogNumber = Number(req.params['catalogNumber'])
	const date = new Date(req.params['date'])
	const result = await getOrbitAndInfoRequest(redisClient, catalogNumber, date);
	if (result === -1) {
		return res.send('No GP data found')
	}
	return res.json(result)
})

app.get('/api/objects/autoSuggest/:queryString', (req, res) => {
	const queryString = req.params['queryString']
	const resultat = autoSuggest(queryString)
	return res.json(resultat)
})

app.get('/api/objects/search/:queryString', (req, res) => {
	const queryString = req.params['queryString']
	const resultat = searchByName(queryString)
	return res.json(resultat)
})

app.get('/api/objects/collisions/:date', (req, res) => {
	const tracked = req.body.tracked
	const date = new Date(req.params['date'])
	const colliding = getColliding(client, tracked, date)
	res.json(colliding)
})

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})
