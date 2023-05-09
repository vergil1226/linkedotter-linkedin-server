const { verifySignUp } = require("../middlewares");
const controller = require("../controllers/auth.controller");
const fetch = require("../controllers/fetch.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  });

  app.post(
    "/api/auth/signup",
    [
      verifySignUp.checkDuplicateUsernameOrEmail
    ],
    controller.signup
  );

  // app.post("/api/set/cookie",controller.setcookie);

  app.post("/api/auth/signin", controller.signin);
  
  app.post("/api/auth/signout", controller.signout);
  
  app.post("/api/auth/fetch",fetch.fetch);
   
};
