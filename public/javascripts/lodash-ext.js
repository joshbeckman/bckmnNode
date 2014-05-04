(function(window, document, _){
  _.mixin({
    'asyncRequest': asyncRequest,
    'doJSONP': doJSONP,
    'request': request
    });
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