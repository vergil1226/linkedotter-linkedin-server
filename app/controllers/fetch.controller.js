const Setcookie = require('../models/user_cookie.model');
const User = require('../models/user.model');
const { user } = require('../models');

/*
This API will return cookie values list, we have to provide email of the user and 
then it will check if user exists and then return all of his cookie values stoed in our database
*/
exports.fetch =async (req,res) =>
{
  try{    
       if(req.body.email)
       {
        User.findOne({
            email: req.body.email
          })
            .exec((err, user) => {
              if (err) {
                res.status(500).send({ message: err });
                return;
              }        
              if (!user) {
                return res.status(404).send({ message: "User Not found." });
              }
              Setcookie.find({
                user_id:user.id
              }).exec((error,result)=>{
                if(error)
                {
                   return res.send({message:err});
                }
                if(!result)
                {
                    return res.send({message:"Cookies Values not found"});
                }

                return res.send({"data":result});
              });
            });          
       }
       else
       {
        return res.send({"error":"Email is Required"});
       }
  }
  catch (ex)
  {
    console.log(ex);
    return res.send({"error":ex})
  }
}
