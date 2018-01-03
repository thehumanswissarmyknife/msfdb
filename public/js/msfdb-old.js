var isClicked = "";

$.get("http://165.227.162.247:3000/positions", function(data) {

  $("#position-skillcomp-overview").hide();
  data.positions.sort(compareLevels);

    for(i = 0; i < data.count; i++) {
        var thisLevel = data.positions[i].level;
        var thisTitle = data.positions[i].title.toLowerCase().replace(/\s+/g, '');
        var thisId = data.positions[i]._id;
        var nextPositions = data.positions[i].nextPositions;


        // if there is no box for this level yet, create it
        if(!$("#"+data.positions[i].level).length){
            $("#levels").append("<div class='hr-level col-xs-12' id='"+ thisLevel +"'></div>");

            //get into the level div and add a div for the level-title
            $("#" + thisLevel).append("<div class='level-title' id='"+ thisLevel +"-title'></div>");
            $("#" + thisLevel +"-title").html(thisLevel);
            $("#" + thisLevel +"-title").css({float: 'left'});
            $("#" + thisLevel).append("<div class='level-positions' id='"+ thisLevel +"-positions'></div>");      
        }

        //create the boxes for t
        $("#" + thisLevel + "-positions").append("<div class='position-box' id='" + thisId+ "'></div>");

        // this is the small box for the dragging and dropping - comment, if no longer needed
        $("#" + thisId).append("<div class='subtractor' id='sub-" + thisId + "'>&nbsp;</div>");
        var subPosLeft = $("#" + thisId).width()/2 - $("#sub-"+ thisId).width()/2;
        $("#sub-"+ thisId).css({left: subPosLeft});

        




        $("#" + thisId).append("<div class='position-title' id='" + thisId + "-title-box'></div>");
        $("#" + thisId+ "-title-box").html(toTitleCase(data.positions[i].title) );
        $("#" + thisId).append("<div class='position-skill-box' id='" + thisId + "-skill-box'></div>");
        $("#" + thisId).append("<div class='position-comp-box' id='" + thisId + "-comp-box'></div>");
        // $("#" + thisId).prepend("<div class='position-details' id='detail-"+ thisId +"'>details</div>");

        // get a nice box to click on for details
        $("#" + thisId).prepend("<div class='info' id='info-" + thisId+ "'></div>");
        $("#info-"+thisId).append("info");
        



        if($("#" + thisLevel + "-positions").children().length > 3) {
          var height = Math.ceil($("#" + thisLevel + "-positions").children().length / 3) * 120;
            $("#"+ thisLevel).css("height", height);
        }
    }
}, "json");


$(document).ajaxStop( function () {
    $( function() {
        $( ".subtractor" ).draggable({ revert: "valid" });
     
        $( ".position-box" ).droppable({
          classes: {
            "ui-droppable-active": "ui-state-active",
            "ui-droppable-hover": "ui-state-hover"
          },
          drop: function( event, ui ) {
            // do some ajax to add the dropped id to the dropping id as nextPositions
            var nextPos = $(this).attr("id");             
            var currPos = $(ui.draggable).attr("id").substr(4, 25);
            if(nextPos!=currPos) {
                $.ajax({
                  url: '/position/'.concat(currPos),
                  dataType: 'json',
                  type: 'patch',
                  contentType: 'application/json',
                  data: JSON.stringify( { "nextPositions": nextPos} ),
                  success: function( data, textStatus, jQxhr ){
                      $("#" + nextPos).toggle( "highlight" );
                      $("#" + nextPos).toggle( "highlight" );
                  },
                  error: function( jqXhr, textStatus, errorThrown ){
                      console.log( errorThrown );
                  }
              });
            }
          }
      });

$( "#pos-det-skills-accordion").accordion({
  collapsible: true,
  heightStyle: "content"
  
});   

    });
});

$(document).ajaxStop( function () {
  $(".info").click(
    function () {
      var thisPosition = $(this).attr("id");
      $(body).prepend("<div class='info-canvas' id='info-canvas-"+thisPosition+"'></div>");
      $("#info-canvas-"+thisPosition).css("width", "95%");
      $("#info-canvas-"+thisPosition).css("height", "95%");
      $("#info-canvas-"+thisPosition).css("background-color", "white");

    }
  )
});




