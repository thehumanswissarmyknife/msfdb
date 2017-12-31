var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var moduleSchema = new Schema ({
	name: String,
	objectives: Array,
	actions: Array,
	duration: Number
});

var Module = mongoose.model('Module', moduleSchema);

module.exports = {Module};