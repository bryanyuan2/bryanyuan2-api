var express = require('express'),
    helmet = require('helmet'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    https = require('https');

var index = require('./routes/index'),
    crontab = require('./script/cron');
    //search = require('./routes/es/search'),
    search = require('./routes/db/search'),
    bookmarks = require('./routes/db/bookmarks'),
    novel = require('./routes/db/novel'),
    instapaper = require('./routes/db/instapaper');
   
var app = express(),
    route = express.Router(),
    server;

if (process.env.NODE_ENV === 'production') {
    server = https.createServer({
        key: fs.readFileSync('./tls/key.pem'),
        cert: fs.readFileSync('./tls/cert.pem')
    }, app);
}

var whitelist = [
        'http://localhost:3000',
        'http://bryanyuan2.github.io',
        'https://bryanyuan2.github.io',
        'http://bryanyuan2-bookmarks.github.io',
        'https://bryanyuan2-bookmarks.github.io',
    ],
    corsOptions = {
        origin: function(origin, callback){
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        },
        credentials: true
    },
    ports = [8080, 8081];

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors(corsOptions));

// public resource
app.use(express.static('public'));

// route
route.get('/', index.getMsg);
route.get('/bookmarks/query/:id', bookmarks._searchBookmarks);
route.get('/bookmarks/list', bookmarks._listBookmarks);

route.get('/search/query/:id', search.getSearchResult);
//route.get('/novel/actor/:gid', novel.getActorRelation);

route.get('/instapaper/get', instapaper.getBookmarksJson);
app.use('/api', route);


if (process.env.NODE_ENV === 'production') {
    server.listen(ports[1])
}

app.listen(ports[0]);

console.log('port ' + ports);

// crontab
crontab.scheduleTab();



