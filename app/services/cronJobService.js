const sdk = require("api")("@phantombuster/v1#1mld74kq6w8xui");
const CronJob = require("cron").CronJob;
const {
  openAiCheck,
  phantomResponse,
  phantom_link,
  cookie,
  all_message,
  message_thread,
} = require("./../models");
const moment = require("moment");

const api_key = "UUfDSfo6pWc0qXGEAKTOwAEjCqSrd4bnXqFT96iv4k8";
// const api_key = "Q30e1EZKVoULIZZpyRUsuLnppo38GRaJoMAiOkFwOk0";

const { Configuration, OpenAIApi } = require("openai");
const { user } = require("./../models");
const configuration = new Configuration({
  apiKey: "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",
});
const openai = new OpenAIApi(configuration);

// check last OpenAI API connect time and start timer
const checkLastTime = async () => {
  try {
    let ret = await openAiCheck.findOne();
    if (!ret) {
      ret = await openAiCheck.insertMany({
        checkDate: moment().format("YYYY-MM-DD HH:mm:ss"),
      });
    }

    const time = moment(ret.checkDate);
    const hour = time.format("H");
    const minute = time.format("m");
    const second = time.format("s");
    return `${second} ${minute} ${hour} * * *`;
  } catch (e) {
    console.log(e.message);
    return "0 0 0 * * *";
  }
};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const fetchLastMessages = async () => {
  let return_obj = {};
  await sdk
    .getAgentsFetchOutput({ id: "4841339730641923" })
    .then(async ({ data }) => {
      if (data.status === "running") {
        await delay(3000);
        return_obj = await fetchLastMessages();
        return;
      }

      if (data.status === "finished") {
        var urlRegex = /(((https?:\/\/))[^\s]+)/g;
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
          message: "no new messages to add",
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

          for (let i = 0; i < json.length; i++) {
            if (json[i].error == null) {
              for (let j = 0; j < json[i].messages.length; j++) {
                json[i].messages[j].user_id = "647e65ced03c930014645ffe";
              }
              await all_message.create(json[i].messages);
              count++;
            }
          }

          return_obj = {
            status: "success",
            message: `${count} message threads added`,
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

const getLastMessages = async () => {
  const link = await phantom_link.findOne({}).sort({ _id: -1 });
  const cookieData = await cookie.findOne({}).sort({ _id: -1 });
  let return_obj = {};
  // let phantomLink = link.phantomLink;
  let phantomLink = link.phantomLink.replace(".json", ".csv");

  sdk.auth(api_key);
  await sdk
    .postAgentsLaunch({
      id: "4841339730641923",
      argument: {
        sessionCookie: cookieData.cookie_value,
        spreadsheetUrl: phantomLink,
        columnName: "threadUrl",
        profilesPerLaunch: 100,
        messagesPerExtract: 5,
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

  let ret = await fetchLastMessages();
  console.log(ret);
  /*
  if (return_obj.status == "success") {
    return await fetchLastMessages();
  } else {
    return return_obj;
  }*/
};

const fetchMessageThread = async (threadUrl) => {
  await sdk
    .getAgentsFetchOutput({ id: "4841339730641923" })
    .then(async ({ data }) => {
      if (data.status === "running") {
        await delay(3000);
        return_obj = await fetchMessageThread(threadUrl);
        return;
      }

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

      let responselink = json_data_link[json_data_link.length - 1];
      if (responselink.indexOf(".json") < 0) {
        return_obj = {
          status: "failed",
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
          for (let i = 0; i < json.length; i++) {
            if (json[i].error == null) {
              await all_message.create(json[i].messages);
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
          };
        });
    })
    .catch((err) => {
      console.log(err);
      return_obj = {
        status: "failed",
      };
    });

  return return_obj;
};

const getMessageThread = async (threadUrl) => {
  const cookieData = await cookie.findOne({}).sort({ _id: -1 });
  sdk.auth(api_key);
  await sdk
    .postAgentsLaunch({
      id: "4841339730641923",
      argument: {
        sessionCookie: cookieData.cookie_value,
        spreadsheetUrl: threadUrl,
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
  return await fetchMessageThread(threadUrl);
};

const connectOpenAI = async () => {
  try {
    let ret = await phantomResponse.find({
      openAIChecked: false,
      isLastMessageFromMe: false,
    });

    for (let i = 0; i < ret.length; i++) {
      let prompt =
        "I sell marketing and outreach sevices. Based on the following conversation -  is this person interested in having a conversion with me as prospective buyer or is interested in purchasing mu devices? Answer only is YES or NO. Do not explain, do not self reference. Only provide this one word answer. This is the conversation.\n";

      let messageThread = await getMessageThread(ret[i].threadUrl);
      let messages = null;
      if (messageThread.status === "failed") {
        messages = await all_message.find({
          conversationUrl: ret[i].threadUrl,
        });
      } else {
        messages = messageThread.messages;
      }
      if (messages == null) continue;
      for (let j = 0; j < messages.length; j++) {
        let message = messages[j].message.replace(/\n/g, " ");
        if (messages[j].firstName === ret[i].firstnameFrom) {
          prompt += `${messages[j].firstName}: ${message}\n`;
        } else {
          prompt += `me: ${message}\n`;
        }
      }

      try {
        let apiResponse = false;
        const response = await openai.createCompletion({
          model: "text-davinci-003",
          prompt,
          max_tokens: 3000,
          top_p: 1,
          frequency_penalty: 0.5,
          presence_penalty: 0,
        });
        if (response?.data?.choices?.length) {
          if (response?.data?.choices[0].text.toLowerCase().includes("yes")) {
            apiResponse = true;
          }
        }
        await phantomResponse.updateOne(
          { _id: ret[i]._id },
          { $set: { isInterested: apiResponse, openAIChecked: true } }
        );
      } catch (err) {
        console.log(err);
      }
    }

    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

const checkQualityScore = async () => {
  try {
    let ret = await phantomResponse.find({
      isInterested: true,
    });

    let score = 0;
    for (let i = 0; i < ret.length; i++) {
      if (ret[i].qualityScore != -1) {
        score += ret[i].qualityScore;
        continue;
      }
      let prompt = `You are an expert SDR, BDR and sales coach. Look at this conversation, and provide the score from 0-100 for how good the answer of ${ret[i].firstnameFrom} was. Do not self reference. Your answer should only contain the score and nothing else. This is the conversation.\n`;
      let messageThread = await all_message.find({
        url: ret[i].threadUrl,
      });
      for (let j = 0; j < messageThread.length; j++) {
        let message = messageThread[j].message.replace(/\n/g, " ");
        if (messageThread[j].connectionDegree === "You") {
          prompt += `me: ${message}\n`;
        } else {
          prompt += `${messageThread[j].firstName}: ${message}\n`;
        }
      }

      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt,
        max_tokens: 3000,
        top_p: 1,
        frequency_penalty: 0.5,
        presence_penalty: 0,
      });
      if (response?.data?.choices?.length) {
        let val = parseInt(response?.data?.choices[0].text);
        score += val;
        await phantomResponse.updateOne(
          { _id: ret[i]._id },
          { qualityScore: val }
        );
      }
    }
    await user.updateOne(
      { _id: "647e65ced03c930014645ffe" },
      { $set: { quality_score: score / ret.length } }
    );
  } catch (err) {
    console.log(err.message);
  }
};

const checkTTA = async () => {
  try {
    let ret = await phantomResponse.find({
      isInterested: true,
    });
    let tta = 0;
    for (let i = 0; i < ret.length; i++) {
      let message = await all_message.findOne({
        date: {
          $gt: ret[i].lastMessageDate,
        },
        conversationUrl: ret[i].threadUrl,
      });
      if (message != null) {
        tta += (moment(message.date) - moment(ret[i].lastMessageDate)).hour();
      }
    }
    await user.updateOne(
      { _id: "647e65ced03c930014645ffe" },
      { $set: { tta_value: tta / ret.length } }
    );
  } catch (err) {
    console.log(err.message);
  }
};

// connect to OpenAI API and save checked time
const saveCheckTime = async () => {
  try {
    let ret = await getLastMessages();
    if (!ret) return;

    ret = await connectOpenAI();
    if (!ret) return;

    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    await openAiCheck.updateOne({}, { $set: { checkDate: currentTime } });
    console.log("Last Check OpenAI: ", currentTime);
  } catch (e) {
    console.log(e.message);
  }
};

cronJobService = async () => {
  const scheduleTime = await checkLastTime();
  const checkOpenAISchedule = new CronJob(scheduleTime, saveCheckTime);
  checkOpenAISchedule.start();

  // await getLastMessages();
  // await checkTTA(); 
  // await checkQualityScore();
  // await connectOpenAI();
  // await phantomResponse.updateMany({}, {openAIChecked: false, isInterested: false});
  // await phantomResponse.updateMany({}, { qualityScore: -1, ttaValue: -1 });

  // let message = await all_message.findOne({
  //   date: {
  //     $gt: "2023-06-08T19:42:22.099Z",
  //   },
  //   conversationUrl:
  //     "https://www.linkedin.com/messaging/thread/2-NzkzODMwOGItM2I1Yy00MTRmLWExMzAtY2Q3NWQ2MDY1ZTBkXzAxMA==",
  // });
  // console.log(message);
};

module.exports = cronJobService;
