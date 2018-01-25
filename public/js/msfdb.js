

// when looking at the position
$(".navPos").click(function () {
	// change the navigation bar
	prepPage("navPos");

	$("#sidebar").append(
		$("<div/>", {id:"positions"})
		);

	$("#toolbar").prepend(
		$("<div/>", {id:"accordion"}).append(
			$("<h3/>", {text:"Actions"}),
			$("<div/>", {id:"accordion-actions"}),
			$("<h3/>", {text:"Positions"}),
			$("<div/>", {id:"accordion-positions"}).append(
				$("<ul/>")
				),
			$("<h3/>", {text:"Tech Skills & Competencies"}),
			$("<div/>", {id:"accordion-skillcomps"}).append(
				$("<ul/>")
				),
			$("<h3/>", {text:"Learnings"}),
			$("<div/>", {id:"accordion-learnings"}).append(
				$("<ul/>")
				)
			),
			$("<div/>", {id:"trashcan", class: "myDropzone-action"})
		);

	// get all positions into the sidebar
	$.getJSON("/positions", function(data) {

		data.positions.sort(compareLevels);

		data.positions.forEach(function(element) {
			var thisId = element._id;

			$("#positions").append(
				$("<div/>", {class:"position-box", id:thisId}).append(
					$("<div/>", {class:"position-title", id:thisId + "-title-box"}).append(
						$("<a/>", {text:toTitleCase(element.title), href:"#"})
						)
					)
				);

			$("#accordion-positions ul").append(
				$("<li/>", {class:"draggable position", id:thisId, text:toTitleCase(element.title)})
				);
		});
	});

	// get all actions and fill them in the toolbar
	$.getJSON("/actions", function(data) {

		var skillsForActions = [];

		var actions = data.actions;

		actions.forEach(function(element) {

			if($("."+camelize(element.skill)+"-actions").length === 0 ){
				$("#accordion-actions").append(
					$("<h5/>", {text:toTitleCase(element.skill)}),
					$("<div/>", {id:camelize(element.skill)+"-actions", class:camelize(element.skill)+"-actions"}).append(
						$("<ul/>")
						)
					);

				skillsForActions.push(camelize(element.skill));
			}
			
			$("#"+ camelize(element.skill)+"-actions ul").append(
				$("<li/>", {class: "draggable action", id:element._id, text: element.action})
				);
		});
		$( "#accordion-actions").accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
		});
	});

	// get all skillcomps and fill them in the toolbar
	$.getJSON("/skillcomps", function(data) {
		var skillcomps = data.skillComps;
		skillcomps.sort(sortSkillComps);

		skillcomps.forEach(function(element) {
			if (element.level > 0) {
				$("#accordion-skillcomps ul").append(
					$("<li/>", {class:"draggable skillcomp", id:element._id, text: toTitleCase(element.name) + " " + element.level})
					);
			}
		});
	});

	// get all learnings  and fill them in the toolbar
	$.getJSON("/learnings", function(data) {
		var learnings = data.learnings;
		learnings.forEach(function(element) {
			$("#accordion-learnings ul").append(
				$("<li/>", {class:"draggable learning", id:element._id, text:element.name})
				);
		});
	});

	$(function() {
		$(".draggable").draggable({
			revert: true,
			helper: "clone",
				scroll: false
		});

		$( "#accordion" ).accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
		});
	});


	$(document).ajaxStop(function() {
		$(".position-box").click(function() {
			var id = $(this).attr("id");

			// show the details for this position
			updateDetails(id);
		});
	});

	function updateDetails(id) {

		//load all data for this position
		$.getJSON("/full-position/" + id, function(data) {
			// console.log("id", id);
			$("#details").children().remove();
			fillPositionDetails(data);
		});
	}


	function fillPositionDetails(pos) {
		var position = pos.position;

		var id = position._id;
		$("#details").empty();

		$("#details").append(
			$("<div/>", {id:"pos-detail-header"}).append(
				$("<h2/>", {text: toTitleCase(position.title)})
				),
			$("<div/>", {id:"pos-detail-irffg", text:toTitleCase(position.irffg) + " - Level " + position.level}),
			$("<div/>"),
			$("<div/>", {id:"pos-det-req"}).append(
				$("<h3/>", {text: "Requirements:"}),
				$("<div/>", {class:"pos-det-req myDropzone-requirement", id:"pos-det-req-" + id})
				),
			$("<div/>", {id:"pos-det-learn"}).append(
				$("<h3/>", {text: "Learnings:"})
				),
			$("<div/>", {id: "pos-det-know"}).append(
				$("<h3/>", {text:"Knowledge:"})
				),
			$("<div/>", {class: "myDropzone-position", id: "pos-det-nextPos-" + id}).append(
				$("<h3/>", {text:"Next positions:"})
				),
			$("<div/>", {id:"pos-det-skillcomps"}).append(
				$("<div/>", {class:"pos-det-skills myDropzone-skill", id:"pos-det-skills"}).append(
					$("<h3/>", {text:"Technical Skills:"}),
					$("<div/>", {id: "pos-det-skills-accordion"})
					),
				$("<div/>", {class:"pos-det-comps myDropzone-skill", id:"pos-det-comps"}).append(
					$("<h3/>", {text:"Competencies:"}),
					$("<div/>", {id:"pos-det-comps-accordion"})
					)
				)
			);

		//
		// ################ check for requirements and get the name for each
		//
		if (position.requirements.length > 0) {
			// console.log("position.requirements.length", position.requirements.length);

			for (var i = 0; i < position.requirements.length; i++) {
				var thisReq = position.requirements[i];
				$("#pos-det-req-" + id).append(
					$("<div/>", {id:"pos-det-req-months-mission-" + thisReq.months + thisReq.missions, text: thisReq.months + " months or/and " + thisReq.missions + " missions in these positions:"}).append(
						$("<ul/>"))
						);
				// "<div id='pos-det-req-months-mission-'" + thisReq.months + thisReq.missions + ">" + thisReq.months + " months or/and " + thisReq.missions + " missions in these positions: <ul></ul></div>");

				for (var j = 0; j < thisReq.positions.length; j++) {
					var thisPos = thisReq.positions[j];
					$("#pos-det-req-" + id + " ul").append(
						$("<li/>", {text:toTitleCase(thisPos.title)})
						);
				}
			}
		} else {
			$("#pos-det-req-" + id).append(
				$("<div/>", {class:"pos-det-req-item", text:"no requirements"})
				);
		}



		//
		// ################ create div for learning
		//
		$("#pos-det-learn").append(
			$("<div/>", {class:"pos-det-learn myDropzone-learning", id:"pos-det-learn-" + id}));

		if (position.learnings.length > 0) {
			position.learnings.forEach(function(element) {
				// $("#pos-det-learn-"+id).append("<div class='pos-det-learn-item'>Taking part in the "+element.learning+" "+element.timing+" this position is "+ element.mandatory+"</div>");
				$("#pos-det-learn-" + id).append(
					$("<div/>", {class:"pos-det-learn-item", text:element.learning})
					);
			});

		} else {
			$("#pos-det-learn-" + id).append(
				$("<div/>", {class:"pos-det-learn-item", text:"No training necessary."})
				);
		}

		//
		// ################ create div for nextpositions
		//
		$("#pos-det-nextPos-" + id).append(
			$("<div/>", {id:"pos-det-nextPos-accordion", class:"myDropzone-position"})
			);

		if (position.nextPositions.length > 0) {

			// cycling through all next positions
			for (var i = 0; i < position.nextPositions.length; i++) {

				var thisNextPosition = position.nextPositions[i];
				console.log("thisNextPosition", thisNextPosition);

				// create the div for the next position
				$("#pos-det-nextPos-accordion").append(
					$("<h3/>", {text:toTitleCase(thisNextPosition.title)}),
					$("<div/>", {id:"pos-det-nextPos-accordion-" + thisNextPosition._id})
					);

				executeSkillDelta(id, thisNextPosition._id);

			}


			$(document).ajaxStop(function() {

			});
		}


		// create div for technical skills

		if (position.skills.length > 0) {

			mySkills = position.skills;
			// console.log("MySkills:", mySkills);


			mySkills.forEach(function(skillsData) {
				// console.log("Skillsdata", skillsData)
				console.log("Inherited", skillsData.inherited);

				$("#pos-det-skills-accordion").append(
					$("<h4/>", {text:toTitleCase(skillsData.name) + " " + skillsData.level}),
					$("<div/>", {class:"pos-det-skills-accordion", id:"pos-det-skills-accordion-" + skillsData._id})
					);
				// "<h4>" + toTitleCase(skillsData.name) + " " + skillsData.level + "</H4><div class='pos-det-skills-accordion' id='pos-det-skills-accordion-" + skillsData._id + "'></div>");

				skillsData.descriptions.forEach(function(descrData) {
					$("#pos-det-skills-accordion-" + skillsData._id).append(
						$("<h5/>", {text:descrData.description}),
						$("<div/>", {class:"pos-det-skills-accordion-description", id:"pos-det-skills-accordion-" + skillsData._id + "-" + descrData._id}).append(
							$("<ul>"))
						);
					
					descrData.actions.forEach(function(actData) {
						$("#pos-det-skills-accordion-" + skillsData._id + "-" + descrData._id + " ul").append(
							$("<li/>", {class:"draggable action", id:descrData._id + "-" + actData._id + "-" + skillsData._id, text:actData.action}));
						// "<li class='draggable action' id='" + descrData._id + "-" + actData._id + "-" + skillsData._id + "'>" + actData.action + "</li>");
					});

					$(document).ajaxStop(function() {
						$("#pos-det-skills-accordion-" + skillsData._id).accordion({
							collapsible: true,
							heightStyle: "content",
							header: "h5",
							active: false
						});
						$(".draggable").draggable({
							revert: true,
							helper: "clone",
				scroll: false
						});
					});
				});

				// if there are inherited skkills
				// create a div, fill it and then in the end...
				if (skillsData.inherited.length > 0) {
					$("#pos-det-skills-accordion-" + skillsData._id).append(
						$("<div/>", {text:"---- inherited skills ----"}),
						$("<div/>", {class:"pos-det-skills-accordion-description", id:"pos-det-skills-accordion-" + skillsData._id + "-inherited"})
						);

					skillsData.inherited.forEach(function(inhDescrData) {
						$("#pos-det-skills-accordion-" + skillsData._id + "-inherited").append(
							$("<h5/>", {text:inhDescrData.description}),
							$("<div/>", {class:"pos-det-skills-accordion-description", id:"pos-det-skills-accordion-" + skillsData._id + "-inherited-" + inhDescrData._id}).append(
								$("<ul/>")
								)
							);

						inhDescrData.actions.forEach(function(inhActData) {
							$("#pos-det-skills-accordion-" + skillsData._id + "-inherited-" + inhDescrData._id + " ul").append(
								$("<li/>", {text:inhActData.action})
								);
						});

						$(document).ajaxStop(function() {
							$("#pos-det-skills-accordion-" + skillsData._id).accordion({
								collapsible: true,
								heightStyle: "content",
								header: "h5",
								active: false
							});
							$("#pos-det-skills-accordion-" + skillsData._id).accordion({
								collapsible: true,
								heightStyle: "content",
								header: "h6",
								active: false
							});
						});
					});
				}
			});
		}

		if (position.competencies.length > 0) {

			myComps = position.competencies;
			// console.log("competencies:", myComps);


			myComps.forEach(function(compsData) {
				// console.log("compsData", compsData)

				$("#pos-det-comps-accordion").append(
					$("<h4/>", {text:toTitleCase(compsData.name) + " " + compsData.level}),
					$("<div/>", {class:"pos-det-comps-accordion", id:"pos-det-comps-accordion-" + compsData._id}).append(
						$("<ul/>"))
					);
				
				compsData.descriptions.forEach(function(descrData) {
					$("#pos-det-comps-accordion-" + compsData._id + " ul").append(
						$("<li/>", {text:descrData.description})
						);
				});
			});
		}

		$(document).ajaxStop(function() {
			$("#pos-det-skills-accordion").accordion({
				collapsible: true,
				heightStyle: "content",
				active: false
			});

			$("#pos-det-comps-accordion").accordion({
				collapsible: true,
				heightStyle: "content",
				active: false
			});

			$("#pos-det-nextPos-accordion").accordion({
				collapsible: true,
				heightStyle: "content",
				header: "h3",
				active: false
			});

		});

		// do all the updating for the dropzones

		$(function() {
			$(".myDropzone-learning").droppable({
				accept: ".learning",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");
					var droppedLearning = $(ui.draggable).attr("id");
					var thisPosition = $(this).attr("id").substring(14, 38);
					// addLearningForm(droppedLearning, thisPosition);

					console.log("Just dropped " + droppedLearning + " on ", thisPosition);
					$.ajax({
						url: "/position/".concat(thisPosition),
						dataType: "json",
						type: "patch",
						contentType: "application/json",
						data: JSON.stringify({
							learnings: {
								"learning": droppedLearning,
								"mandatory": "mandatory",
								"timing": "before"
							}
						}),
						success: function(data, textStatus, jQxhr) {
							updateDetails(thisPosition);
						},
						error: function(jqXhr, textStatus, errorThrown) {
							console.log(errorThrown);
						}
					});

				}
			});


			$(".myDropzone-action").droppable({
				accept: ".action",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");
					var fullID = $(ui.draggable).attr("id");
					console.log("fullID", fullID);
					var descriptionID = fullID.substring(0, 24);
					var actionID = fullID.substring(25, 49);
					var skillCompID = fullID.substring(50, 74);
					console.log("SkillCompId", skillCompID);

					var action = "";
					var description = "";
					var affectedPositions = [];

					$.getJSON('/description/' + descriptionID, function(thisDescription) {

						description = thisDescription;
						console.log("Description inner", description);

						$.getJSON('/action/' + actionID, function(thisAction) {

							action = thisAction;
							console.log("action inner", action);

							$.getJSON("/positionsforskill/" + skillCompID, function(positions) {
								positions = positions.positions;
								for (var i = 0; i < positions.length; i++) {
									console.log("Positions i", positions[i]);
									affectedPositions.push(positions[i].title);
								}
								console.log("affectedPositions", affectedPositions);
								alertBoxActionRemoval(action.action, description.description, affectedPositions);
							});
						});
					});
				}
			});

			$(".myDropzone-requirement").droppable({
				accept: ".position",
				classes: {
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");
				}
			});

			$(".myDropzone-position").droppable({
				accept: ".position",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped a new next position");
					var nextPosition = $(ui.draggable).attr("id");
					var thisPosition = $(this).attr("id").substring(16, 40);
					// addLearningForm(droppedLearning, thisPosition);

					console.log("Just dropped " + nextPosition + " on ", thisPosition);

					$.ajax({
						url: "/position/".concat(thisPosition),
						dataType: "json",
						type: "patch",
						contentType: "application/json",
						data: JSON.stringify({
							"nextPositions": nextPosition
						}),
						success: function(data, textStatus, jQxhr) {
							updateDetails(thisPosition);
						},
						error: function(jqXhr, textStatus, errorThrown) {
							console.log(errorThrown);
						}
					});
				}
			});

			$(".myDropzone-knowledge").droppable({
				accept: ".knowledge",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");
				}
			});

			$(".myDropzone-skill").droppable({
				accept: ".skillcomp",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");
					var droppedSkill = $(ui.draggable).attr("id");
					console.log("Just dropped: ", droppedSkill);
				}
			});

			$(".myDropzone-comp").droppable({
				accept: ".skillcomp",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");
				}
			});
		});
	}

	function getPositionDetails(position) {
		$("body").children().hide();
		$("body").prepend("<div class='container position-details-container' id='detailsOf-" + position + "'>&nbsp;</div>");
		$("#detailsOf-" + position).css("position", "fixed");
		$("#detailsOf-" + position).append("<button type='button' class='btn btn-primary'>back to the overview</button>");
		$("#detailsOf-" + position).append("<div class='row' id='contentOf-" + position + "'></div>");

		var thisPosition = "";
		$.getJSON("/position/" + position, function(data) {

			// everything that you want to have done, ut it here
			thisPosition = data.positions;
			thisTitle = thisPosition.title;
			$("#contentOf-" + position).append("<h1>" + toTitleCase(thisPosition.title) + "</h1>");
		});
	}

	// common functions
	function compareLevels(a, b) {
		if (a.level > b.level)
			return -1;
		if (a.level < b.level)
			return 1;
		return 0;
	}

	function sortSkillComps(a, b) {
		if (a.name == b.name && a.level > b.level) {
			return 1;
		}
		if (a.name == b.name && a.level < b.level) {
			return -1;
		}
		if (a.name > b.name) {
			return 1;
		}
		if (a.name < b.name) {
			return -1;
		}

	}

	function alertBoxActionRemoval(action, description, positions) {
		if (confirm("you are about to remove '" + action.action + "' from '" + description.description + "'. This will affect these positions: " + positions) === true) {
			console.log("remove that action");
			$.getJSON("/removeactionfromdescription/" + action._id + "/" + description._id, function(description) {
				console.log("Description updated:", description);
			});

		} else {
			console.log("rather not");
		}
	}


});


