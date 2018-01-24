var mongoose = require('mongoose');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var fs = require ('fs');
var {ObjectID} = require('mongodb');
var _ = require('lodash');

const got = require('got');

const http = require('http');

var {Server} = require('./server');

var {Position} = require ('./models/position');
var {SkillComp} = require('./models/skillComp');
var {Action} = require('./models/action');
var {Description} = require('./models/description');
var {Knowledge} = require('./models/knowledge');
var {Learning} = require('./models/learning');
var {Module} = require('./models/module');

if(typeof require !== 'undefined') XLSX = require('xlsx');

// var workbook = XLSX.readFile(__dirname + '/imports/Workbook-final2.xlsx');
// var first_sheet_name = workbook.SheetNames[0];
// var second_sheet_name = workbook.SheetNames[1];
// var third_sheet_name = workbook.SheetNames[2];

// var address_of_cell = 'A1';
// var descriptionSheet = workbook.Sheets[first_sheet_name];
// var actionSheet = workbook.Sheets[second_sheet_name];
// var compSheet = workbook.Sheets[third_sheet_name];


// var descriptionsForDb = XLSX.utils.sheet_to_json(descriptionSheet);
// var actionsForDb = XLSX.utils.sheet_to_json(actionSheet);
// var compsForDb = XLSX.utils.sheet_to_json(compSheet);

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
// updateComps();

exportData ();
// getFullLearnings();




var i=0;

function encodeValue (value, cell, sheet, boldBool) {


	sheet[XLSX.utils.encode_cell(cell)] = {t: "s", v: value, w: value, r: value, s: {font: {bold: boldBool}}};


	// sheet[XLSX.utils.encode_cell(cell)] = {t: "s", v: value};

	return sheet;
}

