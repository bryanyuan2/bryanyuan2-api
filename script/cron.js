var _ = require("lodash"),
    schedule = require('node-schedule'),
    unfluff = require('unfluff'),
    Promise = require('promise'),
    request = require('request'),
    objectAssign = require('object-assign'),
    favicon = require('favicon'),
    readingTime = require('reading-time'),
    striptags = require('striptags'),
    readability = require('node-readability'),
    sanitizeHtml = require('sanitize-html'),
    pUrl = require('url'),
    MongoClient = require('mongodb').MongoClient;

var instapaper = require('./../routes/db/instapaper');
var config = require('./../env.json')[process.env.NODE_ENV || 'development'],
    mongodbConf = {
        host: process.env.MONGODB_HOST,
        port: process.env.MONGODB_PORT,
        db: process.env.MONGODB_DB,
        collection: process.env.MONGODB_COLLECTION_BOOKMARKS
    },
    cronTab = {};

var urlExtactor = function (url, output) {
  return new Promise(function (resolve, reject) {
    request(url, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        resolve({ body: body, output: output, url: url })
      } else {
        resolve({ error: error })
      }
    })
  });
}

var htmlExtactor = function (data) {
  return new Promise(function (resolve, reject) {
    var content = unfluff(data.body),
        metadata = {
            _title: _.get(content, ['title'], ''),
            _softTitle: _.get(content, ['softTitle'], ''),
            _date: _.get(content, ['date'], ''),
            _author: _.get(content, ['author'], ''),
            _publisher: _.get(content, ['publisher'], ''),
            _copyright: _.get(content, ['copyright'], ''),
            _favicon: _.get(content, ['favicon'], ''),
            _description: _.get(content, ['description'], ''),
            _keywords: _.get(content, ['keywords'], ''),
            _lang: _.get(content, ['lang'], ''),
            _tags: _.get(content, ['tags'], ''),
            _image: _.get(content, ['image'], ''),
            _links: _.get(content, ['links'], ''),
            _text: _.get(content, ['text'], '')
        };
    
    resolve({ data: metadata, output: data.output, url: data.url });

  });
}

var getBookmarksQueue = function(data) {
  return new Promise(function (resolve, reject) {
    var output = data.json, 
        queue = [],
        i;

    for (i=0;i<output.length;i++) {
        queue.push(output[i].bookmark_id);
    }
    resolve({
        data: data.json,
        queue: queue
    });
  });
}

var faviconExtractor = function(data) {
    console.log("-- faviconExtractor");
    return new Promise(function (resolve, reject) {
        var target_url = data.output.url;
        favicon(target_url, function(err, favicon_url) {
            data.output.favicon = favicon_url;
            resolve(data);
        });
    });
}

var domainExtractor = function(data) {
    console.log("-- domainExtractor");
    return new Promise(function (resolve, reject) {
        data.output.host = pUrl.parse(data.output.url).host;
        resolve(data);
    });
}

var readabilityExtractor = function(data) {
    console.log("readabilityExtractor");

    return new Promise(function (resolve, reject) {
        readability(data.url, function(err, article, meta) {
            var getReadabilityContent = _.get(article, ['content'], '');
            resolve({
                readability: {
                    readability: sanitizeHtml(getReadabilityContent, {
                        allowedTags: [
                            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'p', 'ul', 'ol',
  'nl', 'li', 'b', 'i', 'strong', 'em', 'strike', 'code', 'hr', 'br', 'div', 'span', 
  'table', 'thead', 'caption', 'tbody', 'tr', 'th', 'td', 'pre' ],
                        parser: {
                            lowerCaseTags: true
                        }
                    }),
                    readTime: readingTime(striptags(getReadabilityContent))
                },
                output: data.output,
                data: data.data
            });
        });
    });
}    

var callMongodb = function(recurBookmarks) {
    console.log("-- call callMongodb");
    var url = 'mongodb://' + mongodbConf.host + ':'+ mongodbConf.port + '/' + mongodbConf.db;

    // connect to MongoClient
    MongoClient.connect(url, function(err, db) {
        if(err) {
            throw err;
        }
        var collection = db.collection('bookmarks');
        
        if (collection) {
            // option upsert for updateOne method
            console.log("updating ", recurBookmarks.bookmark_id);
            collection.updateOne({
                    bookmark_id : recurBookmarks.bookmark_id
                }, { 
                    $set: JSON.parse(JSON.stringify(recurBookmarks))
                }, {
                    // if not existed, then do updating
                    upsert: true
                },
                function(err, result) {
                    console.log("Updated the document " + result);
                }
            );
        }
    });
}

var flattenOutput = function(data) {
    console.log("-- call flattenOutput");
    var output = data.data,
        queue = data.queue,
        i;

    for (i=0;i<queue.length;i++) {
        try {
            urlExtactor(output[i].url, output[i])
                .then(htmlExtactor)
                .then(faviconExtractor)
                .then(domainExtractor)
                .then(readabilityExtractor)
                .then(function(data) {
                    callMongodb(objectAssign(data.data, data.output, data.readability));
                });
        } catch (err) {
            console.log("flattenOutput data error", err.message)
        }
    }
}

cronTab.scheduleTab = function() {
    var job = schedule.scheduleJob('0 0 23 * * *', function(){
        console.log('-- crontab should be executed every day at 23:00:00');

        instapaper._getBookmarksList()
                  .then(getBookmarksQueue)
                  .then(flattenOutput);
    });
}

module.exports = cronTab;