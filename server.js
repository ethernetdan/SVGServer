var static = require('node-static');

var fileServer = new static.Server('./public');
var port = Number(process.env.PORT || 5000);

require('http').createServer(function (req, resp) {
  if (req.url.indexOf("/load") == 0 || req.url.indexOf("/save") == 0) {
    resp.write("This is where JSON GOES");
    resp.end();
  } else {
    req.addListener('end', function () {
      fileServer.serve(req, resp);
    }).resume();
  }
}).listen(port);