// ###################################################
// section for the learnings
// ###################################################

$(".navLearn").click(function () {
	// // change the navigation bar
	prepPage("navLearn");

	$("#toolbar").prepend(
		$("<div/>", {id:"accordion"}).append(
			$("<h3/>", {text:"Actions"}),
			$("<div/>", {id:"accordion-actions"}),
			$("<h3/>", {text:"Positions"}),
			$("<div/>", {id:"accordion-positions"}).append(
				$("<ul/>")
				)
			),
			$("<div/>", {id:"trashcan", class: "myDropzone-action"})
		);


	// get all learnings into the sidebar
	$.getJSON("/learnings", function (data) {
		"use strict";
		data.learnings.forEach(function (element) {
			var thisId = element._id;

			$("#sidebar").append(
				$("<div/>", {id:"learning-accordion"}),
				$("<div/>", {id:"learning-accordion-proposed"})
				);


			// check if there already is a n accordion header for this learning category


			if($(".learning-cat"+camelize(element.category)).length === 0) {
				$("#learning-accordion").append(
					$("<h3/>", {text:element.category}),
					$("<div/>", {id:"learning-cat"+camelize(element.category), class:"learning-cat"+camelize(element.category)}).append(
						$("<ul/>")
						)
					);
			}

			if(element.status === "proposed") {

				if($(".learning-proposed").length === 0) {
					$("#learning-accordion-proposed").append(
						$("<h3/>", {text:"proposed learning offers"}),
						$("<div/>", {id:"learning-proposed", class:"learning-proposed"})
						);
				}

				$("#learning-proposed").append(
					$("<div/>", {class:"learning-box", id: thisId}).append(
						$("<a>", {href:"#", text: element.name}))
					);
				
			}

			if(element.modules.length > 0){
				$("#learning-cat"+camelize(element.category)).append(
					$("<div/>", {class:"learning-box", id: thisId}).append(
						$("<a>", {href:"#", text: element.name}))
					);
			}
		});
	});

	// get all actions and fill them in the toolbar
	$.getJSON("/actions", function(data) {

		var skillsForActions = [];

		var actions = data.actions;

		actions.forEach(function(element) {

			if($("."+camelize(element.skill)+"-actions").length === 0 ){

				$("#accordion-actions").append(
					$("<h5/>", {text:toTitleCase(element.skill)}),
					$("<div/>", {id:camelize(element.skill)+"-actions", class:camelize(element.skill)+"-actions"}).append(
						$("<ul/>")
						)
					);

				skillsForActions.push(camelize(element.skill));
			}
			
			$("#"+ camelize(element.skill)+"-actions ul").append(
				$("<li/>", {class: "draggable action", id:element._id, text: element.action})
				);
		});
		$( "#accordion-actions").accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
		});
		$( "#learning-accordion").accordion({
			collapsible: true,
			heightStyle: "content",
			active: 0
		});
		$( "#learning-accordion-proposed").accordion({
			collapsible: true,
			heightStyle: "content",
			active: false
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
	});

	// to be done, when all ajax requests are finished...
	$(document).ajaxStop(function () {

		// clicking on one of the learnings in the sidebar
		$(".learning-box").click(function () {
			var id = $(this).attr("id");
			// console.log("ID", id);
			

			// check what was clicked
			if (id == "newLearning") {		// if it's the NEW button
				createNewLearning();
			} else {
				// console.log("Clicked a learning box");
				updateDetails(id);		// fill the detials
			}
		});

		$(function() {
			$(".draggable").draggable({
				revert: true,
				helper: "clone",
				scroll: false
			});

			$( "#accordion" ).accordion({
				collapsible: true,
				heightStyle: "content",
				active: false
			});

		});

		
	});

	function updateDetails (id) {
		// get the full info on this learning
		$.getJSON("/full-learning/" + id, function (data) {

			var thisLearning = data.learning;
			// console.log("data: ", data);

			// empty the learning details
			$("#details").empty();

			//create the div for everything
			$("#details").append(
				$("<div/>", {class:"learning-details-content", id:"det-" + id}). append(
					$("<div/>", {class:"learning-title", id:"det-" + id + "-name"}). append(
						$("<h2/>", {text:thisLearning.name})
						),
					$("<div/>", {class:"learning-provider", id:"det-" + id + "-provider", text:"Provided by " + thisLearning.provider}),
					$("<div/>", {class:"learning-length", id:"det-" + id + "-length"}),
					$("<div/>", {class:"learning-methodology", id:"det-" + id + "-methodology", text:"Methodology: " + thisLearning.methodology}),
					$("<div/>", {class:"learning-remarks", id:"det-" + id + "-remarks", text:"Comment: " + thisLearning.remarks}),
					$("<div/>", {class:"learning-periodity", id:"det-" + id + "-periodity", text:"Periodity: " + thisLearning.periodity}),
					$("<div/>", {class:"learning-cost", id:"det-"+ id + "-cost", text:"Cost: "}),
					$("<div/>", {class:"learning-modules myDropzone-module", id:"det-" + id + "-modules"}).append(
						$("<h3/>", { text:"Modules: "})
						)
					)
				);

			// for all non-OCA learning offers, make the provider red
			if(thisLearning.provider != "OCA") {
				$(".learning-provider").css("color", "red");
			}

			if(thisLearning.hasOwnProperty('cost')) {
				$("#det-"+ id + "-cost").text("Cost: " + thisLearning.cost);
			} else {
				$("#det-"+ id + "-cost").remove();
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
						$("<li/>", {class:"objective", id:"obj-"+thisObjective._id, text:thisObjective})
						);
				}

				// filling the actions into the UL
				for (var k = 0; k < thisModule.actions.length; k++) {
					var thisAction = thisModule.actions[k];
					$("#mod-"+thisModule._id+"-act ul").append(
						$("<li/>", {class:"draggable mod-action", id:"act-"+thisAction._id, text:thisAction.action})
						);
				}

				if(thisModule.duration !== null) {
					$("#mod-"+thisModule._id+"-dur").append(thisModule.duration + " minutes");
				} else {
					$("#mod-"+thisModule._id+"-dur h7").remove();
				}

				

			}
			if (typeof thisLearning.length != 'undefined'){
				$(".learning-length").append(thisLearning.length);
			} else {
				if(learningLength < 480) {
					$(".learning-length").append("approximately " + parseInt(learningLength/60, 10) + "h " + learningLength%60 + " minutes");
				} else {
					$(".learning-length").append("approximately " + parseInt(learningLength/480, 10) + " day(s) ");
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
				// $(".draggable").draggable({
				//	revert: true,
				//	helper: "clone",
				// scroll: false
				// });

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
});

// ##################################################
// section for the learning gap
// ##################################################

$(".navGap").click(function () {

	prepPage("navGap");

	// create the dropzones in the toolbar
	// get all current learnings and put them with their modules in the toolbar
	$.getJSON("/full-learnings", function (data) {

		var learnings = data.learnings;

		$("#toolbar").append(
			$("<div/>", {id:"learning-accordion"})
			);

		// loop through all learnings
		for (var i = 0; i < learnings.length; i++) {
			var thisLearning = learnings[i];

			// only if this learning has modules...
			if(thisLearning.modules.length > 0){
				$("#learning-accordion").append(
					$("<h2/>", {text:thisLearning.name}),
					$("<div/>", {id:thisLearning._id}).append(
						"<ul/>")
					);

				for (var j = 0; j<thisLearning.modules.length; j++) {
					var thisModule = thisLearning.modules[j];
					$("#" + thisLearning._id + " ul").append(
						$("<li/>", {text:thisModule.name, class:"myDropzone-module-action", id:thisModule._id})
						);
				}
			}
		}

	});



	// get the learning gap and populate the details
	$.getJSON("/learning-gap", function (data) {

		$("#details").append(
			$("<h2/>", {text:"supply actions not covered by learning offers"}),
			$("<div/>", {id:"uncoveredActions-accordion"}).append(
				$("<ul/>")
				)
			);

		// loop through all the actions not covered by learnig offers
		data.uncoveredActions.forEach(function (element) {
			var thisId = element._id;
			var thisAction = element.action;

			// check if we already have a heading for this SKILL, if no, create one, otherwise
			if ( $( ".uncoveredAction-skill-" + camelize(element.skill)).length>0) {
				$("#uncoveredAction-skill-" + camelize(element.skill) +"-ul").append(
					$("<li/>", {text: element.action, id:element._id, class:"draggable action"})
					);

				// append 
			} else {
				$("#uncoveredActions-accordion").append(
					$("<h7/>", {id:"uncoveredAction-skill-" + camelize(element.skill), class:"uncoveredAction-skill-" + camelize(element.skill), text:toTitleCase(element.skill)}),
					$("<div/>").append(
						$("<ul/>", {id:"uncoveredAction-skill-" + camelize(element.skill)+"-ul"}).append(
							$("<li/>", {text: element.action, id:element._id, class:"draggable action"}))
						)
				);
			}
		});

		$("#details").append(
			$("<h2/>", {text:"supply actions that are already covered by learning offers"}),
			$("<div/>", {id:"coveredActions-accordion"}).append(
				$("<ul/>")
				)
			);

		// loop through all actions that are covered by a learning offer
		data.coveredActionsAndModules.forEach(function (element) {

			// check if we already have a heading for this SKILL, if no, create one, otherwise
			if ( $( ".coveredAction-skill-" + camelize(element.skill)).length>0) {
				$("#coveredAction-skill-" + camelize(element.skill) +"-ul").append(
					$("<li/>", {text: element.action + " ["+element.learning +" - "+ element.module+"]"})
					);

				// append 
			} else {
				$("#coveredActions-accordion").append(
					$("<h7/>", {id:"coveredAction-skill-" + camelize(element.skill), class:"coveredAction-skill-" + camelize(element.skill), text:toTitleCase(element.skill)}),
					$("<div/>").append(
						$("<ul/>", {id:"coveredAction-skill-" + camelize(element.skill)+"-ul"}).append(
							$("<li/>", {text: element.action + " ["+element.learning +" - "+ element.module+"]"}))
						)
				);
			}
		});

		$(document).ajaxStop(function() {
			$( "#uncoveredActions-accordion" ).accordion({
				collapsible: true,
				heightStyle: "content",
				header: "h7",
				active: false
			});

			// activte the accordion for unvocered actions
			$( "#coveredActions-accordion" ).accordion({
				collapsible: true,
				heightStyle: "content",
				header: "h7",
				active: false
			});

			// activte the accordion for the learnings & mpodules
			$( "#learning-accordion" ).accordion({
				collapsible: true,
				heightStyle: "content",
				active: false
			});

			// make the draggable elements live
			$(".draggable").draggable({
				revert: true,
				helper: "clone",
				scroll: false
			});

			$(".myDropzone-module-action").droppable({
				accept: ".action",
				classes: {
					"ui-droppable-active": "ui-state-active",
					"ui-droppable-hover": "ui-state-hover-dz"
				},
				drop: function(event, ui) {
					console.log("Dropped something?>");

					// get the id of the dropped action and the module
					var droppedAction = $(ui.draggable).attr("id");
					// var actionText = $(ui.draggable).text();
					var module = $(this).attr("id");

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
							// when successfull, take the action out of the list
							$("#" + droppedAction).remove();
						},
						error: function(jqXhr, textStatus, errorThrown) {
							console.log(errorThrown);
						}
					});
				}
			});

		});

	});
});


