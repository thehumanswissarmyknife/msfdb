var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var descriptorSchema = new Schema ({
	descriptor: String,
	actions: Array
});

var Descriptor = mongoose.model('Descriptor', descriptorSchema);

module.exports = {Descriptor};