import { CronJob } 		from 'cron';
import WordpressApi     from '../services/WordpressApi';
import connectMongoDB from '../database/mongodb/connect';
import SitePublication from '../database/mongodb/models/SitePublication';
import Article, { ArticleWithIdType } from '../database/mongodb/models/Article';
import SocketClient from '../services/Socket/SocketClient';

// new CronJob(
// 	'0 12,20 * * *', // cronTime
// 	function () {		
// 		const wodpressApi = new WordpressApi();
//         wodpressApi.sendToWPApi('roma.cronacalive.it', 0); 
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'*/50 * * * *', // cronTime
// 	function () {		
// 		const wodpressApi = new WordpressApi();
//         wodpressApi.sendToWPApi('bluedizioni.it', 0); 
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );



const runCron = async() => {
	await connectMongoDB();
	const sitesPubblication = await SitePublication.find({active:1}).sort({ _id: -1 }).sort({ _id: -1 });

	Object.entries(sitesPubblication).map(async ([key, sitePublication]) => {
		console.log(sitePublication);
		const sitePublicationName:string = sitePublication.sitePublication;
		new CronJob(
			sitePublication.cronSendToWp, // cronTime
			async function () {				        
					const article = await Article.findOne({ sitePublication: sitePublication?._id, genarateGpt: 1, send: 0 }).sort({ lastMod: 1 }) as ArticleWithIdType | null;
					let articleId = null;
					if( article !== null ) {
						articleId = article._id;
					}
					const wodpressApi 									= new WordpressApi();
					const processName:string                			= `sendToWpApi`;
					const processLabel:string                			= `sendToWpApi ${sitePublicationName}`;
					const alertProcess:string               			= wodpressApi.alertUtility.initProcess(processLabel); //. date('YmdHis')					        			
					await wodpressApi.sendToWPApi(alertProcess,sitePublicationName, 0, articleId);			
					await wodpressApi.alertUtility.write(alertProcess, processName, '', sitePublicationName);
				
			},
			null, // onComplete
			true, // start
			'Europe/Rome' // timeZone
		);
	});											
}

const socketClient = new SocketClient();
socketClient.connectClient('CronSendToWpApi');

runCron();