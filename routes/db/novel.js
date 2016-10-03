/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: novel api
*/
var _ = require("lodash"),
    Promise = require('promise'),
    fs = require('fs'),
    MongoClient = require('mongodb').MongoClient,
    config = require('./../../env.json')[process.env.NODE_ENV || 'development'];

/* mongodb */
var url = 'mongodb://localhost:27017/bryanyuan2';
var novelModel = {};

var searchMediaQuery = function(conf) {
    return new Promise(function (resolve, reject) {
        console.log("query: ", conf.query);
        client.search({
          index: conf.index,
          type: conf.type,
          q: escape(conf.query),
          size: conf.limit
        }).then(function (body) {
          var hits = body.hits.hits;
          resolve(hits);
        }, function (error) {
          console.trace(error.message);
        });
    });
}

novelModel.getActorRelation = function(req, res) {
    var output = res;
    var charName = req.params.gid;
    //connect mongodb
    MongoClient.connect(url, function(err, db) {
      console.log("Connected correctly to server");
      var collection = db.collection('act');
      // query
      collection.find({'char': charName}).toArray(function(err, docs) {
        var json = JSON.parse(JSON.stringify(docs));
        output.send(json);
      });
      db.close();
    });
};

module.exports = novelModel;
