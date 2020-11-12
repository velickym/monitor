

// set the dimensions and margins of the graph
var width = 1200
var height = 600

// append the svg object to the body of the page
var svg = d3.select('body')
  .append("svg")
  .attr("width", width)
  .attr("height", height)

var titles = {}
d3.json('data.json').then(_data => {
  let data = []
  _data.forEach(d => {
    _group = null
    switch (d.name.toLowerCase()) {
      case ('orders'):
        _group = [1, 2]
        break;
      case ('payments'):
        _group = [2, 1]
        break;
      case ('shipping'):
        _group = [2, 3]
        break;
      case ('receipts'):
        _group = [3, 2]
        break;
      default:
        break;
    }
    titles[d.name] = _group
    d.pods.forEach(k => {
      console.log(k)
      data.push({ id: k, category: d.name.toLowerCase(), group: _group })
    })
  })

  console.log(titles)


  // A scale that gives a X target position for each group
  var x = d3.scaleLinear()
    .domain([0, 3])
    .range([0, width * 2 / 3])

  var y = d3.scaleLinear()
    .domain([1, 3])
    .range([0, height * 2 / 3.4])


  // A color scale
  var color = d3.scaleOrdinal()
    .domain(["order", "payment", "shipping", "receipt"])
    .range(["#F8766D", "#00BA38", "#619CFF"])

  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(1).restart();
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

  const textData = [{ name: "Orders", group: [1, 2] }, { name: "Payments", group: [2, 1] }, { name: "Shipping", group: [2, 3] }, { name: "Receipts", group: [3, 2] }]
  svg.selectAll('text').data(textData).join('text').text(d => d.name).attr('class', d => d.name.toLowerCase()).style('text-anchor', 'middle')

  let texts = svg.append('g').selectAll('.text').data(textData).join("circle").attr('class', 'text')
  // .attr("x", (d) => x(titles[d][0]))
  // .attr("y", (d) => y(titles[d][1]))

  // Initialize the circle: all located at the center of the svg area
  var node = svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("class", d => `circle ${d.category}`)
    // .attr("cx", width / 2)
    // .attr("cy", height / 2)
    // .style("fill", "#69b3a2")
    // .style("fill-opacity", 0.3)
    // .attr("stroke", "#69a2b2")
    .call(d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended)
    ).on('mouseover', function (event, d) {
      console.log(d.id)
    })

  // // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
    .force("x", d3.forceX().strength(0.1).x(function (d, i) {
      return x(d.group[0])
    }))
    .force("y", d3.forceY().strength(0.1).y(function (d, i) { return y(d.group[1]) }))
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)) // Force that avoids circle overlapping

  var txtSimulation = d3.forceSimulation()
    .force("x", d3.forceX().strength(0.1).x(function (d, i) {
      return x(d.group[0])
    }))
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




  txtSimulation
    .nodes(textData)
    .on("tick", function (d) {
      texts
        .attr("cx", function (d) {
          d3.selectAll(`.${d.name.toLowerCase()}`).attr('x', d.x).attr('y', d.y - 60)
          return d.x;
        })

    });

})