async function exportData() {
		var wb = {
		  SheetNames: ["Info"],
		  Sheets: {
		    Info: {
		      "!ref":"A1:A1",
		      A1: { t:"s", v:"Welcome to the position overview", s: {"font": {"bold": true}}}
	    	}
		  }
		}

		wb.Props = {
			Title: "MSF OCA HR Supply Learning",
			Subject: "Tech Skills per position",
			Author: "Dennis Vocke",
			Manager: "Sheet Manager",
			Company: "MSF OCA",
			Category: "Experimentation",
			Keywords: "Test",
			Comments: "Nothing to say here",
			LastAuthor: "Not SheetJS",
			CreatedDate: new Date(2017,12,19)
		};

	try {
		var fullPositions = await getFullPositions ();		

		// console.log("fullPositions", fullPositions);

		for (var i = 0; i < fullPositions.length; i++) {
			// if(i ==0) {
			// 	// console.log("this full poistion", fullPositions[i]);
			// }

			var cursor = {c:0, r:0}; // to iterate through the cells

			var cell_ref = XLSX.utils.encode_cell(cursor);

			var thisPosition = fullPositions[i];
			var thisTitle = thisPosition.title.substring(0,29);

			var newSheet = wb.SheetNames.push(thisTitle);

			var skillWidth = 0;
			var descrWidth = 0;
			var actionWidth = 0;

			var nextPositions = [];
			for  (var j = 0; j < thisPosition.nextPositions.length; j++) {
				// var thisNextPos = thisPosition.nextPositions[j];
				var nextPos = await Position.findById(thisPosition.nextPositions[j]);
				// console.log("Nextpos", nextPos.title);

				nextPositions.push(nextPos.title);
			}

			var learnings = [];
			for  (var j = 0; j < thisPosition.learnings.length; j++) {
				// var thisNextPos = thisPosition.nextPositions[j];
				var learn = await Learning.findById(thisPosition.learnings[j].learning);
				// console.log("Learning", learn);

				learnings.push(learn.name);
			}

			

			newSheet = {"!ref":"A1:C100"};
			var wsCols = [
				{wch:10, wpx:90}, 
				{wch:10, wpx:90}, 
				{wch:40, wpx:200}
			];

			// var mySheet = wb.Sheets[thisTitle];
			// console.log("mysheet", mySheet);
			// mySheet['!cols'] = wsCols;

			//put the job title in cell A1
			wb.Sheets[thisTitle] = encodeValue(thisTitle, cursor, newSheet, true);
			cursor.r += 1;
			wb.Sheets[thisTitle] = encodeValue(thisPosition.irffg, cursor, newSheet, false);
			cursor.r += 1;
			wb.Sheets[thisTitle] = encodeValue("Level " + thisPosition.level, cursor, newSheet, false);
			cursor.r += 1;
			wb.Sheets[thisTitle] = encodeValue("Learning offers receommended:  " + learnings, cursor, newSheet, false);
			cursor.r += 1;
			wb.Sheets[thisTitle] = encodeValue("Next positions:  " + nextPositions, cursor, newSheet, false);
			cursor.r += 2;
			wb.Sheets[thisTitle] = encodeValue("Technical Skill ", cursor, newSheet, true);
			cursor.c += 1;
			wb.Sheets[thisTitle] = encodeValue("Description", cursor, newSheet, true);
			cursor.c += 1;
			wb.Sheets[thisTitle] = encodeValue("Action", cursor, newSheet, true);
			cursor.c = 0;
			cursor.r += 1;

			thisPosition.skills.forEach(function (thisSkill) {
				wb.Sheets[thisTitle] = encodeValue(thisSkill.name + " Level " + thisSkill.level, cursor, newSheet, false);

				if(thisSkill.name.length > skillWidth) {
					skillWidth = thisSkill.name.length;
				}
				cursor.c +=1;

				thisSkill.descriptions.forEach(function (thisDescription) {
					wb.Sheets[thisTitle] = encodeValue(thisDescription.description, cursor, newSheet, false);
					if(thisDescription.description.length > descrWidth) {
						descrWidth = thisDescription.description.length;
					}
					cursor.c += 1;
					thisDescription.actions.forEach(function (thisAction) {
						wb.Sheets[thisTitle] = encodeValue(thisAction.action, cursor, newSheet, false);

						if(thisAction.action.length > actionWidth){
							actionWidth = thisAction.action.length;
						}
						cursor.r += 1;
					})
					cursor.c -= 1;
				})
				cursor.c -= 1;
			})
		}
		// console.log("wb.Sheets", wb.Sheets)
	} catch (e) {
		console.log(e);
	}

	if(typeof require !== 'undefined') XLSX = require('xlsx');
	/* output format determined by filename */
	XLSX.writeFile(wb, 'out.xls');

	// doing the same for the learnings

	var wb_learnings = {
	  SheetNames: ["Info"],
	  Sheets: {
	    Info: {
	      "!ref":"A1:A1",
	      A1: { t:"s", v:"Welcome to the learning offer overview", s: {"font": {"bold": true}}}
    	}
	  }
	}

	wb_learnings.Props = {
		Title: "MSF OCA HR Supply Learning",
		Subject: "Tech Learning offers mapped",
		Author: "Dennis Vocke",
		Manager: "Sheet Manager",
		Company: "MSF OCA",
		Category: "Experimentation",
		Keywords: "Test",
		Comments: "Nothing to say here",
		LastAuthor: "Not SheetJS",
		CreatedDate: new Date(2017,12,19)
	};

	try {
		var fullLearnings = await getFullLearnings();

		for (var i = 0; i < fullLearnings.length; i++) {

			console.log("doing stuff");
			var cursor = {c:0, r:0}; // to iterate through the cells

			var cell_ref = XLSX.utils.encode_cell(cursor);

			var thisLearning = fullLearnings[i];

			if(thisLearning.modules.length === 0) {
				continue;
			}

			// console.log ("ThisLearning", thisLearning.modules);
			var thisTitle = thisLearning.name.substring(0,29);

			var newSheet = wb_learnings.SheetNames.push(thisTitle);

			newSheet = {"!ref":"A1:C100"};

			wb_learnings.Sheets[thisTitle] = encodeValue(thisLearning.name, cursor, newSheet, true);
			cursor.r += 1;

			wb_learnings.Sheets[thisTitle] = encodeValue("Provided by: ", cursor, newSheet, false);
			cursor.c += 1;
			wb_learnings.Sheets[thisTitle] = encodeValue(thisLearning.provider, cursor, newSheet, false);
			cursor.c -= 1;
			cursor.r += 1;

			if (typeof thisLearning.length !== "") {
				wb_learnings.Sheets[thisTitle] = encodeValue("Length: ", cursor, newSheet, false);
				cursor.c += 1;
				wb_learnings.Sheets[thisTitle] = encodeValue(thisLearning.length, cursor, newSheet, false);
				cursor.c -= 1;
				cursor.r += 1;
			}

			wb_learnings.Sheets[thisTitle] = encodeValue("Status: ", cursor, newSheet, false);
			cursor.c += 1;
			// console.log("Status:", thisLearning.status);

			if(_.has(thisLearning, 'name')) {
				console.log("Status entdeckt:", thisLearning.status);
			}
			wb_learnings.Sheets[thisTitle] = encodeValue(String(thisLearning.status), cursor, newSheet, false);
			cursor.c -= 1;
			cursor.r += 1;

			wb_learnings.Sheets[thisTitle] = encodeValue("Method: ", cursor, newSheet, false);
			cursor.c += 1;
			wb_learnings.Sheets[thisTitle] = encodeValue(thisLearning.methodology, cursor, newSheet, false);
			cursor.c -= 1;
			cursor.r += 1;

			wb_learnings.Sheets[thisTitle] = encodeValue("Frequency: " + String(thisLearning.periodity), cursor, newSheet, false);
			cursor.c += 1;
			wb_learnings.Sheets[thisTitle] = encodeValue(String(thisLearning.periodity), cursor, newSheet, false);
			cursor.c -= 1;
			cursor.r += 1;

			wb_learnings.Sheets[thisTitle] = encodeValue("Remarks: ", cursor, newSheet, false);
			cursor.c += 1;
			wb_learnings.Sheets[thisTitle] = encodeValue(thisLearning.remarks, cursor, newSheet, false);
			cursor.c -= 1;
			cursor.r += 2;
			wb_learnings.Sheets[thisTitle] = encodeValue("Modules: ", cursor, newSheet, false);
			cursor.r += 1;

			var myModules = thisLearning.modules;
			for(var j = 0; j < myModules.length; j++) {

				wb_learnings.Sheets[thisTitle] = encodeValue(myModules[j].name + " ("+myModules[j].duration+" minutes)", cursor, newSheet, false);
				cursor.r += 1;
				wb_learnings.Sheets[thisTitle] = encodeValue("Objectives:", cursor, newSheet, false);

				cursor.c += 1;
				for (var k = 0; k < myModules[j].objectives.length; k++) {
					wb_learnings.Sheets[thisTitle] = encodeValue(myModules[j].objectives[k], cursor, newSheet, false);
					cursor.r += 1;
				}
				cursor.c -= 1;
				cursor.r += 1;

				wb_learnings.Sheets[thisTitle] = encodeValue("Actions:", cursor, newSheet, false);
				cursor.c += 1;

				for (var l = 0; l < myModules[j].actions.length; l++) {
					console.log("thisaction", myModules[j].actions[l].action);
					wb_learnings.Sheets[thisTitle] = encodeValue(myModules[j].actions[l].action, cursor, newSheet, false);
					cursor.r += 1;


				}
				cursor.c -= 1;
				cursor.r += 2;
			}

		}

	} catch (e) {
		throw e;
	}
	console.log("Writing");
	XLSX.writeFile(wb_learnings, 'learning.xls');


	// get the learning gap

	try {
		const response = await got('http://165.227.162.247:8080/learning-gap');
		var learningGap = response.body;

		var wb_gap = {
		  SheetNames: ["Info"],
		  Sheets: {
		    Info: {
		      "!ref":"A1:A1",
		      A1: { t:"s", v:"Welcome to the learning gap overview", s: {"font": {"bold": true}}}
	    	}
		  }
		}

		wb_gap.Props = {
			Title: "MSF OCA HR Supply Learning",
			Subject: "Tech Learning gap",
			Author: "Dennis Vocke",
			Manager: "Sheet Manager",
			Company: "MSF OCA",
			Category: "Experimentation",
			Keywords: "Test",
			Comments: "Nothing to say here",
			LastAuthor: "Not SheetJS",
			CreatedDate: new Date(2017,12,19)
		};

		console.log("LearningGap", JSON.stringify(learningGap));
		for (var i = 0; i < learningGap.uncoveredActions.length; i++){

			// var thisAction = learningGap.uncoveredActions[i].action;

		}


	} catch (e) {
		throw e;
	}


}

