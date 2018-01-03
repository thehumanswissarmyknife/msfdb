var actionOptions = "";

// get all learnings into the sidebar
$.getJSON("/learning-gap", function (data) {

	$("#learning-details").append(
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
				$("<li/>", {text: element.action})
				);

			// append 
		} else {
			$("#uncoveredActions-accordion").append(
				$("<h7/>", {id:"uncoveredAction-skill-" + camelize(element.skill), class:"uncoveredAction-skill-" + camelize(element.skill), text:toTitleCase(element.skill)}),
				$("<div/>").append(
					$("<ul/>", {id:"uncoveredAction-skill-" + camelize(element.skill)+"-ul"}).append(
						$("<li/>", {text: element.action}))
					)
			);
		}
	});

	$("#learning-details").append(
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





	$( function() {
		// activte the accordion for unvocered actions
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
	});

});


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