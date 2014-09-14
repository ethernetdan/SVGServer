var static = require('node-static'),
  mongo = require('mongodb'),
  util = require('util'),
  http = require('http')
  formidable = require('formidable'),
  ObjectID = require('mongodb').ObjectID;

var fileServer = new static.Server('./public');
var port = Number(process.env.PORT || 5000);
var mongoUri = 'mongodb://localhost:27017/mydb';
if (process.env.VCAP_SERVICES) {
  var env = JSON.parse(process.env.VCAP_SERVICES);
  mongoUri = env['mongolab'][0].credentials.uri;
}

require('http').createServer(function (req, resp) {
  if (req.url == '/save' && req.method.toLowerCase() == 'post') {
    var form = new formidable.IncomingForm();

    form.parse(req, function(err, fields, files) {
      mongo.Db.connect(mongoUri, function (err, db) {
        db.collection('svg', function(er, collection) {
            collection.insert({'fields': fields}, {safe:true}, function (er, rs) {
              if (!er) {
                resp.write('http://' + req.headers.host + '/load/' + rs[0]['_id']);
                resp.end();
              } else {
                resp.end(500);
              }
            });
        });
      });
    });
      return;
  } else if (req.url.indexOf("/load") == 0 && req.method.toLowerCase() == 'get') {
    var id = req.url.split('/');
    var data;

    mongo.Db.connect(mongoUri, function (err, db) {
        db.collection('svg', function(er, collection) {
              collection.findOne({_id: new ObjectID(id[2])},  function(er,rs) {
                if (!er) {
                  resp.write(rs.fields.data);
                  resp.end();
                } else {
                  console.log(err + er);
                  resp.end(500);
                }
              });

        });
    });
    return;
  } else {
    req.addListener('end', function () {
      fileServer.serve(req, resp);
    }).resume();
  }
}).listen(port);
