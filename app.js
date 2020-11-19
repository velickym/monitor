// set the dimensions and margins of the graph
const width = 1200;
const height = 600;
let node;
let svg;

const { d3 } = window;
const getColour = (category) => {
  const colour = d3
    .scaleOrdinal()
    .domain(["payments", "orders", "shipping", "receipts"])
    .range(["#4682b4", "#ff00ff", "#f08080", "#20b2aa"]);
  return colour(category);
};

function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function getRandomCoord() {
  return { x: Math.random() * (width / 4), y: Math.random() * height };
}

class Motion {
  constructor(svgEl, id) {
    Motion.counter = 0;
    this.id = id;
    Motion.clientList = [];
    Motion.svg = svgEl;
    Motion.pods = Array.from(Motion.svg.selectAll(".pod").data());
  }

  static drawClients() {
    Motion.svg
      .selectAll(".client")
      .data(Motion.clientList, (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("fill", getRandomColor())
            .attr("id", (d) => d.id)
            .attr("r", 4)
            .attr("class", "client")
            .attr("cx", (d) => {
              return d.x;
            })
            .attr("cy", (d) => d.y),
        (update) => update,
        (exit) => exit.remove()
      );
  }

  static spawn(id, coords) {
    if (coords) {
      Motion.clientList.push({ id, ...coords });
    } else {
      Motion.clientList.push({ id, ...getRandomCoord() });
    }
    Motion.drawClients();
  }

  static destroy(clientId) {
    Motion.clientList = Motion.clientList.filter((d) => {
      return d.id !== clientId;
    });
    // eslint-disable-next-line no-console
    console.log(`Destroyed::${clientId}`);
    this.drawClients();
  }

  static async copyAndMove(clientId, podId) {
    const el = d3.select(`#${clientId}`).node();
    if (!el) return null;
    Motion.spawn(`${clientId}_copy`, {
      x: el.getAttribute("cx"),
      y: el.getAttribute("cy"),
    });
    const tmpClientId = await Motion.move(`${clientId}_copy`, podId);
    return tmpClientId;
  }

  static async move(clientId, podId) {
    if (!podId) return null;
    const podObj = {};

    // Add circle in the back
    const podTitleData = d3.selectAll("text").data();
    Motion.svg
      .selectAll(".group-pod-circle")
      .data(podTitleData)
      .join("ellipse")
      .attr("class", "group-pod-circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("rx", 120)
      .attr("ry", 90)
      .attr("fill", "#333")
      .attr("stroke", (d) => getColour(d.category))
      .attr("stroke-width", "2px")
      .attr("fill-opacity", 0.1)
      .attr("stroke-opacity", 0.9);

    // update unit's location
    const foundClient = Motion.clientList.find((d) => d.id === clientId);
    foundClient.location = podId;

    // Update unit count number
    Motion.svg.selectAll("text").text((d) => {
      const count = Motion.clientList.filter((client) => {
        if (client.location) {
          return client.location.startsWith(
            d.name.toLowerCase().substring(0, 4)
          );
        }
        return false;
      }).length;
      return `${d.name} (${count})`;
    });

    Motion.pods.forEach((d) => {
      podObj[d.id] = { ...d };
    });

    const { x, y } = podObj[podId];

    await d3
      .selectAll(`#${clientId}`)
      .data(d3.selectAll(`#${clientId}`).data(), (d) => d.id)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("class", "client")
            .attr("fill-opacity", 1)
            .attr("id", `${clientId}`),
        (update) => update.attr("fill-opacity", 1)
      )
      .transition()
      .duration(700)
      .attr("cx", x)
      .attr("cy", y)

      // eslint-disable-next-line func-names
      .on("end", function () {
        d3.select(this).attr("fill-opacity", "0");
      });
    const nodeData = [...Array.from(node.data())];
    node.remove();
    this.svg.selectAll(".pod2").remove();

    this.svg
      .selectAll(".pod2")
      .data(nodeData)
      .join("circle")
      .attr("fill", (d) => getColour(d.category))
      .attr("class", "pod2")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 10);
    return clientId;
  }
}

