function dismissAlert(elem){
  elem.innerHTML = '';
  document.getElementById('messages').style.display = 'none';
}

// Set middle-ground, colors
(function(window, document){
  var bh = document.body.clientHeight,
    wh = window.innerHeight,
    oh = Math.round(wh - bh)/2,
    ph = Math.round(wh/6),
    colored = document.getElementsByClassName('color-me'),
    topLinks = document.getElementsByClassName('top-links');
  setInterval(colorUs, 3000);
  setTimeout(underlineUs, 1000);

  function underlineUs(){
    for (var i = topLinks.length - 1; i >= 0; i--) {
      topLinks[i].className += ' active';
    }
  }
  function colorUs(){
    for (var i = colored.length - 1; i >= 0; i--) {
      colored[i].style.color = _.randColor();
    }
  }
})(this, this.document);

// Init activators
(function(window, document){
  var revealers = document.getElementsByClassName('activator'),
    length = revealers.length,
    i = 0;
  function makeRevealer() {
    var elems = document.getElementsByClassName(this.dataset.activate),
      deacts = document.getElementsByClassName(this.dataset.deactivate);
    for (var i = 0; i < elems.length; i++) {
      classie.toggle(elems[i], 'active');
    }
    for (i = 0; i < deacts.length; i++) {
      classie.toggle(deacts[i], 'active');
    }
  }
  for (; i < length; i++) {
    revealers[i].addEventListener('click', makeRevealer, false);
  }
})(this, this.document);

//Lightbox functions
(function(window,document){
  var links = document.getElementsByClassName('openstrip'),
      i = 0,
      showImages = document.getElementsByClassName('showImages');
  for(i = 0; i< links.length; i++) {
    links[i].addEventListener('click', openStrip, false);
  }
  for(i = 0; i< showImages.length; i++){
    showImages[i].addEventListener('click', showImagesFunc, false);
  }
  function showImagesFunc(evt){
    document.getElementById('menu-stories').style.display = 'inherit';
  }
  function openStrip(evt, tempSet){
    var set = tempSet;
    if (!tempSet) {
      set = this.dataset.openStrip;
    }
    document.body.style.background = 'rgba(0,0,0,0.8)';
    classie.add(document.getElementsByTagName('main')[0], 'lightboxed');
    var lb = document.getElementsByClassName('lightbox')[0],
        lbHeight = 560;
    lb.style.display = 'inherit';
    lb.style.height = lbHeight.toString()+'px';
    if (document.getElementById('content')) {
      _.scrollTo(window, lbHeight-(window.innerHeight - document.getElementById('content').clientHeight), 1250);
    } else {
      _.scrollTo(window, lbHeight-(window.innerHeight - document.getElementsByClassName('home-list')[0].clientHeight), 1250);
    }
    loadImages(imageSrc, document.getElementById('strip'), images[set], function(){
      var imgs = document.getElementsByClassName('gallery-image'),
          indMargin = 3.5,
          totalWidth = 0;
      if(imgs.length == images[set].length){
        for(i=0;i<imgs.length;i++){
          totalWidth += imgs[i].offsetWidth+(indMargin*2);
        }
        if (totalWidth < window.innerWidth){
          totalWidth = window.innerWidth;
        } else {
          totalWidth = totalWidth;
        }
        document.getElementsByClassName('gallery')[0].style.width = totalWidth.toString()+'px';
      }
    });
  }
  function loadImages(imageSrc, gal, imageSet, callback){
    gal.innerHTML = '';
    for(i=0;i<imageSet.length;i++){
      var li = _.create('li',{});
      if(imageSet[i].src){
        li.appendChild(
          _.create('img',{
            className: 'gallery-image',
            src: imageSrc+imageSet[i].src,
            alt: imageSet[i].alt,
            onload: callback,
            title: imageSet[i].alt
          })
        );
      }else{
        li.appendChild(
          _.create('p',{
            className: 'gallery-image lead',
            onload: callback,
            innerText: imageSet[i].text
          })
        );
      }
      gal.appendChild(li);
    }
  }
})(this, this.document);

