const express = require('express')
const cors = require('cors')

require('dotenv').config()
const app = express()

const eventRoutes = require('./routes/event')

/**
 * Serve static files from the 'public' folder
 * A better idea will be using something like Nignx to server static content
 * */
app.use(express.static('public'))

/** Parse urlencoded and json data, to make it available in req.body */
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

/**
 * To allow CORS requests
 * It can be configured more granually, like for a particular domain
 */
app.use(cors())

/** Set up database connection */
require('./utils/db')

app.use(eventRoutes)

app.get('/', (req, res) => {
	res.json({
		message: 'Ok',
	})
})

app.use(function (err, req, res, next) {
	console.error(err.stack)
	res.status(500).json({
		message: 'Server error',
	})
})

const port = process.env.PORT
app.listen(port, () => {
	console.log(`Server is running on port ${port}`)
})
