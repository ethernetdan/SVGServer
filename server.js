var static = require('node-static'),
  mongo = require('mongodb'),
  util = require('util'),
  http = require('http')
  formidable = require('formidable');

var fileServer = new static.Server('./public');
var port = Number(process.env.PORT || 5000);
var mongoUri = process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
      'mongodb://localhost/mydb';

require('http').createServer(function (req, resp) {
  if (req.url == '/save' && req.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      mongo.Db.connect(mongoUri, function (err, db) {
        db.collection('svg', function(er, collection) {
          collection.insert({'fields': fields, 'file':files[0]}, {safe:true}, function (er, rs) {});
        });
      });
    });
      resp.write("This is where JSON GOES");
      resp.end();
  } else if (req.url.indexOf("/load") == 0 && req.method.toLowerCase() == 'get') {
    resp.write("load");
    resp.end();
  } else {
    req.addListener('end', function () {
      fileServer.serve(req, resp);
    }).resume();
  }
}).listen(port);
