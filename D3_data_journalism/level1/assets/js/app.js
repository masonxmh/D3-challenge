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

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  //Import Data
d3.csv("assets/data/data.csv").then(function(liveData) {
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    liveData.forEach(function(data){
      // console.log(data.poverty);
      // console.log(data.healthcare);
      // console.log(data.abbr);
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
    });
    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(liveData, d =>d.poverty)*0.9, d3.max(liveData, d =>d.poverty)*1.2])
      .range([0, width]);
    
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(liveData, d => d.healthcare)*0.9, d3.max(liveData, d => d.healthcare)*1.1])
      .range([height, 0]);

    //Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(liveData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d.poverty))
      .attr("cy", d => yLinearScale(d.healthcare))
      .attr("class", "stateCircle")
      .attr("r", "10")
      .attr("opacity", ".8");


    // Add Circle Text Labels
    cirlesText = chartGroup.selectAll(".stateText")
      .data(liveData)
      .enter()
      .append("text")
      .attr("x", d => xLinearScale(d.poverty))
      .attr("y", d => yLinearScale(d.healthcare-0.2))
      .attr("class", "stateText")
      .text(d => d.abbr)
      .attr("font-size", "10px")  // Font size
      
    
    //Create axes labels
    //append y axis
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0-margin.left)
      .attr("x", 0-(height/2))
      .attr("dy","1em")
      .classed("aText", true)
      .classed("active", true)
      .text("Lacks Healthcare (%)")
      // .style('stroke','#000')
    // console.log(width);
    //append x axis
    chartGroup.append("text")
      .attr("transform", `translate(${width / 2}, ${height+margin.bottom-50})`)
      // .attr("x", width / 2 )
      // .attr("y",  height + 40)
      .attr("class", "aText")
      .classed("aText", true)
      .classed("active", true)
      .text("In Poverty (%)")
      // .style('stroke', '#000');
}).catch(function(error) {
  console.log(error);
})
    