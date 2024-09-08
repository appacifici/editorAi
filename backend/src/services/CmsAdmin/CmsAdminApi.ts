
import axios                            from "axios";
import dotenv                           from 'dotenv';
import Article, { ArticleWithIdType }   from "../../database/mongodb/models/Article";
import connectMongoDB                   from "../../database/mongodb/connect";
import SitePublication,
{ SitePublicationWithIdType }           from "../../database/mongodb/models/SitePublication";
import { BaseAlert }                    from "../Alert/BaseAlert";
import { PromptAiWithIdType }           from "../../database/mongodb/models/PromptAi";
import { ItemProductAmazon, ProductsJson } from "../../files/apiWrappedAmazon";

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
        // http://79.37.16.106:8050/api/getSections

        try{
            const sections = JSON.parse(article.categoryPublishSite);            
            const endPoint = `http://79.37.16.106:8050/api/getTecnicalTemplate?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
            const response = await axios.get(endPoint);
            return JSON.stringify(response.data);
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

    public async getSectionsCmsAdmin(sitePublication: SitePublicationWithIdType,article:ArticleWithIdType):Promise<string|Error> {
        
        // console.log(sitePublication);
        //TODO: modificare sitePub lication e inserire campi per gestire questa url dinamicamente
        // http://79.37.16.106:8050/api/getSections

        try{            
            const endPoint = `http://79.37.16.106:8050/api/getSections`;
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
        // http://79.37.16.106:8050/api/getSections

        try{            
            const sections = JSON.parse(article.categoryPublishSite);
            const endPoint = `http://79.37.16.106:8050/api/getBackLinkSections?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
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
        // http://79.37.16.106:8050/api/getSections

        try{            
            const sections = JSON.parse(article.categoryPublishSite);
            const endPoint = `http://79.37.16.106:8050/api/getSectionKeywordsCmsAdmin?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
            
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
            const endPoint = `http://79.37.16.106:8050/api/setUseSectionBacklinksCmsAdmin?useBacklinks=${useBacklinks}`;
        
            
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
            const endPoint = `http://79.37.16.106:8050/api/setUseSectionKeywordsCmsAdmin?typology=${sections.typology.id}&useKeywords=${useKey}`;
        
            
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
            
            const endPoint = `http://79.37.16.106:8050/api/insertNewProduct`;                    
            console.log('http://79.37.16.106:8050/api/insertNewProduct'); 
            console.log(product); 
            const response = await axios.post(endPoint, product, {
                headers: {
                  'Content-Type': 'application/json', // Imposta il tipo di contenuto a JSON
                },
                timeout: 10000, // Timeout di 10 secondi
            });
            console.log("##########FINEsd ");  

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
                return new Error('insertNewProduct errore generico');
            }
        }
    }


}

export default CmsAdminApi;