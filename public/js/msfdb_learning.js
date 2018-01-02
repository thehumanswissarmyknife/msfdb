var actionOptions = "";

// get all learnings into the sidebar
$.getJSON("/learnings", function (data) {
	"use strict";
	data.learnings.forEach(function (element) {
		var thisId = element._id;

		// $("#learnings-sidebar").append("<div class='learning-box' id='" + thisId + "'></div>");
		$("#learnings-sidebar").append(
			$("<div/>", {class:"learning-box", id: thisId}).append(
				$("<a>", {href:"#", text: element.name}))
			);
	});

	// // at the end of the list, create the option to create a new one:
	// $("#learnings-sidebar").append(
	// $("<div/>").append(
	//		$("<button/>", {text:"enter new learning offer", class:"learning-box", id:"newLearning"})
	//		)
	// );

	$(function() {
		$(".draggable").draggable({
			revert: true,
			helper: "clone"
		});
	});
});

// get all actions and fill them in the toolbar
$.getJSON("/actions", function (data) {
	var actions = data.actions;
	actions.forEach(function(element) {
		$("#accordion-actions ul").append(
			$("<li/>", {class:"draggable ui-draggable ui-draggable-handle action", id:element._id, text:element.action})
			);

		// prepare the actions for the options in the modules
		var temp = "<option id='" + element._id + "'>" + element.action + "</option>";
		actionOptions += temp;
	});
	$(function() {
		$(".draggable").draggable({
			revert: true,
			helper: "clone"
		});
	});
});

// get all positions  and fill them in the toolbar
$.getJSON("/positions", function (data) {
	var positions = data.positions;
	positions.forEach(function (element) {
		$("#accordion-positions ul").append(
			$("<li/>", {class: "draggable ui-draggable ui-draggable-handle position", id:element._id, text:toTitleCase(element.title)})
			);
	});

	$(function() {
		$(".draggable").draggable({
			revert: true,
			helper: "clone"
		});
	});
});

// // get all modules  and fill them in the toolbar
// $.getJSON("/modules", function (data) {
// 	var modules = data.modules;
// 	modules.forEach(function (element) {
// 		$("#accordion-modules ul").append(
// 			$("<li/>", {class: "draggable ui-draggable ui-draggable-handle module", id:element._id, text:toTitleCase(element.name)})
// 			);
// 	});

// 	$(function() {
// 		$(".draggable").draggable({
// 			revert: true,
// 			helper: "clone"
// 		});
// 	});
// });

// to be done, when all ajax requests are finished...
$(document).ajaxStop(function () {

	// $("#btnObjective").click(function () {
	$(".btnObjective").click(function () {
		var id = $(this).attr("id");
		var module = id.substring(12, 14);
		console.log("Module", module);
		console.log("Substring 0,11", id.substring(12, 14));
	});

	$(".addModule").click(function () {
		console.log("Adding a module");
		var id = $(this).attr("id");
		var moduleCount = id.substring(12,14);
		console.log("Module:", moduleCount);

		// adding a module to the parants parent
		$row = $(this).parent();
		$div = $row.parent();
		moduleCount += 1;
		$div.append(createNewModule(moduleCount));

		// change the id of the button
		$(this).attr("id", moduleCount);
	});

	// clicking on one of the learnings in the sidebar
	$(".learning-box").click(function () {
		var id = $(this).attr("id");
		console.log("ID", id);
		

		// check what was clicked
		if (id == "newLearning") {		// if it's the NEW button
			createNewLearning();
		} else {
			console.log("Clicked a learning box");
			updateDetails(id);		// fill the detials
		}
	});

	
});

function processForm () {

	// for each module:
	// create all objectives and save the resulting ids inan array
}

function createNewModule (moduleCounter)  {
	var objectiveCounter = 1;

	$moduleDiv = $("<div/>", {class:"form-group", id:"form-learning-module-" + moduleCounter});
	$moduleDiv.append(
		$("<label/>", {for: "learning-modules", text:"Name:"}),
		$("<input/>", {type:"text", class:"form-control", id:"form-learn-module-" + moduleCounter + "-name", placeholder:"Module " + moduleCounter + ": introduction to ..."}),

		// section for the objectives
		$("<label/>", {for: "learning-modules", text:"Objectives:"}),
		$("<div/>", {class:"form-row"}).append(
			$("<div/>", {class:"form-group col-md-9"}).append(
				$("<input/>", {type:"text", class:"form-control", id:"form-learn-module-" + moduleCounter + "-objective-"+objectiveCounter, placeholder:".. participants can explain/do/..."})
				),
			$("<div/>", {class:"form-group col-md-3"}).append(
				$("<button/>", {text:"add objective", class:"btnObjective", id:"addObjective"})
				)
			),

		// section for the actions
		$("<label/>", {for: "learning-modules", text:"Actions:"}),
		$("<div/>", {class:"form-row"}).append(
			$("<div/>", {class:"form-control col-md-9"}).append(
				$("<select multiple/>", {class:"form-control col-md-9", id:"form-learn-module-" + moduleCounter + "-actions"}).append(actionOptions)
				)
			)
		);
	return $moduleDiv;
}

