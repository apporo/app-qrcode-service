'use strict';

var Devebot = require('devebot');
var Promise = Devebot.require('bluebird');
var chores = Devebot.require('chores');
var lodash = Devebot.require('lodash');
var fs = require('fs');
var path = require('path');

var Service = function(params) {
  params = params || {};

  var self = this;
  var LX = params.loggingFactory.getLogger();
  var LT = params.loggingFactory.getTracer();
  let packageName = params.packageName || 'app-qrcode-service';
  let blockRef = chores.getBlockRef(__filename, packageName);

  LX.has('silly') && LX.log('silly', LT.toMessage({
    tags: [ blockRef, 'constructor-begin' ],
    text: ' + constructor start ...'
  }));

  var qrcodeGenerator = params['app-qrcode/generator'];
  var webweaverService = params['webweaverService'];

  var pluginCfg = params.sandboxConfig;
  var contextPath = pluginCfg.contextPath || '/qrcode-service';
  var express = webweaverService.express;
  var bugsvg = null;

  var router = new express();
  router.route('/generator').post(function(req, res, next) {
    LX.has('debug') && LX.log('debug', LT.add(req).toMessage({
      text: 'qrcode generator: ${body}'
    }));
    qrcodeGenerator.generate({}, req.body).then(function(svg) {
      res.header("Content-Type","image/svg+xml");
      res.send(svg);
    }).catch(function(error) {
      if (!bugsvg) {
        try {
          bugsvg = fs.readFileSync(path.join(__dirname, '../../data/images/bug.svg'));
        } catch(err) {}
      }
      if (bugsvg) {
        res.header("Content-Type","image/svg+xml");
        res.status(502).send(bugsvg);
      } else {
        res.header("Content-Type","application/json");
        res.status(502).json({
          message: 'Error on QRCode Generating'
        });
      }
    });
  });

  webweaverService.push([
    webweaverService.getJsonBodyParserLayer([
      {
        name: 'app-qrcode-service-handler',
        path: contextPath,
        middleware: router
      }
    ])
  ], pluginCfg.priority);

  LX.has('silly') && LX.log('silly', LT.toMessage({
    tags: [ blockRef, 'constructor-end' ],
    text: ' - constructor end!'
  }));
};

Service.referenceList = [ "app-qrcode/generator", "webweaverService" ];

module.exports = Service;
