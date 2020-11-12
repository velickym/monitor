
// set the dimensions and margins of the graph
var width = 1200
var height = 600
class Motion {
  static pods = []
  constructor(svg, id) {
    this.id = id
    this.clientList = []
    this.svg = svg;
    Motion.pods = Array.from(this.svg.selectAll('.pod'))
  }
  _getRandomCoord() {
    return { x: Math.random() * width / 4, y: Math.random() * height }
  }

  _drawClients() {
    this.svg.selectAll(".client")
      .data(this.clientList)
      .join('circle')
      .attr('id', d => {
        return d.id
      })
      .attr("class", "client")
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 3)
      .attr('fill', 'purple')
  }

  spawn(id) {
    this.clientList.push({ id: id, ...this._getRandomCoord() })
    this._drawClients()
  }

  static move(client_id, pod_id) {
    if (!pod_id) return
    const podObj = {}
    Motion.pods.map(d => d.__data__).forEach(d => {
      podObj[d.id] = { ...d }
    })
    const { x, y } = podObj[pod_id]



    d3.select(`#${client_id}`)
      .transition()
      .duration(2000)
      .attr('cx', x).attr('cy', y)
  }
}

// append the svg object to the body of the page
var svg = d3.select('body')
  .append("svg")
  .attr("width", width)
  .attr("height", height)

// set cluster titles
var titles = {}
d3.json('data.json').then((_data) => {
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
      data.push({ id: k, category: d.name.toLowerCase(), group: _group })
    })
  })


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

  // function dragstarted(event) {
  //   if (!event.active) simulation.alphaTarget(1).restart();
  //   event.subject.fx = event.subject.x;
  //   event.subject.fy = event.subject.y;
  // }

  // function dragged(event) {
  //   event.subject.fx = event.x;
  //   event.subject.fy = event.y;
  // }

  // function dragended(event) {
  //   if (!event.active) simulation.alphaTarget(0);
  //   event.subject.fx = null;
  //   event.subject.fy = null;
  // }

  // manually setting up title 
  const textData = [{ name: "Orders", group: [1, 2] }, { name: "Payments", group: [2, 1] }, { name: "Shipping", group: [2, 3] }, { name: "Receipts", group: [3, 2] }]
  svg.selectAll('text').data(textData).join('text').text(d => d.name).attr('class', d => d.name.toLowerCase()).style('text-anchor', 'middle')

  let texts = svg.append('g')
    .selectAll('.text')
    .data(textData)
    .join("circle")
    .attr('class', 'text')

  // Initialize the circle: all located at the center of the svg area
  var node = svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("r", 10)
    .attr("class", d => `circle pod ${d.category}`)
    .on('mouseover', function (event, d) {
      console.log(d)
    })

  // Features of the forces applied to the pods nodes:
  var simulation = d3.forceSimulation()
    .force("x", d3.forceX().strength(0.1).x(function (d, i) {
      return x(d.group[0])
    }))
    .alpha(0.5)
    .force("y", d3.forceY().strength(0.1).y(function (d, i) { return y(d.group[1]) }))
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)) // Force that avoids circle overlapping

  // Features of the forces applied to the text nodes:
  var txtSimulation = d3.forceSimulation()
    .force("x", d3.forceX().strength(0.1).x(function (d, i) {
      return x(d.group[0])
    }))
    .force("y", d3.forceY().strength(0.1).y(function (d, i) { return y(d.group[1]) }))
    .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
    .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
    .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)) // Force that avoids circle overlapping


  // Start the force simulation
  const startSim = async () => {
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
    return Array.from(svg.selectAll('.pod'))
  }
  return startSim();

}).then(() => {
  // Start spawning the clients
  const client = new Motion(svg, "test");
  client.spawn('client1')
  setTimeout(function () {
    Motion.move("client1", "payment-service-hj66k88-xyz123")
  }, 1000)
  setTimeout(function () {
    Motion.move("client1", "receipts-service-hj66k88-abc456")
  }, 3000)
  setTimeout(function () {
    Motion.move("client1", "shipping-service-hj66k88-xyz123")
  }, 5000)
  let i = 0;
  // const intr = setInterval(function () {
  //   client.spawn(Date.now())
  //   i++
  //   if (i > 10) clearInterval(intr)
  // }, 100)
  // }
})
