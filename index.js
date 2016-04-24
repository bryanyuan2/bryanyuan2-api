var express = require('express');
var flickr = require('./routes/flickr');
var search = require('./routes/search');
var app = express();
var bodyParser = require('body-parser');
var port = 8080;
var router = express.Router();
var helmet = require('helmet');
var cors = require('cors');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(helmet());

/* root */
router.get('/', function(req, res) {
    res.json({ message: 'bryanyuan2 heroku API' });
});

/* flickr getFavPhotos */
router.get('/flickr/fav', flickr.getFavPhotos);

/* search api/media */
router.get('/search/query/:id', search.test);

/* */
var whitelist = [
    'http://localhost:3000',
];
var corsOptions = {
    origin: function(origin, callback){
        var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
        callback(null, originIsWhitelisted);
    },
    credentials: true
};
app.use(cors(corsOptions));

/* */

app.use('/api', router);

app.listen(port);
console.log('port ' + port);