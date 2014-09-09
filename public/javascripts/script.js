function dismissAlert(elem){
  elem.innerHTML = '';
  document.getElementById('messages').style.display = 'none';
}

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

  if (elems.length > 0 && viewW > 780){
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

  // SVG Bijou
  var arr = ['.foo', '.boo','.fool','.bool','.cool', '.nool','.doo','.loo', '.too'],
    inc = 1;
    if(document.getElementById('bijou')){      
      godraw();
    }
    if(document.getElementById('bijou-large')){      
      setTimeout(godraw, 1000);
    }
  function godraw () {
    for (var i = arr.length - 1; i >= 0; i--) {
      setTimeout(draw, Math.random()*1000, arr[i], 1);
    }
    setTimeout(undraw, inc * 5000);
  }
  function undraw () {
    for (var i = arr.length - 1; i >= 0; i--) {
      setTimeout(drawNone, Math.random()*1000, arr[i], -1);
    }
    setTimeout(godraw, 3000);
    inc++;
  }
  function drawNone(sl, int){
    var path = document.querySelector(sl),
      bound = path.getBoundingClientRect(),
      length = Math.round(Math.sqrt(Math.pow(bound.height, 2) + Math.pow(bound.width, 2)));
    path.style.strokeDashoffset = length;
  }
  function draw(sl, int){
    var path = document.querySelector(sl),
      bound = path.getBoundingClientRect(),
      length = Math.round(Math.sqrt(Math.pow(bound.height, 2) + Math.pow(bound.width, 2)));
    // Clear any previous transition
    path.style.transition = path.style.WebkitTransition = 'none';
    // Set up the starting positions
    path.style.strokeDasharray = length + ' ' + length;
    path.style.strokeDashoffset = int * length;
    path.style.strokeWidth = 1;
    // Trigger a layout so styles are calculated & the browser
    // picks up the starting position before animating
    path.getBoundingClientRect();
    // Define our transition
    path.style.transition = path.style.WebkitTransition = 'stroke-dashoffset ' + Math.round(0.5 + Math.random() * 2).toString() + 's ease-in-out';
    // Go!
    path.style.strokeDashoffset = '0';
    path.style.stroke = '#666';
    // path.style.stroke = _.randColor();
  }
})(this, this.document);

// In-house
window.jbckmn = window.jbckmn || {};