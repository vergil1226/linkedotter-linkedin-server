const sdk = require("api")("@phantombuster/v1#1mld74kq6w8xui");
const User = require("../models/user.model");
const Agent = require("../models/phantom_agent.model");
const phantom_link = require("../models/phantomlink.model");
const {
  phantomResponse,
  userContainer,
  cookie,
  openAiCheck,
  linkedin_user,
} = require("../models");
var jwt = require("jsonwebtoken");
const config = require("../config/auth.config");

const api_key = "UUfDSfo6pWc0qXGEAKTOwAEjCqSrd4bnXqFT96iv4k8";

/*
This API will create Agent for message scrapper, we need to pass name and linkedin cookie
*/

exports.getOpenAiCheckedDate = async (req, res) => {
  try {
    let ret = await openAiCheck.findOne();
    res.send(ret.checkDate);
  } catch (e) {
    console.log("error", e.message);
    res.status(500).send("Something went wrong!!");
  }
};

//MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q SqCg0Sqh5sSp1OYETdyUnv58gwqAISNqi5cCkoL5Qm0
exports.createAgent = (req, res) => {
  sdk.auth(api_key);
  sdk
    .postAgentsSave({
      repeatedLaunchTimes: {
        minute: [6],
        hour: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
        day: [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
        ],
        dow: ["sun", "mon", "tue", "wed", "thu", "fri", "sat"],
        month: [
          "feb",
          "mar",
          "apr",
          "may",
          "jun",
          "jul",
          "aug",
          "sep",
          "oct",
          "nov",
          "dec",
        ],
        timezone: "Asia/Calcutta",
      },
      notifications: {
        mailAutomaticExitSuccess: false,
        mailAutomaticExitError: false,
        mailAutomaticLaunchError: false,
        mailAutomaticTimeError: false,
        mailManualExitSuccess: false,
        mailManualExitError: false,
        mailManualLaunchError: false,
        mailManualTimeError: false,
        slackAutomaticExitSuccess: false,
        slackAutomaticExitError: false,
        slackAutomaticLaunchError: false,
        slackAutomaticTimeError: false,
        slackManualExitSuccess: false,
        slackManualExitError: false,
        slackManualLaunchError: false,
        slackManualTimeError: false,
      },
      org: "phantombuster",
      script: "LinkedIn Inbox Scraper.js",
      branch: "master",
      environment: "release",
      name: req.body.name, //get this name from request
      executionTimeLimit: 60000,
      fileMgmt: "mix",
      fileMgmtMaxFolders: 1,
      maxParallelism: 1,
      maxRetryNumber: 5,
      launchType: "manually",
      argument: {
        inboxFilter: "all",
        sessionCookie: req.body.sessionCookie,
        //sessionCookie: 'AQEDAUMlUyQAOI1vAAABh-UbJmMAAAGILaZUx00AXOmk6TexIstJgJdA5zktbWkVpm9tkHbx5mQ9F0GomIEIMlS1XqljyD2qMZquQt7LhR934L_tHKaUm_8xeZW5HLwnVwy1Z2auClEvkrc7uREvmOEu',
        before: "05-17-2023",
      },
      applyScriptManifestDefaultSettings: true,
    })
    .then(({ data }) => {
      const agent = new Agent({
        agent_id: data.id,
        date: Date(),
      });
      agent.save((err, agent) => {
        if (err) {
          return res.status(500).send({ message: err });
        } else {
          return res.send({
            status: "Successfully created agent",
            data: data,
          });
          // return res.send({message: "User was registered successfully!"});
        }
      });

      console.log(data);
    })
    .catch((err) => {
      res.send({
        status: "error catch",
        data: err,
      });
    });
};
/*
 This API will Launch Agent
 */

