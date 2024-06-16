import { Command }      from 'commander';
import ChatGptApi       from '../services/ChatGptApi';
import OpenAiService    from '../services/OpenAi/OpenAiService';
import AlertUtility     from '../services/Alert/AlertService';
import { NextArticleGenerate } from '../services/OpenAi/Interface/OpenAiInterface';

const program = new Command();
program.version('1.0.0').description('CLI team commander') 
    .option('-s, --site <type>', 'Sito da lanciare')
    .action(async (options) => { // Definisci la callback come async
        const chatGptApi:    ChatGptApi         = new ChatGptApi();
        const openAiService: OpenAiService      = new OpenAiService();        

        switch (options.site) {                        
            case 'roma.cronacalive.it':   
                try {                    
                    const openAiService: OpenAiService  					= new OpenAiService();
                    const nextArticleGenerate:NextArticleGenerate|null 		= await openAiService.getNextArticleGenerate('roma.cronacalive.it', 0);
                    if( nextArticleGenerate !== null && nextArticleGenerate.article !== null && nextArticleGenerate.site !== null) {
                        const processName:string                			= `generateGptArticle`;
                        const processLabel:string                			= `generateGptArticle roma.cronacalive.it ${nextArticleGenerate.article._id}`;
                        const alertProcess:string               			= openAiService.alertUtility.initProcess(processLabel); //. date('YmdHis')
                        openAiService.alertUtility.setLimitWrite(60000);
            
                        await openAiService.getInfoPromptAi(alertProcess, processName, 'roma.cronacalive.it', "663cf6a56b400c009341d274", 0, null);
                        await openAiService.alertUtility.write(alertProcess, processName, nextArticleGenerate.site.site, 'roma.cronacalive.it');
                    }
                    process.exit(0);
                } catch (error) {
                    console.error('Errore durante l\'esecuzione del comando:', error);
                    process.exit(1); // Uscire con codice di errore
                }
                break; 
            case 'bluedizioni.it':    
                try {
                    const openAiService: OpenAiService  					= new OpenAiService();
                    const nextArticleGenerate:NextArticleGenerate|null 		= await openAiService.getNextArticleGenerate('bluedizioni.it', 0);
                    if( nextArticleGenerate !== null && nextArticleGenerate.article !== null && nextArticleGenerate.site !== null) {
                        const processName:string                			= `generateGptArticle`;
                        const processLabel:string                			= `generateGptArticle bluedizioni.it ${nextArticleGenerate.article._id}`;
                        const alertProcess:string               			= openAiService.alertUtility.initProcess(processLabel); //. date('YmdHis')
                        openAiService.alertUtility.setLimitWrite(60000);
                        await openAiService.getInfoPromptAi(alertProcess, processName, 'bluedizioni.it', "65fdb1790b624b6378727c21", 0, null);
                        await openAiService.alertUtility.write(alertProcess, processName, nextArticleGenerate.site.site, 'bluedizioni.it', nextArticleGenerate.article._id);
                    }
                    process.exit(0);
                } catch (error) {
                    console.error('Errore durante l\'esecuzione del comando:', error);
                    process.exit(1); // Uscire con codice di errore
                }
                break;           
            default:
                console.error('Sito non supportato:', options.site);
                process.exit(1); // Uscire con codice di errore se il sito non è supportato
        }
    });
program.parse(process.argv);
