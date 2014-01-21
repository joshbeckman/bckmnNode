function dismissAlert(elem){elem.innerHTML = '';}
var searchField = document.getElementById('search-field'),
    searchSubmit = document.getElementById('search-submit');
if(searchField){
  if (searchSubmit) {
    searchSubmit.onclick = function(){
      window.location = window.location.origin+'/search?q='+searchField.value;
    };
  }
  searchField.onkeydown = function(ev){
    if(ev.keyCode == 13){
      window.location = window.location.origin+'/search?q='+searchField.value;
    }
  };
}
// Night functions
(function(){
  var nightables = document.getElementsByClassName('day'),
      i = 0,
      length = nightables.length,
      d = new Date(),
      h = d.getHours();
  if (h > 19 || h < 7) {
    for(; i < length; i++) {
      nightables[i].className += ' night';
    }
  }
})();
// Creator function
var create = function(name, props){
  var el = document.createElement(name);
  for (var p in props){
  if(typeof props[p] === 'object'){
  for(var q in props[p]){
  el[p][q] = props[p][q];
  }
  }else{
  el[p] = props[p];
  }
  }
  return el;
};
// Custom ScrollTo
window.scrollTo = function(element, to, duration) {
  var start = element.scrollY,
      change = to - start,
      currentTime = 0,
      increment = 20;

  var animateScroll = function(){
    currentTime += increment;
    var val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scroll(0, val);
    if(currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
};
Math.easeInOutQuad = function (t, b, c, d) {
  t /= d/2;
  if (t < 1) return c/2*t*t + b;
  t--;
  return -c/2 * (t*(t-2) - 1) + b;
};
//Lightbox functions
function openStrip(set){
  document.body.style.background = 'rgba(0,0,0,0.8)';
  classie.add(document.getElementsByTagName('main')[0], 'lightboxed');
  var lb = document.getElementsByClassName('lightbox')[0],
      lbHeight = 560;
  lb.style.height = lbHeight.toString()+'px';
  scrollTo(window, lbHeight-(window.innerHeight - document.getElementById('content').clientHeight), 1250);
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
    var li = create('li',{});
    if(imageSet[i].src){
      li.appendChild(
        create('img',{
          className: 'gallery-image',
          src: imageSrc+imageSet[i].src,
          alt: imageSet[i].alt,
          onload: callback,
          title: imageSet[i].alt
        })
      );
    }else{
      li.appendChild(
        create('p',{
          className: 'gallery-image lead',
          onload: callback,
          innerText: imageSet[i].text
        })
      );
    }
    gal.appendChild(li);
  }
}
// Menu Control functions
(function(){
  var menuRight = document.getElementById( 'cbp-spmenu-right' ),
      menuTogglers = document.getElementsByClassName( 'menu-toggle-button' ),
      menuButton = document.getElementById( 'main-menu-button' ),
      menuTimeout,
      menuToggle = function() {
        for(i=0;i<menuTogglers.length;i++){
          classie.toggle( menuTogglers[i], 'active' );
        }
        classie.toggle( menuRight, 'cbp-spmenu-open' );
        if(menuButton){classie.toggle( menuButton, 'menu-open' );}
      };
  if(menuButton){
    menuRight.onmouseout = function () {
      menuTimeout = window.setTimeout(menuToggle, 500);
    };
    menuRight.onmouseover = function(){
      window.clearTimeout(menuTimeout);
    };
    menuButton.onclick = function(){
      menuToggle();
    };
  }
  function makeToggleClickFxn() {
    return function() {
      menuToggle();
    };
  }
  for(i=0;i<menuTogglers.length;i++){
    menuTogglers[i].onclick = makeToggleClickFxn();
  }
})();
// In-house
window.jshBckmn = window.jshBckmn || {};
window.jshBckmn.setRandomThought = function(elem){
    elem.textContent = (jshBckmn.thoughts[Math.floor(Math.random() * jshBckmn.thoughts.length)] + '.');
    elem.style.opacity = '0.9';
  };
(function(window, document){
  var dates = document.getElementsByClassName('post-date'),
      titles = document.getElementsByClassName('blog-post-title');
  if (dates.length > 0 && titles.length > 0){
    titles[0].onmouseover = function(){
      classie.add(dates[0], 'date-fadeIn');
    };
    titles[0].onmouseout = function(){
      classie.remove(dates[0], 'date-fadeIn');
    };
  }
})(this, this.document);
if (document.getElementById('thoughtBubble')) {
  setTimeout(jshBckmn.setRandomThought, 1000, document.getElementById('thoughtBubble'));
  setInterval(function(){
    document.getElementById('thoughtBubble').style.opacity = '0';
    setTimeout(jshBckmn.setRandomThought, 1000, document.getElementById('thoughtBubble'));
  },10000);
}
// Detect resize
function on_resize(c,t){
  onresize = function(){
    clearTimeout(t);
    t=setTimeout(c,100);
  };
  return c;
}
// Post image functions
(function(window, document) {
  var postImg = document.getElementById('full-image'),
    imgHolder = document.getElementById('post-image-holder'),
    scrollPosts = document.getElementsByClassName('scroll-post'),
    i = 0;
  if (postImg) {
    on_resize(function(){
      resizeOnLoad(postImg);
    })();
    imgHolder.onload = function () {
      postImg.style.backgroundImage = "url(" + this.src + ")";
      resizeOnLoad(postImg);
    };
    postImg.onmouseover = function() {
      i = 0;
      for(; i < scrollPosts.length; i++) {
        scrollPosts[i].style.opacity = '1';
      }
    };
    for(; i < scrollPosts.length; i++) {
      scrollPosts[i].onclick = makeScrollToPost();
    }
  }
  function makeScrollToPost () {
    return function() {
      scrollTo(window, document.getElementById('content').offsetTop, 1000);
      this.style.opacity = '0';
      postImg.onmouseover = null;
    };
  }
  function resizeOnLoad (elem) {
    var img = document.getElementById('post-image-holder'),
      fraction = img.height/img.width,
      percent = fraction * 100;
    if(window.innerHeight < (window.innerWidth * fraction)) {
      elem.style.height = '100vh';
      elem.style.paddingBottom = null;
    } else {
      elem.style.height = null;
      elem.style.paddingBottom = percent.toString() + '%';
    }
  }
})(this, this.document);
// Pixelated images
(function (window, document) {
      var canvases = document.getElementsByClassName('blog-image-canvas'),
      ctx, img, isPlaying = false,
      vMin = 5,
      vMax = 100,
      v = vMin,
      vv = 3,
      dv = vv;
      for (var i = canvases.length - 1; i >= 0; i--) {
        ctx = canvases[i].getContext('2d');
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        img = new Image();
        img.onload = makeImgListener(ctx, canvases[i], img);
        img.src = canvases[i].dataset.imageSrc;
      }
      function makeImgListener (ctx, canvas, img) {
        var ctxt = ctx;
        return function() {
          // canvas.height = 200;
          // canvas.width = (img.width/img.height) * 200;
          // canvas.addEventListener('mouseover', function(evt, ctxt, img){mouseoverHandler(ctxt, img)}, false);
          // canvas.addEventListener('mouseout', function(evt, ctxt, img){mouseoutHandler(ctxt, img)}, false);
          pixelate(ctxt, img, canvas);
        };
      }
      function pixelate(ctx, img, canvas) {
        var size = v ? v * 0.01 : 1,
            w = canvas.width * size,
            h = canvas.height * size;
        ctx.drawImage(img, 0, 0, w, h);
        ctx.drawImage(canvas, 0, 0, w, h, 0, 0, canvas.width, canvas.height);
      }
      function anim(ctx, img, canvas) {
        console.log('There there.');
        /// increase/decrese with delta set by mouse over/out
        v += dv;
        /// if we are outside min/max end animation
        if (v >= vMax || v <= vMin) {
          isPlaying = false;
          return;
        } else {
          /// pixelate based on current value and loop
          pixelate(ctx, img, canvas);
          requestAnimationFrame(anim);
        }
      }
      /// set reverse delta and restart anim if finished
      function mouseoverHandler(ctx, img) {
        dv = vv;
        if (isPlaying === false) {
          isPlaying = true;
          anim(ctx, img, this);
        }
      }
      /// set delta and restart anim if finished
      function mouseoutHandler(ctx, img) {
        dv = -vv;
        if (isPlaying === false) {
          isPlaying = true;
          anim(ctx, img, this);
        }
      }
      window.requestAnimationFrame = (function () {
        return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || function (callback) {
          window.setTimeout(callback, 1000 / 60);
        };
      })();
    })(this, this.document);