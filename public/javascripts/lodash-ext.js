(function(window, document, _){
  _.mixin({
    'asyncRequest': asyncRequest,
    'doJSONP': doJSONP,
    'request': request,
    'onResize': on_resize,
    'scrollTo': scrollTo,
    'create': create,
    'onWake': onWake,
    'randColor': getRandomColor,
    'getVendorPrefix': GetVendorPrefix
    });
  function GetVendorPrefix(arrayOfPrefixes) {
 
    var tmp = document.createElement("div");
    var result = "";
     
    for (var i = 0; i < arrayOfPrefixes.length; ++i) {
     
      if (typeof tmp.style[arrayOfPrefixes[i]] != 'undefined'){
        result = arrayOfPrefixes[i];
        break;
      }
      else {
        result = null;
      }
    }
     
    return result;
  }
  function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }
  function onWake(cb, interval){
    var lastTime = (new Date()).getTime();
    setInterval(function() {
      var currentTime = (new Date()).getTime();
      if (currentTime > (lastTime + interval + 2000)) {
        cb();
      }
      lastTime = currentTime;
    }, interval);
  }
  function on_resize(c,t){
    onresize = function(){
      clearTimeout(t);
      t=setTimeout(c,100);
    };
    return c;
  }
  function create(name, props){
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
  }
  function scrollTo(element, to, duration) {
    Math.easeInOutQuad = function (t, b, c, d) {
      t /= d/2;
      if (t < 1) return c/2*t*t + b;
      t--;
      return -c/2 * (t*(t-2) - 1) + b;
    };
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
  }
  function asyncRequest (url, id, fn) {
    window.loCallbacks = window.loCallbacks || {cntr: 0};
    var name = "fn" + window.loCallbacks.cntr++;
    window.loCallbacks[name] = function() {
      delete window.loCallbacks[name];
      var args = [id, arguments[0]];
      fn.apply(this, args);
    };
    _.doJSONP(url, "loCallbacks." + name);
  }
  function doJSONP(url, callbackFuncName, cbName) {
    var fullUrl = url + "&" + (cbName || "callback") + "=" + callbackFuncName,
      script = document.createElement('script');
    script.src = fullUrl;
    document.body.appendChild(script);
  }
  function request(url, cb, method, post, contenttype){
    var requestTimeout,xhr;
    try{ 
      xhr = new XMLHttpRequest(); 
    }catch(e){
      try{ 
        xhr = new ActiveXObject("Msxml2.XMLHTTP"); 
      }catch (error){
        if(console)console.log("_.request: XMLHttpRequest not supported");
        return null;
      }
    }
    requestTimeout = setTimeout(function() {
      xhr.abort(); 
      cb(new Error("_.request: aborted by timeout"), "", xhr); 
    }, 10000);
    xhr.onreadystatechange = function(){
      if (xhr.readyState != 4) return;
      clearTimeout(requestTimeout);
      cb(xhr.status != 200 ? new Error("_.request: server respnse status is " + xhr.status) : false, xhr.responseText, xhr);
    };
    xhr.open(method ? method.toUpperCase() : "GET", url, true);
    if(!post){
      xhr.send();
    }else{
      xhr.setRequestHeader('Content-type', contenttype ? contenttype : 'application/x-www-form-urlencoded');
      xhr.send(post);
    }
  }
})(this, this.document, _);