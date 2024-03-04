
import axios, { AxiosResponse }             from "axios";
import cheerio                              from 'cheerio';
import dotenv                               from 'dotenv';
import OpenAI                               from "openai";
import MarkdownIt                           from 'markdown-it';
import fs                                   from 'fs';

import { ScrapedData }                      from "../../siteScrapers/interface/VanityfairInterface";
import Article, { ArticleWithIdType}        from "../../database/mongodb/models/Article";
import Site, { SiteWithIdType }             from "../../database/mongodb/models/Site";
import connectMongoDB                       from "../../database/mongodb/connect";
import { writeErrorLog }                    from "../Log";
import { ChatMessage, ChatMessageArray }    from "./Interface/OpenAiInterface";
import { ChatCompletionCreateParamsNonStreaming } from "openai/resources";
import { ChatCompletionAssistantMessageParam, ChatCompletionCreateParamsBase, ChatCompletionSystemMessageParam, ChatCompletionUserMessageParam } from "openai/resources/chat/completions";
import { PromptAiWithIdType } from "../../database/mongodb/models/PromptAi";
const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

interface ChatCompletionRequest {
    model: string;
    temperature: number;
    top_p: number;
    prompt: { role: string; content: string }[];
}

class ChatGptApi2 {
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

    public async getArticleBySiteAndGenerate(user:string, title:string): Promise<boolean> {
        try {            
            
                const articleGpt: string | null | null  = await this.getStructure(user,title);               
                console.log('fine richieste gpt');
                console.log(articleGpt);                                
        } catch (error:any) {         
            console.error(user + ': Errore durante il recupero degli articoli');            
            return false;
        }
        return true;
    }

   
    public async getStructure(user:string,title:string): Promise<string | null> {
        try {      

            if (user) {
                 console.log('Invio richiesta a chat gpt');
                
                const completion = await this.openai.chat.completions.create({                   
                    messages: [                        
                        {
                            role: "system",
                            content: 'You are a useful assistant designed to produce JSON, expert in generating buying guides. Your goal is to generate the structure of a guide that answers all the questions a user needs to make a purchase. You will be provided with titles for which you will have to generate the structure of the chapters and subchapters of the text to be written. The text generated must be very exhaustive and contain all the useful information to make a choice to purchase a product. The length of the texts to be generated is between 500 words, use this number to generate the appropriate number of chapters. Language: Italian. Writing Style: Persuasive. Reply with a Json with this format: [{"introduzione": { "h2": "string", "h3": ["string","string","string"]},...]',
                        },                                                
                        {
                            role: "user", 
                            content: user
                        }, 
                        
                    ],
                    model: "gpt-3.5-turbo-1106",
                    temperature: 0.6,
                    top_p: 0.9,
                    response_format: { "type": "json_object" }
                });
                  
                let article = this.ucfirst(completion.choices[0].message.content);


                if( article != null ) {
                    article = article.replace(/<img[^>]*>/g, '');
                }

                if( completion.choices[0].message.content != null ) {
                    const jsonString = this.ucfirst(completion.choices[0].message.content);
                    if( jsonString != null ) {
                        const data = JSON.parse(jsonString);
                        
                        let chatMessageArray: ChatCompletionCreateParamsNonStreaming = {
                            messages: [],
                            model: "gpt-3.5-turbo-1106",
                            temperature: 0.6,
                            top_p: 0.9                            
                        };

                        let chatMessage:ChatCompletionSystemMessageParam = {
                            role: "system",
                            content: 'You are a helpful assistant designed to produce texts, expert in generating buying guides. \
                            Your aim is to write the various paragraphs regarding a specific topic of a text that answers all the questions necessary for a user to make a purchase. \
                            You will be given three pieces of information in succession, each delimited by triple quotes separated by a comma. \
                            The third option is optional.Step 1: """Help topic""". Step 2: """Paragraph title h2""". Step 3: """Paragraph title h3"""',
                        };
                        chatMessageArray.messages.push(chatMessage);   

                        for (const key in data) {
                            if (data.hasOwnProperty(key)) {
                                const element            = data[key];
                                let chatMessage:ChatCompletionUserMessageParam = {
                                    role:    'user', 
                                    content: 'Write the text for the h2 paragraph delimited by triple quotes. \
                                    I insert the paragraph title with the Markdow format (##). \
                                    """'+title+'""","""'+element.h2+'"""'
                                };
                                chatMessageArray.messages.push(chatMessage);                                
                                
                                element.h3.forEach(async (subtitle:string) => {
                                    let chatMessage:ChatCompletionUserMessageParam = {
                                        role:    'user', 
                                        content: 'Scrivi il testo per il paragrafo h3 delimitato da virgolette triple . """'+title+'""","""'+element.h2+'""","""'+subtitle+'"""'
                                    };
                                    chatMessageArray.messages.push(chatMessage);                                                                      
                                });
                            }        
                        } 
                        console.log(chatMessageArray);
                        //return this.getChatCompletitionRequest(chatMessageArray);          
                    }
                }
                
            }
            return null;
        } catch (error:any) {            
            console.error('processArticle: Errore durante l\'elaborazione dell\'articolo', error);
            return null;
        }
    }
    

    public async getChatCompletitionRequest(chatMessageArray:ChatCompletionCreateParamsNonStreaming): Promise<string | null> {
        try {      
    
            if (chatMessageArray) {
                console.log(chatMessageArray);  
                const completion = await this.openai.chat.completions.create(chatMessageArray);
                console.log(completion); 
                  
                let article = this.ucfirst(completion.choices[0].message.content);
                if( article != null ) {
                    article = article.replace(/<img[^>]*>/g, '');

                }
                return this.ucfirst(completion.choices[0].message.content);
                
            }
            return null;
        } catch (error:any) {            
            console.error('processArticle: Errore durante l\'elaborazione dell\'articolo', error);
            return null;
        }
    }
}

const c = new ChatGptApi2();
const article = c.getArticleBySiteAndGenerate('Rispondi in formato JSON, al titolo delimitato da virgolette triple. """Come scegliere un cardiofrequenzimetro"""','Come scegliere un cardiofrequenzimetro');
console.log(article);

export {ChatCompletionRequest};
export default ChatGptApi2;


