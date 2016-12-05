var express = require('express');
var router = express.Router();
const util = require('util');
var events = require("events");
router.model=[];
var evts=function(){}
util.inherits(evts, events.EventEmitter);
router.events=new evts();

// middleware that is specific to this router
router.get('/get', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  res.write(sres);
  res.end();
})
router.post('/startstop', function (req, res) {
  router.events.emit('startstop',req.body);
  res.write('OK');
  res.end();
});
router.post('/new', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  router.events.emit('new',req.body);
  res.write('OK');
  res.end();
});
router.post('/edit', function (req, res) {
  var sres = JSON.stringify(router.model.modules);
  router.events.emit('edit',req.body);
  res.write('OK');
  res.end();
});
router.post('/delete', function (req, res) {
  router.events.emit('delete',req.body);
  res.write('OK');
  res.end();
});

module.exports = router;
