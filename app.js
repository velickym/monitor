

// set the dimensions and margins of the graph
var width = 900
var height = 450

// append the svg object to the body of the page
var svg = d3.select('body')
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// create dummy data -> just one element per circle
// var data = [{ "name": "A", children: ['a', 'b'] }, { "name": "B" }, { "name": "C" }, { "name": "D" }, { "name": "E" }, { "name": "F" }, { "name": "G" }, { "name": "H" }]
var data = [{ "name": "A", "group": [1, 2] }, { "name": "B", "group": [1, 2] }, { "name": "C", "group": [1, 2] }, { "name": "D", "group": [1, 2] }, { "name": "E", "group": [1, 2] }, { "name": "F", "group": [1, 2] },
{ "name": "G", "group": [2, 1] }, { "name": "H", "group": [2, 1] }, { "name": "I", "group": [2, 1] }, { "name": "J", "group": [2, 1] }, { "name": "K", "group": [2, 1] }, { "name": "L", "group": [2, 1] },
{ "name": "M", "group": [3, 2] }, { "name": "N", "group": [3, 2] }, { "name": "O", "group": [3, 2] }]

// A scale that gives a X target position for each group
var x = d3.scaleLinear()
  .domain([1, 3])
  .range([0, width * 2 / 3.6])

var y = d3.scaleLinear()
  .domain([1, 3])
  .range([0, height * 2 / 3.6])


// A color scale
var color = d3.scaleOrdinal()
  .domain([1, 2, 3])
  .range(["#F8766D", "#00BA38", "#619CFF"])

function dragstarted(event) {
  if (!event.active) simulation.alphaTarget(0.3).restart();
  event.subject.fx = event.subject.x;
  event.subject.fy = event.subject.y;
}

function dragged(event) {
  event.subject.fx = event.x;
  event.subject.fy = event.y;
}

function dragended(event) {
  if (!event.active) simulation.alphaTarget(0);
  event.subject.fx = null;
  event.subject.fy = null;
}


// Initialize the circle: all located at the center of the svg area
var node = svg.append("g")
  .selectAll("circle")
  .data(data)
  .enter()
  .append("circle")
  .attr("r", 10)
  // .attr("cx", width / 2)
  // .attr("cy", height / 2)
  .style("fill", "#69b3a2")
  .style("fill-opacity", 0.3)
  .attr("stroke", "#69a2b2")
  .style("stroke-width", 4)
  .call(d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended)
  )

// // Features of the forces applied to the nodes:
var simulation = d3.forceSimulation()
  .force("x", d3.forceX().strength(0.1).x(function (d, i) { return x(d.group[0]) }))
  .force("y", d3.forceY().strength(0.1).y(function (d, i) { return y(d.group[1]) }))
  .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
  .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
  .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)) // Force that avoids circle overlapping

// // Apply these forces to the nodes and update their positions.
// // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.

// var childnode = svg.append("g")
//   .selectAll(".child")
//   .data(data[0].children)
//   .join('circle')
//   .attr('class', 'child')
//   .attr("r", 10)
//   .attr("cx", width / 2)
//   .attr("cy", height / 2)
//   .style("fill", "#69b3a2")
//   .style("fill-opacity", 0.3)
//   .attr("stroke", "#69a2b2")
//   .style("stroke-width", 4)

// data[0].childNode = childnode

simulation
  .nodes(data)
  .on("tick", function (d) {
    node
      .attr("cx", function (d) {

        return d.x;
      })
      .attr("cy", function (d) {
        return d.y;
      });
  });

// simulation.nodes(childnode)
//   .on("tick", function (j) {
//     node
//       .attr("cx", function (j) { return j.x; })
//       .attr("cy", function (j) { return j.y; });

//   });