function createNewObjective () {
	// get the current module

	// add another obective
}

function createNewLearning () {
	console.log("creating the form");

	// variables for keeping track of modules and objectives
	var module = 1;

	// clear teh learning details
	$("#learning-details").empty();

	$form = $("<form></form>");
	$form.append(
		$("<div/>", {class: "form-group", id:"form-learning-name"}).append(
			$("<label/>", {for: "learning-name", text:"Name:"}),
			$("<input/>", {type:"text", class:"form-control", id:"form-learn-name-data", placeholder:"Name"})
			),
		$("<div/>", {class: "form-group", id:"form-learning-length"}).append(
			$("<label/>", {for: "learning-length", text:"Length:"}),
			$("<input/>", {type:"text", class:"form-control", id:"form-learn-length-data", placeholder:"1 hour, 1 day, 1 week, ..."})
			),
		$("<div/>", {class: "form-group", id:"form-learning-provider"}).append(
			$("<label/>", {for: "learning-provider", text:"Provided by:"}),
			$("<input/>", {type:"text", class:"form-control", id:"form-learn-provider-data", placeholder:"OCA, OCB, Fritz, ..."})
			),
		$("<div/>", {class: "form-group", id:"form-learning-methodology"}).append(
			$("<label/>", {for: "learning-methodology", text:"Methodology: "}),
			$("<select/>", {id:"form-learn-method-data"}).append(
				$("<option/>", {text: "webinar", id:"webinar"}),
				$("<option/>", {text: "eLearning", id:"elearning"}),
				$("<option/>", {text: "face 2 face", id:"f2f"})
				)
			),
		$("<div/>", {class: "form-group", id:"form-learning-remarks"}).append(
			$("<label/>", {for: "learning-provider", text:"Remarks:"}),
			$("<input/>", {type:"text", class:"form-control", id:"form-learn-remarks-data", placeholder:"only done once per year ..."})
			),
		$("<div/>", {class: "form-group", id:"form-learning-modules"}).append(

			// section for the modules
			$("<div/>", {class:"form-row"}).append(
				$("<label/>", {for: "learning-modules", text:"Modules:"}),
				$("<button/>", {class:"addModule", id:"moduleCount-1", text:"add module"})
				),
			$("<div/>", {class: "form-group", id:"form-learning-modules"}).append(createNewModule (1))
			),
		$("<button/>", {type:"submit", text:"submit"})
		);

	// attach the form to the learning details
	$("#learning-details").append($form);
}