// ##################################################
// section for the admin
// ##################################################

$(".navAdmin").click(function () {

	console.log("Entering the admin area");

	prepPage("navAdmin");

	// populate the sidebar

	$("#sidebar").append(
		$("<ul/>").append(
			$("<button/>", {type:"button", class:"btn btn-secondary",text:"Action", id:"newAction"}),
			$("<button/>", {type:"button", class:"btn btn-secondary",text:"Learning", id:"newLearning"}),
			$("<button/>", {type:"button", class:"btn btn-secondary",text:"Module", id:"newModule"})
			)
		);



});

// ######################################################


function executeSkillDelta (currId, nextId) {

	$.getJSON("/skilldelta/" + currId + "/" + nextId, function (data) {
		var skillDelta = data.skillDelta;
		console.log("Getting the skilldelta", nextId, skillDelta);


		// cycle through all elements of the skilldelta
		for (var j = 0; j < skillDelta.length; j++) {
			var thisSkillDelta = skillDelta[j];

			if ($("."+nextId + camelize(thisSkillDelta.name) + thisSkillDelta.from + "-" + thisSkillDelta.to).length === 0) {
				// create the div for the skillDelta
				$("#pos-det-nextPos-accordion-" + nextId).append(
					$("<h5/>", {text:thisSkillDelta.name + ": going from " + thisSkillDelta.from + " to: " + thisSkillDelta.to}),
					$("<div/>", {id:"pos-det-nextPos-accordion-" + nextId +"-"+ j, class:nextId + camelize(thisSkillDelta.name) + thisSkillDelta.from + "-" + thisSkillDelta.to}).append(
						$("<ul/>"))
					);

				// cycle throught the added descriptions
				for (var k = 0; k < thisSkillDelta.descriptions.length; k++) {
					var descr = thisSkillDelta.descriptions[k];
					$("#pos-det-nextPos-accordion-" + nextId +"-"+ j + " ul").append(
						$("<li/>", {text:descr.description})
						);
				}
			}
		}

		if (skillDelta.length === 0) {
			$("#pos-det-nextPos-accordion-" + nextId).text("No change in skill levels.");
		}

	});

	$(document).ajaxStop(function() {
		$("#pos-det-nextPos-accordion-" + nextId).accordion({
			collapsible: true,
			heightStyle: "content",
			header: "h5",
			active: false
		});
	});
}

// simple prep
function prepPage(navig) {
		// change the navigation bar
	$(".nav-tabs li").removeClass("active");
	$("#"+navig).addClass("active");

	//empty the sidebar, details and toolbar
	$("#sidebar").empty();
	$("#details").empty();
	$("#toolbar").empty();
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