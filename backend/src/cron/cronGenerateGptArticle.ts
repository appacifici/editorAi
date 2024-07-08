import { CronJob } 					from 'cron';
import OpenAiService 				from '../services/OpenAi/OpenAiService';
import { NextArticleGenerate } 		from '../services/OpenAi/Interface/OpenAiInterface';
import SitePublication 	 			from '../database/mongodb/models/SitePublication';
import connectMongoDB 				from '../database/mongodb/connect';
import SocketClient 				from '../services/Socket/SocketClient';

const runCron = async() => {
	await connectMongoDB();

	const sitesPubblication = await SitePublication.find({active:1}).sort({ _id: -1 }).sort({ _id: -1 });
	Object.entries(sitesPubblication).map(async ([key, sitePublication]) => {
		console.log(sitePublication);
		const sitePublicationName:string = sitePublication.sitePublication;
		new CronJob(
			sitePublication.cronGenerateAi, // cronTime
			async function () {		
		        const openAiService: OpenAiService  					= new OpenAiService();
				const nextArticleGenerate:NextArticleGenerate|null 		= await openAiService.getNextArticleGenerate(sitePublicationName, 0);
				if( nextArticleGenerate !== null && nextArticleGenerate.article !== null && nextArticleGenerate.site !== null) {
					const processName:string                			= `generateGptArticle`;
					const processLabel:string                			= `generateGptArticle ${sitePublicationName} ${nextArticleGenerate.article._id}`;
					const alertProcess:string               			= openAiService.alertUtility.initProcess(processLabel); //. date('YmdHis')
					openAiService.alertUtility.setLimitWrite(60000);

					await openAiService.runPromptAiArticle(alertProcess, processName, sitePublicationName, sitePublication.promptAiId, 0,null);
					await openAiService.alertUtility.write(alertProcess, processName, nextArticleGenerate.site.site, sitePublicationName, nextArticleGenerate.article._id);
				}
			},
			null, // onComplete
			true, // start
			'Europe/Rome' // timeZone
		);
	});											
}

const socketClient = new SocketClient();
socketClient.connectClient('CronGenerateGptArticle');

runCron();