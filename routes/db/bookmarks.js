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
    mongodbConnectUrl = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db,
    bookmarksModel = {};

bookmarksModel._searchBookmarks = function(req, res) {
    var output = res,
        query = req.params.id,
        sortOpts = {
          time: -1
        },
        searchOpt = {
            "$or":  [
                  { title: new RegExp(query, 'i')}, 
                  { description: new RegExp(query, 'i')},
                  { _description: new RegExp(query, 'i')}
            ]
        },
        selectFieldOpts = { 
            title: 1,
            date: 1,
            bookmark_id: 1,
            url: 1,
            favicon: 1,
            text: 1,
            time: 1,
            _description: 1,
            _text: 1,
            _image: 1,
            _tags: 1
        };

    console.log("query", query);

    return new Promise(function (resolve, reject) {
      MongoClient.connect(mongodbConnectUrl, function(err, db) {
          if(err) { throw err; }

          db.collection(mongodbConf.collection).find(searchOpt, selectFieldOpts).sort(sortOpts).toArray(function (err, result) {
            if (err) {
              console.log(err);
              output.send({ 'result': 'error' });
              resolve({ 'status': 'err', 'result': err });
            } else if (result.length) {
              output.send(result);
              resolve({ 'status': 'ok', 'result': result });
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              output.send({ 'result': '0' });
              resolve({ 'status': 'no', 'result': '0' });
            }
            db.close();
          });
      });
    });
}

bookmarksModel._listBookmarks = function(req, res) {
    var output = res,
        sortOpts = {
            time: -1
        },
        selectFieldOpts = { 
            title: 1,
            date: 1,
            bookmark_id: 1,
            url: 1,
            favicon: 1,
            text: 1,
            time: 1,
            _description: 1,
            _text: 1,
            _image: 1,
            _tags: 1
        },
        limitNumOpts = 100;
    return new Promise(function (resolve, reject) {
      MongoClient.connect(mongodbConnectUrl, function(err, db) {
          if(err) { throw err; }

          db.collection(mongodbConf.collection).find({}, selectFieldOpts).limit(limitNumOpts).sort(sortOpts).toArray(function (err, result) {
            if (err) {
              console.log(err);
              resolve({ 'status': 'err', 'result': err });
            } else if (result.length) {
              output.send(result);
              resolve({ 'status': 'ok', 'result': result });
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              resolve({ 'status': 'no' });
            }
            db.close();
          });
      });
    });
}

bookmarksModel._countBookmarks = function(req, res) {
    var output = res;

    return new Promise(function (resolve, reject) {
      MongoClient.connect(mongodbConnectUrl, function(err, db) {
          if(err) { throw err; }

          db.collection(mongodbConf.collection).count({}, function(err, result) {
              if (err) {
                console.log(err);
                output.send('[{"error":' + err + '}]');
                resolve({ 'status': 'err', 'result': err });
              } else if (result) {
                output.send('[{"count":' + result + '}]');
                resolve({ 'status': 'ok', 'result': result });
              } else {
                console.log('No document(s) found with defined "find" criteria!');
                resolve({ 'status': 'no' });
              }
              db.close();
          });
      });
    });
}

bookmarksModel._latestBookmarks = function(req, res) {
    var output = res,
        sortOpts = {
            time: -1
        },
        selectFieldOpts = { 
            time: 1
        };

    return new Promise(function (resolve, reject) {
      MongoClient.connect(mongodbConnectUrl, function(err, db) {
          if(err) { throw err; }

          db.collection(mongodbConf.collection).find({}, selectFieldOpts).sort(sortOpts).limit(1).toArray(function (err, result) {
            if (err) {
              console.log(err);
              output.send({ 'result': 'error' });
              resolve({ 'status': 'err', 'result': err });
            } else if (result.length) {
              output.send(result);
              resolve({ 'status': 'ok', 'result': result });
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              output.send({ 'result': '0' });
              resolve({ 'status': 'no', 'result': '0' });
            }
            db.close();
          });
      });
    });
}

module.exports = bookmarksModel;
