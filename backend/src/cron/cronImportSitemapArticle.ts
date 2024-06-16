import { CronJob }      from 'cron';
import DinamycScraper from '../siteScrapers/api/DinamycScraper';
import connectMongoDB from '../database/mongodb/connect';
import Site from '../database/mongodb/models/Site';
import SocketClient from '../services/Socket/SocketClient';


const runCron = async() => {
	await connectMongoDB();
	const sites = await Site.find({active:1}).sort({ _id: -1 }).sort({ _id: -1 });

	Object.entries(sites).map(async ([key, site]) => {
		console.log(sites);
		const siteName:string = site.site;

		new CronJob(
			site.cronImportSitemap, // cronTime
			async function () {				        
					const dinamycScraper 								= new DinamycScraper(site.format,siteName);
					const processName:string                			= `importSitemapArticle`;
					const processLabel: string 							= `importSitemapArticle ${site.sitePublication} ${site.site}`;
					const alertProcess:string               			= dinamycScraper.alertUtility.initProcess(processLabel); //. date('YmdHis')	
					dinamycScraper.alertUtility.setLimitWrite(60000); 
					dinamycScraper.init(alertProcess, processName);				        			
					await dinamycScraper.alertUtility.write(alertProcess, processName, site.site, site.sitePublication);
				
			},
			null, // onComplete
			true, // start
			'Europe/Rome' // timeZone
		);
	});											
}

runCron();

const socketClient = new SocketClient();
socketClient.connectClient('CronImportSitemapArticle');

// new CronJob(
// 	//'*/30 * * * *', //ogni 30 minuti
// 	'20 * * * *', // 00:30 1:30 2:30
// 	function () {		
//         // new Vanityfair('readSitemap');  
// 		new DinamycScraper('readSitemap','vanityfair.it');    
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'22 * * * *', // cronTime
// 	function () {		
//         // new IlCorriereDellaCitta('readSitemap');      
// 		new DinamycScraper('readSitemap','ilcorrieredellacitta.com');
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'24 * * * *', // cronTime
// 	function () {		
//         // new RomaToday('readGzSitemap');      
// 		new DinamycScraper('readGzSitemap','romatoday.it');
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );


// new CronJob(
// 	'26 * * * *', // cronTime
// 	function () {		
// 		new DinamycScraper('readSitemap','galleriaborghese.it');
		    
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'28 * * * *', // cronTime
// 	function () {		  
// 		new DinamycScraper('readSitemap','blueshouse.it');  
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'30 * * * *', // cronTime
// 	function () {		
//         new DinamycScraper('readSitemap','arabonormannaunesco.it');      
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'32 * * * *', // cronTime
// 	function () {		        
// 		new DinamycScraper('readSitemap', 'inabruzzo.it');       
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'34 * * * *', // cronTime
// 	function () {		
// 		new DinamycScraper('readSitemap', 'ilciriaco.it');       
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'36 * * * *', // cronTime
// 	function () {		
// 		new DinamycScraper('readSitemap', 'larchitetto.it');       
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'38 * * * *', // cronTime
// 	function () {		
// 		new DinamycScraper('readSitemap', 'biopianeta.it');       
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );

// new CronJob(
// 	'40 * * * *', // cronTime
// 	function () {		
// 		new DinamycScraper('readSitemap', 'wineandfoodtour.it');       
// 	}, // onTick
// 	null, // onComplete
// 	true, // start
// 	'Europe/Rome' // timeZone
// );