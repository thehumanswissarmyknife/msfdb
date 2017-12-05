const myURL = "http://165.227.162.247:3000/";


// get all positions into the sidebar
$.getJSON(myURL + "positions", function(data) {

  data.positions.sort(compareLevels);

    data.positions.forEach( function(element) {
      var thisId = element._id;

      $("#positions").append("<div class='position-box' id='" + thisId+ "'></div>");
      $("#" + thisId).append("<div class='position-title' id='" + thisId + "-title-box'></div>");
      $("#" + thisId+ "-title-box").html("<a href='#'>" + toTitleCase(element.title)+ "</a>" );

      $("#accordion-positions ul").append("<li class='draggable ui-draggable ui-draggable-handle position' >"+toTitleCase(element.title)+"</li>");
    })

    $( function() {
      $( ".draggable" ).draggable({ revert: true, helper: "clone" });
    } );
});

// get all actions and fill them in the toolbar
$.getJSON(myURL + "actions", function(data) {
  
  var actions = data.actions;

  actions.forEach(function(element) {
    $("#accordion-actions ul").append("<li class='draggable ui-draggable ui-draggable-handle action' id='"+element._id+"'>"+element.action+"</li>");
  })
  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});

// get all knowledges  and fill them in the toolbar
$.getJSON(myURL + "knowledge", function(data) {  
  var knowledges = data.knowledges;

  knowledges.forEach( function(element) {
    $("#accordion-knowledges ul").append("<li class='draggable ui-draggable ui-draggable-handle knowledge' id='"+element._id+"'>"+element.knowledge+"</li>");
  })
  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});

// get all skillcomps
// get all knowledges
$.getJSON(myURL + "skillcomps", function(data) {
  var skillcomps = data.skillComps;

  skillcomps.forEach( function(element) {
    if(element.level>0) {
      $("#accordion-skillcomps ul").append("<li class='draggable ui-draggable ui-draggable-handle skillcomp' id='"+element._id+"'>"+toTitleCase(element.name)+" "+element.level+"</li>");
    }
  })

  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});

// get all learnings  and fill them in the toolbar
$.getJSON(myURL + "learnings", function(data) {  
  var learnings = data.learnings;
  learnings.forEach( function(element) {
    $("#accordion-learnings ul").append("<li class='draggable ui-draggable ui-draggable-handle learning' id='"+element._id+"'>"+element.name+"</li>");
  })

  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});


$( document ).ajaxStop(function() {
  $( ".position-box" ).click(function() {
    var id = $(this).attr("id");
    
    //load all data for this position
    $.getJSON(myURL + "position/"+id, function(data) {
      console.log("id", id);
      $("#position-details").children().remove();
      fillPositionDetails(data);
    });
  });
});


