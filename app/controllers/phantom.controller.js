const sdk = require('api')('@phantombuster/v1#1mld74kq6w8xui');
  

exports.delete =  (req,res) => {
    // return res.send({"name":req.body});
    sdk.auth('MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q');
    sdk.postAgentsDelete({id: req.body.id})//get this id from request
      .then(({ data }) => {
        res.send({
            status : "successfuly deleted agent",
            data:data
          });
         console.log(data)})
      .catch(( err ) => 
      {
        res.send({
          status : "error",
          data:err
        })
        } 
      );

     
}

exports.launch = (req,res) =>
{
    
    sdk.auth('MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q');
    sdk.postAgentsLaunch({
      id: req.body.id,
    //   '5995136150519362',//get this id from request
      argument: {
        inboxFilter: 'all',
        sessionCookie: req.body.sessionCookie,
        //sessionCookie: 'AQEDAUMlUyQAOI1vAAABh-UbJmMAAAGILaZUx00AXOmk6TexIstJgJdA5zktbWkVpm9tkHbx5mQ9F0GomIEIMlS1XqljyD2qMZquQt7LhR934L_tHKaUm_8xeZW5HLwnVwy1Z2auClEvkrc7uREvmOEu',
        before: '05-17-2023'
      },
      manualLaunch: true
    })
      .then(({ data }) => {
         res.send({
            status : "successfuly launched",
            data:data
          });
        console.log(data)})
      .catch(( err ) => 
      {
        res.send({
          status : "error",
          data:err
        })
        } 
      );

      
} 

exports.create = (req,res) =>
{
    
    sdk.auth('MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q');
    sdk.postAgentsSave({
      repeatedLaunchTimes: {
        minute: [6],
        hour: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22],
        day: [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
          24,
          25,
          26,
          27,
          28,
          29,
          30,
          31
        ],
        dow: ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
        month: ['feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'],
        timezone: 'Asia/Calcutta'
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
        slackManualTimeError: false
      },
      org: 'phantombuster',
      script: 'LinkedIn Inbox Scraper.js',
      branch: 'master',
      environment: 'release',
      name: req.body.name,//get this name from request
      executionTimeLimit: 60000,
      fileMgmt: 'mix',
      fileMgmtMaxFolders: 1,
      maxParallelism: 1,
      maxRetryNumber: 5,
      launchType: 'manually',
      argument: {
        inboxFilter: 'all',
        sessionCookie: req.body.sessionCookie,
        //sessionCookie: 'AQEDAUMlUyQAOI1vAAABh-UbJmMAAAGILaZUx00AXOmk6TexIstJgJdA5zktbWkVpm9tkHbx5mQ9F0GomIEIMlS1XqljyD2qMZquQt7LhR934L_tHKaUm_8xeZW5HLwnVwy1Z2auClEvkrc7uREvmOEu',
        before: '05-17-2023'
      },
      applyScriptManifestDefaultSettings: true
    })
      .then(({ data }) => {
        res.send({
            status : "Successfully created agent",
            data:data
          })
        console.log(data);})
      .catch(( err ) => 
      {
        res.send({
          status : "error",
          data:err
        })
        }
      );


      
    
}

exports.apiOut = async (req,res) => {
    let apifetchdata = "";
sdk.auth('MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q');
await sdk.getAgentsFetchOutput({id: req.body.id})
  .then(({ data }) => {
    //console.log(data)
    apifetchdata = data;
})
  .catch(err => console.error(err));

  // return apifetchdata;

  res.send({
    status : "success",
    data: apifetchdata
  })
}


exports.apiFet = async (req,res) => {
	let apiFetchall = "";
	sdk.auth('MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q');
	await sdk.getAgentsFetchAll()
		.then(({ data }) => {
			// console.log("data", data)
			apiFetchall = data
		})
		.catch(err => console.error(err));


	// return apiFetchall;

	res.send({
		status: "success",
		data: apiFetchall
	  })
}


exports.apiCall = async (req,res) => {
	let apiData = "";
	sdk.auth('MIdlWFYwQRCINIBNaaWZ6QRw4MEvN5wJYDymKMqeC4Q');
	await sdk.getAgentsFetch({ id: req.body.id })
		.then(({ data }) => {
			// console.log("data", data)
			apiData = data
		})
		.catch(err => console.error(err));


	// return apiData;

	return res.send({
		status: "success",
		data: apiData
	})
}

// module.exports = apiCall;

// module.exports = apiFet;
  
  
    