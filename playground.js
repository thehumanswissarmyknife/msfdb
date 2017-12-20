var mongoose = require('mongoose');
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var bodyParser = require('body-parser');
var fs = require ('fs');
var {ObjectID} = require('mongodb');
var _ = require('lodash');

var {Server} = require('./server');

var {Position} = require ('./models/position');
var {SkillComp} = require('./models/skillComp');
var {Action} = require('./models/action');
var {Description} = require('./models/description');
var {Knowledge} = require('./models/knowledge');
var {Learning} = require('./models/learning');

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




var i=0;

function encodeValue (value, cell, sheet, boldBool) {


	sheet[XLSX.utils.encode_cell(cell)] = {t: "s", v: value, s: {font: {bold: boldBool}}};


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

			newSheet = {"!ref":"A1:C100"};

			//put the job title in cell A1
			wb.Sheets[thisTitle] = encodeValue(thisTitle, cursor, newSheet, true);

			cursor.r += 1;
			wb.Sheets[thisTitle] = encodeValue(thisPosition.irffg, cursor, newSheet, false);
			cursor.r += 1;
			wb.Sheets[thisTitle] = encodeValue("Level " + thisPosition.level, cursor, newSheet, false);
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

				// enter all inherited skills

				// if (i =3) {
				// 	console.log("inherited", thisSkill.inherited);
				// }
				// wb.Sheets[thisTitle] = encodeValue(thisSkill.name + " - inherited", cursor, newSheet, false);
				// cursor.c +=1;

				// thisSkill.inherited.forEach(function (thisDescription) {
				// 	wb.Sheets[thisTitle] = encodeValue(thisDescription.description, cursor, newSheet, false);
				// 	if(thisDescription.description.length > descrWidth) {
				// 		descrWidth = thisDescription.description.length;
				// 	}
				// 	cursor.c += 1;
				// 	thisDescription.actions.forEach(function (thisAction) {
				// 		wb.Sheets[thisTitle] = encodeValue(thisAction.action, cursor, newSheet, false);

				// 		if(thisAction.action.length > actionWidth){
				// 			actionWidth = thisAction.action.length;
				// 		}
				// 		cursor.r += 1;
				// 	})
				// 	cursor.c -= 1;
				// })
				// cursor.c -= 1;

			})

			// for(var j = 0; j < thisPosition.skills.length; j++){
			// 	var thisSkill = thisPosition.skills[j];
			// 	wb.Sheets[thisTitle] = encodeValue(thisSkill.name + " Level " + thisSkill.level, cursor, newSheet);
			// 	cursor.c +=1;
			// 	for(var k = 0; k < thisSkill.descriptions.length; k++) {

			// 	}
			// }
			// shift the cursot to A2
			

			// console.log("NewSheet", newSheet);

			



		}
		// console.log("wb.Sheets", wb.Sheets)
	} catch (e) {
		console.log(e);
	}


	// var new_ws_name = "SheetJS";

	// /* make worksheet */
	// var ws_data = [
	//   [ "S", "h", "e", "e", "t", "J", "S" ],
	//   [  1 ,  2 ,  3 ,  4 ,  5 ]
	// ];
	// var ws = XLSX.utils.aoa_to_sheet(ws_data);

	/* Add the sheet name to the list */
	// wb.SheetNames.push("ws");

	/* Load the worksheet object */
	// wb.Sheets[0] = ws;

	if(typeof require !== 'undefined') XLSX = require('xlsx');
	/* output format determined by filename */
	XLSX.writeFile(wb, 'out.xls');
	

	// for(var R = range.s.r; R <= range.e.r; ++R) {
	//   for(var C = range.s.c; C <= range.e.c; ++C) {
	//     var cell_address = {c:C, r:R};
	//     /* if an A1-style address is needed, encode the address */
	//     var cell_ref = XLSX.utils.encode_cell(cell_address);
	//   }
	// }
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