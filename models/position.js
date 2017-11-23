var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var positionSchema = new Schema ({
	title: {
		type: String,
		required: true},
	level: {
		type:Number,
		required: true},
	skills: [{skill: String, level: Number}],
	competencies: [{comp: String, level: Number}],
	nextPositions: Array,
	requirements: {positions: Array, months: Number, missions: Number}
});

var Position = mongoose.model('Position', positionSchema);

module.exports = {Position};