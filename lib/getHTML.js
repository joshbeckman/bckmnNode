var http = require("http"),
  https = require("https"),
  request = require('request'),
  zlib = require('zlib');

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

exports.impersonate = function(url, callback) {

  var headers = {
      "accept-charset" : "ISO-8859-1,utf-8;q=0.7,*;q=0.3",
      "accept-language" : "en-US,en;q=0.8",
      "accept" : "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      "user-agent" : "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_8) AppleWebKit/537.13+ (KHTML, like Gecko) Version/5.1.7 Safari/534.57.2",
      "accept-encoding" : "gzip,deflate",
    },
    options = {
      url: url,
      headers: headers
    },
    req = request.get(options);
 
  req.on('response', function(res) {
    var chunks = [];
    res.on('data', function(chunk) {
      chunks.push(chunk);
    });
 
    res.on('end', function() {
      var buffer = Buffer.concat(chunks);
      var encoding = res.headers['content-encoding'];
      if (encoding == 'gzip') {
        zlib.gunzip(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        });
      } else if (encoding == 'deflate') {
        zlib.inflate(buffer, function(err, decoded) {
          callback(err, decoded && decoded.toString());
        })
      } else {
        callback(null, buffer.toString());
      }
    });
  });
 
  req.on('error', function(err) {
    callback(err);
  });

};