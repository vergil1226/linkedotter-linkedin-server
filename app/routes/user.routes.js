const express = require("express");
const { authJwt } = require("../middlewares");
const controllers = require("../controllers/cookie.controller"); 
const phantom  = require("../controllers/phantom.controller");


module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  }); 
  
  app.post("/api/set/cookie",authJwt.verifyToken,controllers.setcookie);


  app.use(express.json());

  app.post('/fetch',phantom.apiFetchSingleAgentRecords);

  app.post('/fetchoutput',phantom.apiFetchoutputData);
  
  app.post('/fetchall',phantom.apiFetchall);

  app.post('/delete',phantom.deleteAgentEntry);

  app.post('/launch',phantom.launchAgentEntry);

  app.post('/create',phantom.createAgent);
  
  
};
