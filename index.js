import { FlowProbe } from "./flowprobe.js";

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

const svg = d3.select("svg");
const flowProbe = new FlowProbe(svg);


Promise.all([
    d3.json('data/services.json'),
    d3.json('data/source_gateway.json')
])
.then(([grid, sGateway]) => {
    flowProbe.initScales();
    flowProbe.drawSourceGateway(sGateway);
    flowProbe.initLayoutData(grid);
    // flowProbe.initSimulation();
    flowProbe.appendServices();
    flowProbe.startSimulation();
})