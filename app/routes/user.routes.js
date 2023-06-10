const express = require("express");
const { authJwt } = require("../middlewares");
const cookieControllers = require("../controllers/cookie.controller");
const phantom = require("../controllers/phantom.controller");

module.exports = function (app) {
  app.use(function (req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });
  //set User Cookie Value
  app.post("/api/set/cookie", cookieControllers.setcookie);
  app.get("/api/set/cookie", cookieControllers.setcookie);

  app.use(express.json());

  //Create Agent
  app.post("/createPhantomAgent", phantom.createAgent);

  //Launch Agent with passing Cookie
  app.post("/launchPhantomAgent", phantom.launchAgentEntry);

  //API is hit phantom api to get data of laucnhed agent and then get Json URL from there once job is complete
  //and then parse Json and insert messages in database
  app.post("/fetchPhantomAgentOutput", phantom.apiFetchoutputData);

  //Fetch Agent Details
  app.post("/fetchPhantomAgentDetails", phantom.apiFetchSingleAgentRecords);

  //Fetch All Agents Details
  app.post("/fetchAllPhantomAgent", phantom.apiFetchall);

  //Delete Agent
  app.post("/deletePhantomAgent", phantom.deleteAgentEntry);

  //Get All Scrapped Messages of Linkedin User by passing team name , it will return data from database
  app.get("/fetch/all/messages", phantom.fetchmessage);

  //Get All Messages
  app.post("/fetch/all/user-messages", phantom.fetchUserMessage);

  //Get Scrapped Messages for specified user
  app.post("/fetch/all/message-thread", phantom.fetchMessageThread);

  app.get("/fetch/user/team", phantom.fetchteamuser);
  // app.post("/api/social_media",phantom.responseData);
  // app.post("/api/agent/save",phantom.save_agent);

  //Get Last OpenAI Checked date
  app.get("/openai/checked-date", phantom.getOpenAiCheckedDate);

  // Get all positive replies for a user between dates
  app.get("/get-positive-reply", phantom.getPositiveReply);

  // Get TTA value and Quality Score for a user
  app.get("/get-tta-qualitysocre", phantom.getTTAandQualityScore);
};
