import {Util} from "./util.js";

class FlowProbe {

    // dimensions
    width;
    height;
    margin = {left: 40, right: 40, top: 40, bottom: 40};

    // elements
    svg;
    plane;
    titles;
    texts;

    // simulations
    simulationCircles;
    // simulationTexts;

    // scales
    x;
    y;

    // data
    layoutData;
    // textData;

    constructor(svgElement) {
        this.svg = svgElement;
        this.titles = {};

        // main area (excluding margins)
        let width = svgElement.attr("width");
        let height = svgElement.attr("height");
        this.width = width - this.margin.left - this.margin.right;
        this.height = height - this.margin.top - this.margin.bottom;

        console.log(width, height);
        console.log(this.width, this.height);

        this.plane = this.svg.append('g')
            .attr("class", "plane")
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }

    initScales() {
        this.x = d3
            .scaleLinear()
            .domain([1, 3])
            .range([this.margin.left, this.width - this.margin.right]);

        this.y = d3
            .scaleLinear()
            .domain([1, 3])
            .range([this.height - this.margin.bottom, this.margin.top]);
    }

    appendElements() {

        // append the svg object to the body of the page
        // this.svg = d3
        //     .select("body")
        //     .append("svg")
        //     .attr("width", this.width)
        //     .attr("height", this.height);

        //                                                              Service Centers

        let xScale = this.x;
        let yScale = this.y;

        this.layoutData.forEach(group => this.plane
            .append("g")
            .selectAll(".center")
            .data(group.pods)
            .join("circle")
            .attr("r", 5)
            .attr("fill", "red")
            .attr("cx", d => xScale(group.center[0]))
            .attr("cy", d => yScale(group.center[1]))
        );

        //                                                              Service Backgrounds





        //                                                              Pods
        // let pods = this.plane
        //     .append("g")
        //     .selectAll(".pod")
        //     .data(this.layoutData)
        //     .join("circle")
        //     .attr("r", 10)
        //     .attr("class", (d) => `circle pod ${d.service}`);

        // this.simulationCircles
        //     .nodes(this.layoutData)
        //     .on("tick", (h) => pods
        //         .attr("cx", d => x(d.x))
        //         .attr("cy", d => y(d.y))
        //         .attr("fill", d => Util.getColour(d.service))
        //     );

        this.plane
            .selectAll(".client")
            .data(Array.from(Array(1000).keys()))
            .join("circle")
            .attr("class", "client")
            .attr("cx", 0)
            .attr("cy", 0)
            .attr("r", 1)
            .style("fill", "red");

        this.plane
            .selectAll("text")
            .data(this.layoutData)
            .join("text")
            .text((d) => d.name)
            .attr("fill", (d) => Util.getColour(d.name.toLowerCase()))
            .attr("class", (d) => d.name.toLowerCase())
            .attr("transform", d => `translate(${this.x(d.x)}, ${this.y(d.y) + 40})`)
            .style("text-anchor", "middle");

        // this.texts = this.plane
        //     .append("g")
        //     .selectAll(".text")
        //     .data(this.textData)
        //     .join("circle")
        //     .attr("class", "text");
    }

    initSimulation() {

        // Features of the forces applied to the pods nodes:
        this.simulationCircles = d3
            .forceSimulation()
            .force(
                "x",
                d3
                    .forceX()
                    .strength(0.1)
                    .x((d) => this.x(d.x))
            )
            .alpha(0.5)
            .force(
                "y",
                d3
                    .forceY()
                    .strength(0.1)
                    .y((d) => this.y(d.y))
            )
            .force(
                "center",
                d3
                    .forceCenter()
                    .x(this.width / 2)
                    .y(this.height / 2)
            ) // Attraction to the center of the svg area
            .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
            .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)); // Force that avoids circle overlapping

        // Features of the forces applied to the text nodes:
        // this.simulationTexts = d3
        //     .forceSimulation()
        //     .force(
        //         "x",
        //         d3
        //             .forceX()
        //             .strength(0.1)
        //             .x((d) => x(d.group[0]))
        //     )
        //     .force(
        //         "y",
        //         d3
        //             .forceY()
        //             .strength(0.1)
        //             .y((d) => y(d.group[1]))
        //     )
        //     .force(
        //         "center",
        //         d3
        //             .forceCenter()
        //             .x(this.width / 2)
        //             .y(this.height / 2)
        //     ) // Attraction to the center of the svg area
        //     .force("charge", d3.forceManyBody().strength(1)) // Nodes are attracted one each other of value is > 0
        //     .force("collide", d3.forceCollide().strength(1).radius(15).iterations(1)); // Force that avoids circle overlapping
    }

    startSimulation() {

        // eslint-disable-next-line no-unused-vars
        // const motion = new Motion(svg, "test");
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
            }, Math.random()*500);
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
            }, 2000);
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
                    }, 1000);
                });
            }, 4000);
        };

        // Start the force simulation
        // const startSim = () => {
        //     simulation.nodes(data).on("tick", () => {
        //         node
        //             .attr("cx", (d) => d.x)
        //             .attr("cy", (d) => d.y)
        //             .attr("fill", (d) => Util.getColour(d.category));
        //     });
        //
        //     txtSimulation.nodes(textData).on("tick", () => {
        //         texts.attr("cx", (d) => {
        //             d3.selectAll(`.${d.name.toLowerCase()}`)
        //                 .attr("x", d.x)
        //                 .attr("y", d.y - 60);
        //             return d.x;
        //         });
        //     });
        // };
    }

    initLayoutData(layoutData) {

        let data = [];
        layoutData.forEach(d => {
            d.id = d.name.toLowerCase();
            d.service = d.name.toLowerCase();
            d.x = d.center[0];
            d.y = d.center[1];

            // let group = null;
            // switch (d.name.toLowerCase()) {
            //     case "orders":
            //         group = [1, 2];
            //         break;
            //     case "payments":
            //         group = [2, 1];
            //         break;
            //     case "shipping":
            //         group = [2, 3];
            //         break;
            //     case "receipts":
            //         group = [3, 2];
            //         break;
            //     default:
            //         break;
            // }
            // this.titles[d.name] = group;
            // d.pods.forEach((k) => {
            //     data.push({id: k, category: d.name.toLowerCase(), group});
            // });
        });
        this.layoutData = layoutData;
        // this.textData = [
        //     { name: "Orders", group: [1, 2] },
        //     { name: "Payments", group: [2, 1] },
        //     { name: "Shipping", group: [2, 3] },
        //     { name: "Receipts", group: [3, 2] },
        // ];

    }

    drawSkeleton() {

        //                                                              Input arcs
        const pie = d3.pie()
            .startAngle(Math.PI * -0.3)
            .endAngle(Math.PI * 0.3)
            .sort(null)
            .value(20);

        let inputGroups = [
            {
                name: 'mobile',
                sub: ['ios', 'android']
            },
            {
                name: 'desktop',
                sub: ['chrome', 'firefox']
            },
            {
                name: 'retail',
                sub: ['windows', 'raspberrypi']
            }
        ];

        let arcs = d3.arc()
            .innerRadius(400)
            .outerRadius(500)

        let x = this.x;
        let y = this.y;

        this.plane.append("g")
            .attr("transform", `translate(${x(2)}, ${y(1)})`)
            .attr("class", "inputs")
            .attr("stroke", "red")
            .selectAll("path")
            .data(pie(inputGroups))
            .join("path")
            .attr("fill", "yellow")
            .attr("d", arcs)
            .append("title")
            .text(d => d.name);
    }

    //                                                              Input arcs

}

export {FlowProbe};