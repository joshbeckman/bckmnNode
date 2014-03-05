(function(window,document){
  var svgWidth  = window.innerWidth,
      svgHeight = window.innerHeight,
      i,
      nodes = [],
      color = d3.scale.category20(),
      svg = d3.select("#home-anim-div").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
      force = d3.layout.force()
        .size([svgWidth, svgHeight])
        .nodes(nodes)
        .gravity(0.003)
        .on('tick', tick),
      filter,
      nodeList = svg.selectAll("circle");
    svg.style("opacity", 1e-6)
      .transition()
      .duration(100)
      .style("opacity", 1);
    function tick(e) {
      // Push different nodes in different directions for clustering.
      var k = 6 * e.alpha;
//        nodes.forEach(function(o, i) {
//          o.y += k;
//          o.x += k;
//        });
      nodeList.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
    }
    i=0;
    var funky = function() {
      nodes.push({
          radius: Math.random() * 20 + 5,
          cx: Math.random() * svgWidth,
          cy: Math.random() * svgHeight,
          id: nodes.length.toString()
        });
      force.start();
      filter = svg.append("defs")
        .append("filter")
        .attr("id", "blur-" + (nodes.length - 1).toString())
        .append("feGaussianBlur")
        .attr('stdDeviation', Math.floor(Math.random() * 3));
      nodeList = nodeList.data(nodes);
      nodeList.enter()
        .append("circle")
        .attr('class', 'node')
        .attr("cx", function(d) { return d.cx; })
        .attr("cy", function(d) { return d.cy; })
        .attr("r", 3)
        .attr("fill", 'slategrey')
        .style("stroke", 'slategrey')
        .style("stroke-width", 1)
        .call(force.drag);
      i+=1;
    };
    for(i = 0; i < 100; i++) {
      setTimeout(funky, (i*5));
    }
    setTimeout(function() {
      nodeList.transition()
        .duration(1000)
        .ease('exp-out')
        .attr("r", function(d) { return d.radius; })
        .style('opacity', function(d) { return (5/d.radius); })
        .attr('filter', function(d) { return 'url(#blur-' + d.id +')'; });
    }, 750);
    var gravityInterval = setInterval(function() {
      nodeList.transition()
        .duration(1000)
        .attr("fill", color(i))
        .style("stroke", color(i))
//        .attr("cx", function(d) { return svgWidth * Math.random(); })
//        .attr("cy", function(d) { return d.cy; })
        .attr('filter', function(d) { return 'url(#blur-' + d.id +')'; });
//      force.stop();
//      force.nodes(nodes);
      force.nodes(nodes)
        .gravity(Math.random() * 0.01)
        .start();
      i+=1;
    }, 2000);
    function foobarBalls() {
      clearInterval(gravityInterval);
      setTimeout(function() {
        nodeList.transition()
          .duration(1000)
          .ease('exp-in')
//          .attr('filter', 'none')
          .attr("r",1)
//            .attr('fill', '#333')
//            .style('stroke', '#333')
          .style('opacity', 1)
          .attr('cx', svgWidth/2)
          .attr('cy', svgHeight/2);
//        force.gravity(1);
//        force.resume();
        force.stop();
      }, 1);
      setTimeout(function() {
//        nodeList.attr('filter', 'none');
        nodeList.remove();
      }, 1001); 
    }
  window.addEventListener('click', foobarBalls, false);
})(this, this.document);