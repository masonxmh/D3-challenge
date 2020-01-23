function makeResponsive() {
  var svgArea = d3.select("body").select("svg");

  if (!svgArea.empty()) {
      svgArea.remove();
  }
  // var svgWidth = window.innerWidth;
  // var svgHeight = window.innerHeight;
  var svgWidth = document.getElementsByClassName("article")[0].offsetWidth;
  var svgHeight = svgWidth;
// var svgWidth = 800;
// var svgHeight = 700;

var margin = {
    top : 100,
    right :10,
    bottom: 100,
    left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, 
//and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty"
var chosenYAxis = "healthcare"
// function used for updating x-scale var upon click on axis label
function xScale(liveData, chosenXAxis){
  // create x scale
  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(liveData, d =>d[chosenXAxis])*0.9, d3.max(liveData, d =>d[chosenXAxis])*1.2])
      .range([0, width]);

  return xLinearScale;

}
// function used for updating y-scale var upon click on axis label
function yScale(liveData, chosenYAxis){
  // create y scale
  yLinearScale = d3.scaleLinear()
      .domain([d3.min(liveData, d => d[chosenYAxis])*0.9, d3.max(liveData, d => d[chosenYAxis])*1.1])
      .range([height, 0]);
  return yLinearScale;
}
// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
    .duration(1000)
    .call(leftAxis);

  return yAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

function renderCirclesText(circlesText, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]-0.2));

  return circlesText;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText) {
  //xaxis selection
  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%)"
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age (Median)"
  }
  else {
    var xlabel = "Household Income (Median)"
  }
  //yaxis selection
  if (chosenYAxis === "healthcare") {
    var ylabel = "Lacks Healthcare (%)"
  }
  else if (chosenYAxis === "smokes") {
    var ylabel = "Smokes (%)"
  }
  else {
    var ylabel = "Obese (%)"
  }
  
  //initial tooltip
  var toolTip = d3.tip()
    .attr ("class", "d3-tip")
    .offset([80,-80])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${ylabel}: ${d[chosenYAxis]}`);
    });
  
    
  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data,index) {
    toolTip.show(data);
    d3.select(this).style("stroke", "black");
    // d3.select(this).transition()
    //       .duration('100')
    //       .attr("r", 12)
    //       .style("stroke","black");
          // console.log(this);

  })
    //on mouse out event
    .on("mouseout", function(data,index) {
    toolTip.hide(data);
    d3.select(this).style("stroke", "none");
    // d3.select(this).transition()
    //   .attr("r", 10)
    //   .style("stroke", "none");
    
      
    // toolTip.style("display","none")
  })

  circlesText.call(toolTip);

  circlesText.on("mouseover", function(data) {
    toolTip.show(data);
    // d3.select(this).transition()
    // .attr("r", 12)
    // .style("stroke", "black");
    console.log("."+data.abbr);
    d3.select("." + data.abbr).style("stroke", "black");
    console.log(this);
   
  })
    //on mouse out event
    .on("mouseout", function(data,index) {
    toolTip.hide(data);
    d3.select("." + data.abbr).style("stroke", "none");
    
  });
  return circlesGroup;
  
} // updateToolTip


//Import Data
d3.csv("assets/data/data.csv").then(function(liveData, err) {
  if (err) throw err;
    // Parse Data/Cast as numbers
    // ==============================
    liveData.forEach(function(data){
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });
    // xLinearScale function above csv import
    // ==============================
    var xLinearScale = xScale(liveData, chosenXAxis);
    
    // create y scale function
    var yLinearScale = yScale(liveData, chosenYAxis);

    // Create initial axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    // Append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // Append y axis
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // Create Initial Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(liveData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("class", d => "stateCircle " + d.abbr)
      .attr("r", "10")
      .attr("opacity", ".9");


    // Add Circle Text Labels
    var circlesText = chartGroup.selectAll(".stateText")
      .data(liveData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d[chosenYAxis]-0.2))
      .attr("class", "stateText")
      .text(d => d.abbr)
      .attr("font-size", "10px")  // Font size
      
    // Create group for 3 x - axis labels
    //===================================
    var xlabelsGroup = chartGroup.append('g')
      .attr("transform", `translate(${width / 2}, ${height + 20})`)
    
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty") //value to grab for event listener
      .attr("class", "aText")
      .classed("aText", true)
      .classed("active", true)
      .text("In Poverty (%)")
    
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age") //value to grab for event listener
      .attr("class", "aText")
      .classed("aText", true)
      .classed("inactive", true)
      .text("Age (Median)")

    var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") //value to grab for event listener
    .attr("class", "aText")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Household Income (Median)")
    
    // create group for 3 y - axis labels
    //===================================
    var ylabelsGroup = chartGroup.append('g')
      .attr("transform", "rotate(-90)")
    
    var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", 0-height/2)
    .attr("y", 0-margin.left+50)
    .attr("dy","1em")
    .attr("value", "healthcare") //value to grab for event listener
    .attr("class", "aText")
    .classed("aText", true)
    .classed("active", true)
    .text("Lacks Healthcare (%)")
    
    var smokeLabel = ylabelsGroup.append("text")
    .attr("x", 0-height/2)
    .attr("y", 0-margin.left+30)
    .attr("dy","1em")
    .attr("value", "smokes") //value to grab for event listener
    .attr("class", "aText")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Smokes (%)")
    
    var obeseLabel = ylabelsGroup.append("text")
    .attr("x", 0-height/2)
    .attr("y", 0-margin.left+10)
    .attr("dy","1em")
    .attr("value", "obesity") //value to grab for event listener
    .attr("class", "aText")
    .classed("aText", true)
    .classed("inactive", true)
    .text("Obese (%)")
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);

    // xlabel
    xlabelsGroup.selectAll(".aText")
      .on("click", function(){
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          //replces chosenXAxis with value
          chosenXAxis = value;
          
          // updates x scale for new data
          xLinearScale = xScale(liveData, chosenXAxis);

          // update x axis for new data

          xAxis = renderXAxes(xLinearScale, xAxis);
          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates circle text with new info
          circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);
          
          //changes classes to change bold text
          if (chosenXAxis === "poverty") {
            povertyLabel
              .classed("active", true)
              .classed("inactive", false);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenXAxis === "age") {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", true)
              .classed("inactive", false);
            incomeLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            povertyLabel
              .classed("active", false)
              .classed("inactive", true);
            ageLabel
              .classed("active", false)
              .classed("inactive", true);
            incomeLabel
              .classed("active", true)
              .classed("inactive", false);

          }
          
        }
      });
      
      //ylabels
      ylabelsGroup.selectAll(".aText")
      .on("click", function(){
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          //replces chosenYAxis with value
          chosenYAxis = value;
          
          // updates y scale for new data
          yLinearScale = yScale(liveData, chosenYAxis);

          // update y axis
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates circle text with new info
          circlesText = renderCirclesText(circlesText, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup, circlesText);
          
          //changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthcareLabel
              .classed("active", true)
              .classed("inactive", false);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          if (chosenYAxis === "smokes") {
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", true)
              .classed("inactive", false);
            obeseLabel
              .classed("active", false)
              .classed("inactive", true);
          }
          if (chosenYAxis ==="obesity"){
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
            smokeLabel
              .classed("active", false)
              .classed("inactive", true);
            obeseLabel
              .classed("active", true)
              .classed("inactive", false);

          }
          
        }
      });
    
}).catch(function(error) {
  console.log(error);
})

} //Responsive() function
makeResponsive();

d3.select(window).on("resize", makeResponsive);