async function getFullLearnings() {
	console.log("fetching all learning offers");

	var fullLearnings = [];

	try {
		var learnings = await Learning.find();

		for (var i = 0; i < learnings.length; i++) {
			var thisLearning = learnings[i];
			var theseModules = [];
			for (var j = 0; j < learnings[i].modules.length; j++) {
				var thisModule = await Module.findById(learnings[i].modules[j]);
				// console.log("thisModule: ", thisModule);

				var theseActions = [];

				for (var k = 0; k < thisModule.actions.length; k++) {
					var thisAction = await Action.findById(thisModule.actions[k]);
					// console.log("This Action", thisAction);
					theseActions.push(thisAction);
				}
				thisModule.actions = theseActions;

				// console.log("Thismodule", thisModule);
				theseModules.push(thisModule);
			}
			thisLearning.modules = theseModules;
			fullLearnings.push(thisLearning);
		}
		return fullLearnings;
	} catch (e) {
		throw e;
	}

}
async function getFullPositions() {
	console.log("fetching full positions now");

	try {
		var positions = await Position.find();
		// console.log("Positions", positions);
		var fullPositions = [];

		for (var j = 0; j < positions.length; j++) {
			var element = positions[j];

			// console.log("this position", element._id);
			var partPosition = element;

			var skills = [];
			var skillsArray = element.skills;
			// console.log("skills", skillsArray);

			for (var k = 0; k < skillsArray.length; k++) {
				var thisSkill = skillsArray[k];

				var partSkill = await SkillComp.findById(thisSkill);

				// console.log("PartSkill", partSkill);

				var descriptions = [];
				var descriptionsArray = partSkill.descriptions;

				for (n = 0; n < descriptionsArray.length; n++) {
					var thisDescription = descriptionsArray[n];
					var partDescription =  await Description.findById(thisDescription);
					// console.log("partDescription", partDescription);

					var actions = [];
					var actionsArray = partDescription.actions;
					// console.log("ActionsArray", actionsArray);

					for (var m =0; m < actionsArray.length; m++) {
						var thisAction = actionsArray[m];
						var partAction =  await Action.findById(thisAction);
						// console.log("partAction", partAction);

						actions.push(partAction);
						// console.log("actions", actions);
					}
					partDescription.actions = await actions;
					descriptions.push(partDescription);
					// console.log("descriptions", descriptions);
				}



				// var inheritedSkills = await SkillComp.find({$and:[{name:partSkill.name}, {level: {$lt: partSkill.level}}]});
				// // console.log("inheritedSkills", inheritedSkills);

				// //peter

				// var inheritedDescriptions = [];
				// var inheritedDescriptionArray = [];

				// for(var i2 = 0; i2 < inheritedSkills.length; i2++) {
				// 	for(var j2 = 0; j2 < inheritedSkills[i].descriptions.length; j2++) {
				// 		inheritedDescriptionArray.push(inheritedSkills[i2].descriptions[j2]);
				// 	}
				// }

				// // console.log("inheritedDescriptionArray", inheritedDescriptionArray);
				// for (var n2 = 0; n2 < inheritedDescriptionArray.length; n2++) {
				// 	var thisDescription = inheritedDescriptionArray[n2];
				// 	var partDescription =  await Description.findById(thisDescription);
				// 	// console.log("partDescription", partDescription);

				// 	var inheritedActions = [];
				// 	var inheritedActionsArray = partDescription.actions;
				// 	// console.log("ActionsArray", actionsArray);

				// 	for (var m2 =0; m2 < inheritedActionsArray.length; m2++) {
				// 		var thisAction = inheritedActionsArray[m2];
				// 		var partAction =  await Action.findById(thisAction);
				// 		// console.log("partAction", partAction);

				// 		inheritedActions.push(partAction);
				// 		// console.log("actions", actions);
				// 	}
				// 	partDescription.actions = await inheritedActions;
				// 	inheritedDescriptions.push(partDescription);
				// 	// console.log("descriptions", descriptions);
				// }
				// partSkill.inherited = await inheritedDescriptions;

				partSkill.descriptions = await descriptions;
				
				// console.log("partSkills", partSkill);
				skills.push(partSkill);
				// console.log("skills", skills);
			}
			partPosition.skills = await skills;
			fullPositions.push(partPosition);
		}
		// console.log("fullposition", JSON.stringify(fullPositions));	
	} catch (e) {
		console.log(e);
	}

	return fullPositions;

}
// async function getFullPositions() {
// 	console.log("fetching full positions now");