if (window.d3 !== undefined){
  (function(window, document){
    var svgWidth = 320,
      svgHeight = 320,
      i,
      nodes = [],
      svg = d3.select(".a-project.stark").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
      line = d3.svg.line()
        .x(function(d) { return d.x0; })
        .y(function(d) { return d.y0; })
        .interpolate('basis'),
      lineRand = d3.svg.line()
        .x(function(d,i) { return svgWidth * Math.random(); })
        .y(function(d,i) { return svgHeight * Math.random(); })
        .interpolate('basis'),
      linea = d3.svg.line()
        .x(function(d) { return d.x; })
        .y(function(d) { return d.y; })
        .interpolate('basis'),
      linem = d3.svg.line()
        .x(function(d) { return d.x1; })
        .y(function(d) { return d.y1; })
        .interpolate('basis');

    for ( i = 0; i < 33; i++) {
      nodes.push([[
        {
          x0: i % 2 ? 1 : (svgHeight - 1),
          y0: svgHeight,
          x1: (10 * i) - 100,
          y1: svgHeight,
          x: 10 * i,
          y: svgHeight,
          color: Math.random() > 0.5 ? "#F80F40" : "#24B1E0"
        },
        {
          x0: i % 2 ? 1 : (svgHeight - 1),
          y0: 0,
          x1: (10 * i) - 100,
          y1: (Math.random() * svgHeight),
          x: 10 * i,
          y: (Math.random() * svgHeight)
        }
      ]]);
      drawLine(i);
    }

    setTimeout(moveLines, 1000);

    function moveLines(){
      d3.selectAll(".stick")
        .transition()
        .duration(1000)
        .ease('linear')
        .attr("transform", "translate(-10,0)");
      setTimeout(shiftLines, 1000);
    }

    function shiftLines(){
      d3.selectAll(".stick").remove();
      var fst = nodes.shift();
      nodes.push(fst);
      // console.log(nodes[0][0][0].x);
      for (var i = 0; i < nodes.length; i++) {
        nodes[i][0][0].x = nodes[i][0][1].x = i * 10;
        drawLine(i);
      }
      moveLines();
      window.d3.timer.flush(); // avoid memory leak when in background tab
    }

    function drawLine(index){
      svg.append("path")
        .data(nodes[index])
        .attr("d", linea)
        .attr("class", "stick")
        .attr("fill", 'none')
        .style("stroke", function(d){ return nodes[index][0][0].color;})
        .style("stroke-width", function(d,i){ return 1; });
    }
  })(this, this.document);

  (function(window, document){
    var svgWidth = 320,
      svgHeight = 320,
      i,
      nodes = d3.range(20).map(function(i) {
        return {
          index: i,
          radius: Math.random() * 20 + 5,
          sx: Math.random() * svgWidth,
          sy: Math.random() * svgHeight,
          id: i,
          deg: 1,
          depth: i % 4,
          color: Math.random() > 0.5 ? "#35387F" : "#FF0C31"
        };
      }),
      svg = d3.select(".a-project.unfavoriter").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
      nodeList = svg.selectAll(".starred"),
      theSet = svg.selectAll(".starred")
        .data(nodes)
        .enter().append("svg:polygon")
          .attr("class", "starred")
          .attr("cx", function(d) { return d.sx; })
          .attr("cy", function(d) { return d.sy; })
          .attr("points", function(d,i) { 
            return calculateStarPoints(d.sx, d.sy, 5, d.radius, d.radius/2.5, (i & 1) ? d.deg : -d.deg); 
          })
          .style("fill", function(d,i) { return d.color; })
          .style("stroke", function(d,i) { return d.color; })
          .style('opacity', function(d) { return (10/d.radius); });

    setTimeout(twinkle, 1000);

    function twinkle(){
      var nodes = svg.selectAll(".starred").filter(function(d, i) { return Math.random() > 0.5; });
      nodes.transition()
        .duration(1000)
        .ease('exp-in')
        .attr("class", "starred twinkling")
        .attr('points', function(d,i) { return calculateStarPoints(d.sx + (Math.random() * 20 * (i % 2 ? 1 : -1)), d.sy + (Math.random() * 20 * (i % 2 ? 1 : -1)), 5, 0, 0, 360); })
        .style('opacity', 0);
      setTimeout(twinklOut, 1000);
    }
    function twinklOut(){
      svg.selectAll(".starred.twinkling").transition()
        .duration(1000)
        .ease('exp-out')
        .attr("class", "starred")
        .attr('points', function(d,i) { return calculateStarPoints(d.sx - (Math.random() * 20 * (i % 2 ? 1 : -1)), d.sy - (Math.random() * 20 * (i % 2 ? 1 : -1)), 5, d.radius, d.radius/2.5, d.deg); })
        .style('opacity', function(d) { return (10/d.radius); });
      window.d3.timer.flush(); // avoid memory leak when in background tab
      setTimeout(twinkle, 1000);
    }
    function calculateStarPoints(centerX, centerY, arms, outerRadius, innerRadius, rotate){
      var results = "";
      rotate = rotate || 0;
      var angle = Math.PI / arms;
      for (var i = 0; i < 2 * arms; i++) {
        // Use outer or inner radius depending on what iteration we are in.
        var r = (i & 1) === 0 ? outerRadius : innerRadius;
        var currX = centerX + Math.cos((i * angle) + rotate * 1) * r;
        var currY = centerY + Math.sin((i * angle) + rotate * 1) * r;
        // Our first time we simply append the coordinates, subsequet times
        // we append a ", " to distinguish each coordinate pair.
        if (i === 0) {
           results = currX + "," + currY;
        } else {
           results += ", " + currX + "," + currY;
        }
      }
      return results;
    }
  })(this, this.document);

  (function(window, document){
    var svgWidth = 320,
      svgHeight = 320,
      i,
      nodes = d3.range(1).map(function(i) {
        return {
          index: i,
          radius: Math.random() * 20 + 5,
          sx: Math.random() * svgWidth,
          sy: Math.random() * svgHeight
        };
      }),
      svg = d3.select(".a-project.gatrackjs").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
      theSet = svg.selectAll(".ringed")
        .data(nodes)
        .enter().append("circle")
          .attr('class', 'ringed')
          .attr("cx", function(d) { return Math.random() * svgWidth; })
          .attr("cy", function(d) { return Math.random() * svgHeight; })
          .attr("r", 0)
          .attr("fill", 'none')
          .style("stroke", _.randColor())
          .style("stroke-width", 1);

    setTimeout(ripple, 1000);

    function ripple(){
      svg.selectAll('.ringed')
        .attr("cx", function(d) { return Math.random() * svgWidth; })
        .attr("cy", function(d) { return Math.random() * svgHeight; })
        .attr("r", 0)
        .style("stroke-width", 1)
        .style('opacity', 1);
      svg.selectAll('.ringed')
        .transition()
        .duration(900)
        .ease('exp-out')
        .attr("r", 30)
        .attr("fill", _.randColor())
        .style("stroke", '#aaa')
        .style("stroke-width", 3)
        .style('opacity', 0);
      window.d3.timer.flush(); // avoid memory leak when in background tab
      setTimeout(ripple, 1000);
    }

  })(this, this.document);

  (function(window, document){
    var svgWidth = 320,
      svgHeight = 320,
      i,
      nodes = [],
      svg = d3.select(".a-project.naked-wordpress").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
      line = d3.svg.line()
        .x(function(d) { return d.x0; })
        .y(function(d) { return d.y0; })
        .interpolate('basis'),
      lineW = d3.svg.line()
        .x(function(d) { return d.x1; })
        .y(function(d) { return d.y1; })
        .interpolate('basis');

    for ( i = 0; i < 10; i++) {
      nodes.push([[
        {
          x0: 50,
          y0: (((i % 10) || 0) * 15) + 85,
          x1: (((i % 4) || 0) * 70) + 55,
          y1: 0
        },
        {
          x0: 270,
          y0: (((i % 10) || 0) * 15) + 85,
          x1: (((i % 4) || 0) * 70) + 55,
          y1: 400
        }
      ]]);
      drawLine(i);
    }

    setTimeout(moveLines, 1000);

    function moveLines(){
      d3.selectAll(".naked-wp")
        .transition()
        .duration(2000)
        .attr("d", lineW)
        .style("stroke-width", 1)
        .style("stroke", '#ddd');
      setTimeout(shiftLines, 2500);
    }

    function shiftLines(){
      d3.selectAll(".naked-wp")
        .transition()
        .duration(1000)
        .attr("d", line)
        .style("stroke-width", 3)
        .style("stroke", '#aaa');
      setTimeout(moveLines, 2500);
      window.d3.timer.flush(); // avoid memory leak when in background tab
    }

    function drawLine(index){
      svg.append("path")
        .data(nodes[index])
        .attr("d", line)
        .attr("class", "naked-wp")
        .attr("fill", 'none')
        .style("stroke", '#aaa')
        .style("stroke-width", 3);
    }
  })(this, this.document);

  (function(window, document){
    var svgWidth = 320,
      svgHeight = 320,
      i,
      nodes = d3.range(12).map(function(i) {
        return {
          index: i,
          cx: ((i % 4 || 0) * 50) + 60,
          cy: (((Math.floor(i/4) % 3) || 0) * 50) + 85
        };
      }),
      svg = d3.select(".a-project.aislin").append("svg")
        .attr("width", svgWidth)
        .attr("height", svgHeight),
      theSet = svg.selectAll(".bordered")
        .data(nodes)
        .enter().append("rect")
          .attr('class', 'bordered')
          .attr("x", function(d) { return d.cx; })
          .attr("y", function(d) { return d.cy; })
          .attr("width", 50)
          .attr("height", 50)
          .attr("fill", _.randColor())
          .style("stroke", '#ffffff')
          .style("stroke-width", 0);

    setTimeout(split, 1000);

    function split(){
      svg.selectAll('.bordered')
        .transition()
        .duration(900)
        .attr("fill", function(d) { return _.randColor(); })
        .style("stroke-width", 10);
      setTimeout(rearrage, 1000);
    }
    function rearrage(){
      svg.selectAll('.bordered')
        .transition()
        .duration(900)
        .ease('exp-out')
        .attr("rx", 25)
        .attr("ry", 25)
        .attr("x", function(d,i) { return Math.random() * svgWidth; })
        .attr("y", function(d,i) { return Math.random() * svgHeight; })
        .style("stroke-width", 0);
      setTimeout(returnTo, 1000);
    }
    function returnTo(){
      svg.selectAll('.bordered')
        .transition()
        .duration(900)
        .ease('exp-in')
        .attr("rx", 0)
        .attr("ry", 0)
        .attr("x", function(d,i) { return d.cx; })
        .attr("y", function(d,i) { return d.cy; })
        .attr("fill", _.randColor() );
      window.d3.timer.flush(); // avoid memory leak when in background tab
      setTimeout(split, 1000);
    }
  })(this, this.document);
}

