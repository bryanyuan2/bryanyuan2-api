var express = require('express');
var search = require('./routes/search');
var app = express();
var bodyParser = require('body-parser');
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');
var port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

/* root */
router.get('/', function(req, res) {
    res.json({ message: 'bryanyuan2 heroku API' });
});

/* search api/media */
router.get('/search/query/:id', search.getSearchResult);

/* */
var whitelist = [ 'http://localhost:3000' ];
var corsOptions = {
    origin: function(origin, callback){
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};

app.use(cors(corsOptions));
app.use('/api', router);

app.listen(port);
console.log('port ' + port);