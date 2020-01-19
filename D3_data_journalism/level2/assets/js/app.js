var svgWidth = 800;
var svgHeight = 700;

var margin = {
    top : 100,
    right :10,
    bottom: 100,
    left: 60
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

// function used for updating x-scale var upon click on axis label
function xScale(liveData, chosenXAxis){
  //create scale
  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(liveData, d =>d[chosenXAxis])*0.9, d3.max(liveData, d =>d[chosenXAxis])*1.2])
      .range([0, width]);

  return xLinearScale;

}

// function used for updating xAxis var upon click on axis label
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

  return xAxis;
}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

  circlesGroup.transition()
    .duration(1000)
    .attr("cx", d => newXScale(d[chosenXAxis]));

  return circlesGroup;
}

function renderCirclesText(circlesText, newXScale, chosenXAxis) {

  circlesText.transition()
    .duration(1000)
    .attr("x", d => newXScale(d[chosenXAxis]));

  return circlesText;
}


// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

  if (chosenXAxis === "poverty") {
    var xlabel = "In Poverty (%)"
  }
  else if (chosenXAxis === "age") {
    var xlabel = "Age (Median)"
  }
  else {
    var xlabel = "Household Income (Median)"
  }
  
  //initial tooltip
  var toolTip = d3.tip()
    .attr ("class", "d3-tip")
    .offset([80,-60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    //on mouse out event
    .on("mouseout", function(data,index) {
    toolTip.hide(data);
  });

  // Create Event Listeners to Display and Hide the Text Tooltip
  // circlesText.call(toolTip);
  
  // circlesText.on("mouseover", function(data) {
  //   toolTip.show(data, this);
  // })
  //   // onmouseout Event
  //   .on("mouseout", function(data) {
  //     toolTip.hide(data);
  //   });
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
    });
    // xLinearScale function above csv import
    // ==============================
    var xLinearScale = xScale(liveData, chosenXAxis);
    
    // create y scale function
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(liveData, d => d.healthcare)*0.9, d3.max(liveData, d => d.healthcare)*1.1])
      .range([height, 0]);

    // Create initial axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Append Axes to the chart
    // ==============================
    // Append x axis
    chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    // Append y axis
    chartGroup.append("g")
      .call(leftAxis);

    // Create Initial Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(liveData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("class", "stateCircle")
      .attr("r", "10")
      .attr("opacity", ".9");


    // Add Circle Text Labels
    var circlesText = chartGroup.selectAll(".stateText")
      .data(liveData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d[chosenXAxis]))
      .attr("y", d => yLinearScale(d.healthcare-0.2))
      .attr("class", "stateText")
      .text(d => d.abbr)
      .attr("font-size", "10px")  // Font size
      
    // Create group for 3 x - axis labels
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
    
    //append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0-margin.left)
      .attr("x", 0-(height/2))
      .attr("dy","1em")
      .classed("aText", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)")
    
    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, circlesText);
    
    xlabelsGroup.selectAll(".aText")
      .on("click", function(){
        //get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          //replces chosenXAxis with value
          chosenXAxis = value;
          
          // updates x scale for new data
          xLinearScale = xScale(liveData, chosenXAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates circle text with new info
          circlesText = renderCirclesText(circlesText, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);
          
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
    
}).catch(function(error) {
  console.log(error);
})
    