var actionOptions = "";

// get all learnings into the sidebar
$.getJSON("/learning-gap", function (data) {

	$("#learning-details").append(
		$("<h2/>", {text:"supply actions not covered by learning offers"}),
		$("<div/>", {id:"uncoveredActions"}).append(
			$("<ul/>")
			)
		)

	data.uncoveredActions.forEach(function (element) {
		var thisId = element._id;
		var thisAction = element.action;

		// check if we already have a heading for this SKILL, if no, create one, otherwise
		if ( $( ".skill-" + camelize(element.skill)).length>0) {
			$("#skill-" + camelize(element.skill) +" ul").append(
				$("<li/>", {text: element.action}))

			// append 
		} else {
			$("#uncoveredActions").append(
				$("<h7/>", {id:"skill-" + camelize(element.skill), class:"skill-" + camelize(element.skill), text:toTitleCase(element.skill)}).append(
					$("<ul/>", {id:"skill-" + camelize(element.skill)+"-ul"}).append(
						$("<li/>", {text: element.action}))
					)
				
			)
		}

		// $("#uncoveredActions ul").append(
		// 	$("<li/>", {class: "position-box", id: thisId, text: thisAction})
		// 	);

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