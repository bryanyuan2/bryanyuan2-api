var config = require('./../env.json')[process.env.NODE_ENV || 'development'],
    indexModel = {};

indexModel.getMsg = function(req, res) {
  res.json({
    message: 'bryanyuan2 API on digitalocean.com'
  });
};

module.exports = indexModel;