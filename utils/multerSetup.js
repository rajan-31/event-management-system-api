const multer = require('multer')
const crypto = require('crypto')

/** Multer option set up to rename and save user uploaded files in server filesystem */
const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'public/uploads/images')
	},
	filename: function (req, file, cb) {
		cb(null, file.fieldname + '-' + crypto.randomUUID() + '.' + file.originalname.split('.').pop())
	},
})

/** Create a Multer instance that provides several methods for generating middleware that process files uploaded in multipart/form-data format */
const upload = multer({ storage: storage })

module.exports = upload
