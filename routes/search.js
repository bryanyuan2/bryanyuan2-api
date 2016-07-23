/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: elasticsearch as middleware for bryanyuan2.github.io
*/
var _ = require("lodash");
var Promise = require('promise');
var elasticsearch = require('elasticsearch');
var config = require('./../env.json')[process.env.NODE_ENV || 'development'];

var client = new elasticsearch.Client({
  host: config.SEARCH_API.DOMAIN,
  requestTimeout: Infinity,
  keepAlive: true
});
var searchModel = {};

var searchMediaQuery = function(conf) {
    return new Promise(function (resolve, reject) {
        client.search({
          index: conf.index,
          type: conf.type,
          q: conf.query,
          size: conf.limit
        }).then(function (body) {
          var hits = body.hits.hits;
          resolve(hits);
        }, function (error) {
          console.trace(error.message);
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