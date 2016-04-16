var _ = require("lodash");
var Promise = require('promise');
var Flickr = require("flickrapi");
var flickrOptions = {
    api_key: "84d2372d0e0894f288aeb2ae77ab3de2",
    secret: ""
};
var info = {
    userId: "27966503@N05",
    photosetId: "72157664504091093",
    perPage: 10,
    page: 1
}
var template = 'http://farm{farm}.staticflickr.com/{server}/{id}_{secret}.jpg';

var flickrModel = {};

function getFlickrPhotoGetInfo(getPhoto) {
    var args = Array.prototype.slice.call(getPhoto);
    var ary = [];

    return new Promise(function (resolve, reject){
        if (args.length === 0) {
            return resolve([]);
        }
        var remaining = args.length;

        /* flickr API - flickr.photos.getInfo */
        function flickrPhotoGetInfo(getPhotoId) {
            Flickr.tokenOnly(flickrOptions, function(error, flickr) {
                flickr.photos.getInfo({
                    photo_id: getPhotoId
                }, function(err, result) {
                    if (err) {
                        reject(err);
                    }
                    var thumb = template.replace('{farm}', result.photo.farm)
                                      .replace('{server}', result.photo.server)
                                      .replace('{id}', result.photo.id)
                                      .replace('{secret}', result.photo.secret);
                    ary.push({
                        id: result.photo.id,
                        title: result.photo.title._content,
                        description: result.photo.description._content,
                        thumb: thumb,
                        url: result.photo.urls.url._content,
                        date: result.photo.dates.taken,
                        view: result.photo.views
                    });
                    if (--remaining === 0) {
                        resolve(ary);
                    }
                });
            });
        }

        for (var index in getPhoto) {
            var getPhotoId = _.get(getPhoto[index], ['id']) || '';
            flickrPhotoGetInfo(getPhotoId);
        }
    });
}


flickrModel.getFavPhotos = function(req, res) {
    Flickr.tokenOnly(flickrOptions, function(error, flickr) {
        var output = res;
        /* flickr.favorites.getList */
        flickr.favorites.getList({
            user_id: info.userId,
            per_page: info.perPage,
            page: info.page
        }, function(err, result) {
            if(err) {
                throw new Error(err);
            }
            //console.log("result", result.photos.photo[0]);
            var getPhoto = _.get(result, ['photos', 'photo']);
            getFlickrPhotoGetInfo(getPhoto).then(function(res){
                var json = JSON.parse(JSON.stringify(res));
                //res.send([{name:'wine1'}, {name:'wine2'}, {name:'wine3'}]);
                output.send(json);
            });
        });
    });
};

module.exports = flickrModel;