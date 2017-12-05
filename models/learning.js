var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var learningSchema = new Schema ({
	name: String
});

var Learning = mongoose.model('Learning', learningSchema);

module.exports = {Learning};