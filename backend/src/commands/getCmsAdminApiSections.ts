import { Command }      from 'commander';
import CmsAdminApi      from '../services/CmsAdmin/CmsAdminApi';

const program = new Command();
program.version('1.0.0').description('CLI team commander') 
    .option('-s, --site <type>', 'Sito da lanciare')
    .action((options) => {                                                                                            
        const cmsAdminApi = new CmsAdminApi();
        switch( options.site ) {            
            case 'acquistigiusti.it':                       
                cmsAdminApi.getApiSections(options.site);        
            break;
        } 
    });
program.parse(process.argv);

//NODE_ENV=development npx ts-node src/commands/sendToWpApi.ts -s vanityfair.it