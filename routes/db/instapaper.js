/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: instapaper api
*/
var _ = require("lodash"),
    Promise = require('promise'),
    Instapaper = require('instapaper');

var config = require('./../../env.json')[process.env.NODE_ENV || 'development'],
    instapaperConfig = {
        CONSUMER_KEY: process.env.INSTAPAPER_CONSUMER_KEY,
        CONSUMER_SECRET: process.env.INSTAPAPER_CONSUMER_SECRET,
        USER_ID: process.env.INSTAPAPER_USER_ID,
        USER_PASSWORD: process.env.INSTAPAPER_USER_PASSWORD
    },
    extractorModel = {};

extractorModel._getBookmarksList = function() {
  var json = [],
      item = {};

  // Load a list of bookmarks using promises...
  return new Promise(function (resolve, reject) {
    var client = Instapaper(instapaperConfig.CONSUMER_KEY, instapaperConfig.CONSUMER_SECRET);

    client.setUserCredentials(instapaperConfig.USER_ID, instapaperConfig.USER_PASSWORD);
    client.bookmarks.list({limit: 100}).then(function(bookmarks) {
      for (var i=0;i<bookmarks.length;i++) {
          if (bookmarks[i] && bookmarks[i].title) {
            item = bookmarks[i];
            if ('hash' in item) {
              delete item.hash;
            }
            json.push(item);
          }
      }
      resolve({ json });
    }).catch(function(err) {
      console.warn('oh ERROR', err);
    });
  });
}

extractorModel.getBookmarksJson = function(req, res) {
  var output = res;
  extractorModel._getBookmarksList().then(function(json) {
    output.send(json);
  });
};


module.exports = extractorModel;
