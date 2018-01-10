var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var learningSchema = new Schema ({
	name: String,
	audience: Array,
	modules: Array,
	length: String,
	remarks: String,
	provider: String,
	periodity: String,
	methodology: String,
	category: String
});

var Learning = mongoose.model('Learning', learningSchema);

module.exports = {Learning};