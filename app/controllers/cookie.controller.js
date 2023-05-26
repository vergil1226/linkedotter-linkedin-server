const config = require("../config/auth.config");
var jwt = require("jsonwebtoken");
const cookie_data = require('../models/user_cookie.model');

/*
 This API used to isnert LI cookie value, we need to pass Cookie value and also user login token in header 'x-access-token
 */

exports.setcookie = async (req, res) =>
{
    try {
        
       
        if (req.body.cookie_value)
        {
            const authHeader = req.headers["x-access-token"];
            let user_id=0;
            if (req.body.user_id)
            {
                user_id=req.body.user_id;
            }else{
                let decoded = jwt.verify(authHeader, config.secret);
                user_id=decoded.id;
            }

            const set_cookie = new cookie_data({
                user_id: user_id,
                cookie_value: req.body.cookie_value,
            });
            set_cookie.save((err) => {
                if (err) {
                    return res.status(500).send({message: err});
                } else {
                    return res.send({"msg": "Cookie value submitted succesfully"});
                }
            });
        } else
        {
            return res.send({"error": "Cookie value and user id is required"});
        }
    } catch (ex)
    {
        console.log(ex);
        return res.send({"error": ex})
    }
}