// set cluster titles
const titles = {};
d3.json("data.json")
  .then((_data) => {
    const data = [];
    _data.forEach((d) => {
      let group = null;
      switch (d.name.toLowerCase()) {
        case "orders":
          group = [1, 2];
          break;
        case "payments":
          group = [2, 1];
          break;
        case "shipping":
          group = [2, 3];
          break;
        case "receipts":
          group = [3, 2];
          break;
        default:
          break;
      }
      titles[d.name] = group;
      d.pods.forEach((k) => {
        data.push({ id: k, category: d.name.toLowerCase(), group });
      });
    });

    // append the svg object to the body of the page
    svg = d3
      .select("body")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

    // Initialize the circle: all located at the center of the svg area
    node = svg
      .append("g")
      .selectAll(".pod")
      .data(data)
      .join("circle")
      .attr("r", 10)
      .attr("class", (d) => `circle pod ${d.category}`);
    svg
      .selectAll(".client")
      .data(Array.from(Array(1000).keys()))
      .join("circle")
      .attr("class", "client")

      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 1)
      .style("fill", "red");

    // A scale that gives a X target position for each group
    const x = d3
      .scaleLinear()
      .domain([0, 3])
      .range([0, (width * 2) / 3]);

    const y = d3
      .scaleLinear()
      .domain([1, 3])
      .range([0, (height * 2) / 3.4]);

    const textData = [
      { name: "Orders", group: [1, 2] },
      { name: "Payments", group: [2, 1] },
      { name: "Shipping", group: [2, 3] },
      { name: "Receipts", group: [3, 2] },
    ];

    svg
      .selectAll("text")
      .data(textData)
      .join("text")
      .text((d) => d.name)
      .attr("fill", (d) => getColour(d.name.toLowerCase()))
      .attr("class", (d) => d.name.toLowerCase())
      .style("text-anchor", "middle");

    const texts = svg
      .append("g")
      .selectAll(".text")
      .data(textData)
      .join("circle")
      .attr("class", "text");

    // Features of the forces applied to the pods nodes:
    const simulation = d3
      .forceSimulation()
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x((d) => x(d.group[0]))
      )
      .alpha(0.5)
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y((d) => y(d.group[1]))
      )
      .force(
        "center",
        d3
          .forceCenter()
          .x(width / 2)
          .y(height / 2)
      ) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)); // Force that avoids circle overlapping

    // Features of the forces applied to the text nodes:
    const txtSimulation = d3
      .forceSimulation()
      .force(
        "x",
        d3
          .forceX()
          .strength(0.1)
          .x((d) => x(d.group[0]))
      )
      .force(
        "y",
        d3
          .forceY()
          .strength(0.1)
          .y((d) => y(d.group[1]))
      )
      .force(
        "center",
        d3
          .forceCenter()
          .x(width / 2)
          .y(height / 2)
      ) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)); // Force that avoids circle overlapping

    // Start the force simulation
    const startSim = () => {
      simulation.nodes(data).on("tick", () => {
        node
          .attr("cx", (d) => d.x)
          .attr("cy", (d) => d.y)
          .attr("fill", (d) => getColour(d.category));
      });

      txtSimulation.nodes(textData).on("tick", () => {
        texts.attr("cx", (d) => {
          d3.selectAll(`.${d.name.toLowerCase()}`)
            .attr("x", d.x)
            .attr("y", d.y - 60);
          return d.x;
        });
      });
    };

    return startSim();
  })
  .then(() => {
    // eslint-disable-next-line no-unused-vars
    const motion = new Motion(svg, "test");
    const podIds = Array.from(d3.selectAll(".pod").data()).map((d) => d.id);
    const orderPods = podIds.filter((d) => d.startsWith("order"));
    const paymentPods = podIds.filter((d) => d.startsWith("payment"));
    const receiptPods = podIds.filter((d) => d.startsWith("receipt"));
    const shippingPods = podIds.filter((d) => d.startsWith("shipping"));

    /**
     * A funtion that simulate traffic flow.
     */
    const sim = () => {
      const clientId = `client_${Date.now()}`;
      Motion.spawn(clientId);
      setTimeout(() => {
        Motion.move(
          clientId,
          orderPods[Math.floor(Math.random() * orderPods.length)]
        );
      }, 0);
      setTimeout(() => {
        Motion.copyAndMove(
          clientId,
          receiptPods[Math.floor(Math.random() * receiptPods.length)]
        ).then((d) => {
          setTimeout(() => {
            Motion.destroy(d);
          }, 1000);
        });
      }, 1000);

      setTimeout(() => {
        Motion.move(
          clientId,
          paymentPods[Math.floor(Math.random() * paymentPods.length)]
        );
      }, 800);
      setTimeout(() => {
        Motion.move(
          clientId,
          receiptPods[Math.floor(Math.random() * receiptPods.length)]
        );
      }, 3000);

      setTimeout(() => {
        Motion.move(
          clientId,
          shippingPods[Math.floor(Math.random() * shippingPods.length)]
        ).then((d) => {
          setTimeout(() => {
            Motion.destroy(d);
          }, 500);
        });
      }, 4000);
    };

    // Run the sim function recursively
    setTimeout(() => {
      sim();
      const intr = setInterval(() => {
        sim();
        if (Motion.counter > 100) {
          clearInterval(intr);
        }
      }, 200); // Control the speed of unit spawning
    }, 2000);
  });

// Allows some time while force simulation to startup
let timeout = 500;
setInterval(() => {
  timeout -= 1;
  if (timeout >= 0) {
    d3.select("body")
      .selectAll("h2")
      .data([null])
      .join("h2")
      .style("position", "absolute")
      .style("left", "20px")
      .style("font-family", "sans-serif")
      .text(`Simulation start in ${Math.floor(timeout / 100)}`);
  } else {
    d3.select("body").selectAll("h2").data([null]).join("h2").text(" ");
  }
}, 1);