$( document ).ajaxStop(function() {

  $(".info").click(
    function () {
      var thisPosition = $(this).attr("id");
      $(body).prepend("<div class='info-canvas' id='info-canvas-"+thisPosition+"'></div>");
      $("#info-canvas-"+thisPosition).css("width", "95%");
      $("#info-canvas-"+thisPosition).css("height", "95%");
      $("#info-canvas-"+thisPosition).css("background-color", "white");

    }
  )
  $(".position-box").click(

      function() {
        var currPos = $(this).attr("id");
        var coordCurrPos = $(this).position();
        var postionTitle = $("#" + currPos + "-title-box").text();
        coordCurrPos.left = coordCurrPos.left + $(this).width()/2;

        $(".position-box").css("background-color", "white");
        $(this).css("background-color", "green");

        if(isClicked != currPos) {
          isClicked = currPos;
          // if the position-skillcomp-box is already visible, get rid of it
          if ($("#position-skillcomp-overview").is(":visible")) {
            $("#position-skillcomp-overview").hide(); 
          }
          $(".canvas-div").remove();

          // show the skill comp box
          $("#position-skillcomp-overview").empty();
          $("#position-skillcomp-overview").show();
          $("#position-skillcomp-overview").prepend("<div class='position-title-sc'>"+postionTitle+"</div>");
          

          // get  all info for this position
          $.ajax({
              url: '/positions/'+ currPos,
              type: 'get',
              dataType: 'json',// mongod is expecting the parameter name to be called "jsonp"
              success: function (data) {
                  // when you have the details, get the next positions and save them to a local variable
                  var nextPositions = data.positions.nextPositions;
                  var skills = data.positions.skills;
                  var comps = data.positions.competencies;

                  // make nice boxes for skills and comsp
                    $("#position-skillcomp-overview").append("<div class='pos-skill-container-50 col-xs-6' id='skills-"+ currPos+"'>&nbsp;</div>");
                    var mySkills = 0;
                    for (var i = 0; i < skills.length; i++) {
                      var skill = skills[i].skill;
                      var level = skills[i].level;
                      
                      // go through all skills and create a div for it. widht should be calculated by number of skills and the height should be according to the stkill level - WAREhousing 1 =10px
                      if (level>0) {
                        mySkills++;
                        $("#skills-" + currPos).append("<div class='pos-single-skill-box height-"+level+" skill-"+camelize(skill)+"' id='"+currPos+"-"+camelize(skill)+"-level-"+level+"'>"+skill+"</div>");
                      }                                     
                    }

                      for(var np = 0; np< nextPositions.length; np++){

                        var nextPos = nextPositions[np];
                        drawLine(currPos, nextPos);


                        var skillDelta= [];
                        // get the skills for each job:
                        $.getJSON( "/positions/" + nextPos, function(data) {
                          var newSkills = data.positions.skills;
                          console.log("newskill: " + newSkills);

                          // go through the newSkills and 
                          for(var p = 0; p < newSkills.length; p++) {
                            // console.log(p);
                            for(var o =0; o < skills.length; o++) {
                              // console.log(o);
                              if (newSkills[p].skill == skills[o].skill) {
                                if (newSkills[p].level != skills[o].level) {
                                  skillDelta.push("{skill:"+ newSkills[p].skill+", level: "+newSkills[p].level - skills[o].level+"}");
                                  console.log("skilldelta: "+skillDelta[skillDelta.length]);
                                };

                              };
                            }
                          }
                        });
                      // this means: find out if a given skill is in the skillset of the old job and 
                      // if it is present in both old and new job: calculate the difference
                      // if the skill is only present in the old job, forget about it
                      // if the skill is only present in the new job: display the skill
                    };
                    var myWidth = 99/mySkills;
                    $(".pos-single-skill-box").css("width", myWidth + "%");



                    $("#position-skillcomp-overview").append("<div class='pos-comps-container-50 col-xs-6' id='comps-"+ currPos+"'>&nbsp;</div>");
                    var myComps = 0;
                    for (var i = 0; i < comps.length; i++) {
                      var comp = comps[i].comp;
                      var level = comps[i].level;
                      
                      // go through all skills and create a div for it. widht should be calculated by number of skills and the height should be according to the stkill level - WAREhousing 1 =10px
                      if (level>0) {
                        myComps++;
                        $("#comps-" + currPos).append("<div class='pos-single-comp-box height-"+level+" comp-"+camelize(comp)+"' id='"+currPos+"-"+camelize(comp)+"-level-"+level+"'>"+comp+"</div>");
                      };
                    };
                    var myCWidth = 99/myComps;
                    $(".pos-single-comp-box").css("width", myCWidth + "%");

                    



                  // go through all nextPosition boxes and undim them as well
                  for(j = 0; j < nextPositions.length; j++) {
                      $("#" + nextPositions[j]).fadeTo(0, 1); 
                      $("#" + nextPositions[j]).css("background-color", "yellow");

                      // display the div with the delta on all skillcomps
                      $("#sc-" + nextPositions[j]).append();


                  }
              },
              error: function (XMLHttpRequest, textStatus, errorThrown) {
              console.log('error', errorThrown);
              }
          });

      } else if (isClicked == currPos) {
        console.log("is already clicked");
        getPositionDetails(currPos);
      }
    

    });
});

