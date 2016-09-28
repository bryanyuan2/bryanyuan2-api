/*
    app name: bryanyuan2-api
    author: bryanyuan2@gmail.com
    description: instapaper api
*/
var _ = require("lodash"),
    Promise = require('promise'),
    Instapaper = require('instapaper');

var config = require('./../env.json')[process.env.NODE_ENV || 'development'],
    instapaperConfig = {
        CONSUMER_KEY: process.env.INSTAPAPER_CONSUMER_KEY,
        CONSUMER_SECRET: process.env.INSTAPAPER_CONSUMER_SECRET,
        USER_ID: process.env.INSTAPAPER_USER_ID,
        USER_PASSWORD: process.env.INSTAPAPER_USER_PASSWORD
    },
    extractorModel = {};

extractorModel.getList = function(req, res) {
  var client = Instapaper(instapaperConfig.CONSUMER_KEY, instapaperConfig.CONSUMER_SECRET),
      output = res,
      jsonOutput = [],
      readItem = {};

  client.setUserCredentials(instapaperConfig.USER_ID, instapaperConfig.USER_PASSWORD);

  // Load a list of bookmarks using promises...
  client.bookmarks.list().then(function(bookmarks) {
    for (var i=0;i<bookmarks.length;i++) {
        if (bookmarks[i] && bookmarks[i].title) {
          readItem = bookmarks[i];
          if ('hash' in readItem) {
            delete readItem.hash;
          }
          jsonOutput.push(readItem);
        }
    }

    output.send(jsonOutput);
  }).catch(function(err) {
    console.warn('oh ERROR', err);
  });

};


module.exports = extractorModel;
