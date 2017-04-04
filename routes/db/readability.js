/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: readability api
*/
var _ = require("lodash"),
    Promise = require('promise'),
    MongoClient = require('mongodb').MongoClient,
    striptags = require('striptags');

var config = require('./../../env.json')[process.env.NODE_ENV || 'development'],
    mongodbConf = {
        host: process.env.MONGODB_HOST,
        port: process.env.MONGODB_PORT,
        db: process.env.MONGODB_DB,
        collection: process.env.MONGODB_COLLECTION_BOOKMARKS
    },
    mongodbConnectUrl = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db,
    readabilityModel = {};

readabilityModel._readCleanArticle = function(req, res) {
    console.log("_readCleanArticle");
    var bookmarkID = parseFloat(req.params.id),
        output = res;

    return new Promise(function (resolve, reject) {
      MongoClient.connect(mongodbConnectUrl, function(err, db) {
          if(err) { throw err; }
          db.collection(mongodbConf.collection).find({ bookmark_id: bookmarkID }).toArray(function (err, result) {
            if (err) {
              console.log(err);
              resolve({});
            } else if (result.length) {
              var getOnlyResult = result[0];
              output.render('mobile', {
                  title: _.get(getOnlyResult, ['title'], ''),
                  content: _.get(getOnlyResult, ['readability'], '')
              });
              resolve({});
            } else {
              console.log('No document(s) found with defined "find" criteria!');
              resolve({});
            }
            db.close();
          });
      });
    });
}

module.exports = readabilityModel;
