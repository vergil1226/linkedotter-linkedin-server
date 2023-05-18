const config = require("../config/auth.config");
const db = require("../models");
const User = db.user;


var jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");
/*
 Signup API, we need to pass username, email and password in request body
 */
exports.signup = (req, res) => {
    const user = new User({
        username: req.body.username,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 8)
    });
    user.save((err, user) => {
        if (err) {
            return res.status(500).send({message: err});
        } else {

            var token = jwt.sign({id: user.id}, config.secret, {
                expiresIn: 86400 // 24 hours
            });

            res.send({message: "User was registered successfully!", "token": token});
        }
    });
}

/*
 Login API, we need to pass username password in request body
 In Response, you will get x-access-token which you can pass further to insert cookie value
 */
exports.signin = (req, res) => {
    User.findOne({
        username: req.body.username
    }).exec((err, user) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }

        if (!user) {
            return res.status(404).send({message: "User Not found."});
        }

        var passwordIsValid = bcrypt.compareSync(
                req.body.password,
                user.password
                );

        if (!passwordIsValid) {
            return res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
        }

        var token = jwt.sign({id: user.id}, config.secret, {
            expiresIn: 86400 // 24 hours
        });


        res.status(200).send({
            id: user._id,
            username: user.username,
            email: user.email,
            accessToken: token
        });
    });
};

/*
 Signout API, we need to pass username x-access-token in header to sign out of the application
 */
exports.signout = (req, res) => {

    try {
        const authHeader = req.headers["x-access-token"];
        jwt.sign(authHeader, "", {expiresIn: 1}, (logout, err) => {
            if (logout) {
                return res.status(200).send({msg: 'You have been Logged Out'});
            } else {
                return res.status(404).send({msg: 'Error'});
            }
        });
    } catch (e)
    {
        return res.status(404).send({message: "Error in Logout"});
    }
};



