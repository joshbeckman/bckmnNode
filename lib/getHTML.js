var http = require("http"),
  https = require("https"),
  request = require('request');

/**
 * getHTML:  REST get request returning straight HTML
 * @param options: http options object
 * @param callback: callback to pass the resulting HTML back upon
 */
exports.getHTML = function(options, onResult) {
  // console.log("rest::getHTML");

  var prot = options.port == 443 ? https : http;
  var req = prot.request(options, function(res) {
    var output = '';
    console.log(options.host + ':' + res.statusCode);
    res.setEncoding('utf8');

    res.on('data', function (chunk) {
      output += chunk;
    });

    res.on('end', function() {
      // console.log(output);
      onResult(res.statusCode, output);
    });
  });

  req.on('error', function(err) {
    console.log('error: ' + err.message);
  });

  req.end();
};