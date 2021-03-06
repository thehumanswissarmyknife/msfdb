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
var {Learning} = require('./models/learning')

const port = process.env.PORT || 3000;
const mongoCon = process.env.MONGODB_URI || 'mongodb://localhost:30001/msfdb';

// connection to the db
mongoose.connect('mongodb://localhost:30001/msfdb', { useMongoClient: true });
mongoose.Promise = global.Promise;

// json parser for the Posting and getting
app.use(bodyParser.json());

//stat the server
app.listen(port, function () {
	console.log('Server is up and running, listening on port ' + port);
});

// log what happens
app.use((req, res, next) => {
	var now = new Date().toString();
	var logLine = `${now}: ${req.method}${req.originalUrl}`;
	console.log(logLine);
	fs.appendFile('logs/server.log', logLine +  '\n', (err) => {
		if (err) {
			console.log('Unable to write to file server.log');
		}
	});
	next();
});
app.use(express.static(__dirname + '/public'));


// POSTIIONS
app.post('/positions', async (req, res) => {
	try {
		var position = new Position(req.body);

		position = await position.save();
		res.status(200).send({position, status: 'created'});

	} catch (e) {
		res.status(404).send({e, status: 'not created'});
	}
});

app.get('/positions', async (req, res) => {
	try {
		// console.log(Position.find());
		var positions = await Position.find();
		res.status(200).send({count: positions.length, positions});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/position/:id', async (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send({status: 'not created', error: 'bad object ID'});
	}
	try {
		// console.log(Position.find());
		var position = await Position.findById(id);
		res.status(200).send({position});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.patch('/position/:id', async (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['nextPositions', 'skills', 'competencies']);
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 

	var thisPosition = "";
	try {
		thisPosition = await Position.findByIdAndUpdate(id, {$addToSet: body}, {new: true});
		res.status(200).send({position: thisPosition, status: 'updated'});
	} catch(e){
		res.status(400).send(e);
	};

});

app.get('/full-positions', async (req, res) => {
	try {
		var positionArray = await Position.find();
		// console.log("positionArray", positionArray);
		var positions = [];

		for(var i = 0; i < positionArray.length; i++) {
			// console.log("skillCompArray[i]._id: ", positionArray[i]._id);
			positions.push(await getFullPosition(positionArray[i]._id));
		}

		res.status(200).send({positions});
	} catch (e) {
		res.status(404).send(e);
	}

})

app.get('/full-position/:id', async (req, res) => {
	var id = req.params.id;
	try {
		console.log("full-position");		
		var thisPosition = await getFullPosition2(id);
		console.log("thisPos", thisPosition);
		res.status(200).send({position: thisPosition});
	} catch (e) {
		res.status(404).send(e);
	}

})
// SKILLCOMPS
app.post('/skillcomps', async (req, res) => {
	try {
		var skillComp = new SkillComp(req.body);

		skillComp = await skillComp.save();
		res.status(200).send({skillComp, status: 'created'});
	} catch (e) {
		res.status(404).send({e, status: 'not created'});
	}
});

app.get('/skillcomps', async (req, res) => {
	try {
		var skillComps = await SkillComp.find();
		res.status(200).send({skillComps});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

app.get('/skillcomp/:id', async (req, res) => {
	var id = req.params.id;
	try {
		var skillComp = await SkillComp.findById(id);
		res.status(200).send({skillComp});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

app.patch('/skillcomps/:id', async (req, res) => {
	var id = req.params.id;
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 
	var body = _.pick(req.body, ['descriptions']);
	var thisSkillcomp = "";
	try {
		for(var i =0; i < body.descriptions.length; i++) {
			thisSkillcomp = await SkillComp.findByIdAndUpdate(id, {$addToSet: {descriptions: body.descriptions[i]}}, {new: true});
		}
		res.status(200).send(thisSkillcomp);
	} catch(e) {
		res.status(404).send(e);
	}
	// var skillcomp = await SkillComp.findByIdAndUpdate(id, {$addToSet: body}, {new: true});
})

app.get('/full-skillcomps', async (req, res) => {
	try {
		var skillCompArray = await SkillComp.find();
		console.log("skillCompArray", skillCompArray);
		var skillComps = [];

		for(var m = 0; m < skillCompArray.length; m++) {
			console.log("skillCompArray[m]._id: ", skillCompArray[m]._id)
			skillComps.push(await getFullSkillComp(skillCompArray[m]._id));
		}

		res.status(200).send({skillComps});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

app.get('/full-skillcomps/:skillcomp/:level', async (req, res) => {
	var skillcomp = req.params.skillcomp;
	var level = req.params.level;
	try {
		var skillCompArray = await SkillComp.find({name: skillcomp, level: level}).limit(1);
		console.log("skillCompArray", skillCompArray);
		var skillComps = [];

		for(var m = 0; m < skillCompArray.length; m++) {
			console.log("skillCompArray[m]._id: ", skillCompArray[m]._id)
			skillComps.push(await getFullSkillComp(skillCompArray[m]._id));
		}

		res.status(200).send({skillComps});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

app.get('/full-skillcomp/:id', async (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)) {
		return res.status(404).send("Bad skillcomp ID");
	}
	try {
		var thisSkillComp = await getFullSkillComp(id);
		res.status(200).send(thisSkillComp);
	} catch (e) {
		res.status(404).send(e);
	}
	
})

app.get('/skillcomps/:name/:level', async (req, res) => {
	try {
		var thisName = req.params.name;
		var thisLevel= req.params.level;
		var skillComps = await SkillComp.find({$and:[{name:thisName}, {level: thisLevel}]});
		res.status(200).send({skillComps});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

// DESCRIPTOR
app.post('/descriptions', async(req, res) => {
	try {
		var description = new Description(req.body);

		description = await description.save();
		res.status(200).send({description, status: 'created'});
	} catch (e) {
		res.status(404).send({e, status: 'not created'});
	}

});

app.get('/descriptions', async (req, res) => {
	try {
		var descriptions = await Description.find();
		res.status(200).send({descriptions});
	} catch(e) {
		res.status(404).send(e);
	}
	

})

app.patch('/description/:id', async (req, res) => {
	var id = req.params.id;
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send("Bad description ID");
	} 

	var body = _.pick(req.body, ['actions']);
	var thisDescription = "";
	try {
		for(var i = 0; i < body.actions.length; i++) {
			console.log(body.actions[i]);
			thisDescription = await Description.findByIdAndUpdate(id, {$addToSet: {actions: body.actions[i]}}, {new: true})
		}
		res.status(200).send(thisDescription);
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/full-descriptions', async (req, res) => {
	try {
		var descriptionArray = await Description.find();
		var descriptions = [];

		// go through all descriptors
		for(var n = 0; n < descriptionArray.length; n++) {
			descriptions.push(await getFullDescription( descriptionArray[n]._id));
		}

		res.status(200).send(descriptions);
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/description/:id', async (req, res) => {
	var thisDescription = req.params.id;
	if(!ObjectID.isValid(thisDescription)){
		return res.status(404).send('Bad descriptor ID');
	}

	try {
		var description = await Description.findById(thisDescription);
		res.status(200).send({description});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/full-description/:id', async (req, res) => {
	var thisDescription = req.params.id;
	if(!ObjectID.isValid(thisDescription)){
		return res.status(404).send('Bad descriptor ID');
	}

	try {
		var description = await getFullDescription(thisDescription);
		res.status(200).send(description);
	} catch (e) {
		res.status(404).send(e);
	}
});





// ACTIONS
app.post('/actions', async (req, res) => {
	try {
		var action = new Action(req.body);

		action = await action.save();
		res.status(200).send({action, status: 'created'});
	} catch (e) {
		res.status(404).send({e, status: 'not created'});
	}
});

app.patch('/actions/:id', async (req, res) => {
	var id = req.params.id;
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 

	var body = _.pick(req.body, ['knowledges']);
	var thisAction = "";
	try {
		for(var i = 0; i< body.knowledges.length; i++) {
			thisAction = await Action.findByIdAndUpdate(id, {$addToSet: {knowledges: body.knowledges[i]}}, {new: true});
		}
		res.status(200).send(thisAction);
	} catch(e) {
		res.status(404).send(e);
	}
	// var skillcomp = await SkillComp.findByIdAndUpdate(id, {$addToSet: body}, {new: true});
})

app.get('/actions', async (req, res) => {
	try {
		var actions = await Action.find();
		res.status(200).send({actions});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/full-actions', async (req, res) => {
	try {
		var actions = [];
		var actionArray = await Action.find();
		// console.log("actionArray", actionArray);

		for(var i = 0; i < actionArray.length; i++){
			console.log("inside the action for loop");
			actions.push(await getFullAction(actionArray[i]._id));

		}
		console.log("Actions", actions);
		res.status(200).send({actions});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

app.get('/full-actions/:id', async (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send('Bad action ID');
	}
	try {
		var actions = await Action.findById(id);

		// for(var i = 0; i < actionArray.length; i++){
		// 	actions.push(await getFullAction(actionArray[i]._id));
		// }
		res.status(200).send({actions});
	} catch (e) {
		res.status(404).send(e);
	}
	
});

app.get('/actions/:id', async (req, res) => {
	var thisAction = req.params.id;

	if(!ObjectID.isValid(thisAction)){
		return res.status(404).send('Bad action ID');
	}

	try {
			var action = await getFullAction(thisAction);
			res.status(200).send({action});
	} catch (e) {
		res.status(404).send(e);
	}
	
});


app.get('/actions/:actionID', async (req, res) => {
	var actionID = req.params.actionID;
	if(!ObjectID.isValid(actionID)) {
		return (res.status(404).send('id not valid'));
	}
	try {
		var action = await Action.findById(actionID);
		res.status(200).send({action});
	} catch (e) {
		res.status(400).send(e);
	}
});

// KNOWLEDGE
app.post('/knowledge', async (req, res) => {
	try {
		var knowledge = new Knowledge(req.body);

		knowledge = await knowledge.save();
		res.status(200).send({knowledge, staus: 'created'});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/knowledge', async (req, res) => {
	try {
		var knowledges = await Knowledge.find();
		res.status(200).send({knowledges});
	} catch (e) {
		res.status(404).send(e);
	}
});

// LEARNING
app.post('/learning', async (req, res) => {
	try {
		var learning = new Learning(req.body);

		learning = await learning.save();
		res.status(200).send({learning, status: 'created'});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/learnings', async (req, res) => {
	try {
		var learnings = await Learning.find();
		res.status(200).send({learnings});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/learning/:id', async (req, res) => {

	var id = req.params.id;
	try {
		var learning = await Learning.findById(id);
		res.status(200).send({learning});
	} catch (e) {
		res.status(404).send(e);
	}
});

async function getFullPosition(id) {
	console.log("getFullPosition");
	if (!ObjectID.isValid(id)) {
		throw "bad position ID";
	};

	try {
		var thisPosition = await Position.findById(id);
		// console.log("position found:", thisPosition);

		var skills = [];
		var skillsArray = thisPosition.skills;
		// console.log("skillsArray", skillsArray);

		var comps = [];
		var compsArray = thisPosition.competencies;
		// console.log("compsArray", compsArray);

		for(var i = 0; i < skillsArray.length; i++) {
			var thisName = skillsArray[i].skill;
			var thisLevel = skillsArray[i].level;
			var thisSkill = await SkillComp.find({name: thisName, level: thisLevel}).limit(1);
			// console.log("ThisSkill", thisSkill);

			// get the full story

			skills.push(await getFullSkillComp(thisSkill[0]._id));
		}
		console.log("skills", skills);

		for(var j = 0; j < compsArray.length; j++) {
			

			console.log("compsarray j", compsArray[j]);


			var thisName = compsArray[j].comp;
			var thisLevel = compsArray[j].level;

			var thisComp = await SkillComp.find({name: thisName, level: thisLevel}).limit(1);
			console.log("thisComp", thisComp);

			comps.push(await getFullSkillComp(thisComp[0]._id));
		}
		console.log("comps", comps);

		return {_id: thisPosition._id, level: thisPosition.level, irffg: thisPosition.irffg, title: thisPosition.title};

	} catch (e) {
		throw (e);
	}

}

async function getFullPosition2 (id) {

	if (!ObjectID.isValid(id)) {
		throw "bad killcomp ID";
	};

	try {
		var thisPosition = await Position.findById(id);
		var title = thisPosition.title;
		var level = thisPosition.level;
		var irffg = thisPosition.irffg;

		// arrays for final results
		var nextPositions = [];
		var requirements = [];
		var learnings = [];
		var skills = ["Peter"];
		var comps = [];

		// arrays for storing the ids to look up..
		var nextPositionsArray = thisPosition.nextPositions;
		var requirementsArray = thisPosition.requirements;
		var learningsArray = thisPosition.learnings;
		var skillsArray = thisPosition.skills;
		var compsArray = thisPosition.competencies;

		nextPositionsArray.forEach(async function (nextPos) {
			var myNextPosition = await Position.findById(nextPos);
			nextPositions.push({title: myNextPosition.title, _id: myNextPosition._id});
		})

		// get info for the next positions


		console.log("nextPositions", nextPositions);

		// get info for all requirements
		requirementsArray.forEach(async function (reqs) {
			var posArray = [];
			reqs.positions.forEach( async function (pos) {
				var thisPosition = await Position.findById(pos);
				await posArray.push({title: thisPosition.title, _id: thisPosition._id});
			})
			await requirements.push({positions: posArray, months: reqs.months, missions: reqs.missions});
		})
		console.log("requirements", requirements);

		learningsArray.forEach( async function (learn) {
			var thisLearning = await Learning.findById(learn.learning);
			var temp = {learning: thisLearning.name, learningId: thisLearning._id, mandatory: learn.mandatory, timing: learn.timing};
			console.log("thisLearning", temp);
			await learnings.push({learning: thisLearning.name, learningId: thisLearning._id, mandatory: learn.mandatory, timing: learn.timing});
			console.log("pushed learning", learnings);
		})
		await console.log("learnings after loop", learnings);

		skillsArray.forEach( async function (skill) {
			var thisSkill = await getFullSkillComp(skill);
			skills.push(thisSkill);
		})
		console.log("skills", skills);

		compsArray.forEach( async function (comp) {
			var thisComp = await getFullSkillComp(comp);
			comps.push(thisComp);
		})
		console.log("comps", comps);

		return ({_id: thisPosition._id, title, level, irffg, nextPositions, requirements, learnings, skills, competencies: comps});

	} catch (e) {
		return e;
	}
}


// funtions to get the full details

async function getFullSkillComp (id) {

	console.log("this is the skillcomp ID passed on:", id);
	if (!ObjectID.isValid(id)) {
		throw "bad skillcomp ID";
	};

	console.log("getting the full skillcomp", id);

	try {
		var thisSkillComp = await SkillComp.findById(id);

		var descriptions = [];
		var descriptionArray = thisSkillComp.descriptions;

		for(var i = 0; i < descriptionArray.length; i++) {

			descriptions.push(await getFullDescription(descriptionArray[i]));
			console.log("424: descriptions", descriptions);
		}
		console.log("returning the full skillcomp", thisSkillComp._id);
		return {_id: thisSkillComp._id, name: thisSkillComp.name, level: thisSkillComp.level, descriptions: descriptions};

	} catch (e) {
		throw e;
	}
}

async function getFullDescription (id) {
	if (!ObjectID.isValid(id)) {
		throw "bad description ID";
	};

	var thisDescription = await Description.findById(id);

	var actions = [];
	var actionArray = thisDescription.actions;

	for(var i = 0; i < actionArray.length; i++){
		actions.push(await getFullAction(actionArray[i]));
	};

	return {_id: thisDescription._id, description: thisDescription.description, actions: actions};
}



async function getFullAction (id) {
	if (!ObjectID.isValid(id)) {
		throw "bad action ID";
	};

	console.log("getFullAction");

	var thisAction = await Action.findById(id);

	var knowledges = [];
	var knowledgeArray = await thisAction.knowledges;

	for (var j = 0; j < knowledgeArray.length; j++) {

		if(!ObjectID.isValid(knowledgeArray[j])) {
			return res.status(404).send('bad knowledge id');
		}
		var thisKnowledge = await Knowledge.findById(knowledgeArray[j]);
		knowledges.push(thisKnowledge);
	};
	console.log("Knowledges found: ", knowledges);
	return {_id: thisAction._id, action: thisAction.action, knowledges: knowledges};

}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array)
  }
}

