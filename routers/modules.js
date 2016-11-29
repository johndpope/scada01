var express = require('express');
var router = express.Router();
router.model=[];
// middleware that is specific to this router
router.get('/get', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
})
router.post('/start', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
});
router.post('/stop', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
});
router.post('/new', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
});
router.post('/delete', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
});

module.exports = router;