var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var descriptionSchema = new Schema ({
	description: String,
	actions: Array
});

var Description = mongoose.model('Description', descriptionSchema);

module.exports = {Description};