function fillPositionDetails (pos) {
  var position = pos.position;

  console.log("POSITION INPUT", position);
  var id = position._id;
  console.log("Filling details for ", position.title);
  $("#position-details").empty();

  $("#position-details").append("<div class='pos-detail-header'><h2>"+toTitleCase(position.title)+"</h2></div>");
  $("#position-details").append("<div class='pos-detail-irffg'>"+toTitleCase(position.irffg)+"</div>");
  $("#position-details").append("<div></div>");

  // create div for requirements
  $("#position-details").append("<div id='pos-det-req'><h3>Requirements:</h3></div>");
  $("#position-details").append("<div id='pos-det-learn'><h3>Learnings:</h3></div>");
  $("#position-details").append("<div id='pos-det-skillcomps'></div>");
  $("#pos-det-skillcomps").append("<div class='pos-det-skills myDropzone-skill' id='pos-det-skills'><h3>Technical Skills:</h3><div id='pos-det-skills-accordion'></div></div>");
  $("#pos-det-skillcomps").append("<div class='pos-det-comps myDropzone-skill' id='pos-det-comps'><h3>Competencies:</h3><div id='pos-det-comps-accordion'>&nbsp;</div></div>");
  $("#position-details").append("<div id='pos-det-know'><h3>Knowledge:</h3></div>");
  $("#position-details").append("<div id='pos-det-nextPos'><h3>Next positions:</h3></div>");
  

  $("#pos-det-req").append("<div class='pos-det-req myDropzone-requirement' id='pos-det-req-"+id+"'></div>");

  // check for requirements and get the name for each
  if(position.requirements.length>0) {
    position.requirements.forEach( function(element) {
      var position = "";
      element.positions.forEach(function(position) {
        $.getJSON(myURL + "position/"+ position, function (data) {
        thisPosition = data.position.title;
        $("#pos-det-req-"+id).append("<div class='pos-det-req-item'><div class='pos-det-req-job'>"+thisPosition+"</div><div class='pos-det-req-months'>"+element.months+" months</div><div class='pos-det-req-missions'>"+element.missions+" missions</div></div>");

        $
        })
      })
    })
  } else {
    $("#pos-det-req-"+id).append("<div class='pos-det-req-item'><div class='pos-det-req-job'>no requirements</div></div>");
  }

  // create div for learning
  $("#pos-det-learn").append("<div class='pos-det-learn myDropzone-learning' id='pos-det-learn-"+id+"'></div>");

  if(position.learnings.length > 0) {
    position.learnings.forEach( function(element) {
      $.getJSON(myURL+"learning/"+ element.learning, function(data) {
        thisLearning = data.learning.name;
        console.log("did this");
        $("#pos-det-learn-"+id).append("<div class='pos-det-learn-item'>Staff should complete the "+thisLearning+" "+element.timing+" this position</div>");
      })
    })

  } else {
    $("#pos-det-learn-"+id).append("<div class='pos-det-learn-item'>No training necessary.</div>");
  }

  // create div for learnings
    // get all info for the learnings
    // run through the loop and create divs for all learnings

  // create div for technical skills

  if(position.skills.length >0 ) {

    mySkills = position.skills;
    console.log("MySkills:", mySkills);
    

    mySkills.forEach( function (skillsData) {
      $.getJSON(myURL + "full-skillcomp/" + skillsData, function (returnedSkill) {
        var id = returnedSkill._id;
        var skill = returnedSkill.name;
        var level = returnedSkill.level;
        var descriptions = returnedSkill.descriptions;
        $("#pos-det-skills-accordion").append("<h4>Los</H4><div class='' id='pos-det-skills-accordion-"+id+"'><ul><li>Per</li><li>Perse</li><li>Person</li></ul></div>");
        $("#pos-det-skills-accordion").append("<h4>Los jetzt</H4><div class='' id='pos-det-skills-accordion-"+id+"'><ul><li>Per</li><li>Perse</li><li>Person</li></ul></div>");

        console.log("Descriptions", descriptions);

        $("#pos-det-skills-accordion").append("<h4>"+toTitleCase(skill) +" "+level+ "</H4><div class='' id='pos-det-skills-accordion-"+id+"'><ul></ul></div>");
        
        $("#pos-det-skills-accordion").accordion({
          collapsible: true,
          heightStyle: "content"   
        }); 

      });

    });

$( document ).ajaxStop( function () {
  $("#pos-det-skills-accordion").accordion({
          collapsible: true,
          heightStyle: "content"   
        }); 
});





    // position.skills.forEach( function (elSkill) {

    //   $.getJSON(myURL + "full-skillcomps/" + elSkill, function (skillData) {
    //     var id = skillData._id;
    //     var descriptions = skillData.descriptions;
    //     console.log("outer el", descriptions);
    //     $("#pos-det-skills-accordion").append("<h4>"+toTitleCase(skillData.name) +" "+skillData.level+ "</H4><div id='pos-det-skills-accordion-"+id+"'><ul></ul></div>");

    //     $( "#pos-det-skills-accordion").accordion({
    //       collapsible: true,
    //       heightStyle: "content"   
    //     });  
    //     skillData.descriptions.forEach( function (descrData) {
    //       $("#pos-det-skills-accordion-"+id+" ul").append("<li class='draggable ui-draggable ui-draggable-handle position' >"+descrData.description+"</li>");
    //       console.log("Inner element:", descrData.description);

    //     })

    //   })


        
    // })


  }

  


  // create div for competencies

  // create dib for knowledge


  // do all the updating for the dropzones

  $( function() {
      $( ".myDropzone-learning" ).droppable({
        accept: ".learning",
        classes: {
          "ui-droppable-active": "ui-state-active",
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
        }
      });


      $( ".myDropzone-action" ).droppable({
        accept: ".action",
        classes: {
          "ui-droppable-active": "ui-state-active",
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
        }
      });

      $( ".myDropzone-requirement" ).droppable({
        accept: ".position",
        classes: {
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
        }
      });

      $( ".myDropzone-position" ).droppable({
        accept: ".position",
        classes: {
          "ui-droppable-active": "ui-state-active",
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
        }
      });

      $( ".myDropzone-knowledge" ).droppable({
        accept: ".knowledge",
        classes: {
          "ui-droppable-active": "ui-state-active",
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
        }
      });

      $( ".myDropzone-skill" ).droppable({
        accept: ".skillcomp",
        classes: {
          "ui-droppable-active": "ui-state-active",
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
          var droppedSkill = $(ui.draggable).attr("id");
          console.log("Just dropped: ", droppedSkill);
        }
      });

      $( ".myDropzone-comp" ).droppable({
        accept: ".skillcomp",
        classes: {
          "ui-droppable-active": "ui-state-active",
          "ui-droppable-hover": "ui-state-hover"
        },
        drop: function( event, ui ) {
          console.log("Dropped something?>");
        }
      });

    } );

  // $( function() {
      
  //   } );

  //   $( function() {

  //   } );

  //     $( function() {

  //   } );

  //     $( function() {

  //     } );

}






function getPositionDetails (position) {
  $("body").children().hide();
  $("body").prepend("<div class='container position-details-container' id='detailsOf-"+position+"'>&nbsp;</div>");
  $("#detailsOf-"+position).css("position", "fixed");
  $("#detailsOf-"+position).append("<button type='button' class='btn btn-primary'>back to the overview</button>");
  $("#detailsOf-"+position).append("<div class='row' id='contentOf-"+position+"'></div>");

  var thisPosition ="";
  $.getJSON( myURL + "position/"+position, function( data ) {

    // everything that you want to have done, ut it here
    thisPosition = data.positions;
    thisTitle = thisPosition.title;
    $("#contentOf-"+position).append("<h1>"+toTitleCase(thisPosition.title)+"</h1>");
  });
}



// common functions
function compareLevels(a,b) {
  if (a.level > b.level)
    return -1;
  if (a.level < b.level)
    return 1;
  return 0;
}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}