exports.launchAgentEntry = async (req, res) => {
  const d = new Date(); // today, now
  const today = d.toISOString().slice(0, 10);
  /*var newDate = new Date(today);
  const userdate = new Date("yy-mm-hh");
  if (req.body.user_id) {
    var user_id = req.body.user_id;
  } else {
    const userdate2 = await User.aggregate([
      {
        $lookup: {
          from: "cookie_datas",
          localField: "_id",
          foreignField: "user_id",
          as: "article_category",
        },
      },

      {
        $sort: {
          date: 1,
        },
      },

      {
        $match: {
          $and: [
            { username: { $ne: "admin" } },
            { "users._id": { $ne: "null" } },
            {
              $or: [{ date: { $lt: newDate } }],
            },
          ],
        },
      },
    ]).limit(1);

    if (userdate2.length === 0) {
      return res.send({
        status: "error",
        msg: "There is no user left to process for today",
      });
    }
    var user_id = userdate2[0]._id;
  }

  // const cookieData = await cookie
  //   .findOne()
  //   .sort({ _id: -1 })
  //   .limit(1);

  const user = await User.findOne({
    $or: [{ date: { $lt: today } }, { date: null }],
  }).sort({ _id: -1 });*/
  const cookieData = await cookie.findOne({}).sort({ _id: -1 });

  const agentData = await Agent.findOne().sort({ _id: -1 });

  if (cookieData) {
    sdk.auth(api_key);
    sdk
      .postAgentsLaunch({
        id: agentData.agent_id,
        argument: {
          inboxFilter: "all",
          sessionCookie: cookieData.cookie_value,
          before: today,
        },
        manualLaunch: true,
      })
      .then(({ data }) => {
        userContainer.create({
          user_id: cookieData.user_id,
          container_id: data.containerId,
          agent_id: agentData.agent_id,
        });
        //User.findOneAndUpdate({_id:cookieData.user_id,},{date:new Date()})

        const filter1 = { _id: cookieData.user_id };
        const update1 = { date: today };
        User.findOneAndUpdate(filter1, update1, { new: true })
          .then(({ data }) => {
            res.send({ status: "successfuly launched", data: data });
          })
          .catch((err) => {
            return res.send({ status: "error", data: err });
          });
      })
      .catch((err) => {
        return res.send({ status: "error", data: err });
      });
  } else {
    return res.send({
      status: "error",
      msg: "There is no user left to process for today",
    });
  }
};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

