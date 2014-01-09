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
function scrollTo(element, to, duration) {
  var start = element.scrollTop,
      change = to - start,
      currentTime = 0,
      increment = 20;

  var animateScroll = function(){
    currentTime += increment;
    var val = Math.easeInOutQuad(currentTime, start, change, duration);
    element.scrollTop = val;
    if(currentTime < duration) {
      setTimeout(animateScroll, increment);
    }
  };
  animateScroll();
}
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
  scrollTo(document.body, lbHeight-(window.innerHeight - document.getElementById('content').clientHeight), 1250);
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
window.jshBckmn.fadeDate = function(){
  var d = document.getElementsByClassName('post-date')[0],
      t = document.getElementsByClassName('blog-post-title')[0];
  t.onmouseover = function(){
    classie.add(d, 'date-fadeIn');
  };
  t.onmouseout = function(){
    classie.remove(d, 'date-fadeIn');
  };
};
if (document.getElementById('thoughtBubble')) {
  setTimeout(jshBckmn.setRandomThought, 1000, document.getElementById('thoughtBubble'));
  setInterval(function(){
    document.getElementById('thoughtBubble').style.opacity = '0';
    setTimeout(jshBckmn.setRandomThought, 1000, document.getElementById('thoughtBubble'));
  },10000);
}
