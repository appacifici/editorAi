import { Command } from 'commander';
import { writeErrorLog } from '../services/Log/Log';
import CmsAdminApi from '../services/CmsAdmin/CmsAdminApi';

const program = new Command();
program.version('1.0.0').description('CLI team commander')
    .option('-s, --site <type>', 'Sito da lanciare')
    .action(async (options) => { // Aggiungi async qui
        const cmsAdminApi = new CmsAdminApi();
        const processName: string  	= `dinamycScraper`;
        const processLabel: string 	= `dinamycScraper ${options.options} ${options.site}`;
        const alertProcess: string 	= cmsAdminApi.alertUtility.initProcess(processLabel);
        
        await cmsAdminApi.updateProduct(alertProcess,options.site, 0); // Aggiungi await qui
        process.exit(1); // Ora puoi mettere l'exit qui        
        
    });
program.parse(process.argv);
