const createDOMPurify = require('dompurify')
const { JSDOM } = require('jsdom')
const fs = require('fs')

/** Helper function to validate links */
function isValidDomainName(input) {
	input = input.replace(/^https?:\/\//i, '').split('/')[0] // Remove http(s) protocol if present & remove path

	let subdomains = input.split('.') // Split the input into an array of subdomains
	if (subdomains.length < 2) return false // Check if the domain name has at least two parts

	// Validate each subdomain
	for (let i = 0; i < subdomains.length; i++) {
		let subdomain = subdomains[i]
		// Check if subdomain is valid & subdomain is not too long
		if (!subdomain.match(/^[a-z0-9-]+$/i) || subdomain.length > 63) return false
	}

	let topLevelDomain = subdomains[subdomains.length - 1]
	// Check if top-level domain is valid & domain name is not too long
	if (!topLevelDomain.match(/^[a-z]{2,}$/i) || input.length > 253) {
		return false
	}

	return true
}

/** Helper function to validate event sent by user */
function validateEvent(event) {
	// check if required fields are present
	if (
		event.title &&
		event.registrationLink &&
		event.dateTimeFrom &&
		event.dateTimeTo &&
		event.about &&
		event.speakers
	) {
		// check if all fields have valid data and length
		if (
			event.title.length >= 5 &&
			event.title.length <= 200 &&
			isValidDomainName(event.registrationLink) &&
			!isNaN(event.dateTimeFrom.getTime()) &&
			!isNaN(event.dateTimeTo.getTime()) &&
			event.dateTimeFrom.toDateString() === event.dateTimeTo.toDateString() &&
			event.about.length > 0 &&
			event.speakers.length >= 1
		) {
			return true
		} else return false
	} else return false
}

/** Helper function to sanitize user submitted HTML through rich text editor */
function sanitizeHTML(str) {
	const window = new JSDOM('').window
	const DOMPurify = createDOMPurify(window)
	const clean = DOMPurify.sanitize(str, { WHITESPACE: 'preserve' })

	return clean
}

/** Helper function to make event sent by user in correct format */
function formatEventData(event) {
	if (event.dateTimeFrom && event.dateTimeTo) {
		event.dateTimeFrom = new Date(event.dateTimeFrom)
		event.dateTimeTo = new Date(event.dateTimeTo)
	}

	event.about = sanitizeHTML(event.about)
	event.readingMaterialAndResources = sanitizeHTML(event.readingMaterialAndResources)
	event.joiningInfo = sanitizeHTML(event.joiningInfo)

	return event
}

/** Helper function to delete images used by deleted or updated event */
function deleteImages(images) {
	images.forEach((item) => {
		if (item.image)
			fs.unlink(`public/uploads/images/${item.image}`, (err) => {
				if (err) {
					console.log(err)
				} else {
					console.log(`Deleted file: "public/uploads/images/${item.image}"`)
				}
			})
	})
}

module.exports = {
	validateEvent: validateEvent,
	formatEventData: formatEventData,
	deleteImages: deleteImages,
}
