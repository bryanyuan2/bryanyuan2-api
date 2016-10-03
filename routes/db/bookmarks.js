/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: instapaper api
*/
var _ = require("lodash"),
    Promise = require('promise'),
    MongoClient = require('mongodb').MongoClient;

var config = require('./../../env.json')[process.env.NODE_ENV || 'development'],
    mongodbConf = {
        host: process.env.MONGODB_HOST,
        port: process.env.MONGODB_PORT,
        db: process.env.MONGODB_DB,
        collection: process.env.MONGODB_COLLECTION_BOOKMARKS
    },
    bookmarksModel = {};

bookmarksModel._searchBookmarks = function(req, res) {
    var output = res;
    var query = req.params.id;

    return new Promise(function (resolve, reject) {
      var url = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db;
      MongoClient.connect(url, function(err, db) {
          if(err) {
            throw err;
          }

          console.log("query", query);
          // query
          db.collection(mongodbConf.collection).find({
            "$or": [{
                title: new RegExp(query, 'i')
            }, {
                description: new RegExp(query, 'i')
            }, {
                _description: new RegExp(query, 'i')
            }]
          }).toArray(function (err, result) {
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
            //Close connection
            db.close();
          });
      });
    });
}


bookmarksModel._listBookmarks = function(req, res) {
    var output = res;

    return new Promise(function (resolve, reject) {
      var url = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db;
      MongoClient.connect(url, function(err, db) {
          if(err) {
            throw err;
          }

          // query
          db.collection(mongodbConf.collection).find({}).toArray(function (err, result) {
            if (err) {
              console.log(err);
            } else if (result.length) {
              console.log('result', result);
              output.send(result);
            } else {
              console.log('No document(s) found with defined "find" criteria!');
            }
            //Close connection
            db.close();
          });
      });
    });
}

module.exports = bookmarksModel;
