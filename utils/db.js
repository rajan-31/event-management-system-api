const mongoose = require('mongoose')

/** strictQuery option to toggle strict mode for the filter parameter to queries */
mongoose.set('strictQuery', true)

mongoose.connect(process.env.MONGODB_URL).catch((err) => {
	console.error("Can't initiate MongoDB connection!")
})

mongoose.connection
	.on('connected', function () {
		console.info('Mongoose connection open to ' + process.env.MONGODB_URL)
	})
	.on('disconnected', function () {
		console.error('Mongoose connection lost!')
	})
	.on('error', function (err) {
		console.error('Mongoose connection error: ' + err)
	})

module.exports = mongoose
