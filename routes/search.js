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

var client = new elasticsearch.Client({
  apiVersion: '2.1',
  host: config.SEARCH_API.DOMAIN,
  requestTimeout: Infinity,
  deadTimeout: 6000
  maxRetries: 10,
  maxSockets: 10,
  minSockets: 10,
  keepAlive: true,
  createNodeAgent(connection, config) {
    return new AgentKeepAlive(connection.makeAgentConfig(config));
  }
});
var searchModel = {};

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
          resolve(error.message);
        });
    });
}

/*
  index: bryanyuan2
  type: media
*/
searchModel.getSearchResult = function(req, res) {
    var output = res;
    var conf = {
        index: config.SEARCH_API.DOMAIN.ES_INDEX,
        type: config.SEARCH_API.DOMAIN.ES_TYPE,
        query: req.params.id || 'yahoo',
        limit: req.param('limit') || 10
    };

    searchMediaQuery(conf).then(function(res){
        var json = JSON.parse(JSON.stringify(res));
        output.send(json);
    });
};

module.exports = searchModel;
