const router = require('express').Router()
const mongoose = require('mongoose')

const Event = require('../models/event')
const upload = require('../utils/multerSetup')
const helpers = require('../utils/helpers')

/** Return all events */
router.get('/event', async (req, res, next) => {
	try {
		const events = await Event.find({}, null, { lean: true })

		res.json({
			message: 'Events retrieved successfully',
			events: events,
		})
	} catch (err) {
		next(err)
	}
})

/** Returns event based on valid and unique ID */
router.get('/event/:id', async (req, res, next) => {
	try {
		const _id = new mongoose.Types.ObjectId(req.params.id)

		const event = await Event.findById(_id)
		if (event)
			res.json({
				message: 'Event retrieved successfully',
				event: event,
			})
		else
			res.json({
				message: 'Event does not exists',
			})
	} catch (err) {
		if (err.name === 'BSONError')
			res.status(400).json({
				message: 'Invalid event ID',
			})
		else {
			next(err)
		}
	}
})

/** Creates and returns new event if submitted event data is valid */
router.post('/event', upload.any(), async (req, res, next) => {
	const newEvent = helpers.formatEventData(req.body)
	const newEventImages = req.files

	newEventImages.forEach((imgObj) => {
		eval(`newEvent.${imgObj.fieldname}.image = imgObj.filename`)
	})

	if (helpers.validateEvent(newEvent)) {
		try {
			const event = await Event.create(newEvent)

			res.status(201).json({
				message: 'Event created successfully',
				event: event,
			})
		} catch (err) {
			if (err.name === 'MongoServerError' && err.code === 11000) {
				res.status(400).json({
					message: 'Duplicate event title',
				})
				helpers.deleteImages([...newEvent.speakers, ...newEvent.moderators])
			} else {
				next(err)
			}
		}
	} else {
		res.status(400).json({
			message: 'Invalid or missing required field in event data',
		})
		helpers.deleteImages([...newEvent.speakers, ...newEvent.moderators])
	}
})

/** Updates event based on event ID, if submitted event data is valid */
router.put('/event/:id', upload.any(), async (req, res, next) => {
	const updatedEvent = helpers.formatEventData(req.body)
	const updatedEventImages = req.files

	try {
		const _id = new mongoose.Types.ObjectId(req.params.id)
		const oldEvent = await Event.findById(_id)

		updatedEventImages.forEach((imgObj) => {
			eval(`updatedEvent.${imgObj.fieldname}.image = imgObj.filename`)
		})

		if (helpers.validateEvent(updatedEvent)) {
			try {
				// const event = await Event.findByIdAndUpdate(_id, updatedEvent, { overwrite: true, new: true })
				const event = await Event.findOneAndReplace({ _id: _id }, updatedEvent, {
					returnDocument: 'after',
				})
				if (event) {
					res.status(201).json({
						message: 'Event updated successfully',
						event: event,
					})
					if (oldEvent) {
						helpers.deleteImages([...oldEvent.speakers, ...oldEvent.moderators])
					}
				} else {
					res.json({
						message: 'Event does not exists',
					})
					helpers.deleteImages([...updatedEvent.speakers, ...updatedEvent.moderators])
				}
			} catch (err) {
				next(err)
			}
		} else {
			res.status(400).json({
				message: 'Invalid or missing required field in event data',
			})
			helpers.deleteImages([...updatedEvent.speakers, ...updatedEvent.moderators])
		}
	} catch (err) {
		if (err.name === 'BSONError') {
			res.status(400).json({
				message: 'Invalid event ID',
			})
			helpers.deleteImages([...updatedEvent.speakers, ...newEvent.moderators])
		} else {
			next(err)
		}
	}
})

/** Deletes event based on event ID */
router.delete('/event/:id', async (req, res) => {
	try {
		const _id = new mongoose.Types.ObjectId(req.params.id)
		const event = await Event.findByIdAndDelete(_id)

		if (event) {
			res.json({
				message: 'Event deleted successfully',
			})

			helpers.deleteImages([...event.speakers, ...event.moderators])
		} else
			res.json({
				message: 'Event does not exists',
			})
	} catch (err) {
		if (err.name === 'BSONError')
			res.status(400).json({
				message: 'Invalid event ID',
			})
		else {
			next(err)
		}
	}
})

module.exports = router
