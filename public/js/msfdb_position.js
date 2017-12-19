var myURL = "http://165.227.162.247:8080/";

$body = $("body");

$(document).on({
    ajaxStart: function() { $body.addClass("loading"); },
     ajaxStop: function() { $body.removeClass("loading"); }
});


// get all positions into the sidebar
$.getJSON(myURL + "positions", function(data) {

  data.positions.sort(compareLevels);

    data.positions.forEach( function(element) {
      var thisId = element._id;

      $("#positions").append("<div class='position-box' id='" + thisId+ "'></div>");
      $("#" + thisId).append("<div class='position-title' id='" + thisId + "-title-box'></div>");
      $("#" + thisId+ "-title-box").html("<a href='#'>" + toTitleCase(element.title)+ "</a>" );

      $("#accordion-positions ul").append("<li class='draggable ui-draggable ui-draggable-handle position' id='"+thisId+"'>"+toTitleCase(element.title)+"</li>");
    });

    $( function() {
      $( ".draggable" ).draggable({ revert: true, helper: "clone" });
    } );
});

// get all actions and fill them in the toolbar
$.getJSON(myURL + "actions", function(data) {

  var actions = data.actions;

  actions.forEach(function(element) {
    $("#accordion-actions ul").append("<li class='draggable ui-draggable ui-draggable-handle action' id='"+element._id+"'>"+element.action+"</li>");
  });
  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});

// // get all knowledges  and fill them in the toolbar
// $.getJSON(myURL + "knowledge", function(data) {  
//   var knowledges = data.knowledges;

//   knowledges.forEach( function(element) {
//     $("#accordion-knowledges ul").append("<li class='draggable ui-draggable ui-draggable-handle knowledge' id='"+element._id+"'>"+element.knowledge+"</li>");
//   })
//   $( function() {
//         $( ".draggable" ).draggable({ revert: true, helper: "clone" });
//       } );
// });

// get all skillcomps and fill them in the toolbar
$.getJSON(myURL + "skillcomps", function(data) {
  var skillcomps = data.skillComps;
  skillcomps.sort(sortSkillComps);

  skillcomps.forEach( function(element) {
    if(element.level>0) {
      $("#accordion-skillcomps ul").append("<li class='draggable ui-draggable ui-draggable-handle skillcomp' id='"+element._id+"'>"+toTitleCase(element.name)+" "+element.level+"</li>");
    }
  });

  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});

// get all learnings  and fill them in the toolbar
$.getJSON(myURL + "learnings", function(data) {
  var learnings = data.learnings;
  learnings.forEach( function(element) {
    $("#accordion-learnings ul").append("<li class='draggable ui-draggable ui-draggable-handle learning' id='"+element._id+"'>"+element.name+"</li>");
  });

  $( function() {
        $( ".draggable" ).draggable({ revert: true, helper: "clone" });
      } );
});


$( document ).ajaxStop(function() {
  $( ".position-box" ).click(function() {
    var id = $(this).attr("id");

    // show the details for this position
    updateDetails(id);
  });
});

function updateDetails(id) {
  
  //load all data for this position
  $.getJSON(myURL + "full-position/"+id, function(data) {
    console.log("id", id);
    $("#position-details").children().remove();
    fillPositionDetails(data);
  });
}


