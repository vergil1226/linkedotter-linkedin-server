const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const fetch = require("../controllers/fetch.controller");
const phantom=require("../controllers/phantom.controller")
module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });


  //Signup , it also checks duplicate using middlewear
  app.post("/api/auth/signup", [verifySignUp.checkDuplicateUsernameOrEmail],controller.signup);

  // app.post("/api/set/cookie",controller.setcookie);

  //User Signin Request
  app.post("/api/auth/signin", controller.signin);

  //User Signout Request
  app.post("/api/auth/signout", controller.signout);
  
  //fetch user cookie by providing email in request
  app.post("/api/auth/fetchUserLatestCookie",fetch.fetch);

  //Get User Details
  app.get("/api/userData",phantom.userData);

};
