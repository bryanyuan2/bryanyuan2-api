/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: elasticsearch as middleware for bryanyuan2.github.io
*/
var _ = require("lodash"),
    Promise = require('promise'),
    MongoClient = require('mongodb').MongoClient;

var config = require('./../../env.json')[process.env.NODE_ENV || 'development'],
    mongodbConf = {
        host: process.env.MONGODB_HOST,
        port: process.env.MONGODB_PORT,
        db: process.env.MONGODB_DB,
        collection: process.env.MONGODB_COLLECTION_BRYANYUAN2
    },
    searchModel = {};

/* elasticsearch */
var searchMediaQuery = function(conf) {
    return new Promise(function (resolve, reject) {
        var output = conf.res;
        var query = conf.query;
        var url = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db;
        MongoClient.connect(url, function(err, db) {
            if(err) {
              throw err;
            }
            // query
            db.collection(mongodbConf.collection).find({
              "$or": [{
                  title: new RegExp(query, 'i')
              }, {
                  description: new RegExp(query, 'i')
              }]
            }).limit(10).toArray(function (err, result) {
              if (err) {
                console.log(err);
                output.send({ 'result': 'error' });
              } else if (result.length) {
                console.log('result', result);
                output.send(result);
              } else {
                console.log('No document(s) found with defined "find" criteria!');
                output.send({ 'result': '0' });
              }
              db.close();
            });
        });
    });
}

/* mongodb */
var logSearchQueryDB = function(result) {
    return new Promise(function (resolve, reject) {
      var url = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db;
      MongoClient.connect(url, function(err, db) {
          if(err) {
            throw err;
          }
          // console.log("req.headers", result.conf.req.headers);
          db.collection(mongodbConf.collection).insertOne({
            "query": result.conf.query,
            "timestamp": Date.now()
          }, function(err, done) {
              db.close();
              var json = JSON.parse(result.hits);
              output.send(json);
              resolve();
          });
      });
    });
}

/*
  index: bryanyuan2
  type: media
*/
searchModel.getSearchResult = function(req, res) {
    var conf = {
        query: req.params.id || 'yahoo',
        req: req,
        res: res
    };

    //searchMediaQuery(conf).then(logSearchQueryDB);
    searchMediaQuery(conf);
};


module.exports = searchModel;
