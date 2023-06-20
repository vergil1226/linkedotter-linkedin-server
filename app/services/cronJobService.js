const sdk = require("api")("@phantombuster/v1#1mld74kq6w8xui");
const CronJob = require("cron").CronJob;
const {
  openAiCheck,
  phantomResponse,
  phantom_link,
  cookie,
  all_message,
} = require("./../models");
const moment = require("moment");

const api_key = "UUfDSfo6pWc0qXGEAKTOwAEjCqSrd4bnXqFT96iv4k8";
// const api_key = "Q30e1EZKVoULIZZpyRUsuLnppo38GRaJoMAiOkFwOk0";

const { Configuration, OpenAIApi } = require("openai");
const { user } = require("./../models");
const {
  launchAgentEntry,
  fetchInbox,
  launchProfileAgent,
  fetchProfile,
  launchMessageThread,
  fetchMessageThread,
} = require("./agentService");
const linkedn_user = require("../models/linkedin_user.model");
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

const connectOpenAI = async () => {
  try {
    let ret = await phantomResponse.find({
      openAIChecked: false,
      isLastMessageFromMe: false,
    });

    for (let i = 0; i < ret.length; i++) {
      let prompt =
        "I sell marketing and outreach sevices. Based on the following conversation -  is this person interested in having a conversion with me as prospective buyer, is interested in purchasing my services, or interested in speaking to me further (even if they dont want a sales pitch)? Answer only is YES or NO. Do not explain, do not self reference. Only provide this one word answer. This is the conversation.\n";

      let messages = await all_message.find({
        conversationUrl: ret[i].threadUrl,
      });

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

const checkQualityScore = async (user_id) => {
  try {
    let ret = await phantomResponse.find({
      isInterested: true,
      user_id
    });

    let score = 0,
      count = 0;
    for (let i = 0; i < ret.length; i++) {
      if (ret[i].qualityScore != -1) {
        score += ret[i].qualityScore;
        continue;
      }
      let prompt = `You are an expert SDR, BDR and sales coach. Look at this conversation, and provide the score from 0-100 for how good the answer of me was. Do not self reference. Your answer should only contain the score and nothing else. This is the conversation.\n`;
      let messageThread = await all_message.find({
        url: ret[i].threadUrl,
      });
      for (let j = 0; j < messageThread.length; j++) {
        let message = messageThread[j].message.replace(/\n/g, " ");
        if (messageThread[j].firstName !== ret[i].firstnameFrom) {
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
        let val = parseInt(response?.data?.choices[0].text.replace(/\D/g, ""));
        score += val;
        await phantomResponse.updateOne(
          { _id: ret[i]._id },
          { qualityScore: val }
        );
        count++;
      }
    }
    if (count == 0) return;
    await user.updateOne(
      { _id: user_id },
      { $set: { quality_score: score / count } }
    );
  } catch (err) {
    console.log(err.message);
  }
};

const checkTTA = async (user_id) => {
  try {
    let ret = await phantomResponse.find({
      isInterested: true,
      user_id
    });
    let tta = 0,
      count = 0;
    for (let i = 0; i < ret.length; i++) {
      let message = await all_message.findOne({
        date: {
          $gt: ret[i].lastMessageDate,
        },
        conversationUrl: ret[i].threadUrl,
      });
      if (message != null) {
        tta += moment
          .duration(moment(message.date).diff(moment(ret[i].lastMessageDate)))
          .asHours();
        count++;
      }
    }

    if (count == 0) return;
    await user.updateOne(
      { _id: user_id },
      { $set: { tta_value: tta / count } }
    );
  } catch (err) {
    console.log(err.message);
  }
};

// connect to OpenAI API and save checked time
const saveCheckTime = async () => {
  try {
    const users = await user.find({
      username: {
        $ne: "admin",
      },
    });
    for (let i = 0; i < users.length; i++) {
      await this.runProcess(users._id);
    }

    const currentTime = moment().format("YYYY-MM-DD HH:mm:ss");
    await openAiCheck.updateOne({}, { $set: { checkDate: currentTime } });
    console.log("Last Check OpenAI: ", currentTime);
  } catch (e) {
    console.log(e.message);
  }
};

runProcess = async (user_id) => {
  let ret = await launchAgentEntry(user_id);
  if (ret.status == "failed") return;
  ret = await fetchInbox(user_id, "3954653220496213");

  let messages = ret.messages;
  for (let i = 0; i < messages.length; i++) {
    let pro = await linkedn_user.findOne({
      userLink: messages[i].lastMessageFromUrl,
    });
    if (pro == null) {
      let result = await launchProfileAgent(
        user_id,
        messages[i].lastMessageFromUrl
      );
      if ((result.status = "success")) {
        await fetchProfile();
      }
    }
  }

  for (let i = messages.length - 1; i >= 0; i--) {
    console.log(i);
    let result = await launchMessageThread(user_id, messages[i].threadUrl);
    if (result.status == "success") {
      await fetchMessageThread();
    }
  }

  await connectOpenAI();
  await checkTTA(user_id);
  await checkQualityScore(user_id);
};

cronJobService = async () => {
  const scheduleTime = await checkLastTime();
  const checkOpenAISchedule = new CronJob(scheduleTime, saveCheckTime);
  checkOpenAISchedule.start();

  // await phantomResponse.updateMany({}, {qualityScore: -1});
  // await runProcess("648ff2235604ed00140de2ac");
  /*const users = await user.find({
    username: {
      $ne: "admin",
    },
  });
  for (let i = 0; i < users.length; i++) {
    await this.runProcess(users[i]._id);
  }*/
  // await checkTTA();
};

module.exports = { runProcess, cronJobService };