(function(window, document){
  var elems = document.getElementsByClassName('building-block'),
  whole = document.body.scrollHeight,
  past = window.scrollY,
  perc = 0,
  old = window.scrollY,
  i = 0,
  dataset = {},
  viewH = window.innerHeight,
  viewW = window.innerWidth,
  supportsTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints,
  transformPrefix = _.getVendorPrefix(["transform", "msTransform", "mozTransform", "webkitTransform", "oTransform"]);

  if (elems.length > 0 && viewW > 800){
    setTimeout(buildPage, 30);
    var scrollIntervalID = setInterval(runPage, 10);
  }

  function runPage(){
    old = past;
    past = window.scrollY;
    perc = past/(document.body.scrollHeight - viewH);
    if (old != past && perc < 1) {
      window.requestAnimationFrame(function() {
        updatePage();
      });
    } else if (old != past && perc >= 1) {
      window.requestAnimationFrame(function() {
        finalizePage();
      });
    }
  }
  function buildPage(){
    var rotator;
    for (i = elems.length - 1; i >= 0; i--) {
      elems[i].style.zIndex = elems[i].dataset.zIndex || null;
      elems[i].style.top = elems[i].dataset.origTop = ((Math.random() * viewH) - viewH).toFixed() + 'px';
      elems[i].style.left = elems[i].dataset.origLeft = (Math.random() * viewW).toFixed() + 'px';
      elems[i].style.height = elems[i].dataset.origHeight = (viewH+viewW).toFixed() + 'px';
      elems[i].style.opacity = '0.2';
      rotator = (Math.random() * 360).toFixed();
      elems[i].dataset.origRotate = rotator;
      elems[i].style[transformPrefix] = 'rotate(' + rotator + 'deg)';
    }
    if (viewH >= document.body.scrollHeight){
      setTimeout(finalizePage, 2000);
    }
  }
  function updatePage(){
    for (i = elems.length - 1; i >= 0; i--) {
      dataset = elems[i].dataset;
      elems[i].style.top = (parseInt(dataset.origTop,10) + ((parseInt(dataset.top,10) - parseInt(dataset.origTop,10)) * perc)).toFixed() + 'px';
      elems[i].style.left = (parseInt(dataset.origLeft,10) + ((parseInt(dataset.left,10) - parseInt(dataset.origLeft,10)) * perc)).toFixed() + 'px';
      elems[i].style.height = (parseInt(dataset.origHeight,10) + ((parseInt(dataset.height,10) - parseInt(dataset.origHeight,10)) * perc)).toFixed() + 'px';
      elems[i].style.opacity = ((Math.round(100 * perc) / 100) + 0.2).toString();
      elems[i].style[transformPrefix] = 'rotate(' + (parseInt(dataset.origRotate,10) + ((parseInt(dataset.rotate,10) - parseInt(dataset.origRotate,10)) * perc)).toFixed() + 'deg)';
    }
    document.getElementById('building-blocks').style.zIndex = null;
    document.getElementById('building-blocks').className = 'pure-hidden-phone';
  }
  function finalizePage(){
    for (i = elems.length - 1; i >= 0; i--) {
      dataset = elems[i].dataset;
      elems[i].style.top = (parseInt(dataset.top,10)).toFixed() + 'px';
      elems[i].style.left = (parseInt(dataset.left,10)).toFixed() + 'px';
      elems[i].style.height = (parseInt(dataset.height,10)).toFixed() + 'px';
      elems[i].style.opacity = 1;
      elems[i].style[transformPrefix] = 'rotate(' + (parseInt(dataset.rotate,10)).toFixed() + 'deg)';
    }
    document.getElementById('building-blocks').style.display = 'block';
    document.getElementById('building-blocks').style.zIndex = 1;
    document.getElementById('building-blocks').className = 'pure-hidden-phone turned-fast';
  }
})(this, this.document);

// In-house
window.jbckmn = window.jbckmn || {};