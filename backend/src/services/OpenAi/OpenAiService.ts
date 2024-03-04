
import dotenv                               from 'dotenv';
import OpenAI                               from "openai";
import MarkdownIt                           from 'markdown-it';

import Site, { SiteWithIdType }             from "../../database/mongodb/models/Site";
import SitePublication, { SitePublicationWithIdType }                      from '../../database/mongodb/models/SitePublication';
import PromptAi, { PromptAiArrayType, PromptAiWithIdType }                             from "../../database/mongodb/models/PromptAi";
import connectMongoDB                       from "../../database/mongodb/connect";
import { ChatCompletionCreateParamsNonStreaming, ChatCompletionUserMessageParam } from 'openai/resources';
import { isConstructorDeclaration } from 'typescript';

const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

class OpenAiService {
    htmlText:string;

    static getCsvKeywords(titleGpt: string) {
        throw new Error("Method not implemented.");
    }    
    
    openai  = new OpenAI({baseURL:process.env.OPENAI_BASE_URL, apiKey:process.env.OPENAI_API_KEY});
    md      = new MarkdownIt();    

    constructor() {
        this.htmlText = '';
        connectMongoDB();
    }

    private ucfirst(str:string|null):string|null {
        if (str == null || typeof str !== 'string' || str.length === 0) {
            return null;
        }
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    public async getInfoPromptAi(siteName: string, userContent:string, title:string): Promise<boolean> {
        try {            
                //Recupera il sito su cui pubblicare
                const sitePublication: SitePublicationWithIdType | null         = await SitePublication.findOne({ sitePublication: siteName });

                //Recupera la logina di generazione in base al sito su cui pubblicare
                const promptAi: PromptAiWithIdType| null                        = await PromptAi.findOne({ sitePublication: siteName });                  

                if( promptAi != null ) {
                    //Recupero la chiamata da fare definita nel db promptAi
                    const call:string|null                                      = this.getCurrentCall(promptAi);
                    if( call != null ) {
                        console.log(call);

                        //Recupero i dati params per lo step corrente
                        const step:ChatCompletionCreateParamsNonStreaming|null  = this.getCurrentStep(promptAi,call);                        

                        if( step != null ) {                                                                   
                            let jsonString:string       = JSON.stringify(step);
                            const placeholder:string    = '[plachehorderContent]';                     
                            userContent                 = userContent.replace(/"/g, '\\"');       
                            jsonString                  = jsonString.replace(placeholder, userContent);                            
                            console.log(jsonString);

                            const updatedStep:ChatCompletionCreateParamsNonStreaming = JSON.parse(jsonString);
                            console.log(updatedStep);
                            

                            const articleGpt: string | null | null  = await this.runChatCompletitions(step);    
                        }
                    }
                } else {
                    console.log('Nessun PromptAI');
                }
                                      
        } catch (error:any) {         
            console.error(userContent + ': Errore durante il recupero degli articoli',error);            
            return false;
        }
        return true;
    }

    /**
     * Recupera la chiamata che deve essere effettuata da inviare a OpenAi     
     */
    public getCurrentCall(promptAi: PromptAiWithIdType): string|null {
        const calls: any = promptAi.calls;
        console.log(calls);
    
        for (const obj of calls) {
            for (const [key, value] of Object.entries(obj)) {
                console.log(`Chiave: ${key}, Valore: ${value}`);
                if (typeof value === 'number' && value === 0) {
                    return key;
                }
            }
        }
        return null;
    }

    /**
     * Recupera il ChatCompletionCreateParamsNonStreaming dello step attuale     
     */
    public getCurrentStep(promptAi: PromptAiWithIdType, call:string): ChatCompletionCreateParamsNonStreaming|null {
        const steps: any = promptAi.steps;        
            
        for (const item of steps) {
            if (item.hasOwnProperty(call)) {
                return item[call];                
            }
        }
       
        return null;
    }
    
   
    public async runChatCompletitions(chatCompletionParam:ChatCompletionCreateParamsNonStreaming): Promise<string | null> {
        try {      

            if (chatCompletionParam) {                
                
                //const completion = await this.openai.chat.completions.create(chatCompletionParam);
                  
                // let structureArticle = this.ucfirst(completion.choices[0].message.content);
               
                // if( structureArticle != null ) {
                //     //TODO salva in Schema PromptAI
                //     const jsonString = this.ucfirst(structureArticle);
                //     if( jsonString != null ) {
                //         const data = JSON.parse(jsonString);
                //         console.log(data);

                //         let testGenerate = '';
                //         for (const key in data) {
                //             if (data.hasOwnProperty(key)) {
                //                 const element = data[key];
                //                 // Chiamare la funzione getArticle per ogni iterazione
                //                 // console.log(element.h2);
                //                 testGenerate += element.h2;
                                                                
                //                 let prompt:string = 'The buying guide: '+title+'. I write the text delimited by triple quotes. """'+element.h2+'""". I provide you with the structure of the chapters to write in json format:'+ jsonString;
                //                 let liPrompt:string = '. Subchapters: ';
                //                 for (const subtitle of element.h3) {
                //                     // console.log( subtitle );
                //                     // testGenerate += subtitle ;
                //                     // testGenerate += await this.getArticle('Scrivi il testo per il paragrafo h2 delimitato da virgolette triple in circa 150 parole. """' + title + '""","""' + element.h2 + '""","""' + subtitle + '"""',testGenerate);
                //                     // await this.sleep(21000);
                                    
                //                     liPrompt += `"""${subtitle}""",`;
                //                 }
                //                 //prompt += liPrompt;

                //                 testGenerate += await this.getArticle(prompt,structureArticle);
                //                 console.log(`--- \n ${prompt} \n`);
                //                 await this.sleep(21000);
                                
                //             }                      
                //             console.log(this.md.render(testGenerate));
                //         }
                        
                //         console.log(this.md.render(testGenerate));
                //         console.log('###');
                //     }
                // }
                
            }
            return null;
        } catch (error:any) {            
            console.error('processArticle: Errore durante l\'elaborazione dell\'articolo', error);
            return null;
        }
    }

    public sleep(ms:any) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // public async getArticle(info:string,testGenerate:string): Promise<string | null> {
    //     try {                          
    //         if (info) {                                
    //             const completion = await this.openai.chat.completions.create({                   
    //                 messages: [                        
    //                     {
    //                         role: "system",
    //                         content: 'Act as: Copywriter. Text type: Buying guide. Explain well in the chapter the items delimited by triple quotes. Min Length chapters: 700 words. Min Length subchapters: 200 words. Formatting: Important words in bold. Writing style: persuasive. Tone: professional. Italian language. Don\'t generate chapters: Conclusions, Objective: write paragraphs regarding a specific topic of a purchasing guide, to help the reader make a purchase. MyStructure: Write chapters with the Markdown format (##). Write: The chapter must have a short introduction.',
    //                     },                                                
    //                     {
    //                         role: "user", 
    //                         content: info
    //                     }                        
    //                 ],
    //                 model: "gpt-3.5-turbo-1106",
    //                 temperature: 0.6,
    //                 top_p: 0.9,
    //                 // response_format: { "type": "json_object" }
    //             });
                  
    //             let article = this.ucfirst(completion.choices[0].message.content);
    //             if( article != null ) {
    //                 article = article.replace(/<img[^>]*>/g, '');

    //             }
    //             return this.ucfirst(completion.choices[0].message.content);
                
    //         }
    //         return null;
    //     } catch (error:any) {            
    //         console.error('processArticle: Errore durante l\'elaborazione dell\'articolo', error);
    //         return null;
    //     }
    // }
}

const c = new OpenAiService();
c.getInfoPromptAi('acquistigiusti.it','Rispondi in formato JSON, al titolo delimitato da virgolette triple. """Come scegliere un cardiofrequenzimetro"""','Come scegliere un cardiofrequenzimetro');

export default OpenAiService;


