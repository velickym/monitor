// set the dimensions and margins of the graph
const width = 1200;
const height = 600;

const { d3 } = window;

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
  constructor(svg, id) {
    Motion.counter = 0;
    this.id = id;
    Motion.clientList = [];
    Motion.svg = svg;
    Motion.pods = Array.from(Motion.svg.selectAll(".pod"));
  }

  static drawClients() {
    Motion.svg
      .selectAll(".client")
      .data(Motion.clientList)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("fill", getRandomColor())
            .attr("id", (d) => d.id)
            .attr("class", "client")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 6),
        (update) => update.attr("r", "5")
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

  static copyAndMove(clientId, podId) {
    console.log(clientId);

    const node = d3.select(`#${clientId}`).node();
    Motion.spawn(`${clientId}_copy`, {
      x: node.getAttribute("cx"),
      y: node.getAttribute("cy"),
    });
    Motion.move(`${clientId}_copy`, podId);
  }

  static async move(clientId, podId) {
    if (!podId) return;
    const podObj = {};
    Motion.pods
      .map((d) => d.__data__)
      .forEach((d) => {
        podObj[d.id] = { ...d };
      });
    const { x, y } = podObj[podId];

    await d3
      .select(`#${clientId}`)
      .transition()
      .duration(1000)
      .attr("cx", x)
      .attr("cy", y);
    setTimeout(() => {
      return 1;
    }, 1000);
    Motion.counter += 1;
  }
}

// append the svg object to the body of the page
const svg = d3
  .select("body")
  .append("svg")
  .attr("width", width)
  .attr("height", height);

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
      .attr("class", (d) => d.name.toLowerCase())
      .style("text-anchor", "middle");

    const texts = svg
      .append("g")
      .selectAll(".text")
      .data(textData)
      .join("circle")
      .attr("class", "text");

    // Initialize the circle: all located at the center of the svg area
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("r", 10)
      .attr("class", (d) => `circle pod ${d.category}`)
      .on("mouseover", (event, d) => {
        console.log(d);
      });

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
    const startSim = async () => {
      simulation.nodes(data).on("tick", () => {
        node.attr("cx", (d) => d.x).attr("cy", (d) => d.y);
      });

      txtSimulation.nodes(textData).on("tick", () => {
        texts.attr("cx", (d) => {
          d3.selectAll(`.${d.name.toLowerCase()}`)
            .attr("x", d.x)
            .attr("y", d.y - 60);
          return d.x;
        });
      });
      return Array.from(svg.selectAll(".pod"));
    };
    return startSim();
  })
  .then(() => {
    // Start spawning the clients
    const motion = new Motion(svg, "test");
    console.log(motion);
    const podIds = Array.from(d3.selectAll(".pod")).map((d) => d.__data__.id);
    const orderPods = podIds.filter((d) => d.startsWith("order"));
    const paymentPods = podIds.filter((d) => d.startsWith("payment"));
    const receiptPods = podIds.filter((d) => d.startsWith("receipt"));
    const shippingPods = podIds.filter((d) => d.startsWith("shipping"));

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
        );
      }, 1000);

      setTimeout(() => {
        Motion.move(
          clientId,
          paymentPods[Math.floor(Math.random() * paymentPods.length)]
        );
      }, 1000);
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
        );
      }, 5000);
      // const intr = setInterval(function () {
      //   client.spawn(Date.now())
      //   i++
      //   if (i > 10) clearInterval(intr)
      // }, 100)
      // }
    };
    setTimeout(() => {
      sim();
      const intr = setInterval(() => {
        sim();
        if (Motion.counter > 100) {
          clearInterval(intr);
        }
      }, Math.random(1, 20) * 1000);
    }, 4000);
  });

let timeout = 700;
setInterval(() => {
  timeout -= 1;
  if (timeout >= 0) {
    console.log(timeout);
    d3.select("body")
      .selectAll("h2")
      .data([null])
      .join("h2")
      .text(`Simulation start in ${timeout}`);
  }
}, 1);
