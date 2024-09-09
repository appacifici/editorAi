import { Command }      from 'commander';
import ChatGptApi       from '../services/ChatGptApi';
import OpenAiService    from '../services/OpenAi/OpenAiService';
import AlertUtility     from '../services/Alert/AlertService';
import { NextArticleGenerate } from '../services/OpenAi/Interface/OpenAiInterface';
import searchAmazonProducts from '../services/Amazon/AmazonAffiliationApi';
import { parseConfigFileTextToJson } from 'typescript';
import { ProductsJson } from '../files/apiWrappedAmazon';
import AmazonProductSearch from '../services/Amazon/AmazonAffiliationApi';

const program = new Command();
program.version('1.0.0').description('CLI team commander') 
    .option('-s, --site <type>', 'Sito da lanciare')
    .action(async (options) => { // Definisci la callback come async
        const chatGptApi:    ChatGptApi         = new ChatGptApi();
        const openAiService: OpenAiService      = new OpenAiService();        

        switch (options.site) {                        
            case 'acquistigiusti.it':   
                try {                    
                    
                    const amazonProductSearch = new AmazonProductSearch();              
                    await amazonProductSearch.initialize(); 
                    const producsJson:boolean|Error =  await amazonProductSearch.insertNewProduct(options.site);
                    
                    process.exit(0);
                } catch (error) {
                    console.error('Errore durante l\'esecuzione del comando:', error);
                    process.exit(1); // Uscire con codice di errore
                }
            break; 
        }
    });
program.parse(process.argv);
