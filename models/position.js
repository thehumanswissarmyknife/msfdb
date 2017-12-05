var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var positionSchema = new Schema ({
	title: String,
	level: Number,
	irffg: String,
	skills: Array,
	competencies: Array,
	nextPositions: Array,
	requirements: [{positions: Array, months: Number, missions: Number}],
	learnings: [{learning: String, mandatory: String, timing: String}]
});

var Position = mongoose.model('Position', positionSchema);

module.exports = {Position};