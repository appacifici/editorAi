
import dotenv                                               from 'dotenv';
import OpenAI                                               from "openai";
import MarkdownIt                                           from 'markdown-it';
import cheerio                                              from 'cheerio';
import { DOMParser }                                        from 'xmldom';

import SitePublication, { SitePublicationWithIdType }       from '../../database/mongodb/models/SitePublication';
import PromptAi, { PromptAiWithIdType }                     from "../../database/mongodb/models/PromptAi";
import connectMongoDB                                       from "../../database/mongodb/connect";
import Article, { ArticleWithIdType }                       from '../../database/mongodb/models/Article';
import { 
    ChatCompletionCreateParamsNonStreaming, 
    ChatCompletionUserMessageParam}                         from 'openai/resources';
import { 
    ACTION_CREATE_DATA_SAVE, 
    ACTION_UPDATE_SCHEMA_ARTICLE,
    TYPE_IN_JSON, 
    TYPE_READ_STRUCTURE_FIELD, 
    TYPE_READ_FROM_DATA_PROMPT_AND_ARTICLE,
    PromptAICallInterface, 
    PromptAiCallsInterface, 
    StructureChapter, 
    StructureChaptersData, 
    ACTION_WRITE_BODY_ARTICLE,
    ACTION_WRITE_TOTAL_ARTICLE,
    ACTION_CALLS_COMPLETE,
    TYPE_READ_WRITE_DYNAMIC_SCHEMA,
    TypeMsgUserRaplace,
    ACTION_READ_WRITE_DYNAMIC_SCHEMA,
    ACTION_READ_WRITE_DYNAMIC_SECTION,
    NextArticleGenerate,
    isStructureChapter
}                                                           from './Interface/OpenAiInterface';
import { writeErrorLog }                                    from '../Log/Log';
import { IOpenAiService }                                   from './Interface/IOpenAiService';
import { BaseAlert } from '../Alert/BaseAlert';
import Site, { SiteWithIdType } from '../../database/mongodb/models/Site';

const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

//TODO da definire in altro file
function isError(e: any): e is Error {
    return e instanceof Error;
}

class OpenAiService extends BaseAlert implements IOpenAiService{
    htmlText:string;

    openai  = new OpenAI({baseURL:process.env.OPENAI_BASE_URL, apiKey:process.env.OPENAI_API_KEY});
    md      = new MarkdownIt();    

    constructor() {
        super();
        this.htmlText = '';
        connectMongoDB();
    }

    public async getNextArticleGenerate(siteName: string, generateValue: number): Promise<NextArticleGenerate|null> {
        const sitePublication: SitePublicationWithIdType | null     = await SitePublication.findOne({sitePublication: siteName});
        const article:ArticleWithIdType | null                      = await Article.findOne({ sitePublication: sitePublication?._id, genarateGpt: generateValue }).sort({ lastMod: 1 }) as ArticleWithIdType | null;        
        const site:SiteWithIdType | null                            = await Site.findOne({ _id: article?.site.toString()}) as SiteWithIdType | null;
        if( sitePublication ===null || article === null || site === null ) {
            console.log("errore getNextArticleGenerate");
            return null;
        }

        return {
            sitePublication: sitePublication,
            article: article,
            site: site
        }
    }

