
import axios                            from "axios";
import dotenv                           from 'dotenv';
import * as fs                          from 'fs';
import FormData                         from 'form-data';
import sharp                            from "sharp";

import Article, { ArticleWithIdType }   from "../../database/mongodb/models/Article";
import Site, { SiteWithIdType }         from "../../database/mongodb/models/Site";
import connectMongoDB                   from "../../database/mongodb/connect";
import SitePublication,
{ SitePublicationWithIdType }           from "../../database/mongodb/models/SitePublication";
import ImageWP, { ImageType }           from "../../database/mongodb/models/ImageWP";
import { writeErrorLog }                from "../Log/Log";
import { WordpressCategory }            from "../OpenAi/Interface/WordpressInterface";
import { BaseAlert }                    from "../Alert/BaseAlert";

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
        // http://80.181.225.51:8050/api/getSections

        try{
            const sections = JSON.parse(article.categoryPublishSite);            
            const endPoint = `http://80.181.225.51:8050/api/getTecnicalTemplate?category=${sections.category.id}&subcategory=${sections.subcategory.id}&typology=${sections.typology.id}`;
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
        // http://80.181.225.51:8050/api/getSections

        try{            
            const endPoint = `http://80.181.225.51:8050/api/getSections`;
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
}

// Francesco Totti e i suoi luoghi preferiti nel Lazio: da Sabaudia ad Anzio

export default CmsAdminApi;

