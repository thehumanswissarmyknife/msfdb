var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var actionSchema = new Schema ({
	action: String,
	knowledges: Array,
	skill: String
});

var Action = mongoose.model('Action', actionSchema);

module.exports = {Action};