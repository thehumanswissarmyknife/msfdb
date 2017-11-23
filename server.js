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
var {Descriptor} = require('./models/descriptor');
var {Knowledge} = require('./models/knowledge');

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

app.get('/positions/:id', async (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)){
		return res.status(404).send({status: 'not created', error: 'bad object ID'});
	}
	try {
		// console.log(Position.find());
		var positions = await Position.findById(id);
		res.status(200).send({count: positions.length, positions});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.patch('/positions/:id', (req, res) => {
	var id = req.params.id;
	var body = _.pick(req.body, ['nextPositions', 'skills', 'competencies']);
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 

	Position.findByIdAndUpdate(id, {$addToSet: body}, {new: true}).then((position) => {
		res.status(200).send({position, status: 'updated'});
	}).catch((e) => {
		res.status(400).send(e);
	});

});

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

app.patch('/skillcomps/:id', async (req, res) => {
	var id = req.params.id;
	if (!ObjectID.isValid(req.params.id)) {
		return res.status(404).send({});
	} 
	var body = _.pick(req.body, ['descriptors']);
	try {
		res.status(200).send(await SkillComp.findByIdAndUpdate(id, {$addToSet: body}, {new: true}));
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

app.get('/full-skillcomps/:id', async (req, res) => {
	var id = req.params.id;
	if(!ObjectID.isValid(id)) {
		return res.status(404).send("Bad skillcomp ID");
	}
	try {
		var thisSkillComp = await getFullSkillComp(id);
		res.status(200).send({thisSkillComp});
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
app.post('/descriptors', async(req, res) => {
	try {
		var descriptor = new Descriptor(req.body);

		descriptor = await descriptor.save();
		res.status(200).send({descriptor, status: 'created'});
	} catch (e) {
		res.status(404).send({e, status: 'not created'});
	}

});

app.get('/descriptors', async (req, res) => {
	try {
		var descriptors = await Descriptor.find();
		res.status(200).send({descriptors});
	} catch(e) {
		res.status(404).send(e);
	}
	

})

app.get('/full-descriptors', async (req, res) => {
	try {
		var descriptorArray = await Descriptor.find();
		var descriptors = [];

		// go through all descriptors
		for(var n = 0; n < descriptorArray.length; n++) {
			descriptors.push(await getFullDescriptor( descriptorArray[n]._id));
		}

		res.status(200).send({descriptors});
	} catch (e) {
		res.status(404).send(e);
	}
});

app.get('/descriptors/:id', async (req, res) => {
	var thisDescriptor = req.params.id;
	if(!ObjectID.isValid(thisDescriptor)){
		return res.status(404).send('Bad descriptor ID');
	}

	try {
		var descriptor = await getFullDescriptor(thisDescriptor);
		res.status(200).send({descriptor});
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
	try {
		res.status(200).send(await Action.findByIdAndUpdate(id, {$addToSet: body}, {new: true}));
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

		for(var i = 0; i < actionArray.length; i++){
			actions.push(await getFullAction(actionArray[i]._id));
		}
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




// funtions to get the full details

async function getFullSkillComp (id) {
	if (!ObjectID.isValid(id)) {
		throw "bad killcomp ID";
	};

	try {
		var thisSkillComp = await SkillComp.findById(id);

		var descriptors = [];
		var descriptorArray = thisSkillComp.descriptors;

		for(var i = 0; i < descriptorArray.length; i++) {
			descriptors.push(await getFullDescriptor(descriptorArray[i]));
		}

		return {_id: thisSkillComp._id, name: thisSkillComp.name, level: thisSkillComp.level, descriptors: descriptors};

	} catch (e) {
		throw e;
	}
}

async function getFullDescriptor (id) {
	if (!ObjectID.isValid(id)) {
		throw "bad descriptor ID";
	};

	var thisDescriptor = await Descriptor.findById(id);

	var actions = [];
	var actionArray = thisDescriptor.actions;

	for(var i = 0; i < actionArray.length; i++){
		actions.push(await getFullAction(actionArray[i]));
	};

	return {_id: thisDescriptor._id, descriptor: thisDescriptor.descriptor, actions: actions};
}



async function getFullAction (id) {
	if (!ObjectID.isValid(id)) {
		throw "bad Action ID";
	};

	var thisAction = await Action.findById(id);

	var knowledges = [];
	var knowledgeArray = await thisAction.knowledges;
	console.log("MY thisAction", thisAction);

	for (var j = 0; j < knowledgeArray.length; j++) {

		if(!ObjectID.isValid(knowledgeArray[j])) {
			return res.status(404).send('bad knowledge id');
		}
		var thisKnowledge = await Knowledge.findById(knowledgeArray[j]);
		knowledges.push(thisKnowledge);
	};
	return {_id: thisAction._id, action: thisAction.action, knowledges: knowledges};

}


