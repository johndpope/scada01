var express = require('express');
var router = express.Router();
router.model=[];
// middleware that is specific to this router
router.use(function timeLog(req, res, next) {
  console.log('Time: ', Date.now());
  next();
});
router.get('/get', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
});


module.exports = router;