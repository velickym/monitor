let dimensions = {
  height: document.body.clientHeight,
  width: document.body.clientWidth
}

const svg = d3.select('body').append("svg").attr("viewBox", `50 50 ${dimensions.width + 100} ${dimensions.height + 100}`);

d3.json('./data.json', data => {
  // const data = {}
  // _data.forEach(o => {
  //   Object.defineProperty(o, "children",
  //     Object.getOwnPropertyDescriptor(o, "pods"));
  //   delete o["pods"];
  // })

  // _data.forEach(d => {
  //   data[d.name] = { ...d }
  // })

  // const root = d3.hierarchy(data)
  // console.log(root.count())

  // console.log(nodeData)
  // const linkData = root.links()
  // console.log(linkData)
  // console.log(root)



  const simulation = d3.forceSimulation(data)
    .alpha(0.000001)
    .force('collide', d3.forceCollide(height / 2 < width / 2 ? height / 2 : width / 3))
    .force('center', d3.forceCenter(width / 2, height / 2))
    // .force('charge', forceManyBody().strength(0))
    .on("tick", () => {
      // Force
      console.log("ticking")

      // Render links
      svg.selectAll('.link')
        .data(linkData)
        .join('line')
        .attr('class', 'link')
        .attr('stroke', 'black')
        .attr('fill', 'none')
        .attr('x1', d => d.source.x)
        .attr('x2', d => d.target.x)
        .attr('y1', d => d.source.y)
        .attr('y2', d => d.target.y)


      svg.selectAll('.node')
        .data(data)
        .join('circle')
        .attr('class', 'node')
        .attr('fill', 'steelblue')
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .attr('r', 10)
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
    });
  // const simulation = d3.forceSimulation(nodeData)
  //   .alpha(0.000001)
  //   .force('collide', d3.forceCollide(height / 2 < width / 2 ? height / 2 : width / 3))
  //   .force('center', d3.forceCenter(width / 2, height / 2))
  // .force('charge', forceManyBody().strength(0))
})
