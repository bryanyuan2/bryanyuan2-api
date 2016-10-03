/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: elasticsearch as middleware for bryanyuan2.github.io
*/
var _ = require("lodash"),
    Promise = require('promise'),
    elasticsearch = require('elasticsearch'),
    AgentKeepAlive = require('agentkeepalive'),
    MongoClient = require('mongodb').MongoClient,
    http = require('http');

var config = require('./../env.json')[process.env.NODE_ENV || 'development'],
    esConf = {
      INDEX: process.env.ELASTICSEARCH_INDEX_BRYANYUAN2,
      TYPE: process.env.ELASTICSEARCH_TYPE_MEDIA
    },
    mongodbConf = {
        host: process.env.MONGODB_HOST,
        port: process.env.MONGODB_PORT,
        db: process.env.MONGODB_DB,
        collection: process.env.MONGODB_COLLECTION_SEARCH
    },
    searchModel = {};

/* elasticsearch */
var searchMediaQuery = function(conf) {
    return new Promise(function (resolve, reject) {
        var elasticClient = new elasticsearch.Client({
          host: 'localhost:9200',
          createNodeAgent(connection, config) {
            return http.globalAgent;
          }
        });

        console.log("query: ", conf.query);
        elasticClient.search({
            index: conf.index,
            type: conf.type,
            q: escape(conf.query),
            size: conf.limit
        }).then(function (body) {
            resolve({
              conf: conf,
              hits: JSON.stringify(body.hits.hits)
            });
        }, function (error) {
            console.trace(error.message);
            resolve(error.message);
        });
    });
}

/* mongodb */
var logSearchQueryDB = function(result) {
    return new Promise(function (resolve, reject) {
      var url = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db;
      MongoClient.connect(url, function(err, db) {
          if(err) throw err;
          console.log("req.headers", result.conf.req.headers);
          db.collection(mongodbConf.collection).insertOne({
            "query": result.conf.query,
            "timestamp": Date.now()
          }, function(err, done) {
              output = result.conf.res;
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
        index: esConf.INDEX,
        type: esConf.TYPE,
        query: req.params.id || 'yahoo',
        limit: req.param('limit') || 10,
        req: req,
        res: res
    };

    searchMediaQuery(conf).then(logSearchQueryDB);
};


module.exports = searchModel;
