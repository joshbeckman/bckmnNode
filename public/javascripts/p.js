var loadViz = function(dataInput, color){
  loadData(dataInput, numTicks, circleData);
  buildBase();
  setScales(maxVal, vizBody);
  drawBars(dataInput, color);
  addCircleAxes();
};
var allData,
    maxVal,
    minVal,
    tempArray,
    dataInputWeekly = [],
    dataInputMonthly = [],
    daysInYear = 365, 
    monthsInYear = 12, 
    daysInMonth = 30, 
    daysInWeek = 7, 
    weeksInYear = 52,
    hoursInDay = 24,
    minutesInHour = 60,
    secondsInMinute = 60,
    numTicks = 10,
    circleData = [],
    w = window.innerWidth-20,
    h = window.innerHeight-100,
    vizPadding = { top: 5, right: 5, bottom: 5, left: 5 },
    radius,
    divvy = d3.select("#divvy");
var splitData = function(dataInputDaily){
  for (i=0;i<52;i++){
    tempArray = [dataInputDaily[7*i][0], d3.sum(dataInputDaily.slice((7*i), (7*(i+1))), function(d){return parseFloat(d[1])})];
    dataInputWeekly.push(tempArray)
  }
  for (i=0;i<12;i++){
    tempArray = [dataInputDaily[30*i][0], d3.sum(dataInputDaily.slice((30*i), (30*(i+1))), function(d){return parseFloat(d[1])})];
    dataInputMonthly.push(tempArray)
  }
}
var loadData = function(dataInput, numTicks, circleData){
  allData = [].concat.apply([], [dataInput]);
  maxVal = d3.max(allData, function(d){return parseFloat(d[1])});
  minVal = d3.min(allData, function(d){return parseFloat(d[1])});
  for (i=0; i<=numTicks; i++) {
    circleData[i] = (maxVal/numTicks) * i;
  };
};

var buildBase = function(){
  document.getElementById('radial').innerHTML = '';
  viz = d3.select("#radial").append('svg:svg').attr('width', w).attr('height', h);
  viz.append("svg:rect")
    .attr('x', 0)
    .attr('y', 0)
    .attr('height', 0)
    .attr('width', 0)
    .attr('height', 0);
  vizBody = viz.append("svg:g")
    .attr('id', 'body');
};

var setScales = function (maxVal, vizBody) {
  var heightCircleConstraint,
      widthCircleConstraint,
      circleConstraint,
      centerXPos,
      centerYPos,
      radiusLength;
  heightCircleConstraint = h - vizPadding.top - vizPadding.bottom;
  widthCircleConstraint = w - vizPadding.left - vizPadding.right;
  circleConstraint = d3.min([heightCircleConstraint, widthCircleConstraint]);
  radius = d3.scale.linear().domain([0, maxVal])
      .range([0, (circleConstraint / 2)]);
  radiusLength = radius(maxVal);
  centerXPos = widthCircleConstraint / 2 + vizPadding.left;
  centerYPos = heightCircleConstraint / 2 + vizPadding.top;
  vizBody.attr("transform", "translate(" + centerXPos + ", " + centerYPos + ")");
};

var addCircleAxes = function() {
    var circleAxes, i;
    vizBody.selectAll('.circle-ticks').remove();       
    circleAxes = vizBody.selectAll('.circle-ticks')
      .data(circleData)
      .enter().append('svg:g')
      .attr("class", "circle-ticks");

    circleAxes.append("svg:circle")
      .attr("r", function (d, i) { return radius(d); })
      .attr("class", "circle")
      .style("stroke", 'white')
      .style("opacity", 1)
      .style("fill", "none");
};
var drawBars = function(dataSet, color) {
  var groups, bar;
  pie = d3.layout.pie().value(function(d) { return d; }).sort(null);
  d = [];
  for(i = 0; i<dataSet.length; i++) { d.push(1); }

  groups = vizBody.selectAll('.series')
    .data([d]);
  groups.enter().append("svg:g")
    .attr('class', 'series');
    
  groups.exit().remove();
  
  bar = d3.svg.arc()
    .innerRadius( 0 )
    .outerRadius( function(d,i) { return radius( parseFloat(dataSet[i][1]) ); });
    
  arcs = groups.selectAll(".series g.arc")
    .data(pie)
    .enter()
    .append("g")
    .attr("class", "attr");
              
  arcs.append("path")
    .attr("fill", color)
    .transition()
    .delay(function(d, i) { return i * 10; })
    .attr("d", bar)
    .style("opacity", 1)
    .style('stroke', 'none');
  arcs.on('mouseover', function(d,i) {
      d3.select(this).style('stroke', color).style("opacity", 0.5);
      divvy.transition().duration(200).style("opacity", 0.8);
      divvy.html(dataSet[i][1].toString()+' pageviews<br>'+moment(dataSet[i][0].toString(), "YYYYMMDD").format("MMM Do [']YY"))
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY - 28) + "px");
    })
    .on('mouseout', function() {
      divvy.transition().duration(200).style("opacity", 0);
      divvy.html('');
      d3.select(this).style('stroke', 'none').style("opacity", 1);
    })
    .on('click', function(d, i) {
      d3.select(this).style('stroke', color).style("opacity", 0.5);
      divvy.transition().duration(200).style("opacity", 1);
      divvy.html(dataSet[i][1].toString()+' pageviews<br>'+moment(dataSet[i][0].toString(), "YYYYMMDD").format("MMM Do [']YY"))
      .style("left", (d3.event.pageX) + "px")     
      .style("top", (d3.event.pageY - 28) + "px");  
    });
};
var weeklyButton = document.getElementById('weekly-button'), 
  monthlyButton = document.getElementById('monthly-button'),
  dailyButton = document.getElementById('daily-button');
var handleWeeklyButton = function(){
  loadViz(dataInputWeekly,'#3fb3b6');
  weeklyButton.className = 'hidden';
  monthlyButton.className = '';
  dailyButton.className = '';
}
var handleMonthlyButton = function(){
  loadViz(dataInputMonthly,'#85d4d6');
  weeklyButton.className = '';
  monthlyButton.className = 'hidden';
  dailyButton.className = '';
}
var handleDailyButton = function(){
  loadViz(daysOfYear,'#338d8f');
  weeklyButton.className = '';
  monthlyButton.className = '';
  dailyButton.className = 'hidden';
}


