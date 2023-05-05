const { authJwt } = require("../middlewares");
const controllers = require("../controllers/cookie.controller");

module.exports = function(app) {
  app.use(function(req, res, next) {
    res.header(
      "Access-Control-Allow-Headers",
      "x-access-token, Origin, Content-Type, Accept"
    );
    next();
  }); 
  
  app.post("/api/set/cookie",authJwt.verifyToken,controllers.setcookie);
};
