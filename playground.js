var mongoose = require('mongoose');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var fs = require ('fs');
var {ObjectID} = require('mongodb');
var _ = require('lodash');

var {Position} = require ('./models/position');
var {SkillComp} = require('./models/skillComp');
var {Action} = require('./models/action');
var {Description} = require('./models/description');
var {Knowledge} = require('./models/knowledge');
var {Learning} = require('./models/learning');

if(typeof require !== 'undefined') XLSX = require('xlsx');

var workbook = XLSX.readFile(__dirname + '/imports/Workbook-final.xlsx');
var first_sheet_name = workbook.SheetNames[0];
var second_sheet_name = workbook.SheetNames[1];
var address_of_cell = 'A1';
var descriptionSheet = workbook.Sheets[first_sheet_name];
var actionSheet = workbook.Sheets[second_sheet_name];


var descriptionsForDb = XLSX.utils.sheet_to_json(descriptionSheet);
var actionsForDb = XLSX.utils.sheet_to_json(actionSheet);

//for the first row of the sheet: get all cells into an array, then camelCase all values and write them back
const port = process.env.PORT || 3000;
const mongoCon = process.env.MONGODB_URI || 'mongodb://localhost:30001/msfdb';

// connection to the db
mongoose.connect('mongodb://localhost:30001/msfdb', { useMongoClient: true });
mongoose.Promise = global.Promise;

// removeAllDescriptions();
// updateDescriptions();
// updateActions() ;
// removeAllNextPositions();




var i=0;

async function updateDescriptions () {
	console.log("Length", descriptionsForDb.length);
	descriptionsForDb.forEach( async function (element) {
		// console.log("Counter:", i, element);
		// i++;

		try {

			const body = _.pick(element, ['description']);
			// const level = _.pick(element, ['level']);
			// const name = _.pick(element, ['skill']);
			// console.log("Body", body);
			// console.log("level", level);
			// console.log("name", name);
			var description = new Description(body);
			description = await description.save();
			// console.log("Description", description);
			// console.log("Element", element);
			var temp = await SkillComp.find({$and: [{name: element.skill}, {level: element.level}]}).limit(1);
			// console.log("skill:",temp, temp[0]._id);

			const thisSkillcomp = await SkillComp.findByIdAndUpdate(temp[0]._id, {$addToSet: {descriptions: description._id}});
			// console.log("Skill", thisSkillcomp);
		} catch (e){
			console.log(e);
		}	
	})
}

async function updateActions () {
	console.log("Count of actions:", actionsForDb.length);
	actionsForDb.forEach( async function (element) {
		try {
			const body = _.pick(element, ['action']);
			// console.log("Body", body);
			// console.log("Element:", element);
			var action = new Action(body);
			action = await action.save();
			console.log("Action", action);

			var temp = await Description.find({description: element.description}).limit(1);
			console.log("Temp", temp);

			const thisDescription = await Description.findByIdAndUpdate(temp[0]._id, {$addToSet: {actions: action._id}})

		} catch (e) {
			console.log(e);
		}
		// console.log(element);
	})
}

async function removeAllDescriptions() {

	console.log("Doing it");
	try {
		var skillcomps = await SkillComp.find();

		skillcomps.forEach( async function (element) {
			var thisSkill = await SkillComp.findByIdAndUpdate(element._id, { $set : {descriptions: [] }});
			console.log("Skill", thisSkill);
		})
	} catch (e){
		console.log(e);
	}
}

async function removeAllNextPositions() {

	console.log("Doing it");
	try {
		var positions = await Position.find();

		positions.forEach( async function (element) {
			var thisPosition = await Position.findByIdAndUpdate(element._id, { $set : {nextPositions: [] }});
			console.log("Position", thisPosition);
		})
	} catch (e){
		console.log(e);
	}
}