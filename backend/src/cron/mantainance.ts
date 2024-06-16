import { CronJob } 		from 'cron';
import { deleteOldAlerts } from '../services/Mongoose/MoongoseService';


new CronJob(
	'* * * * *', // cronTime
	function () {		
		deleteOldAlerts(48);        
	}, // onTick
	null, // onComplete
	true, // start
	'Europe/Rome' // timeZone
);