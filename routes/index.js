const express = require('express');
const  router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.json({ message: 'Hell0 qingrongh ' });
});

module.exports = router;
