
import axios                            from "axios";
import dotenv                           from 'dotenv';
import Article, { ArticleWithIdType }   from "../../database/mongodb/models/Article";
import connectMongoDB                   from "../../database/mongodb/connect";
import SitePublication,
{ SitePublicationWithIdType }           from "../../database/mongodb/models/SitePublication";
import { BaseAlert }                    from "../Alert/BaseAlert";
import { PromptAiWithIdType }           from "../../database/mongodb/models/PromptAi";
import { ItemProductAmazon, ProductsJson } from "../../files/apiWrappedAmazon";
import Site, { SiteWithIdType } from "../../database/mongodb/models/Site";

const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

//TODO da definire in altro file
function isError(e: any): e is Error {
    return e instanceof Error;
}

class CmsAdminApi extends BaseAlert{
    
    constructor() {
        super();        
        connectMongoDB();
    }

    public async getApiSections(siteName: string) {
        try {
            console.log('ecc');
            const sitePublication: any = await SitePublication.findOne({ sitePublication: siteName });
            const page = sitePublication?.page;
            if (sitePublication !== null) {
                const url: string = `${sitePublication.urlCategories}`;
                console.log(sitePublication.urlCategories);
                const response = await axios.get(url);
                console.log(response.data);
                if (response.data) {
                    

                    const filtro = { sitePublication: siteName };
                    const aggiornamento = { categories: response.data };
                    await SitePublication.findOneAndUpdate(filtro, aggiornamento, { new: true });

                } else {
                    console.log('getCmsAdminApiSections.ts: No Categories found.');
                }

            }

        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getCmsAdminApiSections errore generico');
            }
        }
    }

    public async getCmsAdminTecnicalTemplate(sitePublication: SitePublicationWithIdType,article:ArticleWithIdType):Promise<string|Error> {
        
        // console.log(sitePublication);
        //TODO: modificare sitePub lication e inserire campi per gestire questa url dinamicamente
        // http://82.55.228.55:8050/api/getSections
        const sections = JSON.parse(article.categoryPublishSite);            
        const endPoint = `http://82.55.228.55:8050/api/getTecnicalTemplate?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
        try{
            
            const response = await axios.get(endPoint);
            return JSON.stringify(response.data);
        } catch (error: unknown) {                     
            if (isError(error)) {
                return new Error(` getCmsAdminApiSections errore:${endPoint}`);
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getCmsAdminApiSections errore generico');
            }
        }
    }

    public async getSectionsCmsAdmin(sitePublication: SitePublicationWithIdType,article:ArticleWithIdType):Promise<string|Error> {
        
        // console.log(sitePublication);
        //TODO: modificare sitePub lication e inserire campi per gestire questa url dinamicamente
        // http://82.55.228.55:8050/api/getSections

        try{            
            const endPoint = `http://82.55.228.55:8050/api/getSections`;
            const response = await axios.get(endPoint);            
            return JSON.stringify(response.data);
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getSectionsCmsAdmin errore generico');
            }
        }
    }

    public async getBacklinkSectionsCmsAdmin(sitePublication: SitePublicationWithIdType,article:ArticleWithIdType):Promise<string|Error> {
        
        // console.log(sitePublication);
        //TODO: modificare sitePub lication e inserire campi per gestire questa url dinamicamente
        // http://82.55.228.55:8050/api/getSections

        try{            
            const sections = JSON.parse(article.categoryPublishSite);
            const endPoint = `http://82.55.228.55:8050/api/getBackLinkSections?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
            const response = await axios.get(endPoint);            
            return JSON.stringify(response.data);
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getBacklinkSectionsCmsAdmin errore generico');
            }
        }
    }

    public async getSectionKeywordsCmsAdmin(sitePublication: SitePublicationWithIdType,article:ArticleWithIdType):Promise<string|Error> {
        
        // console.log(sitePublication);
        //TODO: modificare sitePub lication e inserire campi per gestire questa url dinamicamente
        // http://82.55.228.55:8050/api/getSections

        try{            
            const sections = JSON.parse(article.categoryPublishSite);
            const endPoint = `http://82.55.228.55:8050/api/getSectionKeywordsCmsAdmin?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
            
            const response = await axios.get(endPoint);            
            return JSON.stringify(response.data);
            return '';
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getBacklinkSectionsCmsAdmin errore generico');
            }
        }
    }

    public async setUseSectionBacklinksCmsAdmin(article:ArticleWithIdType,promptAi: PromptAiWithIdType):Promise<boolean|Error> {
        try{   
            
            console.log("##########promptAi");
            console.log(promptAi);            
            const useBacklinks = promptAi.data;
            const endPoint = `http://82.55.228.55:8050/api/setUseSectionBacklinksCmsAdmin?useBacklinks=${useBacklinks}`;
        
            
            const response = await axios.get(endPoint);
            console.log("############ response");            
            console.log(endPoint);

            //return JSON.stringify(response.data);
            return true;
        } catch (error: unknown) {                     
            if (isError(error)) {
                console.log("ERRORWEWWWWWWWW222");
                console.log(error);
                return error as Error;
            } else {
                console.log("ERRORWEWWWWWWWW");
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getBacklinkSectionsCmsAdmin errore generico');
            }
        }
    }

    public async setUseSectionKeywordsCmsAdmin(article:ArticleWithIdType,promptAi: PromptAiWithIdType):Promise<boolean|Error> {
        try{   
            
            console.log("##########promptAi");
            console.log(promptAi);
            const sections = JSON.parse(article.categoryPublishSite);
            const useKey = promptAi.data;
            const endPoint = `http://82.55.228.55:8050/api/setUseSectionKeywordsCmsAdmin?typology=${sections.typology.id}&useKeywords=${useKey}`;
        
            
            const response = await axios.get(endPoint);
            console.log("############ response");            
            console.log(response);

            //return JSON.stringify(response.data);
            return true;
        } catch (error: unknown) {                     
            if (isError(error)) {
                console.log("ERRORWEWWWWWWWW222");
                console.log(error);
                return error as Error;
            } else {
                console.log("ERRORWEWWWWWWWW");
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getBacklinkSectionsCmsAdmin errore generico');
            }
        }
    }

    public async insertNewProduct(product:ItemProductAmazon):Promise<boolean|Error> {
        try{   
            
            // Accedi a vari campi dell'item
            console.log(`ASIN: ${product.ASIN}`);            
            
            const endPoint = `http://82.55.228.55:8050/api/insertNewProduct`;                    
            console.log('http://82.55.228.55:8050/api/insertNewProduct'); 
            
            const response:any = await axios.post(endPoint, product, {
                headers: {
                  'Content-Type': 'application/json', // Imposta il tipo di contenuto a JSON
                },
                timeout: 10000, // Timeout di 10 secondi
            });
            

            console.log("############ response");            
            console.log(response.data.success);

            //return JSON.stringify(response.data);
            return response.success;
        } catch (error: unknown) {                     
            if (isError(error)) {
                console.log("ERRORWEWWWWWWWW222");
                console.log(error);
                return error as Error;
            } else {
                console.log("ERRORWEWWWWWWWW");
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('insertNewProduct errore generico');
            }
        }
    }

    public async updateProduct(alertProcess:string,siteName: string, send: number, articleSelected?:ArticleWithIdType|null):Promise<boolean|Error> {
        this.alertUtility.setCallData(alertProcess, `SitePublication.findOne: sitePublication`,false);
        this.alertUtility.setCallData(alertProcess, siteName);
        const sitePublication: SitePublicationWithIdType | null = await SitePublication.findOne({ sitePublication: siteName });
        if(sitePublication === null ) {  
            console.log('SitePublication == null');
            //await writeErrorLog(siteName + '- runPromptAiArticle: promptAi == null: siteName:' + siteName+ ' promptAiId:'+promptAiId);
            this.alertUtility.setError(alertProcess, 'SitePublication.findOne:<br> SitePublication == null', false);                
            this.alertUtility.setError(alertProcess, siteName);                 
            return false;                
        }
        this.alertUtility.setCallResponse(alertProcess, `SitePublication.findOne:<br>`, false);
        this.alertUtility.setCallResponse(alertProcess, sitePublication);

        //------------------------------------------------------------------------------------------------------------//

        this.alertUtility.setCallData(alertProcess, `Article.findOne: sitePublication - genarateGpt - send`,false);
        this.alertUtility.setCallData(alertProcess, sitePublication, false);
        this.alertUtility.setCallData(alertProcess, 1, false);
        this.alertUtility.setCallData(alertProcess, 0);

        let  article: ArticleWithIdType | null;
        if( articleSelected === undefined ) {
            article= await Article.findOne({ sitePublication: sitePublication?._id, genarateGpt: 1, send: 0 }).sort({ lastMod: 1 }) as ArticleWithIdType | null;
        } else {
            article = articleSelected;
        }
        if(article === null ) {                  
            this.alertUtility.setError(alertProcess, 'Article.findOne:<br> article == null');                
            return false;                
        }
        this.alertUtility.setCallResponse(alertProcess, `Article.findOne:<br>`, false);
        this.alertUtility.setCallResponse(alertProcess, article);

 

        this.alertUtility.setCallData(alertProcess, `Article.findOneAndUpdate send: 1`, false);   
        try{         

            console.log('eccccccco');
            console.log(article);
            const endPoint = `http://82.55.228.55:8050/api/updateProduct`;                    
            console.log('http://82.55.228.55:8050/api/updateProduct'); 
            
            const response:any = await axios.post(endPoint, article, {
                headers: {
                  'Content-Type': 'application/json', // Imposta il tipo di contenuto a JSON
                },
                timeout: 10000, // Timeout di 10 secondi
            });
            
            console.log(response.data);
            const filtro = { _id: article._id };
            const aggiornamento = { send: 1 };
            await Article.findOneAndUpdate(filtro, aggiornamento, { new: true });
            this.alertUtility.setCallResponse(alertProcess, `Article.findOneAndUpdate OK`);

        } catch (error: unknown) {                     
            this.alertUtility.setError(alertProcess, `Article.findOneAndUpdate`, false );
            this.alertUtility.setError(alertProcess, error );
            return false;
        }
            
        
        return true;
    }


}

export default CmsAdminApi;