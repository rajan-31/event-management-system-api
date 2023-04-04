const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
		unique: true,
	},
	registrationLink: {
		type: String,
		required: true,
	},
	dateTimeFrom: {
		type: Date,
		required: true,
	},
	dateTimeTo: {
		type: Date,
		required: true,
	},
	about: {	// HTML
		type: String,
		required: true,
	},
	speakers: {
		type: [
			{
				name: String,
				image: String,
				about: String,
				_id:false
			},
		],
		required: true,
		validate: {
			validator: function (speakers) {
				return speakers.length >= 1
			},
			message: 'At least one speaker is required',
		},
	},
	moderators: [
		{
			name: String,
			image: String,
			about: String,
			_id:false
		},
	],
    readingMaterialAndResources: String,    // HTML
    joiningInfo: String,    // HTML
    organizedBy: [ String ],
    tags: [ String ]
})

module.exports = mongoose.model('Event', eventSchema)
