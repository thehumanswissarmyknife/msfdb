var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var knowledgeSchema = new Schema ({
	knowledge: String,
	level: String
});

var Knowledge = mongoose.model('Knowledge', knowledgeSchema);

module.exports = {Knowledge};