    public async getInfoPromptAi(alertProcess:string, processName:string, siteName: string, promptAiId:string, generateValue: number, articleGenerate:ArticleWithIdType|null): Promise<boolean> {

        //Recupera la logina di generazione in base al sito su cui pubblicare
        this.alertUtility.setCallData(alertProcess, `PromptAi.findOne:<br> ${siteName}, _id: ${promptAiId}`);
        const promptAi: PromptAiWithIdType| null                        = await PromptAi.findOne({sitePublication: siteName, _id: promptAiId});   
        if(promptAi == null ) {  
            console.log('getInfoPromptAi: promptAi == null');
            //await writeErrorLog(siteName + '- getInfoPromptAi: promptAi == null: siteName:' + siteName+ ' promptAiId:'+promptAiId);
            this.alertUtility.setError(alertProcess, 'PromptAi.findOne:<br> promptAi == null', true);                
            return false;                
        }
        this.alertUtility.setCallResponse(alertProcess, `PromptAi.findOne:<br>`, false);
        this.alertUtility.setCallResponse(alertProcess, promptAi, true);

        //------------------------------------------------------------------------------------------------------------//

        //Recupero la chiamata da fare definita nel db promptAi
        this.alertUtility.setCallData(alertProcess, `getCurrentCall`, false);
        this.alertUtility.setCallData(alertProcess, promptAi);
        const call:PromptAICallInterface|null                           = this.getCurrentCall(promptAi);            
        if(call == null ) {  
            this.alertUtility.setError(alertProcess, 'getCurrentCall:<br> call == null');
            // await writeErrorLog('getCurrentCall: '+siteName + '- call == null: promptAiId:'+promptAiId);
            return false;                
        }
        this.alertUtility.setCallResponse(alertProcess, `getCurrentCall:<br>`, false);
        this.alertUtility.setCallResponse(alertProcess, call);

        //------------------------------------------------------------------------------------------------------------//
        
        this.alertUtility.setCallData(alertProcess, `SitePublication.findOne({sitePublication: ${siteName}}) `);
        const sitePublication: SitePublicationWithIdType | null         = await SitePublication.findOne({sitePublication: siteName});

        let article:ArticleWithIdType | null = null;
        if( articleGenerate === null ) {
            this.alertUtility.setCallData(alertProcess, `Article.findOne({ sitePublication: ${sitePublication?._id}, genarateGpt: ${generateValue} })`);
            article                          = await Article.findOne({ sitePublication: sitePublication?._id.toString(), genarateGpt: generateValue }).sort({ lastMod: 1 }) as ArticleWithIdType | null;            
        } else {
            article = articleGenerate;
        }
        if( sitePublication === null || article === null ) {
            this.alertUtility.setError(alertProcess, 'sitePublication === null || article === null');                
            return false;
        }            

        this.alertUtility.setCallResponse(alertProcess, `Article:<br>`, false);
        this.alertUtility.setCallResponse(alertProcess, article);
        

        //------------------------------------------------------------------------------------------------------------//

        let text:string|object|Error;            
        this.alertUtility.setCallData(alertProcess, `getDinamycField2:<br> Call  - SitePubblication  - Article`, false);
        this.alertUtility.setCallData(alertProcess, call, false);
        this.alertUtility.setCallData(alertProcess, sitePublication, false);
        this.alertUtility.setCallData(alertProcess, article);            
        text = this.getDinamycField(call,sitePublication, article);                            
        if( text instanceof Error ) {
            this.alertUtility.setError(alertProcess, `getDinamycField2:<br> `, false );
            this.alertUtility.setError(alertProcess, text );
            return false;
        }
        this.alertUtility.setCallResponse(alertProcess, `getDinamycField2:<br> ${text}`);

        //------------------------------------------------------------------------------------------------------------//

                                                
            
            if( call != null ) {                                                                
                //Recupero i dati params per lo step corrente          
                this.alertUtility.setCallData(alertProcess, `getCurrentStep:<br> `, false);          
                this.alertUtility.setCallData(alertProcess, promptAi, false);          
                this.alertUtility.setCallData(alertProcess, call.key);          
                const step:ChatCompletionCreateParamsNonStreaming|null|Error  = this.getCurrentStep(promptAi,call.key);       
                if( step instanceof Error ) {
                    this.alertUtility.setError(alertProcess, `getCurrentStep:<br> `, false );
                    this.alertUtility.setError(alertProcess, step );
                    return false;
                }                                            
                if( step === null ) {    
                    this.alertUtility.setError(alertProcess, `getCurrentStep: NULL `);
                    return false;
                }
                this.alertUtility.setCallResponse(alertProcess, `getCurrentStep:<br>`, false);
                this.alertUtility.setCallResponse(alertProcess, step);

                //------------------------------------------------------------------------------------------------------------//
                        
                //Crea il json della call corrente con il campo complete ad 1 per il successivo salvataggio     
                this.alertUtility.setCallData(alertProcess, `setCompleteCall:<br> `, false);          
                this.alertUtility.setCallData(alertProcess, promptAi, false);          
                this.alertUtility.setCallData(alertProcess, call.key);          
                const setCompleteCall:PromptAiCallsInterface|Error = this.setCompleteCall(promptAi,call.key) as PromptAiCallsInterface; 
                if( setCompleteCall instanceof Error ) {
                    this.alertUtility.setError(alertProcess, `setCompleteCall:<br> `, false );
                    this.alertUtility.setError(alertProcess, setCompleteCall );
                    return false;
                } 
                this.alertUtility.setCallResponse(alertProcess, `setCompleteCall:<br>`, false);
                this.alertUtility.setCallResponse(alertProcess, setCompleteCall);
                
                //------------------------------------------------------------------------------------------------------------//

                this.alertUtility.setCallData(alertProcess, `appendUserMessage:<br> `, false);          
                this.alertUtility.setCallData(alertProcess, step, false);          
                this.alertUtility.setCallData(alertProcess, call, false);          
                this.alertUtility.setCallData(alertProcess, promptAi, false);          
                this.alertUtility.setCallData(alertProcess, text);          
                const jsonChatCompletation:ChatCompletionCreateParamsNonStreaming|Error = this.appendUserMessage(step,call,promptAi,text);
                if( jsonChatCompletation instanceof Error ) {
                    this.alertUtility.setError(alertProcess, `appendUserMessage:<br> `, false );
                    this.alertUtility.setError(alertProcess, jsonChatCompletation );
                    return false;
                }
                this.alertUtility.setCallResponse(alertProcess, `appendUserMessage:<br>`, false);
                this.alertUtility.setCallResponse(alertProcess, jsonChatCompletation);

                //------------------------------------------------------------------------------------------------------------//
                
                this.alertUtility.setCallData(alertProcess, `runChatCompletitions:<br> `, false);
                this.alertUtility.setCallData(alertProcess, jsonChatCompletation);
                const response: string | unknown = call.saveFunction !== ACTION_CALLS_COMPLETE ? await this.runChatCompletitions(jsonChatCompletation) : '';
                if( response instanceof Error ) {
                    this.alertUtility.setError(alertProcess, `runChatCompletitions:<br> `, false );
                    this.alertUtility.setError(alertProcess, response );
                    return false;
                }
                if( typeof response !== 'string' ) {
                    return false;
                }
                this.alertUtility.setCallResponse(alertProcess, `runChatCompletitions:<br>`, false);
                this.alertUtility.setCallResponse(alertProcess, response);

                //------------------------------------------------------------------------------------------------------------//

                //Aggiorna il campo calls e il campo data del PromptAiSchema                    
                //Slvataggio della struttura
                if( call.saveFunction == ACTION_CREATE_DATA_SAVE ) {
                    //Genera il dato da salvare in base ai parametri settati nelle calls del PromptAI                                
                    this.alertUtility.setCallData(alertProcess, `createDataSave:<br> `);
                    const createDataSave:boolean| unknown = await this.createDataSave(response, promptAi, call, setCompleteCall, siteName );
                    if( createDataSave instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `createDataSave:<br> `, false );
                        this.alertUtility.setError(alertProcess, createDataSave );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `createDataSave: OK`);     
                    
                    //------------------------------------------------------------------------------------------------------------//

                //Salvataggio Diretto del body
                } else if( call.saveFunction == ACTION_WRITE_TOTAL_ARTICLE ) {
                                    
                    this.alertUtility.setCallData(alertProcess, `updateSchemaArticle:<br> `);
                    const responseUpdate:boolean| unknown = await this.updateSchemaArticle(response, call, article );  
                    if( responseUpdate instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `updateSchemaArticle:<br> `, false );
                        this.alertUtility.setError(alertProcess, responseUpdate );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `updateSchemaArticle: OK`);    

                    //------------------------------------------------------------------------------------------------------------//
                    
                    this.alertUtility.setCallData(alertProcess, `createDataSave:<br> `);
                    const createDataSave:boolean| unknown = await this.createDataSave(null, promptAi, call, setCompleteCall, siteName );      
                    if( createDataSave instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `createDataSave:<br> `, false );
                        this.alertUtility.setError(alertProcess, createDataSave );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `createDataSave: OK`);                         

