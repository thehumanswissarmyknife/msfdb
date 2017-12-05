// $.getJSON("http://localhost:3000/positions", "", function(data) {

// });

// $.post( "http://localhost:3000/actions" [, data ] [, success ] [, dataType ] )

var isClicked = "";


$.get("http://165.227.162.247:3000/positions", function(data) {

  $("#position-skillcomp-overview").hide();
  


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

      $("#" + thisLevel + "-positions").append("<div class='position-box' id='" + thisId+ "' style='z-index:10'></div>");


      // this is the small box for the dragging and dropping - comment, if no longer needed
      // $("#" + thisId).append("<div class='subtractor' id='sub-" + thisId + "'>+</div>");
      // var subPosLeft = 30;
      // $("#sub"+ thisId).css({left: subPosLeft});


      $("#" + thisId).append("<div class='position-title' id='" + thisId + "-title-box'></div>");
      $("#" + thisId+ "-title-box").html(data.positions[i].title);
      $("#" + thisId).append("<div class='position-skill-box' id='" + thisId + "-skill-box'></div>");
      $("#" + thisId).append("<div class='position-comp-box' id='" + thisId + "-comp-box'></div>");
      console.log("Fett");
      $("#" + thisId).prepend("<div class='position-details' id='detail-"+ thisId +"'>details</div>");



      if($("#" + thisLevel + "-positions").children().length > 3) {
        var height = Math.ceil($("#" + thisLevel + "-positions").children().length / 3) * 90;
          $("#"+ thisLevel).css("height", height);
      }
  }

// when hovering over any position-box
    $(".position-box").hover(
        function() {
          var currPos = $(this).attr("id");
          var coordCurrPos = $(this).position();
          coordCurrPos.left = coordCurrPos.left + $(this).width()/2;
            // get the details for this position
            $.ajax({
                url: '/positions/'+ $(this).attr('id'),
                type: 'get',
                dataType: 'json',// mongod is expecting the parameter name to be called "jsonp"
                success: function (data) {
                    // when you have the details, get the next positions and save them to a local variable
                    var nextPositions = data.positions.nextPositions;
                    var currSkills = data.positions.skills;

                    // dim out all position boxes
                    $(".position-box").fadeTo(0, 0.2);

                    // undim the current position
                    $("#"+ data.positions._id).fadeTo(0, 1);

                    // go through all nextPosition boxes and undim them as well
                    for(j = 0; j < nextPositions.length; j++) {
                      var nextPos = nextPositions[j];
                        $("#" + nextPositions[j]).fadeTo(0, 1); 
                        $("#" + nextPositions[j]).css("background-color", "yellow");

                        // display the div with the delta on all skillcomps
                        $("#" + nextPositions[j]).append("<div class='skillcomp' id='sc-"+nextPositions[j]+"'>&nbsp</div>");


                        // get the position of the next position
                        var coordNextPos = $("#" + nextPos).position();

                        coordNextPos.left = coordNextPos.left + $("#" + nextPos).width()/2;
                        console.log("nextPos: " + coordNextPos.left);

                        // calculate the coordinates for the canvas
                        if (coordCurrPos.top > coordNextPos.top) {
                          var canvasTop = coordNextPos.top + $("#" + nextPos).height();
                        } else {
                          var canvasTop = coordCurrPos.top;
                        };
                        
                        var canvasLeft = Math.min(coordCurrPos.left, coordNextPos.left);
                        var canvasBottom = Math.max(coordCurrPos.top, coordNextPos.top);
                        var canvasRight = Math.max(coordCurrPos.left, coordNextPos.left)+ 1;
                        var canvasWidth = canvasRight - canvasLeft +1;
                        var canvasHeight = canvasBottom - canvasTop + 10;


                        console.log("canvas: " + canvasTop + ", " + canvasRight + ", " + canvasBottom + ", " + canvasLeft);
                        $("body").prepend("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:"+ canvasWidth+"px; height:" + canvasHeight+"px; position:absolute; top:"+canvasTop+"; left:"+canvasLeft+"; z-index:2;' id='"+currPos+"-"+nextPos+"' class='drawingboard'></svg>");
                        // draw a line
                        //
                        $("#" + currPos+"-"+nextPos).append("<line x1='0' y1='0' x2='"+canvasWidth+"' y2='"+canvasHeight+"'/>");


                        // to calculate the delta: get the data for the nextPos and then iterate through all skills & comps of the nextPos showing the value and what was the value for the currPos
                        $.ajax({
                            url: '/positions/'+ nextPos,
                            type: 'get',
                            dataType: 'json',// mongod is expecting the parameter name to be called "jsonp"
                            success: function (nextData) {
                            var skills = nextData.positions.skills;
                            var comps = nextData.positions.competencies;



                            for(var i = 0; i < skills.length; i++) {
                              var skill = skills[i].skill;
                              var level = skills[i].level;
                              // if (level > 0) {
                              //   console.log(skill +": "+ level);
                              // };
                              
                              // $("#sc-"+nextPos).append("<div>"+skill +": "+ level+"</div>");

                              
                            }
                          },
                          error: function (XMLHttpRequest, textStatus, errorThrown) {
                          console.log('error', errorThrown);
                          }
                        });
                    }
                },
                error: function (XMLHttpRequest, textStatus, errorThrown) {
                console.log('error', errorThrown);
                }
            });
            }, function() {
                // when not hovering any more, undim all 
                $(".position-box").fadeTo(0, 1);
                $(".position-box").css("background-color", "white");
                $(".skillcomp").remove();
                $(".drawingboard").remove();
        }
    );

// when clicking the the positionbox
$(".position-box").click(

    function() {
      var currPos = $(this).attr("id");
      var coordCurrPos = $(this).position();
      var postionTitle = $("#" + currPos + "-title-box").text();
      coordCurrPos.left = coordCurrPos.left + $(this).width()/2;

        if(isClicked != currPos) {
          isClicked = currPos;
      // if the position-skillcomp-box is already visible, get rid of it
      if ($("#position-skillcomp-overview").is(":visible")) {
        $("#position-skillcomp-overview").hide(); 
      }

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
                    console.log(np);
                    var nextPos = nextPositions[np];
                    // console.log(nextPos);

                    // get the position of the next position
                    // var coordNextPos = $("#" + nextPos).position();

                    // coordNextPos.left = coordNextPos.left + $("#" + nextPos).width()/2;
                    // console.log("nextPos: " + coordNextPos.left);

                    // // calculate the coordinates for the canvas
                    // if (coordCurrPos.top > coordNextPos.top) {
                    //   var canvasTop = coordNextPos.top + $("#" + nextPos).height();
                    // } else {
                    //   var canvasTop = coordCurrPos.top;
                    // };
                    
                    // var canvasLeft = Math.min(coordCurrPos.left, coordNextPos.left);
                    // var canvasBottom = Math.max(coordCurrPos.top, coordNextPos.top);
                    // var canvasRight = Math.max(coordCurrPos.left, coordNextPos.left)+ 1;
                    // var canvasWidth = canvasRight - canvasLeft +1;
                    // var canvasHeight = canvasBottom - canvasTop + 10;


                    // console.log("canvas: " + canvasTop + ", " + canvasRight + ", " + canvasBottom + ", " + canvasLeft);
                    // $("body").prepend("<svg xmlns='http://www.w3.org/2000/svg' version='1.1' style='width:"+ canvasWidth+"px; height:" + canvasHeight+"px; position:absolute; top:"+canvasTop+"; left:"+canvasLeft+"; z-index:2;' id='"+currPos+"-"+nextPos+"' class='fixed-drawingboard'></svg>");
                    // // draw a line
                    // //
                    // $("#" + currPos+"-"+nextPos).append("<line x1='0' y1='0' x2='"+canvasWidth+"' y2='"+canvasHeight+"'/>");

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
                      console.log();
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
  }
  

  });
          

    
    
}, "json");

// all the stuff for the dragging and dropping

// $( function() {
//     $( ".subtractor" ).draggable({ revert: "valid" });
 
//     $( ".position-box" ).droppable({
//       classes: {
//         "ui-droppable-active": "ui-state-active",
//         "ui-droppable-hover": "ui-state-hover"
//       },
//       drop: function( event, ui ) {
//         // do some ajax to add the dropped id to the dropping id as nextPositions
//         var nextPos = $(this).attr("id");             
//         var currPos = $(ui.draggable).attr("id").substr(4, 25);

//           $.ajax({
//               url: '/positions/'.concat(currPos),
//               dataType: 'json',
//               type: 'patch',
//               contentType: 'application/json',
//               data: JSON.stringify( { "nextPositions": nextPos} ),
//               success: function( data, textStatus, jQxhr ){
//                   $("#" + nextPos).toggle( "highlight" );
//                   $("#" + nextPos).toggle( "highlight" );
//               },
//               error: function( jqXhr, textStatus, errorThrown ){
//                   console.log( errorThrown );
//               }
//           });

//       }
//     });

// } );


function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function(letter, index) {
    return index == 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function mgFindSkillComps (name, level) {
  
}