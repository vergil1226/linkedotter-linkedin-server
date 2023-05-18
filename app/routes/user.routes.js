const express = require("express");
const { authJwt } = require("../middlewares");
const controllers = require("../controllers/cookie.controller");
const myfirstmodule = require("../myfirstmodule");
const fetchoutput = require("../fecthoutput");
const fetchall = require("../fetchall");
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

  app.post('/fetch',phantom.apiCall);

  app.post('/fetchoutput',phantom.apiOut);
  
  app.post('/fetchall',phantom.apiFet);

  app.post('/delete',phantom.delete);

  app.post('/launch',phantom.launch);

  app.post('/create',phantom.create);
  
  
};