function fillPositionDetails (pos) {
  var position = pos.position;

  console.log("POSITION INPUT", position);
  var id = position._id;
  console.log("Filling details for ", position.title);
  $("#position-details").empty();

  $("#position-details").append("<div class='pos-detail-header'><h2>"+toTitleCase(position.title)+"</h2></div>");
  $("#position-details").append("<div class='pos-detail-irffg'>"+toTitleCase(position.irffg)+" - Level "+ position.level + "</div>");
  $("#position-details").append("<div></div>");

  // create div for requirements
  $("#position-details").append("<div id='pos-det-req'><h3>Requirements:</h3></div>");
  $("#position-details").append("<div id='pos-det-learn'><h3>Learnings:</h3></div>");
    $("#position-details").append("<div id='pos-det-know'><h3>Knowledge:</h3></div>");
  $("#position-details").append("<div class='myDropzone-position' id='pos-det-nextPos-"+id+"'><h3>Next positions:</h3></div>");
  // $("#position-details").append("<div id='pos-det-nextPos'><h3>Next positions:</h3></div>");
  $("#position-details").append("<div id='pos-det-skillcomps'></div>");
  $("#pos-det-skillcomps").append("<div class='pos-det-skills myDropzone-skill' id='pos-det-skills'><h3>Technical Skills:</h3><div id='pos-det-skills-accordion'></div></div>");
  $("#pos-det-skillcomps").append("<div class='pos-det-comps myDropzone-skill' id='pos-det-comps'><h3>Competencies:</h3><div id='pos-det-comps-accordion'></div></div>");

  $("#pos-det-req").append("<div class='pos-det-req myDropzone-requirement' id='pos-det-req-"+id+"'></div>");

  //
  // ################ check for requirements and get the name for each
  //
  if(position.requirements.length>0) {
    console.log("position.requirements.length", position.requirements.length);

    for (var i = 0; i < position.requirements.length; i++) {
      var thisReq = position.requirements[i];
      $("#pos-det-req-"+id).append("<div id='pos-det-req-months-mission-'"+thisReq.months + thisReq.missions +">"+thisReq.months+" months or/and "+thisReq.missions+" missions in these positions: <ul></ul></div>");

      for(var j = 0; j < thisReq.positions.length; j++) {
        var thisPos = thisReq.positions[j];
        $("#pos-det-req-"+id+" ul").append("<li>"+toTitleCase(thisPos.title)+"</li>");

      }
    }
  } else {
    $("#pos-det-req-"+id).append("<div class='pos-det-req-item'><div class='pos-det-req-job'>no requirements</div></div>");
  }



  //
  // ################ create div for learning
  //
  $("#pos-det-learn").append("<div class='pos-det-learn myDropzone-learning' id='pos-det-learn-"+id+"'></div>");

  if(position.learnings.length > 0) {
    position.learnings.forEach( function(element) {
      // $("#pos-det-learn-"+id).append("<div class='pos-det-learn-item'>Taking part in the "+element.learning+" "+element.timing+" this position is "+ element.mandatory+"</div>");
      $("#pos-det-learn-"+id).append("<div class='pos-det-learn-item'>"+element.learning+"</div>");
    });

  } else {
    $("#pos-det-learn-"+id).append("<div class='pos-det-learn-item'>No training necessary.</div>");
  }





  //
  // ################ create div for nextpositions
  //
  $("#pos-det-nextPos-"+id).append("<div id='pos-det-nextPos-accordion' class='myDropzone-position'></div>");

  if(position.nextPositions.length > 0) {

    // cycling through all next positions
    for(var  i = 0; i < position.nextPositions.length; i++){

      var thisNextPosition = position.nextPositions[i];
      console.log("thisNextPosition", thisNextPosition);

      // create the div for the next position
      $("#pos-det-nextPos-accordion").append("<h3>"+toTitleCase(thisNextPosition.title)+"</h3><div id='pos-det-nextPos-accordion-"+thisNextPosition._id+"'></div>");

      // calculate the skilldelta
      // var skillDelta = await calculateSkillDelta (position, thisNextPosition._id);

      var skillDelta = new Promise(function(resolve, reject) {
        
        return calculateSkillDelta (position, thisNextPosition._id);

        // if (skillDelta!="") {
        //   resolve("Stuff worked!");
        // }
        // else {
        //   reject(Error("It broke"));
        // }
      });

      skillDelta.then( function (skillDelta) {
        console.log("awaited skilldelta", skillDelta );
      }, function (err) {
        console.log(err);
      });

      // when you have the skillDelta
      
        var sk = skillDelta;

        // cycle through all elements of the skilldelta
        for (var j = 0; j < sk.length; j++) {
          var thisSkillDelta = sk[j];
          console.log("SK", thisSkillDelta);

          // create the div for the skillDelta
          $("#pos-det-nextPos-accordion-"+thisNextPosition._id).append("<h5>"+thisSkillDelta.name+": going from "+thisSkillDelta.from+" to: "+thisSkillDelta.to+"</h5><div id='pos-det-nextPos-accordion-"+thisSkillDelta._id+"'><ul></ul></div>");

          // cycle throught the added descriptions
          for (var k = 0; k < thisSkillDelta.adding.length; k++) {
            var descr = thisSkillDelta.adding[k];
            $("#pos-det-nextPos-accordion-"+thisSkillDelta._id+" ul").append("<li>"+descr.description+"</li>");
          }
        }
      
      $( document ).ajaxStop( function() {
        $("#pos-det-nextPos-accordion-"+thisNextPosition._id).accordion({
          collapsible: true,
          heightStyle: "content",
          header: "h5",
          active: false
        });
      });
    }
    $( document ).ajaxStop( function() {
      $("#pos-det-nextPos-accordion").accordion({
        collapsible: true,
        heightStyle: "content",
        header: "h3",
        active: false
      });
    });
  }

//   if(position.nextPositions.length > 0) {

//     async.each(position.nextPositions, async function (element) {

//       $("#pos-det-nextPos-accordion").append("<h3>"+toTitleCase(element.title)+"</h3><div id='pos-det-nextPos-accordion-"+element._id+"'></div>");

//       var skillDelta = calculateSkillDelta (position, element._id);
//       skillDelta.then( async function (sk) {
//         console.log("Skilldelta that is being processed", skillDelta);

//         async.each(sk, async function (ski) {
//           $("#pos-det-nextPos-accordion-"+element._id).append("<h5>"+ski.skill+": going from "+ski.from+" to: "+ski.to+"</h5><div id='pos-det-nextPos-accordion-"+ski._id+"'><ul></ul></div>");

//           // async.each( ski.adding, async function (descr) {
//           //   $("#pos-det-nextPos-accordion-"+ski._id+" ul").append("<li>"+descr.description+"</li>");
//           // })
//         })
//       })
      
//       $( document ).ajaxStop( function() 
        // $("#pos-det-nextPos-accordion-"+element._id).accordion({
//           collapsible: true,
//           heightStyle: "content",
//           header: "h5",
//           active: false
//         }); 
//       })
//     }, function (error) {
//       console.log(error);
//     })

//   $( document ).ajaxStop( function() {
//     $("#pos-det-nextPos-accordion").accordion({
//       collapsible: true,
//       heightStyle: "content",
//       header: "h3",
//       active: false
//     }); 
//   }) 
// }
  // create div for technical skills

  if(position.skills.length >0 ) {

    mySkills = position.skills;
    console.log("MySkills:", mySkills);
    

    mySkills.forEach( function (skillsData) {
      // console.log("Skillsdata", skillsData)
      console.log("Inherited", skillsData.inherited);

      $("#pos-det-skills-accordion").append("<h4>"+toTitleCase(skillsData.name) +" "+skillsData.level+ "</H4><div class='pos-det-skills-accordion' id='pos-det-skills-accordion-"+skillsData._id+"'></div>");

      skillsData.descriptions.forEach( function (descrData) {
        $("#pos-det-skills-accordion-"+skillsData._id).append("<h5>"+descrData.description+"</h5><div class='pos-det-skills-accordion-description' id='pos-det-skills-accordion-"+skillsData._id+"-"+descrData._id+"'><ul></ul></div>");

        descrData.actions.forEach( function (actData) {
          $("#pos-det-skills-accordion-"+skillsData._id+"-"+descrData._id + " ul").append("<li class='draggable action' id='"+descrData._id+"-"+actData._id+"-"+skillsData._id+"'>"+actData.action+"</li>");
        });

        $( document ).ajaxStop( function() {
          $("#pos-det-skills-accordion-"+skillsData._id).accordion({
            collapsible: true,
            heightStyle: "content",
            header: "h5",
            active: false
          });
          $( ".draggable" ).draggable({ revert: true, helper: "clone" });
        });
      });

      // if there are inherited skkills
      // create a div, fill it and then in the end...
      if(skillsData.inherited.length>0) {
        $("#pos-det-skills-accordion-"+skillsData._id).append(" ---- inherited skills ---- <div class='pos-det-skills-accordion-description' id='pos-det-skills-accordion-"+skillsData._id+"-inherited'></div>");

        skillsData.inherited.forEach( function (inhDescrData) {
          $("#pos-det-skills-accordion-"+skillsData._id+"-inherited").append("<h5>"+inhDescrData.description+"</h5><div class='pos-det-skills-accordion-description' id='pos-det-skills-accordion-"+skillsData._id+"-inherited-"+inhDescrData._id+"'><ul></ul></div>");

          inhDescrData.actions.forEach( function (inhActData) {
            $("#pos-det-skills-accordion-"+skillsData._id+"-inherited-"+inhDescrData._id + " ul").append("<li>"+inhActData.action+"</li>");
          });

          $( document ).ajaxStop( function() {
            $("#pos-det-skills-accordion-"+skillsData._id).accordion({
              collapsible: true,
              heightStyle: "content",
              header: "h5",
              active: false
            });
            $("#pos-det-skills-accordion-"+skillsData._id).accordion({
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

  if(position.competencies.length >0 ) {

    myComps = position.competencies;
    console.log("competencies:", myComps);
    

    myComps.forEach( function (compsData) {
      // console.log("compsData", compsData)

      $("#pos-det-comps-accordion").append("<h4>"+toTitleCase(compsData.name) +" "+compsData.level+ "</H4><div class='pos-det-comps-accordion' id='pos-det-comps-accordion-"+compsData._id+"'><ul/></div>");

      compsData.descriptions.forEach( function (descrData) {
        $("#pos-det-comps-accordion-"+compsData._id+ " ul").append("<li>"+descrData.description+"</li>");

        // $( document ).ajaxStop( function() {
        //   $("#pos-det-comps-accordion-"+compsData._id).accordion({
        //     collapsible: true,
        //     heightStyle: "content",
        //     header: "h5"   
        //   }); 
        // })
      });
    });
}

  $( document ).ajaxStop( function() {
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

  });
  

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
          var droppedLearning = $(ui.draggable).attr("id");
          var thisPosition = $(this).attr("id").substring(14, 38);
          // addLearningForm(droppedLearning, thisPosition);

          console.log("Just dropped " + droppedLearning + " on ", thisPosition);
          $.ajax({
            url: "/position/".concat(thisPosition),
            dataType: "json",
            type: "patch",
            contentType: "application/json",
            data: JSON.stringify( {learnings: { "learning": droppedLearning, "mandatory": "mandatory", "timing": "before"}} ),
            success: function( data, textStatus, jQxhr ){
              updateDetails(thisPosition);
            },
            error: function( jqXhr, textStatus, errorThrown ){
                console.log( errorThrown );
            }
          });

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
          var fullID = $(ui.draggable).attr("id");
          console.log("fullID", fullID);
          var descriptionID = fullID.substring(0,24);
          var actionID = fullID.substring(25,49);
          var skillCompID = fullID.substring(50, 74);
          console.log("SkillCompId",skillCompID);

          var action = "";
          var description = "";
          var affectedPositions = [];

          $.getJSON('/description/'+descriptionID, function (thisDescription) {
            
            description = thisDescription;
            console.log("Description inner", description);

            $.getJSON('/action/'+actionID, function (thisAction) {

              action = thisAction;
              console.log("action inner", action);

              $.getJSON("/positionsforskill/"+skillCompID, function (positions) {
                positions = positions.positions;
                for (var i = 0; i < positions.length; i++) {
                  console.log("Positions i", positions[i]);
                  affectedPositions.push(positions[i].title);
                }
                console.log("affectedPositions", affectedPositions);
                alertBoxActionRemoval(action.action, description.description, affectedPositions) ;
              });
              
            });
          });

          

          console.log("action", action);
          console.log("Description", description);

          
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
            data: JSON.stringify( {"nextPositions": nextPosition} ),
            success: function( data, textStatus, jQxhr ){
              updateDetails(thisPosition);
            },
            error: function( jqXhr, textStatus, errorThrown ){
                console.log( errorThrown );
            }
          });
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

function sortSkillComps(a, b) {
  if(a.name == b.name && a.level > b.level) {
    return 1;
  }
  if(a.name == b.name && a.level < b.level) {
    return -1;
  }
    if(a.name > b.name) {
    return 1;
  }
  if(a.name < b.name) {
    return -1;
  }

}

function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

async function calculateSkillDelta (currPos, nextPos) {
  var skillDelta = [];
  // console.log("currPos", currPos)
  // console.log("###############################");

  try {
    // get full-position fr both positions
    var currentPosition = currPos;
    var nextPosition = await $.getJSON(myURL + "full-position/" + nextPos);

    var currSkills = currentPosition.skills;
    var nextSkills = nextPosition.position.skills;
    var tempNextSkill = nextPosition.position.skills;
    // console.log("Going from "+ currentPosition.title + " to "+ nextPosition.position.title);
    // console.log("#!#!#!#!#!##! the whole current skillset:", currSkills);
    // console.log("#!#!#!#!#!##! the whole next skillset:", nextSkills);



    // for each skill in the current Position, check if the skill is present in the next position
    for (var i = 0; i < currSkills.length; i++) {
      var currSkill = currSkills[i];
      for (var j = 0; j < nextSkills.length; j++) {
        var nextSkill = nextSkills[j];
        var isPresent = false;

        if( currSkill.name != nextSkill.name ) {
          for(var i = 0; i < currSkills.length; i++) {

            if (currSkills[i].name == nextSkill.name ) {
              isPresent = true;
              // console.log("found the skill in the current Job")
            }
          }
          if(!isPresent) {
            var thisSkill = {_id: currSkill._id + nextSkill._id, skill: nextSkill.name, from: 0, to: nextSkill.level, adding: nextSkill.descriptions};
          }
        }
        if (currSkill.name == nextSkill.name ) {
          // console.log("tempNextSkills before splice", tempNextSkill);
          // console.log("J is", j);
          tempNextSkill.splice(j, 1);
          // console.log("tempNextSkills after splice", tempNextSkill);

          if(currSkill.level < nextSkill.level){
            var thisSkill = {_id: currSkill._id + nextSkill._id, skill: currSkill.name, from: currSkill.level, to: nextSkill.level, adding: nextSkill.descriptions};
          }
          // console.log("### currSkill.name == nextSkill.name");
          await skillDelta.push(thisSkill);
          // console.log("### skillDelta:", skillDelta.length, skillDelta);
        }
      }
    }

    for(var i = 0; i < tempNextSkill.length; i++) {
      var newSkill = tempNextSkill[i];
      var thisNewSkill = {_id: currSkill._id + nextSkill._id, skill: nextSkill.name, from: 0, to: nextSkill.level, adding: nextSkill.descriptions};
      await skillDelta.push(thisNewSkill);
    }
    
  } catch (e) {
    throw (e);
  }

  // console.log("SkillDelta: ", skillDelta);
  // console.log("uniq Delta", uniqueDelta);
  
  return skillDelta;
  // if the skill is present, compare the levels 
  // if the level-delta is greater 0, display the new descriptions
}

function addLearningForm(learningId, position) {
  var learning = "";
  $.getJSON(myURL + "learning/" + learningId, function (thisLearning) {
    learning = thisLearning.learning;
    console.log("getJSONed learning", learning.name);
    });




  


  // console.log("getJSONed learning", learning.name);
  

  // // create div for the form
  // $("body").append("<div class='learning-form-wrapper' id='learning-form-wrapper'/>")
  // $("#learning-form-wrapper").append("<form id='learning-form' action=''/>")
  // $("#learning-form").append("<div class='form-group' id='learning-form-group-learning'/>")
  // $("#learning-form-group-learning").append("<div id='"+learning._id+"'/>");
  // $("#learning-form-group-learning").append(learning.name);

  // $("#learning-form").append("<div class='form-group' id='learning-form-group-mandatory'/>")
  // $("#learning-form-group-mandatory").append("<label class='' />");
  // $("#learning-form-group-mandatory").append("<select class='form-control' id='select-mandatory'/>");
  // $("#learning-form-group-mandatory select").append("<option id='mandatory'/>");
  // $("#mandatory").append("mandatory");
  // $("#learning-form-group-mandatory select").append("<option id='recommended'/>");
  // $("#recommended").append("recommended");

  // $("#learning-form").append("<div class='form-group' id='learning-form-group-timing'/>")
  // $("#learning-form-group-timing").append("<label class='' />");
  // $("#learning-form-group-timing").append("<select class='form-control' id='select-timing'/>");
  // $("#learning-form-group-timing select").append("<option id='before'/>");
  // $("#before").append("before");
  // $("#learning-form-group-timing select").append("<option id='during'/>");
  // $("#during").append("during");

  // // $("#learning-form").append("<button class='btn btn-primary' type='submit' id='btn-submit' onClick='addLearning("+learningId+", "+position+", "+document.getElementById('select-mandatory').value+", "+document.getElementById('select-timing').value+"'/>");
  // $("#learning-form").append("<button class='btn btn-primary' type='submit' id='btn-submit' onClick='addLearning('peter', 'robert', 'ralf', 'natter')'/>");
  // $("#btn-submit").append("submit");
  // $("#learning-form").append("<button class='btn btn-primary' type='cancel' id='btn-cancel'/>");
  // $("#btn-cancel").append("cancel");



}

// function addLearning(learningId, position, mandatory, timing) {
//   console.log("learningId", learningId);
//   console.log("position", position);
//   console.log("mandatory", mandatory);
//   console.log("timing", timing);

// }



// <form>
//   <div class="form-group">
//     <label for="exampleFormControlInput1">Email address</label>
//     <input type="email" class="form-control" id="exampleFormControlInput1" placeholder="name@example.com">
//   </div>
//   <div class="form-group">
//     <label for="exampleFormControlSelect1">Example select</label>
//     <select class="form-control" id="exampleFormControlSelect1">
//       <option>1</option>
//       <option>2</option>
//       <option>3</option>
//       <option>4</option>
//       <option>5</option>
//     </select>
//   </div>
//   <div class="form-group">
//     <label for="exampleFormControlSelect2">Example multiple select</label>
//     <select multiple class="form-control" id="exampleFormControlSelect2">
//       <option>1</option>
//       <option>2</option>
//       <option>3</option>
//       <option>4</option>
//       <option>5</option>
//     </select>
//   </div>
//   <div class="form-group">
//     <label for="exampleFormControlTextarea1">Example textarea</label>
//     <textarea class="form-control" id="exampleFormControlTextarea1" rows="3"></textarea>
//   </div>
// </form>


function alertBoxActionRemoval(action, description, positions) {
    if (confirm("you are about to remove '"+action.action+"' from '"+description.description+"'. This will affect these positions: " + positions) == true) {
        console.log("remove that action");
        $.getJSON("/removeactionfromdescription/" +action._id +"/"+ description._id, function (description) {
          console.log ("Description updated:", description);
        });

    } else {
        console.log("rather not");
    }
}