$(document).ajaxStop( function () {
  $(".btn").click(
    function () {
      $(".position-details-container").remove();
      $("body").children().show();

    }
  )
});

function drawLine (currPos, nextPos) {
  console.log("drawing a line");
  // everything you need to know for the lines
  // get the position of the next position
  var coordCurrPos = $("#" + currPos).position();
  var coordNextPos = $("#" + nextPos).position();

  coordCurrPos.left += 20 + $("#" + currPos).width()/2;
  coordNextPos.left += 20 + $("#" + nextPos).width()/2;

  coordCurrPos.top += 20 + $("#" + currPos).height()/2;
  coordNextPos.top += 20 + $("#" + nextPos).height()/2;

  // coordNextPos.left += $("#" + nextPos).margin-left()+ $("#" + nextPos).width()/2;
  // coordNextPos.top += $("#" + nextPos).height()/2;
  // coordCurrPos.left += $("#" + currPos).width()/2;
  // coordCurrPos.top += $("#" + currPos).height()/2;

  var A ={left:0, top:0};
  var B ={left:0, top:0};

  A.left = Math.min(coordCurrPos.left, coordNextPos.left);
  A.top = Math.min(coordCurrPos.top, coordNextPos.top);

  console.log("A.left", A.left);

  B.left = Math.max(coordCurrPos.left, coordNextPos.left);
  B.top = Math.max(coordCurrPos.top, coordNextPos.top);

  console.log("A.left", A.left);
  console.log("B.left", B.left);

  var canvasBuffer = 2;

  if(A.top == B.top) {
    A.top -= canvasBuffer;
    B.top += canvasBuffer;
  }

  if(A.left == B.left) {
    A.left -= canvasBuffer;
    B.left += canvasBuffer;
  }
  console.log("A.left + buffer", A.left);
  console.log("B.left + buffer", B.left);

  var abHeight = B.top - A.top;
  var abWidth = B.left - A.left;

  // calculate the coordinates for the canvas
  if (coordCurrPos.top > coordNextPos.top) {
    var canvasTop = coordNextPos.top + $("#" + nextPos).height();
  } else {
    var canvasTop = coordCurrPos.top +1;
  };
  
  var canvasLeft = Math.min(coordCurrPos.left, coordNextPos.left)-1;
  var canvasBottom = Math.max(coordCurrPos.top, coordNextPos.top)+1;
  var canvasRight = Math.max(coordCurrPos.left, coordNextPos.left)+ 1;
  var canvasWidth = canvasRight - canvasLeft ;
  var canvasHeight = canvasBottom - canvasTop + 2;


  console.log("canvas: " + canvasTop + ", " + canvasRight + ", " + canvasBottom + ", " + canvasLeft);
  $("body").prepend("<div class='canvas-div' id='"+currPos+"-"+nextPos+"'></div>");
  // $("#"+currPos+"-"+nextPos).css("height", canvasHeight);
  // $("#"+currPos+"-"+nextPos).css("width", canvasWidth);
  // $("#"+currPos+"-"+nextPos).css("position", "absolute");
  // $("#"+currPos+"-"+nextPos).css("top", canvasTop);
  // $("#"+currPos+"-"+nextPos).css("left", canvasLeft);
  // $("#"+currPos+"-"+nextPos).append("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:"+ canvasWidth+"px; height:" + canvasHeight+"px;' id='"+currPos+"-"+nextPos+"-canvas' class='fixed-drawingboard'></svg>");
  //   if(coordCurrPos.left < coordNextPos.left && coordCurrPos.top < coordNextPos.top) {
  //   $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='0' y1='0' x2='"+canvasWidth+"' y2='"+canvasHeight+"'/>");
  // } else if (coordCurrPos.left > coordNextPos.left && coordCurrPos.top > coordNextPos.top) {
  //   $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='"+canvasWidth+"' y1='"+canvasHeight+"' x2='0' y2='0'/>");
  // } else if (coordCurrPos.left < coordNextPos.left && coordCurrPos.top > coordNextPos.top) {
  //   $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='"+canvasWidth+"' y1='0' x2='0' y2='"+canvasHeight+"'/>");
  // } else {
  //   $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='0' y1='"+canvasHeight+"' x2='"+canvasWidth+"' y2='0'/>");
  // }


  $("#"+currPos+"-"+nextPos).css("height", abHeight);
  $("#"+currPos+"-"+nextPos).css("width", abWidth);
  $("#"+currPos+"-"+nextPos).css("position", "absolute");
  $("#"+currPos+"-"+nextPos).css("top", A.top);
  $("#"+currPos+"-"+nextPos).css("left", A.left);
  $("#"+currPos+"-"+nextPos).append("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:"+ abWidth+"px; height:" + abHeight+"px;' id='"+currPos+"-"+nextPos+"-canvas' class='fixed-drawingboard'></svg>");
  // draw a line
  //
  if(coordCurrPos.left < coordNextPos.left && coordCurrPos.top < coordNextPos.top) {
    $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='2' y1='2' x2='"+abWidth+"' y2='"+abHeight+"'/>");
  } else if (coordCurrPos.left > coordNextPos.left && coordCurrPos.top > coordNextPos.top) {
    $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='"+abWidth+"' y1='"+abHeight+"' x2='2' y2='2'/>");
  } else if (coordCurrPos.left < coordNextPos.left && coordCurrPos.top > coordNextPos.top) {
    $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='"+abWidth+"' y1='2' x2='2' y2='"+abHeight+"'/>");
  } else {
    $("#"+currPos+"-"+nextPos+"-canvas").append("<line x1='2' y1='"+abHeight+"' x2='"+abWidth+"' y2='2'/>");
  }
  
  $("#"+currPos+"-"+nextPos).html($("#"+currPos+"-"+nextPos).html());
  // $("#cont").html($("#cont").html());
}

function getPositionDetails (position) {
  $("body").children().hide();
  $("body").prepend("<div class='container position-details-container' id='detailsOf-"+position+"'>&nbsp;</div>");
  $("#detailsOf-"+position).css("position", "fixed");
  $("#detailsOf-"+position).append("<button type='button' class='btn btn-primary'>back to the overview</button>");
  $("#detailsOf-"+position).append("<div class='row' id='contentOf-"+position+"'></div>");

  var thisPosition ="";
  $.getJSON( "http://165.227.162.247:3000/positions/"+position, function( data ) {

    // everything that you want to have done, ut it here
    thisPosition = data.positions;
    thisTitle = thisPosition.title;
    $("#contentOf-"+position).append("<h1>"+toTitleCase(thisPosition.title)+"</h1>");
  });
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

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

