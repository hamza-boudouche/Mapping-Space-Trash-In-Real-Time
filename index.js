require("dotenv").config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const redis = require('async-redis')
const {
	writeObjectsToCash,
	getObject,
	getObjectsRequest,
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
	const objects = await getObjects(100, undefined);
	await writeObjectsToCash(client, objects);
	setInterval(async () => {
		const objects = await getObjects(100, undefined);
		await writeObjectsToCash(client, objects);
	}, 60 * 60 * 1000)
}

app.use(morgan('dev'))
app.use(cors(corsOptions));
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// app.use(express.static(__dirname + '/public'));

setUp(redisClient)

app.get('/test', (req, res) => {
	return res.send('working')
})

app.get('/api/objects/:count', async (req, res) => {
	const count = Number(req.params['count'])
	const result = await getObjectsRequest(redisClient, count)
	console.log(result)
	return res.json(result)
})

app.get('/api/orbit/:catalogNumber/:date', async (req, res) => {
	const catalogNumber = Number(req.params['catalogNumber'])
	const date = new Date(req.params['date'])
	let result = null;
	try {
		result = await getOrbitAndInfoRequest(redisClient, catalogNumber, date)
	} catch (err) {
		console.log(err)
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

app.listen(port, () => {
	console.log(`Server is listening on port ${port}`)
})