async function fetchProfile() {
  let return_obj = {};
  await sdk
    .getAgentsFetchOutput({ id: "8602125783871801" })
    .then(async ({ data }) => {
      if (data.status === "running") {
        await delay(3000);
        return_obj = await fetchProfile();
        return;
      }

      if (data.status === "finished") {
        var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
        json_data_link = data.output.match(urlRegex);
        if (json_data_link == null) {
          return_obj = {
            status: "failed",
            message: "Invalid Cookie Value",
          };
          return;
        }
      }

      let responselink = json_data_link[json_data_link.length - 1];
      if (responselink.indexOf(".json") < 0) {
        return_obj = {
          status: "success",
          message: "no new profiles to add",
        };
        return;
      }

      await fetch(responselink, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then(async (json) => {
          let count = 0;
          for (let i = json.length - 1; i >= 0 && i >= json.length - 10; i--) {
            if (json[i].error == null) {
              let ret = await linkedin_user.findOne({
                userLink: json[i].query,
              });
              if (ret == null) {
                await linkedin_user.create({
                  userLink: json[i].query,
                  company: json[i].jobs[0]?.companyName,
                  jobTitle: json[i].jobs[0]?.jobTitle,
                });
                count++;
              }
            }
          }
          return_obj = {
            status: "success",
            message: `${count} linkedin users' profile added`,
          };
        })
        .catch((e) => {
          console.log(e);
          return_obj = {
            status: "failed",
            message: e.message,
          };
        });
    })
    .catch((err) => {
      console.log(err);
      return_obj = {
        status: "failed",
        message: e.message,
      };
    });

  return return_obj;
}

async function getProfile(csv_link) {
  const cookieData = await cookie.findOne({}).sort({ _id: -1 });
  let return_obj = {};

  await sdk
    .postAgentsLaunch({
      id: "8602125783871801",
      argument: {
        sessionCookie: cookieData.cookie_value,
        spreadsheetUrl: csv_link,
        numberOfAddsPerLaunch: 10,
        columnName: "lastMessageFromUrl",
      },
      manualLaunch: true,
    })
    .then(({ data }) => {
      console.log(data);
      return_obj = {
        status: "success",
      };
    })
    .catch((err) => {
      console.log(err);
      return_obj = {
        status: "failed",
        message: err.message,
      };
    });

  if (return_obj.status == "success") {
    return await fetchProfile();
  } else {
    return return_obj;
  }
}

async function fetchInbox(agent_id) {
  let return_obj = {};
  var container_id;

  await sdk
    .getAgentsFetchOutput({ id: agent_id })
    .then(async ({ data }) => {
      apifetchdata = data;
      container_id = data.containerId;

      if (data.status === "running") {
        await delay(2000);
        return_obj = await fetchInbox(agent_id);
        return;
      }

      if (data.status === "finished") {
        var urlRegex = /(((https?:\/\/)|(www\.))[^\s]+)/g;
        json_data_link = data.output.match(urlRegex);
        if (json_data_link == null) {
          return_obj.status = "failed";
          return_obj.message = "Invalid Cookie Value";
          return;
        }

        return_obj.csv_link = json_data_link[0];
        let responselink = json_data_link[1];
        phantom_link.create({ phantomLink: responselink });

        let count = 0;
        await fetch(responselink, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => response.json())
          .then(async (json) => {
            let user_id = await getUserIdFromUserCotnainer(container_id);
            for (let i = 0; i < json.length; i++) {
              var ret = await phantomResponse.findOne({
                user_id: user_id,
                lastMessageDate: json[i].lastMessageDate,
              });
              if (ret == null) {
                json[i]["container_id"] = container_id;
                json[i]["user_id"] = user_id;
                json[i]["openAIChecked"] = false;
                json[i]["isInterested"] = false;

                await phantomResponse.create(json[i]);
                count++;
              }
            }
          })
          .catch((e) => {
            console.log(e);
          });

        return_obj.status = "success";
        return_obj.message = `${count} messages have been Inserted`;
      }
    })
    .catch((err) => {
      return_obj.status = "failed";
      return_obj.message = err.message;
    });

  return return_obj;
}

exports.apiFetchoutputData = async (req, res) => {
  sdk.auth(api_key);

  let agent_id = null;
  if (req.body.user_id) {
    var agentData = await userContainer
      .findOne({ user_id: req.body.user_id })
      .sort({ _id: -1 })
      .limit(1);
  } else {
    var agentData = await userContainer.findOne().sort({ _id: -1 }).limit(1);
  }

  if (agentData == null) {
    return res.send({ msg: "Agent Not Found" });
  }
  agent_id = agentData.agent_id;
  let ret = await fetchInbox(agent_id);

  if (ret.status === "success") {
    let pret = await getProfile(ret.csv_link);
    return res.send({
      status: "success",
      message: ret.message + "\n" + pret.message,
    });
  } else {
    return res.send({
      status: ret.status,
      message: ret.message,
    });
  }
};

/*
This API will delete Agent 
*/
exports.deleteAgentEntry = (req, res) => {
  // return res.send({"name":req.body});
  sdk.auth(api_key);
  sdk
    .postAgentsDelete({ id: req.body.id }) //get this id from request
    .then(({ data }) => {
      res.send({
        status: "successfuly deleted agent",
        data: data,
      });
      console.log(data);
    })
    .catch((err) => {
      res.send({
        status: "error",
        data: err,
      });
    });
};

/*
    This API will return all existing Agent , you can take any id and pass it to launch and fetch scrapped data in fetch api
*/
exports.apiFetchall = async (req, res) => {
  let apiFetchall = "";
  sdk.auth(api_key);
  await sdk
    .getAgentsFetchAll()
    .then(({ data }) => {
      // console.log("data", data)
      apiFetchall = data;
    })
    .catch((err) => console.error(err));

  // return apiFetchall;

  res.send({
    status: "success",
    data: apiFetchall,
  });
};
/*
  This API will return the Agent data only
*/
exports.apiFetchSingleAgentRecords = async (req, res) => {
  let apiData = "";
  sdk.auth(api_key);
  await sdk
    .getAgentsFetch({ id: req.body.id })
    .then(({ data }) => {
      // console.log("data", data)
      apiData = data;
    })
    .catch((err) => console.error(err));

  await userContainer.create({
    user_id: req.body.id,
    container_id: data,
  });
  // return apiData;

  return res.send({
    status: "success",
    data: apiData,
  });
};
/*
  This API will return Linkeidn Messages based on Team name
*/
exports.fetchmessage = async (req, res) => {
  try {
    var limit = req.body.limit,
      page = req.body.page > 0 ? req.body.page : 1,
      skip = (page - 1) * limit;

    if (req.body.team) {
      var arr = [];
      const team = await User.find(
        { team: req.body.team },
        {
          team: 0,
          username: 0,
          email: 0,
          password: 0,
          user_type: 0,
          date: 0,
          __v: 0,
        }
      );

      for (var i = 0; i < team.length; i++) {
        arr.push(team[i]._id);
      }

      let response = await phantomResponse
        .find({ user_id: { $in: arr } })
        .limit(limit)
        .skip(skip);
      var count = await phantomResponse.countDocuments({
        user_id: { $in: arr },
      });

      // return res.send({"data":response,"count":count,"skip":skip});
      let data = { data: response, count: count };

      return res.send({ success: "true", msg: "", data: data });
    } else if (req.headers["x-access-token"]) {
      const authHeader = req.headers["x-access-token"];
      let decoded = jwt.verify(authHeader, config.secret);

      // return res.send({"send":decoded});
      var response = await phantomResponse
        .find({ user_id: decoded.id })
        .limit(limit)
        .skip(skip);

      var count = await phantomResponse.countDocuments({ user_id: decoded.id });

      let data = { data: response, count: count };

      return res.send({ success: "true", msg: "", data: data });
    } else {
      return res.send({
        success: "false",
        msg: "Please send team or header ",
        data: [],
      });
    }
  } catch (error) {
    return res.send({ success: "false", msg: error.message, data: [] });
  }
};

exports.fetchUserMessage = async (req, res) => {
  try {
    if (req.body.userId) {
      var limit = req.body.limit,
        page = req.body.page > 0 ? req.body.page : 1,
        skip = (page - 1) * limit;

      const response = await phantomResponse
        .aggregate([
          {
            $match: {
              user_id: req.body.userId,
              isLastMessageFromMe: false,
            },
          },
          {
            $lookup: {
              from: "linkedin_users",
              localField: "lastMessageFromUrl",
              foreignField: "userLink",
              as: "profile",
            },
          },
        ])
        .limit(limit)
        .skip(skip);

      /*const response = await phantomResponse
        .find({ user_id: req.body.userId, isLastMessageFromMe: false })
        .limit(limit)
        .skip(skip);*/

      var count = await phantomResponse.countDocuments({
        user_id: req.body.userId,
        isLastMessageFromMe: false,
      });
      return res.send({ success: "true", msg: "", data: response, count });
    }

    return res.send({ success: "false", msg: "not found" });
  } catch (error) {
    return res.send({ success: "false", msg: error.message, data: [] });
  }
};

exports.fetchteamuser = async (req, res) => {
  try {
    if (req.query.team) {
      var result = await User.find({ team: req.query.team });

      return res.send({ success: "true", msg: "", data: result });
    } else {
      var result = await User.find();
      return res.send({ success: "true", msg: "", data: result });

      // return res.send({"success":"true","msg":"Please send Team ","data":[]});
    }
  } catch (error) {
    return res.send({ success: "false", msg: error.message, data: [] });
  }
};

exports.responseData = async (req, res) => {
  console.log(req);
  const userResponse = await phantomResponse.findOne().sort({ _id: -1 });
  return res.send({
    status: "success",
    data: "data",
  });
};

async function getUserIdFromUserCotnainer(container_id) {
  try {
    const container_id_user = await userContainer.findOne({
      container_id: container_id,
    });
    return container_id_user.user_id;
  } catch (error) {
    return 0;
  }
}

/*
This API launch Agent for processing api to scrap data
*/
exports.userData = async (req, res) => {
  console.log(user);
  console.log(cookiedata);
  return res.send({
    status: "user data",
    data: user,
    cookie: cookiedata,
    agent: agentData,
    // agent:agentData
  });
};
