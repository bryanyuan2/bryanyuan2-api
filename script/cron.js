var schedule = require('node-schedule'),
    extractor = require('unfluff'),
    Promise = require('promise'),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient,
    objectAssign = require('object-assign'),
    favicon = require('favicon');

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
        resolve({ body: body, output: output })
      } else {
        resolve({ error: error })
      }
    })
  });
}

var htmlExtactor = function (data) {
  return new Promise(function (resolve, reject) {
    content = extractor(data.body);
    resolve({data: content, output: data.output});
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

var metadataExtractor = function(data) {
    var content = data.data;
    return new Promise(function (resolve, reject) {
        var metadata = {
            _title: content.title,
            _softTitle: content.softTitle,
            _date: content.date,
            _author: content.author,
            _publisher: content.publisher,
            _copyright: content.copyright,
            _favicon: content.favicon,
            _description: content.description,
            _keywords: content.keywords,
            _lang: content.lang,
            _tags: content.tags,
            _image: content.image,
            _links: content.links,
            _text: content.text
        }
        resolve({ data: metadata, output: data.output})
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

var faviconExtractor = function(data) {
    console.log("-- faviconExtractor");
    return new Promise(function (resolve, reject) {
        favicon(data.output.url, function(err, favicon_url) {
            // console.log("favicon_url", favicon_url);
            data.output.favicon = favicon_url;
            resolve(data)
        });
    });
}

var flattenOutput = function(data) {
    console.log("-- call flattenOutput");
    var output = data.data,
        queue = data.queue,
        i;

    for (i=0;i<queue.length;i++) {
        urlExtactor(output[i].url, output[i]).then(htmlExtactor)
                                             .then(metadataExtractor)
                                             .then(faviconExtractor)
                                             .then(function(data){
            var recurBookmarks = objectAssign(data.data, data.output);
            callMongodb(recurBookmarks);
        });
    }
}

cronTab.scheduleTab = function() {
    var job = schedule.scheduleJob('0 0 23 * * *', function(){
    //var job = schedule.scheduleJob('* * * * * *', function(){
        console.log('-- crontab should be executed every day at 23:00:00');

        instapaper._getBookmarksList()
                  .then(getBookmarksQueue)
                  .then(flattenOutput);
    });
}

module.exports = cronTab;