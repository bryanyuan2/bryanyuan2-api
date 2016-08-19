/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: elasticsearch as middleware for bryanyuan2.github.io
*/
var _ = require("lodash");
var Promise = require('promise');
var elasticsearch = require('elasticsearch');
var config = require('./../env.json')[process.env.NODE_ENV || 'development'];
var AgentKeepAlive = require('agentkeepalive');

/* mongodb */
var MongoClient = require('mongodb').MongoClient;

/* elasticsearch */
var client = new elasticsearch.Client({
  apiVersion: '2.1',
  host: config.SEARCH_API.DOMAIN,
  requestTimeout: Infinity,
  deadTimeout: 6000,
  maxRetries: 10,
  maxSockets: 10,
  minSockets: 10,
  keepAlive: true,
  createNodeAgent(connection, config) {
    return new AgentKeepAlive(connection.makeAgentConfig(config));
  }
});
var mongodbConf = {
  host: 'localhost',
  port: '27017',
  db: 'bryanyuan2',
  collection: 'search'
};
var searchModel = {};

/* elasticsearch */
var searchMediaQuery = function(conf) {
    return new Promise(function (resolve, reject) {
        console.log("query: ", conf.query);
        client.search({
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
        index: config.SEARCH_API.DOMAIN.ES_INDEX,
        type: config.SEARCH_API.DOMAIN.ES_TYPE,
        query: req.params.id || 'yahoo',
        limit: req.param('limit') || 10,
        req: req,
        res: res
    };

    searchMediaQuery(conf).then(logSearchQueryDB);

};


module.exports = searchModel;
