const sdk = require("api")("@phantombuster/v1#1mld74kq6w8xui");
const api_key = "UUfDSfo6pWc0qXGEAKTOwAEjCqSrd4bnXqFT96iv4k8";

const {
  phantomResponse,
  phantom_link,
  cookie,
  phantom_agent,
  linkedin_user,
  all_message,
} = require("./../models");

// delay function - ms: milliseconds for delay
const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// fetch profile function
exports.fetchProfile = async () => {
  let return_obj = {};

  // call api to fetch data from profile agent
  await sdk
    .getAgentsFetchOutput({ id: "8602125783871801" })
    .then(async ({ data }) => {
      // if agent status is running, delay 3s and call function again
      if (data.status === "running") {
        await delay(3000);
        return_obj = await this.fetchProfile();
        return;
      }

      // if agent status is finished, get possible links from output
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

      // get json link (json link is at the end of links)
      let responselink = json_data_link[json_data_link.length - 1];
      // check if the last link is not json link
      if (responselink.indexOf(".json") < 0) {
        return_obj = {
          status: "success",
          message: "no new profiles to add",
        };
        return;
      }

      // all json link and fetch json format data
      await fetch(responselink, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then(async (json) => {
          // add fetched profile to db
          let count = 0; // added profile count
          for (let i = json.length - 1; i >= 0; i--) {
            if (json[i].error == null) {
              await linkedin_user.create({
                userLink: json[i].query,
                company: json[i].jobs[0]?.companyName,
                jobTitle: json[i].jobs[0]?.jobTitle,
              });
              count++;
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
};

// launch profile agent - profileLink: specified linkedin user link
exports.launchProfileAgent = async (user_id, profileLink) => {
  let return_obj = {};
  const cookieData = await cookie.findOne({ user_id }).sort({ _id: -1 }); // get last cookie data

  // authenticate to the phantom api with api key
  sdk.auth(api_key);

  // launch profile scrapper agent
  await sdk
    .postAgentsLaunch({
      id: "8602125783871801",
      argument: {
        sessionCookie: cookieData.cookie_value,
        spreadsheetUrl: profileLink,
        onlyCurrentJson: true, // get json file for only current user profile
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

  return return_obj;
};

// launch agent function
exports.launchAgentEntry = async (user_id) => {
  let return_obj = {};

  const cookieData = await cookie.findOne({ user_id }).sort({ _id: -1 }); // find the last cookie data
  const agentData = await phantom_agent.findOne().sort({ _id: -1 }); // find the last agent data

  if (cookieData) {
    // authenticate to the phantom api with api key
    sdk.auth(api_key);

    // launch inbox scrapper agent
    await sdk
      .postAgentsLaunch({
        id: agentData.agent_id, // agent id
        argument: {
          inboxFilter: "all", // inbox type - "all": get all messages
          sessionCookie: cookieData.cookie_value, //  cookie value
          numberOfThreadsToScrape: 500, // number of threads to scrape
        },
        manualLaunch: true, // manually laucnh
      })
      .then(({ data }) => {
        // success
        return_obj = {
          status: "success",
          msg: "inbox scrapper agent successfully launched",
        };
      })
      .catch((err) => {
        // error
        return_obj = {
          status: "failed",
          msg: err.message,
        };
      });
  } else {
    // no cookie data
    return_obj = {
      status: "failed",
      msg: "cookie value not exist",
    };
  }

  return return_obj;
};

// fetch inbox messages
exports.fetchInbox = async (user_id, agent_id) => {
  let return_obj = {};

  sdk.auth(api_key);
  await sdk
    .getAgentsFetchOutput({ id: agent_id })
    .then(async ({ data }) => {
      // if agent status is running, delay 2s and call function again
      if (data.status === "running") {
        await delay(2000);
        return_obj = await this.fetchInbox(agent_id);
        return;
      }

      // if agent status is finished, get possible links from output
      if (data.status === "finished") {
        var urlRegex = /(((https?:\/\/))[^\s]+)/g;
        json_data_link = data.output.match(urlRegex);
        if (json_data_link == null) {
          return_obj = {
            status: "failed",
            message: "invalid cookie value",
          };
          return;
        }

        // get json link and save link to db
        let responselink = json_data_link[1];
        phantom_link.create({ phantomLink: responselink });

        // fetch json data from link
        let count = 0; // added message count
        await fetch(responselink, {
          method: "GET",
          headers: {
            Accept: "application/json",
          },
        })
          .then((response) => response.json())
          .then(async (json) => {
            let addedMessages = [];
            for (let i = 0; i < json.length; i++) {
              // check if the message is already in db
              var ret = await phantomResponse.findOne({
                user_id: user_id,
                lastMessageDate: json[i].lastMessageDate,
              });
              // if new to db, add columns and create
              if (ret == null) {
                json[i]["user_id"] = user_id;
                json[i]["openAIChecked"] = false;
                json[i]["isInterested"] = false;
                json[i]["ttaValue"] = -1;
                json[i]["qualityScore"] = -1;

                await phantomResponse.create(json[i]);
                addedMessages[count++] = json[i];
              }
            }
            return_obj = {
              status: "success",
              message: `${count} messages have been Inserted`,
              messages: addedMessages,
            };
          })
          .catch((e) => {
            console.log(e);
            return_obj = {
              status: "failed",
              message: e.message,
            };
          });
      }
    })
    .catch((err) => {
      console.log(err);
      return_obj.status = "failed";
      return_obj.message = err.message;
    });

  return return_obj;
};

// launch message thread scrapper agent
exports.launchMessageThread = async (user_id, threadUrl) => {
  const cookieData = await cookie.findOne({ user_id }).sort({ _id: -1 });

  sdk.auth(api_key);
  await sdk
    .postAgentsLaunch({
      id: "4841339730641923",
      argument: {
        sessionCookie: cookieData.cookie_value,
        spreadsheetUrl: threadUrl,
        noDatabase: true, // get message even it is scrapped before
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

  return return_obj;
};

// fetch data from message thread scrapper agent
exports.fetchMessageThread = async () => {
  sdk.auth(api_key);
  // call fetch agent output api
  await sdk
    .getAgentsFetchOutput({ id: "4841339730641923" })
    .then(async ({ data }) => {
      // if agent status is running, delay 3s and call function again
      if (data.status === "running") {
        await delay(3000);
        return_obj = await this.fetchMessageThread();
        return;
      }

      // if agent status is finished, get possible links from output
      if (data.status === "finished") {
        var urlRegex = /(((https?:\/\/))[^\s]+)/g;
        json_data_link = data.output.match(urlRegex);
        if (json_data_link == null) {
          return_obj = {
            status: "failed",
          };
          return;
        }
      }

      // get json link at the end of links
      let responselink = json_data_link[json_data_link.length - 1];
      // check if last link is json
      if (responselink.indexOf(".json") < 0) {
        return_obj = {
          status: "failed",
        };
        return;
      }

      // call link and get json data
      await fetch(responselink, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
        .then((response) => response.json())
        .then(async (json) => {
          // for all messages check if it already exists in db, if not save to db
          for (let i = 0; i < json[0].messages.length; i++) {
            let ret = await all_message.findOne({
              date: json[0].messages[i].date,
            });
            if (ret == null) {
              await all_message.create(json[0].messages[i]);
            }
          }
          return_obj = {
            status: "success",
            messages: json[0].messages,
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
        message: err.message,
      };
    });

  return return_obj;
};
