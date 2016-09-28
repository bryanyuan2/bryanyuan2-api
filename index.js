var express = require('express'),
    helmet = require('helmet'),
    cors = require('cors'),
    bodyParser = require('body-parser');

var index = require('./routes/index'),
    search = require('./routes/search'),
    novel = require('./routes/novel'),
    instapaper = require('./routes/instapaper');

var app = express(),
    route = express.Router();

var whitelist = [
        'http://localhost:3000',
        'http://bryanyuan2.github.io',
    ],
    corsOptions = {
        origin: function(origin, callback){
            var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
            callback(null, originIsWhitelisted);
        },
        credentials: true
    },
    port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());
app.use(cors(corsOptions));

// public resource
app.use(express.static('public'));

// route
route.get('/', index.getMsg);
route.get('/search/query/:id', search.getSearchResult);
route.get('/novel/actor/:gid', novel.getActorRelation);
route.get('/instapaper/get', instapaper.getList);
app.use('/api', route);

app.listen(port);
console.log('port ' + port);


