var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var learningSchema = new Schema ({
	name: String,
	modules: Array,
	length: String,
	remarks: String,
	provider: String,
	periodity: String
});

var Learning = mongoose.model('Learning', learningSchema);

module.exports = {Learning};