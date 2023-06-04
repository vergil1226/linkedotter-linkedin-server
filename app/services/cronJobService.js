const CronJob = require("cron").CronJob;
const { openAiCheck, phantomResponse } = require("./../models");
const moment = require("moment");

const { Configuration, OpenAIApi } = require("openai");
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
      let apiResponse = false;
      let prompt = `I sell marketing and outreach sevices. Based on the following conversation -  is this person interested in having a conversion with me as prospective buyer or is interested in purchasing mu devices? Answer only is YES or NO. Do not explain, do not self reference. Only provide this one word answer. This is the conversation - ${ret[i].message}`;
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
    }

    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};

// connect to OpenAI API and save checked time
const saveCheckTime = async () => {
  try {
    let ret = await connectOpenAI();
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
};

module.exports = cronJobService;