// 	try {
// 		var positions = await Position.find();
// 		// console.log("Positions", positions);
// 		var fullPositions = [];

// 		for (var j = 0; j < positions.length; j++) {
// 			var element = positions[j];

// 			// console.log("this position", element._id);
// 			var partPosition = element;

// 			var skills = [];
// 			var skillsArray = element.skills;
// 			// console.log("skills", skillsArray);

// 			for (var k = 0; k < skillsArray.length; k++) {
// 				var thisSkill = skillsArray[k];

// 				var partSkill = await SkillComp.findById(thisSkill);
// 				// console.log("PartSkill", partSkill);

// 				var descriptions = [];
// 				var descriptionsArray = partSkill.descriptions;

// 				for (n = 0; n < descriptionsArray.length; n++) {
// 					var thisDescription = descriptionsArray[n];
// 					var partDescription =  await Description.findById(thisDescription);
// 					// console.log("partDescription", partDescription);

// 					var actions = [];
// 					var actionsArray = partDescription.actions;
// 					// console.log("ActionsArray", actionsArray);

// 					for (var m =0; m < actionsArray.length; m++) {
// 						var thisAction = actionsArray[m];
// 						var partAction =  await Action.findById(thisAction);
// 						// console.log("partAction", partAction);

// 						actions.push(partAction);
// 						// console.log("actions", actions);
// 					}
// 					partDescription.actions = await actions;
// 					descriptions.push(partDescription);
// 					// console.log("descriptions", descriptions);
// 				}
// 				partSkill.descriptions = await descriptions;
// 				// console.log("partSkills", partSkill);
// 				skills.push(partSkill);
// 				// console.log("skills", skills);
// 			}
// 			partPosition.skills = await skills;
// 			fullPositions.push(partPosition);
// 		}
// 		// console.log("fullposition", JSON.stringify(fullPositions));	
// 	} catch (e) {
// 		console.log(e);
// 	}

// 	return fullPositions;

// }

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

async function updateComps () {
	console.log("Length", compsForDb.length);
	console.log("comps", compsForDb);
	compsForDb.forEach( async function (element) {
		// console.log("Counter:", i, element);
		// i++;

		try {

			const body = _.pick(element, ['description']);
			// console.log("Description:", body);
			// const level = _.pick(element, ['level']);
			// const name = _.pick(element, ['skill']);
			// console.log("Body", body);
			// console.log("level", level);
			// console.log("name", name);
			var description = new Description(body);
			description = await description.save();
			// console.log("Description", description);
			// console.log("Element", element);
			var temp = await SkillComp.find({$and: [{name: element.comp}, {level: element.level}]}).limit(1);
			
			// if(temp.length<1) {
			// 	console.log("Not found", element.comp, element.level);
			// }
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