var _ = require("lodash");
var Promise = require('promise');
var Flickr = require("flickrapi");
var elasticsearch = require('elasticsearch');
var AgentKeepAlive = require('agentkeepalive');

var client = new elasticsearch.Client({
  apiVersion: '2.1',
  host: 'http://localhost:9200',
  createNodeAgent(connection, config) {
    return new AgentKeepAlive(connection.makeAgentConfig(config));
  }
});

var searchModel = {};

function searchMediaQuery(conf) {
    return new Promise(function (resolve, reject) {
        client.search({
          index: conf.index,
          type: conf.type,
          q: conf.query,
          size: conf.limit
        }).then(function (body) {
          var hits = body.hits.hits;
          //console.log("hits", hits);
          resolve(hits);
        }, function (error) {
          //console.trace(error.message);
        });
    });
}

searchModel.test = function(req, res) {
    var output = res;
    var conf = {
        index: 'api',
        type: 'media',
        query: req.params.id || 'yahoo',
        limit: req.param('limit') || 5
    };

    searchMediaQuery(conf).then(function(res){
        var json = JSON.parse(JSON.stringify(res));
        //res.send([{name:'wine1'}, {name:'wine2'}, {name:'wine3'}]);
        output.send(json);
    });
};

module.exports = searchModel;