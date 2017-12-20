// $body = $("body");

// $(document).on({
//     ajaxStart: function () { $body.addClass("loading"); },
//     ajaxStop: function () { $body.removeClass("loading"); }
// });

console.log("hi");


// get all learnings into the sidebar
$.getJSON("/learnings", function (data) {
	"use strict";
	data.learnings.forEach(function (element) {
		var thisId = element._id;

		$("#learnings-sidebar").append("<div class='learning-box' id='" + thisId + "'></div>");
		$("#" + thisId).html("<a href='#'>" + element.name + "</a>");
	});

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
		$("#accordion-actions ul").append("<li class='draggable ui-draggable ui-draggable-handle action' id='" + element._id + "'>" + element.action + "</li>");
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
		$("#accordion-positions ul").append("<li class='draggable ui-draggable ui-draggable-handle position' id='" + element._id + "'>" + toTitleCase(element.title) + "</li>");
	});

	$(function() {
		$(".draggable").draggable({
			revert: true,
			helper: "clone"
		});
	});
});


$(document).ajaxStop(function () {
	$(".learning-box").click(function () {
		var id = $(this).attr("id");
		console.log("just clicked: ", id);

		// show the details for this position
		updateDetails(id);
	});
});

function updateDetails (id) {
	$.getJSON("/full-learning/" + id, function (data) {

		var thisLearning = data.learning;
		console.log("data: ", data);
		$("#learning-details").empty();
		$("#learning-details").append("<div class='learning-details-content' id='det-" + id + "'></div>");

		// header
		$("#det-" + id).append("<div class='learning-title' id='det-" + id + "-name'><h2>" + thisLearning.name + "</h2></div>");
		
		// detail info

		//provider
		$("#det-" + id).append("<div class='learning-provider' id='det-" + id + "-provider'>Provided by " + thisLearning.provider + "</div>");
		if(thisLearning.provider != "OCA") {
			$(".learning-provider").css("color", "red");
		}

		// modules
		$("#det-" + id).append("<div class='learning-modules' id='det-" + id + "-modules'><h3>Modules: </h3></div>");
		for (var i = 0; i < thisLearning.modules.length; i++) {
			var thisModule = thisLearning.modules[i];
			$("#det-" + id +"-modules").append("<div id='learning-module-accordion'><h3>" + thisModule.name+ "</h3><div id='mod-"+thisModule._id+"'><div id='mod-"+thisModule._id+"-obj'/><div class='myDropzone-action' id='mod-"+thisModule._id+"-act'/></div></div>");
			$("#mod-"+thisModule._id+"-obj").append("<h7>Objectives:</h7><ul></ul>");
			$("#mod-"+thisModule._id+"-act").append("<h7>Actions:</h7><ul></ul>");
			for (var j = 0; j < thisModule.objectives.length; j++) {
				var thisObjective = thisModule.objectives[j];
				$("#mod-"+thisModule._id+"-obj ul").append("<li class='draggable objective' id='obj-"+thisObjective._id+"'>"+thisObjective+"</li>");
			}

			for (var k = 0; k < thisModule.actions.length; k++) {
				var thisAction = thisModule.actions[k];
				$("#mod-"+thisModule._id+"-act ul").append("<li class='draggable mod-action' id='act-"+thisAction._id+"'>"+thisAction.action+"</li>");
			}
		}

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
					var module = $(this).attr("id").substring(4, 28);
					console.log("module id", module);

					$.ajax({
						url: "/module/".concat(module),
						dataType: "json",
						type: "patch",
						contentType: "application/json",
						data: JSON.stringify({
							actions: [droppedAction]
						}),
						success: function(data, textStatus, jQxhr) {
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



// function getPositionDetails(position) {
// 	$("body").children().hide();
// 	$("body").prepend("<div class='container position-details-container' id='detailsOf-" + position + "'>&nbsp;</div>");
// 	$("#detailsOf-" + position).css("position", "fixed");
// 	$("#detailsOf-" + position).append("<button type='button' class='btn btn-primary'>back to the overview</button>");
// 	$("#detailsOf-" + position).append("<div class='row' id='contentOf-" + position + "'></div>");

// 	var thisPosition = "";
// 	$.getJSON(myURL + "position/" + position, function (data) {

// 		// everything that you want to have done, ut it here
// 		thisPosition = data.positions;
// 		thisTitle = thisPosition.title;
// 		$("#contentOf-" + position).append("<h1>" + toTitleCase(thisPosition.title) + "</h1>");
// 	});
// }



function toTitleCase(str) {
	return str.replace(/\w\S*/g, function(txt) {
		return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
	});
}

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
		return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
	}).replace(/\s+/g, '');
}