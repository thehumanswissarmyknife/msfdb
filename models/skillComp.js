var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var skillCompSchema = new Schema ({
	name: {
		type: String,
		required: true},
	level: {
		type:Number,
		required: true},
	descriptions: Array,
	type: String
});

var SkillComp = mongoose.model('SkillComp', skillCompSchema);

module.exports = {SkillComp};