function updateDetails (id) {
	// get the full info on this learning
	$.getJSON("/full-learning/" + id, function (data) {

		var thisLearning = data.learning;
		console.log("data: ", data);

		// empty the learning details
		$("#learning-details").empty();

		//create the div for everything
		$("#learning-details").append(
			$("<div/>", {class:"learning-details-content", id:"det-" + id}). append(
				$("<div/>", {class:"learning-title", id:"det-" + id + "-name"}). append(
					$("<h2/>", {text:thisLearning.name})
					),
				$("<div/>", {class:"learning-provider", id:"det-" + id + "-provider", text:"Provided by " + thisLearning.provider}),
				$("<div/>", {class:"learning-length", id:"det-" + id + "-length"}),
				$("<div/>", {class:"learning-methodology", id:"det-" + id + "-methodology", text:"Methodology: " + thisLearning.methodology}),
				$("<div/>", {class:"learning-remarks", id:"det-" + id + "-remarks", text:"Comment: " + thisLearning.remarks}),
				$("<div/>", {class:"learning-periodity", id:"det-" + id + "-periodity", text:"Periodity: " + thisLearning.periodity}),
				$("<div/>", {class:"learning-modules", id:"det-" + id + "-modules", class: "myDropzone-module"}).append(
					$("<h3/>", { text:"Modules: "})
					)
				)
			);

		// for all non-OCA learning offers, make the provider red
		if(thisLearning.provider != "OCA") {
			$(".learning-provider").css("color", "red");
		}

		$("#det-" + id +"-modules").append(
			$("<div/>", {id:"learning-module-accordion"}));

		// variable to hold the lenth, calculated rom all module durations
		var learningLength = 0;

		// create the frame for all modules
		for (var i = 0; i < thisLearning.modules.length; i++) {

			var thisModule = thisLearning.modules[i];

			// add the duration of this module to the learning length
			learningLength += thisModule.duration;

				$("#learning-module-accordion").append(
					$("<h3/>", {text:thisModule.name}),
					$("<div/>", {id:"mod-"+thisModule._id}).append(
						$("<div/>", {id:"mod-"+thisModule._id+"-obj"}).append(
							$("<h7/>",{text:"Objectives:"}),
							$("<ul/>")
							),
						$("<div/>", {id:"mod-"+thisModule._id+"-act", class:"myDropzone-action"}).append(
							$("<h7/>", {text:"Actions:"}),
							$("<ul/>")
							),
						$("<div />", {id:"mod-"+thisModule._id+"-dur"}).append(
							$("<h7/>", {text: "Length: "})
							)
						)
					);

			// filling the objectives into the UL
			for (var j = 0; j < thisModule.objectives.length; j++) {
				var thisObjective = thisModule.objectives[j];
				$("#mod-"+thisModule._id+"-obj ul").append(
					$("<li/>", {class:"draggable objective", id:"obj-"+thisObjective._id, text:thisObjective})
					);
			}

			// filling the actions into the UL
			for (var k = 0; k < thisModule.actions.length; k++) {
				var thisAction = thisModule.actions[k];
				$("#mod-"+thisModule._id+"-act ul").append(
					$("<li/>", {class:"draggable mod-action", id:"act-"+thisAction._id, text:thisAction.action})
					);
			}

			$("#mod-"+thisModule._id+"-dur").append(thisModule.duration + " minutes");

		}
		if(thisLearning.length!=null) {
			$(".learning-length").append(thisLearning.length);
		} else {
			if(learningLength < 480) {
				$(".learning-length").append("approximately " + parseInt(learningLength/60) + "h " + learningLength%60 + " minutes");
			} else {
				$(".learning-length").append("approximately " + parseInt(learningLength/480) + " day(s) ");
			}
		}
		
		

		// after all details are filled, do some jQuery UI stuff
		$( function() {

			// activte the accordion
			$( "#learning-module-accordion" ).accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
			});

			// make the items draggabel
			$(".draggable").draggable({
				revert: true,
				helper: "clone"
			});

			// prepare the dropzone to drop the actions there
			$(".myDropzone-action").droppable({
				accept: ".action",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");

					// get the id of the dropped action and the module
					var droppedAction = $(ui.draggable).attr("id");
					var actionText = $(ui.draggable).text();
					var module = $(this).attr("id").substring(4, 28);

					// AJAX patching of the module
					$.ajax({
						url: "/module/".concat(module),
						dataType: "json",
						type: "patch",
						contentType: "application/json",
						data: JSON.stringify({
							actions: [droppedAction]
						}),
						success: function(data, textStatus, jQxhr) {
							// when successfull, update the page!
							// updateDetails(thisLearning._id);
							$("#mod-"+module+"-act ul").append(
								$("<li/>", {class:"draggable mod-action", id:"act-"+droppedAction, text:actionText})
								);
						},
						error: function(jqXhr, textStatus, errorThrown) {
							console.log(errorThrown);
						}
					});
				}
			});

			$(".myDropzone-module").droppable({
				accept: ".module",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");

					// get the id of the dropped action and the module
					var droppedModule = $(ui.draggable).attr("id");
					var learning = $(this).attr("id").substring(4, 28);

					// AJAX patching of the module
					$.ajax({
						url: "/learning/".concat(learning),
						dataType: "json",
						type: "patch",
						contentType: "application/json",
						data: JSON.stringify({
							actions: [droppedAction]
						}),
						success: function(data, textStatus, jQxhr) {
							// when successfull, update the page!
							updateDetails(thisLearning._id);
						},
						error: function(jqXhr, textStatus, errorThrown) {
							console.log(errorThrown);
						}
					});
				}
			});

		});
	});
}

// returns a title case string
function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

// returns a camelized string
function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
		return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
	}).replace(/\s+/g, '');
}