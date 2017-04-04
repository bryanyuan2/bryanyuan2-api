var express = require('express'),
    helmet = require('helmet'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    fs = require('fs'),
    https = require('https'),
    path = require('path'),
    exphbs  = require('express-handlebars');

var index = require('./routes/index'),
    crontab = require('./script/cron');
    //search = require('./routes/es/search'),
    search = require('./routes/db/search'),
    bookmarks = require('./routes/db/bookmarks'),
    readability = require('./routes/db/readability'),
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

// template engine


// handlebars template
app.set('view engine', 'handlebars');
app.engine('handlebars', exphbs({
    //partialsDir: __dirname + '/views/partials/',
    extname: '.handlebars'
}));
app.set('views', path.join(__dirname, 'views/layouts'));


app.use('/api', route);

// route
route.get('/', index.getMsg);

// {{app}} readability
route.get('/readability/:id', readability._readCleanArticle);

// {{bryanyuan2.github.io}} search
route.get('/search/query/:id', search.getSearchResult);

// {{bryanyuan2-bookmarks.github.io}} bookmarks
route.get('/bookmarks/query/:id/:limit', bookmarks._searchBookmarks);
route.get('/bookmarks/list', bookmarks._listBookmarks);
route.get('/bookmarks/list/:limit', bookmarks._listBookmarks);
route.get('/bookmarks/count', bookmarks._countBookmarks);
route.get('/bookmarks/latest', bookmarks._latestBookmarks);
route.get('/bookmarks/timestamp', bookmarks._timestampBookmarks);

// {{bryanyuan2-bookmarks.github.io}} instapaper
route.get('/instapaper/get', instapaper.getBookmarksJson);


if (process.env.NODE_ENV === 'production') {
    server.listen(ports[1])
}

app.listen(ports[0]);

console.log('port ' + ports);

// crontab
crontab.scheduleTab();