                    //------------------------------------------------------------------------------------------------------------//
                    

                } else if( call.saveFunction == ACTION_WRITE_BODY_ARTICLE ) {         
                    this.alertUtility.setCallData(alertProcess, `updateSchemaArticle: response, call, article <br> `);
                    const responseUpdate:boolean| unknown = await this.updateSchemaArticle(response, call, article );  
                    if( responseUpdate instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `updateSchemaArticle:<br> `, false );
                        this.alertUtility.setError(alertProcess, responseUpdate );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `createDataSave:`, false);   
                    this.alertUtility.setCallResponse(alertProcess, responseUpdate);   

                    this.alertUtility.setCallData(alertProcess, `createDataSave:<br> `);             
                    const createDataSave:boolean|unknown = await this.createDataSave(null, promptAi, call, setCompleteCall, siteName );    
                    if( createDataSave instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `createDataSave:<br> `, false );
                        this.alertUtility.setError(alertProcess, createDataSave );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `createDataSave: OK`);                         
                                                        
                            
                
                //Salvataggio capitolo in body
                } else if( call.saveFunction == ACTION_UPDATE_SCHEMA_ARTICLE ) {
                    //Recupero il capitolo corrente gestisto
                    const chiave                                            = call.msgUser.field.toString();
                    const data:StructureChaptersData                        = (promptAi as any)[chiave];                    

                    this.alertUtility.setCallData(alertProcess, `readStructureField:<br> `,false);             
                    this.alertUtility.setCallData(alertProcess, data);             
                    const structureChapter:StructureChapter |unknown   = this.readStructureField(data);
                    if( structureChapter instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `readStructureField:<br> `, false );
                        this.alertUtility.setError(alertProcess, structureChapter );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `readStructureField:`, false);  
                    this.alertUtility.setCallResponse(alertProcess, structureChapter );


                    this.alertUtility.setCallData(alertProcess, `setStructureFieldChapterGenerate:<br> `,false);             
                    this.alertUtility.setCallData(alertProcess, data);             
                    const structureChaptersData:StructureChaptersData|unknown  = this.setStructureFieldChapterGenerate(data,'false');                                         
                    if( structureChaptersData instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `setStructureFieldChapterGenerate:<br> `, false );
                        this.alertUtility.setError(alertProcess, structureChaptersData );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `setStructureFieldChapterGenerate:`, false);  
                    this.alertUtility.setCallResponse(alertProcess, structureChaptersData );


                    try {
                        this.alertUtility.setCallData(alertProcess, `PromptAi.findByIdAndUpdate: `,false); 
                        this.alertUtility.setCallData(alertProcess, `promptAi._id: ${promptAi._id}`,false); 
                        this.alertUtility.setCallData(alertProcess, `data: <br>`,false); 
                        this.alertUtility.setCallData(alertProcess, structureChaptersData); 
                        await PromptAi.findByIdAndUpdate(promptAi._id, { data: structureChaptersData });
                    } catch (error: unknown) {            
                        this.alertUtility.setError(alertProcess, `PromptAi.findByIdAndUpdate:<br> `, false );
                        this.alertUtility.setError(alertProcess, error );
                        return false;
                    }  


                    //Appenda il capitolo nel caso di generazione da struttura definita
                    const sc = structureChapter as StructureChapter;
                    const chapterArticle: string = structureChapter ? `<${sc.type}>${sc.value}</${sc.type}>${response}` : '';

                    this.alertUtility.setCallData(alertProcess, `updateSchemaArticle:<br> `);
                    const responseUpdate:boolean| unknown = await this.updateSchemaArticle(chapterArticle, call, article );  
                    if( responseUpdate instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `updateSchemaArticle:<br> `, false );
                        this.alertUtility.setError(alertProcess, responseUpdate );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `updateSchemaArticle:`, false);   
                    this.alertUtility.setCallResponse(alertProcess, responseUpdate);   


                    const scd                                        =  structureChaptersData as StructureChaptersData;
                    this.alertUtility.setCallData(alertProcess, `checkIfLastChapter:<br>`,false);
                    this.alertUtility.setCallData(alertProcess, scd);                                
                    const checkIfLastChapter:boolean| unknown        = this.checkIfLastChapter(scd,'false'); 
                    if( checkIfLastChapter instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `checkIfLastChapter:<br> `, false );
                        this.alertUtility.setError(alertProcess, checkIfLastChapter );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `checkIfLastChapter:${checkIfLastChapter}`);                                  
                                                    
                    
                    //TODO: deve essere saltato quialcosa senno a che serve verificare che sia l'ultimo capitolo?
                    if(  checkIfLastChapter === true ) {                                                                                                             
                        console.log(scd[0].getStructure.chapters);
                        try {                                                                                                                                                                                                    
                            console.log('Articolo generato correttamente e completato con successo.');
                        } catch (error) {
                            console.error('Si è verificato un errore durante l\'aggiornamento:', error);
                            await writeErrorLog('getInfoPromptAi: '+ACTION_UPDATE_SCHEMA_ARTICLE+' :Si è verificato un errore durante l\'aggiornamento - siteName:' + siteName+ ' promptAiId:'+promptAiId);
                            await writeErrorLog(error);
                        }
                    }

                } else if( call.saveFunction == ACTION_READ_WRITE_DYNAMIC_SCHEMA ) {
                                
                    this.alertUtility.setCallData(alertProcess, `updateDynamicResponse: response, call, article`,false);
                    const responseUpdate:boolean|unknown = await this.updateDynamicResponse(response, call, article );  
                    if( responseUpdate instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `updateDynamicResponse:<br> `, false );
                        this.alertUtility.setError(alertProcess, responseUpdate );
                        return false;
                    }
                    if( responseUpdate === false ) {    
                        this.alertUtility.setError(alertProcess, `updateDynamicResponse: false ` );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `updateDynamicResponse:${responseUpdate}`); 
                                                    
                        
                    this.alertUtility.setCallData(alertProcess, `createDataSave: `,false);             
                    this.alertUtility.setCallData(alertProcess, promptAi,false);             
                    this.alertUtility.setCallData(alertProcess, call,false);             
                    this.alertUtility.setCallData(alertProcess, setCompleteCall,false);             
                    this.alertUtility.setCallData(alertProcess, siteName);             
                    const createDataSave:boolean|unknown = await this.createDataSave(null, promptAi, call, setCompleteCall, siteName );    
                    if( createDataSave instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `createDataSave:<br> `, false );
                        this.alertUtility.setError(alertProcess, createDataSave );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `createDataSave: OK`);                        
                    console.log('Salvataggio generato correttamente e completato con successo.');

                } else if( call.saveFunction == ACTION_READ_WRITE_DYNAMIC_SECTION ) {
                                
                    this.alertUtility.setCallData(alertProcess, `updateDynamicSectionResponse: response, call, article`,false);
                    const responseUpdate:boolean|unknown = await this.updateDynamicSectionResponse(response, call, article );  
                    if( responseUpdate instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `updateDynamicSectionResponse:<br> `, false );
                        this.alertUtility.setError(alertProcess, responseUpdate );
                        return false;
                    }
                    if( responseUpdate === false ) {    
                        this.alertUtility.setError(alertProcess, `updateDynamicSectionResponse: false ` );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `updateDynamicSectionResponse:${responseUpdate}`); 
                                                    
                        
                    this.alertUtility.setCallData(alertProcess, `createDataSave: `,false);             
                    this.alertUtility.setCallData(alertProcess, promptAi,false);             
                    this.alertUtility.setCallData(alertProcess, call,false);             
                    this.alertUtility.setCallData(alertProcess, setCompleteCall,false);             
                    this.alertUtility.setCallData(alertProcess, siteName);             
                    const createDataSave:boolean|unknown = await this.createDataSave(null, promptAi, call, setCompleteCall, siteName );    
                    if( createDataSave instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `createDataSave:<br> `, false );
                        this.alertUtility.setError(alertProcess, createDataSave );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `createDataSave: OK`);                        
                    console.log('Salvataggio generato correttamente e completato con successo.');
                    

                //Chiusura chiamate calls e salvataggio articolo a complete 1
                } else if( call.saveFunction == ACTION_CALLS_COMPLETE ) {
                    this.alertUtility.setCallData(alertProcess, `setAllCallUncomplete: `,false);                                
                    this.alertUtility.setCallData(alertProcess, promptAi);     
                    const setAllCallUncomplete:Promise<boolean|Error> = this.setAllCallUncomplete(promptAi);
                    if( setAllCallUncomplete instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `setAllCallUncomplete:<br> `, false );
                        this.alertUtility.setError(alertProcess, setAllCallUncomplete );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `setAllCallUncomplete: OK`); 
                

                    this.alertUtility.setCallData(alertProcess, `setArticleComplete: `,false);       
                    this.alertUtility.setCallData(alertProcess, article,false);     
                    this.alertUtility.setCallData(alertProcess, promptAi);     
                    const setArticleComplete:boolean|Error = await this.setArticleComplete(article, promptAi);
                    if( setArticleComplete instanceof Error ) {
                        this.alertUtility.setError(alertProcess, `setArticleComplete:<br> `, false );
                        this.alertUtility.setError(alertProcess, setArticleComplete );
                        return false;
                    }
                    this.alertUtility.setCallResponse(alertProcess, `setArticleComplete: OK`); 

                }                                                                                                                       
            }
                                            
            this.alertUtility.setCallResponse(alertProcess, call); 
    
        return true;
    }

    //recupera il campo da leggere
    private getDinamycField(call:PromptAICallInterface,sitePublication: SitePublicationWithIdType,article:ArticleWithIdType): string|object|Error {
        try{
            if( typeof call.readTo == 'object' ) {
                let response:any = {};         
                for (const readTo of call.readTo) {                
                    switch( readTo.schema ) {
                        case 'Article':
                            response[`${readTo.field}`] = typeof article[`${readTo.field}`] == 'object' ? JSON.stringify(article[`${readTo.field}`] ) : article[`${readTo.field}`] ;
                        break;
                        case 'SitePubblication':                        
                            response[`${readTo.field}`] = typeof sitePublication[`${readTo.field}`] == 'object' ? JSON.stringify(sitePublication[`${readTo.field}`]) : sitePublication[`${readTo.field}`];
                        break;
                    }                
                }                
                return response;
            } else {

                //Questw funzioni sul testo vengono attivate o disattivare dai settings della call 
                let text:string|undefined  = this.unifyString(article[`${call.readTo}`]);                        
                if( call.removeHtmlTags === true ) {
                    //Deve però rimuovere sempre i tag img
                    text = this.removeHtmlTags(article[`${call.readTo}`]);
                }
                return text;
            }
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('setCompleteCall errore generico');
            }
        }
    }

    /**
     * Setta gli articoli a complete nella genrazione gpt     
     */
    private async setArticleComplete(article:ArticleWithIdType, promptAi: PromptAiWithIdType): Promise<boolean|Error>{
        try {
            const update = {genarateGpt:1};
            const filter = { _id: article._id };
            const result = await Article.findOneAndUpdate(filter, update);
        
            // Se l'aggiornamento di 'Article' ha avuto successo, aggiorna 'PromptAi'
            //TODO: questa parte deve essere centralizzata perchè la deve chiamare anche il case sopra
            if (result) {
                return true; 
                
            } else {
                await writeErrorLog('setArticleComplete: Nessun articolo trovato o aggiornato - article._id:' + article._id);  
                console.error('Nessun articolo trovato o aggiornato.');
                return false;
            }
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('setCompleteCall errore generico');
            }
        }
    }

    /**
     * Funzione che appende il role user al ChatCompletation     
     */
    private appendUserMessage(step:ChatCompletionCreateParamsNonStreaming,call:PromptAICallInterface,promptAi: PromptAiWithIdType,title:string|any): ChatCompletionCreateParamsNonStreaming|Error {            
        try{
            switch( call.msgUser.type ) {
                //Se il tipo è inJson significa che il messaggio utente e nello stesso campo
                case TYPE_IN_JSON:
                    if( call.msgUser.user !== undefined && typeof title == 'string' ) {
                        for (const userMsg of call.msgUser.user) {
                            const placeholder:string    = '[plachehorderContent]';                        
                            title                       = title.replace(/\\"/g, '\\"');                        
                            const msg:string            = userMsg.message.replace(placeholder, title);
                            let chatMessage:ChatCompletionUserMessageParam = {
                                role:    'user', 
                                content: this.unifyString(msg)
                            };
                            step.messages.push(chatMessage)
                        }    
                    } else {
                        console.log('appendUserMessage: Manca il campo call.msgUser.user');
                    }         
                break;
                case TYPE_READ_STRUCTURE_FIELD:
                    if( call.msgUser.field !== undefined && typeof title == 'string') {
                        call.msgUser.key
                        // console.log("step");
                        // console.log(step);
                        // console.log("call");
                        // console.log(call);
                        // console.log("promptAi");
                        const chiave                        = call.msgUser.field.toString();
                        const data:StructureChaptersData    = (promptAi as any)[chiave];                    
                        const chapter:StructureChapter|null|unknown = this.readStructureField(data);
                        if (isStructureChapter(chapter)) {
                            let message                     = call.msgUser.message;
                            const placeholder:string        = '[plachehorderContent]';
                            message                         = message.replace(/\\"/g, '\\"');
                            message                         = message.replace(placeholder, chapter.value);

                            let chatMessage:ChatCompletionUserMessageParam = {
                                role:    'user', 
                                content: '"""'+this.unifyString(this.removeHtmlTags(title))+'""". '+message
                            };
                            step.messages.push(chatMessage)
                        }
                        // console.log("step");
                        // console.log(step);
                    }
                break;
                case TYPE_READ_FROM_DATA_PROMPT_AND_ARTICLE:
                    if( call.msgUser.field !== undefined && typeof title == 'string') {
                        call.msgUser.key
                        // console.log("step");
                        // console.log(step);
                        // console.log("call");
                        // console.log(call);
                        // console.log("promptAi");
                        const chiave                        = call.msgUser.field.toString();
                        const dataJson:any                  = (promptAi as any)[chiave];                    
                        
                        if( dataJson !== null ) {
                            let message                     = call.msgUser.message;
                            const placeholder:string        = '[plachehorderContent]';
                            message                         = message.replace(/\\"/g, '\\"');
                            message                         = message.replace(placeholder, JSON.stringify(dataJson));

                            let chatMessage:ChatCompletionUserMessageParam = {
                                role:    'user', 
                                content: '<article>'+this.unifyString(title)+'</article>. '+message
                            };
                            step.messages.push(chatMessage)
                        }
                        // console.log("step");
                        // console.log(step);
                    }
                break;
                case TYPE_READ_WRITE_DYNAMIC_SCHEMA:
                    
                    if( call.msgUser.replace !== undefined && typeof title == 'object') {
                        call.msgUser.key
                        // console.log("step");
                        // console.log(step);
                        // console.log("call");
                        // console.log(call);
                        // console.log("promptAi");
                        const oReplace:[TypeMsgUserRaplace]|undefined                        = call.msgUser.replace;                               
                        
                        
                        if( oReplace !== undefined && call.msgUser.user != undefined ) {
                            for (const userMsg of call.msgUser.user) {
                                let message                         = userMsg.message;                        
                                for (const itemReplace of oReplace) {                                 
                                    const placeholder:string        = `[#${itemReplace.field}#]`;
                                    message                         = message.replace(/\\"/g, '\\"');
                                    message                         = message.replace(placeholder, title[`${itemReplace.field}`])+'.';
                                }
                                
                                console.log(title);
                                let chatMessage:ChatCompletionUserMessageParam = {
                                    role:    'user', 
                                    content: message
                                };
                                step.messages.push(chatMessage)
                                console.log('eccoim');
                            }
                        }                    
                    }
                break;
            }        
            return step;
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('setCompleteCall errore generico');
            }
        }
    }

    /**
     * Legge la struttura 1 definita per generare un articolo
     */
    private readStructureField(data:StructureChaptersData):StructureChapter|null|unknown {
        try {
            // console.log("data");
            // console.log(data[0].getStructure.chapters);
            let firstChapter:StructureChapter|null = null;
            for (const item of data) {
                const chapters = item.getStructure.chapters;
                for (const chapter of chapters) {
                    if (chapter.toGenerate === 'true') {
                        firstChapter = chapter;
                        break;
                    }
                }            
            }          
            if( firstChapter !== null ) {
                return firstChapter;
            }
            return null;            
        } catch (error: unknown) {            
            return error;
        }        
    }

    /**
     * Setta toGenerate a true per il capitolo appena generato 
     */
    private setStructureFieldChapterGenerate(data: StructureChaptersData, toGenerate: string): StructureChaptersData|unknown {        
        try{
            for (const item of data) {
                const chapters = item.getStructure.chapters;
                for (const chapter of chapters) {
                    if (chapter.toGenerate === 'true') {
                        chapter.toGenerate = toGenerate;
                        break;
                    }
                }            
            }            
            return data;
        } catch (error: unknown) {            
            return error;
        }  
    }

    /**
     * Determina se è l'ultimo capitolo da generate 
     */
    private checkIfLastChapter(data: StructureChaptersData, toGenerate: string): boolean|unknown {      
        try {  
            let checkLast = true;        
            for (const item of data) {
                const chapters = item.getStructure.chapters;
                for (const chapter of chapters) {
                    if (chapter.toGenerate === 'true') {
                        checkLast = false;
                        break;
                    }
                }            
            }
            return checkLast;
        } catch (error: unknown) {            
            return error;
        }
    }
    
    /**
     * Salva il dato in update nella tabella Article
     */
    private async updateDynamicResponse(response: string, call: PromptAICallInterface, article:ArticleWithIdType): Promise<boolean|unknown> {    
        try {
            const jsonResponse:any = JSON.parse(response);
            if( typeof call.saveTo === 'string' ) {
                return false;
            }
            
            for (const saveTo of call.saveTo) {                
                switch( saveTo.schema ) {
                    case 'Article':
                        let value;
                        if( saveTo.responseField !== undefined ) {
                            value   = jsonResponse[`${saveTo.responseField}`];
                        } else {
                            value   = response;
                        }
                        if( typeof value == 'object') {
                            value = JSON.stringify(value);
                        }
                        const filter = { _id: article._id };
                        const field  = saveTo.field 
                        const update = {[field]: value}
                        await Article.findOneAndUpdate(filter, update).then(result => {
                            
                        }).catch(async error => {         
                            return error;
                        });
                    break;
                    case 'SitePubblication':                        
                        
                    break;
                }                
            }
        } catch (error: unknown) {            
            return error;
        }                
        return true;        
    }

     /**
     * Salva il dato in update nella tabella Article
     */
     private async updateDynamicSectionResponse(response: string, call: PromptAICallInterface, article:ArticleWithIdType): Promise<boolean|unknown> {    
        try {
            const jsonResponse:any = JSON.parse(response);
            if( typeof call.saveTo === 'string' ) {
                return false;
            }
            
            for (const saveTo of call.saveTo) {                
                switch( saveTo.schema ) {
                    case 'Article':
                        let value   = jsonResponse[`${saveTo.responseField}`];
                        if( typeof value == 'object') {
                            value = JSON.stringify(value);
                        }
                        const filter = { _id: article._id };
                        const field  = saveTo.field 
                        const update = {[field]: value}
                        await Article.findOneAndUpdate(filter, update).then(result => {
                            
                        }).catch(async error => {         
                            return error;
                        });
                    break;
                    case 'SitePubblication':                        
                        
                    break;
                }                
            }
        } catch (error: unknown) {            
            return error;
        }                
        return true;        
    }

    /**
     * Salva il dato in update nella tabella Article
     */
    private async updateSchemaArticle(response: string, call: PromptAICallInterface, article:ArticleWithIdType): Promise<boolean|unknown> {  
        try{  
            const lastArticle:ArticleWithIdType | null  = await Article.findOne({ _id: article._id });   
            let update = {};
                    

            //Se in una chiamata riceve tutti i campi necessari a generare l'articolo  
            if( call.saveFunction == ACTION_WRITE_TOTAL_ARTICLE ) {
                const parser = new DOMParser();

                // Parsa il documento XML
                const xmlDoc = parser.parseFromString(response, 'text/xml');

                // Recupera i nodi metaTitle, metaDescription e h1
                const metaTitleNode = xmlDoc.getElementsByTagName('metaTitle')[0];
                const metaDescriptionNode = xmlDoc.getElementsByTagName('metaDescription')[0];
                const h1Node = xmlDoc.getElementsByTagName('h1')[0];

                // Ottieni i testi dei nodi
                const metaTitle = metaTitleNode.textContent;
                const metaDescription = metaDescriptionNode.textContent;
                const h1 = h1Node.textContent;

                // Recupera il nodo <article>
                const articleNode = xmlDoc.getElementsByTagName('article')[0];

                // Ottieni il contenuto del nodo <article> come stringa
                let articleContent = articleNode.toString();

                const $ = cheerio.load(articleContent);
                $('h2 strong').each(function() {            
                    $(this).replaceWith($(this).text());
                });

                const articleCheerio:string|null = $('article').html();
                if(  articleCheerio != null ) {
                    articleContent = '<article>'+articleCheerio+'</article>';
                }

                update                          = {
                    titleGpt:       metaTitle,
                    descriptionGpt: metaDescription,
                    bodyGpt :       articleContent,
                    h1Gpt:          h1
                };
                    
            } else {
                const $ = cheerio.load(response);
                $('h2 strong').each(function() {            
                    $(this).replaceWith($(this).text());
                });

                const articleCheerio:string|null = $('article').html();
                if(  articleCheerio != null ) {
                    response = '<article>'+articleCheerio+'</article>';
                }
                
                const baseArticle:string                = call.lastBodyAppend === true && lastArticle?.bodyGpt !== undefined ? lastArticle?.bodyGpt : '';
                
                if( typeof call.saveTo !== 'string') {
                    await writeErrorLog(' updateSchemaArticle: Save string non consentuito - call.saveTo:' + call.saveTo+' article._id:'+article._id);
                    console.log("updateSchemaArticle: Save string non consentuito");
                    return false;
                }
                update                                  = {[call.saveTo] : baseArticle+' '+response};
            }

            console.log(update);
            const filter                                = { _id: article._id };
            return await Article.findOneAndUpdate(filter, update).then(result => {
                return true;
            }).catch(async error => {            
                return error;
            });
        } catch (error: unknown) {            
            return error;
        }
    }

    /**
     * Salva il dato nella tabella promptAI
     */
    private async createDataSave(response: string|null, promptAi: PromptAiWithIdType, call: PromptAICallInterface, setCompleteCall:PromptAiCallsInterface, siteName:string): Promise<boolean|unknown> {
        try {
            let field: string = '';

            if(  typeof call.saveTo !== 'string' ) {
                field = '';
            } else {
                field = call.saveTo;
            }
            
            let dataField: any = {}; // Inizializza dataField come un oggetto vuoto
        
            switch (field) {
                case 'data':                                
                    dataField = promptAi.data || '';
                    break;
            }
        
            if( response !== null ) {
                if( dataField == '' ) {
                    dataField = [{[call.saveKey]: JSON.parse(response)}];
                } else {
                    dataField = dataField.map((item:any) => ({ ...item, [call.saveKey]: JSON.parse(response) }));    
                }
            }
            
            const filter            = { _id: promptAi._id };
            const update            = { [field] : dataField, calls: setCompleteCall };
            await PromptAi.findOneAndUpdate(filter, update);
        } catch (error: unknown) {            
            return error;
        }
        
        return true;
    }
    

    /**
     * Recupera la chiamata che deve essere effettuata da inviare a OpenAi     
     */
    public getCurrentCall(promptAi: PromptAiWithIdType): PromptAICallInterface | null {
        const calls: PromptAiCallsInterface = promptAi.calls as PromptAiCallsInterface;

        for (let i = 0; i < calls.length; i++) {
            const call = calls[i];
            if (call.complete === 0) { // Assumo che `complete` sia 0 per le chiamate non completate
                return call;
            }
        }
        return null;
    }

     /**
     * Setta il complete della call ad 1     
     */
     public setCompleteCall(promptAi: PromptAiWithIdType,key:string): PromptAiCallsInterface | Error {
        try {
            const calls: PromptAiCallsInterface = promptAi.calls as PromptAiCallsInterface;        

            for (let i = 0; i < calls.length; i++) {
                const call = calls[i];
                if (call.key === key) { // Assumo che `complete` sia 0 per le chiamate non completate
                    call.complete = 1;
                }
            }
            return calls;
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('setCompleteCall errore generico');
            }
        }
    }

    /**
     * Effettua il reset di tutti i complete delle calls per poter lavorare con il nuovo articolo     
     */
    public async setAllCallUncomplete(promptAi: PromptAiWithIdType): Promise<boolean|Error> {
        const calls: PromptAiCallsInterface = promptAi.calls as PromptAiCallsInterface;        

        for (let i = 0; i < calls.length; i++) {
            const call = calls[i];            
            call.complete = 0;            
        }

        const filterPromptAi = { _id: promptAi._id };
        const updatePromptAi = { calls: calls, data : [{}] };

        return await PromptAi.findOneAndUpdate(filterPromptAi, updatePromptAi).then(result => {
            return true;
        }).catch(async error => {            
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('setCompleteCall errore generico');
            }
        });        
    }

    /**
     * Recupera il ChatCompletionCreateParamsNonStreaming dello step attuale     
     */
    public getCurrentStep(promptAi: PromptAiWithIdType, call:string): ChatCompletionCreateParamsNonStreaming|null|Error {
        try {
            const steps: any = promptAi.steps;                                   
            for (const item of steps) {            
                if (item.hasOwnProperty(call)) {                
                    return item[call];                
                }
            }       
            return null;
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getCurrentStep errore generico');
            }
        }
    }
    
    //Effettua la chiamata ad OpenAi
    public async runChatCompletitions(chatCompletionParam:ChatCompletionCreateParamsNonStreaming): Promise<string | unknown> {
        try {      
            if (chatCompletionParam) {                                                
                console.log(chatCompletionParam);
                const completion = await this.openai.chat.completions.create(chatCompletionParam);       
                
                if( completion.choices[0].message.content !== null ) {     
                    let response = completion.choices[0].message.content.replace(/minLength="\d+ words"/g, '');
                    response = response.replace(/maxLength="\d+ words"/g, '');                        
                    console.log(response);
                    return response;
                } else {
                    return null;
                }
            }
            return null;
        } catch (error: unknown) {                     
            return error;
        }
    }

    private unifyString(stringWithNewlines:string):string {
        const unifiedString = stringWithNewlines.replace(/\n|\r\n|\r/g, '');
        return unifiedString;
    }

    private removeHtmlTags(htmlString:string) {
        // Carica la stringa HTML utilizzando cheerio
        const $ = cheerio.load(htmlString);
        
        // Trova tutti i tag HTML e rimuovili
        $('*').each((index: any, element: any) => {
          $(element).replaceWith($(element).text().trim());
        });
        
        // Ritorna la stringa senza tag HTML
        return $.text().trim();
      }

    public sleep(ms:any) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

}

// const c = new OpenAiService();
// c.getInfoPromptAi('acquistigiusti.it', 'Come scegliere un cardiofrequenzimetro');

export default OpenAiService;


