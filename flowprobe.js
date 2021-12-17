const BLOCK = 120;


class FlowProbe {

    // dimensions
    width;
    height;
    margin = {left: 140, right: 140, top: 120, bottom: 120};
    gatewayRadius;

    // elements
    svg;
    // plane;
    titles;
    services;
    texts;

    // simulations
    simulationCircles;
    // simulationTexts;

    // scales
    x;
    y;
    inputSourceScale;

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

        // this.plane = this.svg.append('g')
        //     .attr("class", "plane")
        //     .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
    }

    translate(horizontal, hMove, vertical, vMove) {
        return `translate(${this.x(horizontal) + hMove}, ${this.y(vertical) + vMove})`;
    }

    initScales() {
        this.x = d3
            .scaleLinear()
            .domain([0, 2])
            .range([this.margin.left, this.width]);

        this.y = d3
            .scaleLinear()
            .domain([0, 1])
            .range([this.height - this.margin.bottom, this.margin.top]);

        this.gatewayRadius = BLOCK * 1.4
    }

    appendServices() {

        let fp = this;
        this.layoutData.forEach(service => {

            let podsCount = service.children.length;
            let countInRow = 4;

            let meshX = d3.scaleLinear()
                .domain([0, countInRow])
                .range([0, BLOCK]);
            let meshY = d3.scaleLinear()
                .domain([0, podsCount / countInRow])
                .range([0, BLOCK / 2]);

            let pad = BLOCK / 2;

            fp.svg.selectAll('.anchor')
                .data([0,9])
                .append("circle")
                .attr("r", 5)
                .attr("transform", fp.translate(service.x, 0, service.y, pad));

            let groups = fp.svg.selectAll(`#${service.id}`)
                .data([service])
                .enter()
                .append("g")
                .attr("class", "service")
                .attr("id", service.id)
                .attr("transform", fp.translate(service.x, 0, service.y,pad));

            groups.append("circle")
                .attr("class", "service-wrapper")
                .attr("transform", `translate(${pad},${pad})`)
                .attr("r", pad * 1.5);

            let mesh = groups.append("g")
                .attr("class", "service-mesh")
                .attr("transform", `translate(${.2 * pad},${ .6 * pad})`)
                .attr("r", pad * 1.5);

            // let column = index => meshX(index < countInRow ? index : index - countInRow);
            let column = index => meshX(index % countInRow);
            let row = index => meshY(Math.floor(index / countInRow));
            let debug = (d, i) => {
                console.log(d, i, meshX(i));
                return `translate(${column(i)},${row(i)})`;
            }

            mesh
                .selectAll(".pod")
                .data(service.children)
                .enter()
                .filter(d => !d.children)
                .append("circle")
                .attr("r", 10)
                .attr("class", "pod")
                .attr("transform", (d, i) => debug(d, i))
                .style("fill", service.color);
            //
            //
            // groups
            //     .selectAll(".pod")
            //     .data(service.pack(nodes).descendants())
            //     .enter()
            //     .filter(d => !d.children)
            //     .append("circle")
            //     .attr("r", d => d.r)
            //     .attr("class", "pod")
            //     .attr("transform", d => "translate(" + d.x + "," + d.y + ")")
            //     .style("fill", service.color);
        });

        this.svg
            .append("g")
            .attr("class", "service-captions")
            .selectAll("text")
            .data(this.layoutData)
            .join("text")
            .text(d => d.name)
            .attr("fill", d => d.color)
            .attr("class", d => d.id)
            .attr("transform", d => this.translate(d.x, BLOCK * .45, d.y, BLOCK * .55))
            .style("text-anchor", "middle");

        this.svg
            .append("g")
            .attr("class", "service-throughputs")
            .selectAll("text")
            .data(this.layoutData)
            .join("text")
            .text("2.5")
            .attr("fill", d => d.color)
            .attr("class", d => d.id)
            .attr("transform", d => this.translate(d.x, BLOCK * .45, d.y, BLOCK * 1.55))
            .style("text-anchor", "middle");





        //                                                              Service Backgrounds

    }

    initSimulation() {

        // Features of the forces applied to the pods nodes:
        // this.simulationCircles = d3
        //     .forceSimulation()
        //     .force(
        //         "x",
        //         d3
        //             .forceX()
        //             .strength(0.1)
        //             .x((d) => this.x(d.x))
        //     )
        //     .alpha(0.5)
        //     .force(
        //         "y",
        //         d3
        //             .forceY()
        //             .strength(0.1)
        //             .y((d) => this.y(d.y))
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
        // const podIds = Array.from(d3.selectAll(".pod").data()).map((d) => d.id);
        // const orderPods = podIds.filter((d) => d.startsWith("order"));
        // const paymentPods = podIds.filter((d) => d.startsWith("payment"));
        // const receiptPods = podIds.filter((d) => d.startsWith("receipt"));
        // const shippingPods = podIds.filter((d) => d.startsWith("shipping"));

        /**
         * A funtion that simulate traffic flow.
         */
        /*const sim = () => {
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
        };*/

        // let circles = this.services;

        // Start the force simulation
        // const startSim = () => {
        //     this.simulationCircles.nodes(this.layoutData).on("tick", () => {
        //         circles
        //             .attr("cx", (d) => d.x)
        //             .attr("cy", (d) => d.y)
        //             .attr("fill", (d) => Util.getColour(d.category));
        //     });

            // txtSimulation.nodes(textData).on("tick", () => {
            //     texts.attr("cx", (d) => {
            //         d3.selectAll(`.${d.name.toLowerCase()}`)
            //             .attr("x", d.x)
            //             .attr("y", d.y - 60);
            //         return d.x;
            //     });
            // });
        // };
    }

    initLayoutData(layoutData) {

        let data = [];
        layoutData.forEach(d => {
            d.id = d.name.toLowerCase();
            d.service = d.name.toLowerCase();
            d.x = d.center[0];
            d.y = d.center[1];
            d.pack = d3.pack(d.children).size([BLOCK,BLOCK]).padding(4);

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

    drawSourceGateway(gateway) {

        //                                                              Input arcs
        const pie = d3.pie()
            .startAngle(Math.PI * -0.4)
            .endAngle(Math.PI * 0.4)
            .sort(null)
            .value(d => d3.sum(d.children, c => c.current));

        let innerRadius = this.gatewayRadius * .8;
        let outerRadius = this.gatewayRadius * 1.2;

        let arcs = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        let pieData = pie(gateway);
        let pane = this.svg.append("g")
            .attr("id", "gateway")
            .attr("transform", this.translate(1, BLOCK * .5, 1, this.margin.top * .85))
            .attr("stroke", "white");

        //                                                              Pre calculations
        let min = 0, max = 0, total = 0;
        gateway.forEach(platform => {
            let sum = d3.sum(platform.children, c => c.current);
            platform.value = sum;
            total += sum;
            let minChild = d3.min(platform.children, c => c.current);
            if (minChild >= min)
                min = minChild;
            let maxChild = d3.max(platform.children, c => c.current);
            if (maxChild >= max)
                max = maxChild;
        });
        console.log("total: ", total, "min: ", min, "max: ", max);

        let slices = pane
            .selectAll(".arc")
            .data(pieData)
            .enter()
            .append("g")
            .attr("class", "arc");

        slices
            .append("path")
            .attr("d", arcs)
            .attr("fill", d => d.data.color);


        //                                                              Append circles into arcs
        let circlesRadius = this.gatewayRadius;

        let scaleCircles = d3.scaleLinear()
            .domain([min, max])
            .range([circlesRadius * .07, circlesRadius * .17]);

        let inputSources = pane
            .append("g")

            .selectAll("circle")
            .data(d3.merge(pieData.map(arc => {

                let inputSource = arc.data;
                let count = inputSource.children.length;

                let stepAngle = (arc.endAngle - arc.startAngle) / (count + 1);
                console.log(inputSource.name, stepAngle);

                return inputSource.children.map((child, index) => {
                    let anglePad = stepAngle * .3 * index;
                    let step = ++index * stepAngle + anglePad;
                    let angle = arc.startAngle + step;
                    child.point = d3.pointRadial(angle, circlesRadius);
                    return child;
                })
            })))
            .enter();


        // inputSources.append("circle")
        //     .attr("class", "gateway-circle")
        //     .attr("id", d => d.name)
        //     .attr("cx", d => d.point[0])
        //     .attr("cy", d => d.point[1])
        //     .attr("r", d => scaleCircles(d.current))

        inputSources.append("text")
            .attr("id", d => d.name)
            .attr("class", "gateway-icon")
            .attr("x", d => d.point[0])
            .attr("y", d => d.point[1] + scaleCircles(d.current) *.6)
            .attr("style", d => `font-size: ${1.9 * scaleCircles(d.current)}px`)
            .text(d => d.faUnicode);
    }

    //                                                              Input arcs

}

export {FlowProbe};