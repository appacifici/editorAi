import connectMongoDB from "../../database/mongodb/connect";
import Site, { SiteArrayWithIdType, SiteWithIdType } from "../../database/mongodb/models/Site";
import axios, { AxiosError, AxiosResponse } from "axios";
import cheerio from 'cheerio';
import * as fs                              from 'fs';
import { ReadSitemapSingleNodeResponse, ReadSitemapResponse, UrlNode } from "../interface/SitemapInterface";
import { ScrapedData } from "../interface/ScrapedInterface";
import Article, { ArticleType, ArticleWithIdType } from "../../database/mongodb/models/Article";
import SitePublication, { SitePublicationArrayWithIdType, SitePublicationWithIdType } from "../../database/mongodb/models/SitePublication";
import { writeErrorLog } from "../../services/Log/Log";
import { download, extractGzip, readFileToServer } from "../../services/File";
import { BaseAlert } from "../../services/Alert/BaseAlert";

type ScrapeWebsiteFunction  = (url: string,selectorBody:string, selectorImg:string) => Promise<ScrapedData | null>;
type ReadSitemapFunction    = (url: string) => Promise<ReadSitemapResponse|null>;

function isError(e: any): e is Error {
    return e instanceof Error;
}


class BaseApi extends BaseAlert{
    alertProcess:   string;
    processName:    string;
    
    constructor() {
        super()
        this.connect();

        this.alertProcess   = '';             
        this.processName    = '';    
    }

    public async connect() {
        await connectMongoDB();
    }

    public setAlertProcessAndName(alertProcess:string, processName:string) {
        this.alertProcess   = alertProcess;             
        this.processName    = processName; 
    }

    public async getSitemapBySite(siteName: string): Promise<SiteWithIdType|Error> {
        try {
            const result: SiteWithIdType|null = await Site.findOne({ site: siteName });
            if( result === null ) {
                return new Error('Site.find not found');
            }
            return result;
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

    public async getSitePublication(sitePublicationName: string): Promise<SitePublicationWithIdType | Error> {
        try{ 
            console.log('eccolo finone');
            const result: SitePublicationWithIdType | null = await SitePublication.findOne({ sitePublication: sitePublicationName });
            if( result === null ) {
                return new Error('SitePublication.find not found');
            }
            return result;
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

    public async getArticleByUrl(url: string): Promise<ArticleWithIdType | null> {
        const result: ArticleWithIdType | null = await Article.findOne({ url: url });
        return result;
    }

    protected async readFromListSitemap(siteName: string, scrapeWebsite: ScrapeWebsiteFunction, readSitemapFunction:any) {                     
        this.alertUtility.setCallData(this.alertProcess, `readSitemapFunction`);        
        if( readSitemapFunction instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `readSitemapFunction in not function` );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `readSitemapFunction OK` );

        this.alertUtility.setCallData(this.alertProcess, `getSitemapBySite`, false);
        this.alertUtility.setCallData(this.alertProcess, siteName);  
        const result: SiteWithIdType|Error = await this.getSitemapBySite(siteName);
        if( result instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `getSitemapBySite`, false );
            this.alertUtility.setError(this.alertProcess, result );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `getSitemapBySite`, false);
        this.alertUtility.setCallResponse(this.alertProcess, result);
                  
        this.alertUtility.setCallData(this.alertProcess, `getSitePublication`, false);
        this.alertUtility.setCallData(this.alertProcess, result.sitePublication);
        const sitePublication: SitePublicationWithIdType | Error = await this.getSitePublication(result.sitePublication);
        if( sitePublication instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `getSitePublication`, false );
            this.alertUtility.setError(this.alertProcess, sitePublication );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `getSitePublication`, false);
        this.alertUtility.setCallResponse(this.alertProcess, sitePublication);


        const url = result.url;
        this.alertUtility.setCallData(this.alertProcess, `readFirstNodeSitemapFromUrl`, false);
        this.alertUtility.setCallData(this.alertProcess, url);   
        const sitemap: ReadSitemapSingleNodeResponse = await this.readFirstNodeSitemapFromUrl(url);
        if( sitemap instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `readFirstNodeSitemapFromUrl`, false );
            this.alertUtility.setError(this.alertProcess, sitemap );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `readFirstNodeSitemapFromUrl`, false);
        this.alertUtility.setCallResponse(this.alertProcess, sitemap);


        if (sitemap.success === true && sitePublication !== null) {
            let loc: string       = '';
            let date: Date | null = null;
            date                  = new Date();
            
            if (sitemap.data != undefined) {
                date = sitemap.data.lastmod != '' ? new Date(sitemap.data.lastmod) : date;
                loc = sitemap.data.loc;
            }

            const updateData = {
                lastMod: date,
                lastUrl: loc,
                active: 1,
            };
            

            await Site.updateOne({ url: url }, { $set: updateData });
            
            
            this.alertUtility.setCallData(this.alertProcess, `readSitemapFunction`, false);
            this.alertUtility.setCallData(this.alertProcess, loc);   
            const sitemapDetail: ReadSitemapResponse|Error = await readSitemapFunction(loc);
            if( sitemapDetail instanceof Error ) {
                this.alertUtility.setError(this.alertProcess, `readSitemapFunction`, false );
                this.alertUtility.setError(this.alertProcess, sitemapDetail );
                return false;
            }
            this.alertUtility.setCallResponse(this.alertProcess, `readSitemapFunction`, false);
            this.alertUtility.setCallResponse(this.alertProcess, sitemapDetail);

            if (sitemapDetail != null && sitemapDetail.data) {        
                this.alertUtility.setCallData(this.alertProcess, `insertOriginalArticle`, false);
                this.alertUtility.setCallData(this.alertProcess, result, false);           
                this.alertUtility.setCallData(this.alertProcess, sitePublication, false);           
                this.alertUtility.setCallData(this.alertProcess, sitemapDetail );           
                const insert:boolean|Error = await this.insertOriginalArticle(result, sitePublication, sitemapDetail, scrapeWebsite);
                if( insert instanceof Error ) {
                    this.alertUtility.setError(this.alertProcess, `insertOriginalArticle`, false );
                    this.alertUtility.setError(this.alertProcess, insert );                    
                } else {
                    this.alertUtility.setCallResponse(this.alertProcess, `insertOriginalArticle`, false);
                    this.alertUtility.setCallResponse(this.alertProcess, insert);
                }
            }
            return true;
        }

        this.alertUtility.setError(this.alertProcess, `sitemap.success === true && sitePublication !== null`, false );
        this.alertUtility.setError(this.alertProcess, sitemap, false );
        this.alertUtility.setError(this.alertProcess, sitePublication );        

        return false;
    }

    /**
     * Legge una classica sitemap di url
     */
    protected async readSimpleSitemap(siteName: string, scrapeWebsite: ScrapeWebsiteFunction) {
        this.alertUtility.setCallData(this.alertProcess, `getSitemapBySite`, false);
        this.alertUtility.setCallData(this.alertProcess, siteName);

        const result: SiteWithIdType|Error = await this.getSitemapBySite(siteName);
        if( result instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `getSitemapBySite`, false );
            this.alertUtility.setError(this.alertProcess, result );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `getSitemapBySite`, false);
        this.alertUtility.setCallResponse(this.alertProcess, result);
        
        this.alertUtility.setCallData(this.alertProcess, `getSitePublication`, false);
        this.alertUtility.setCallData(this.alertProcess, result.sitePublication);
        const sitePublication: SitePublicationWithIdType|Error = await this.getSitePublication(result.sitePublication);
        if( sitePublication instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `getSitePublication`, false );
            this.alertUtility.setError(this.alertProcess, sitePublication );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `getSitePublication`, false);
        this.alertUtility.setCallResponse(this.alertProcess, sitePublication);

        const url = result.url;
        this.alertUtility.setCallData(this.alertProcess, `readSitemapFromUrl`, false);
        this.alertUtility.setCallData(this.alertProcess, url);        
        const sitemapDetail: ReadSitemapResponse|Error = await this.readSitemapFromUrl(url);
        if( sitemapDetail instanceof Error ) {
            this.alertUtility.setError(this.alertProcess, `readSitemapFromUrl`, false );
            this.alertUtility.setError(this.alertProcess, sitemapDetail );
            return false;
        }
        this.alertUtility.setCallResponse(this.alertProcess, `readSitemapFromUrl`, false);
        this.alertUtility.setCallResponse(this.alertProcess, sitemapDetail);

        
        if (sitemapDetail != null && sitemapDetail.data && sitePublication !== null) {
            this.alertUtility.setCallData(this.alertProcess, `insertOriginalArticle`, false);
            this.alertUtility.setCallData(this.alertProcess, result,false);        
            this.alertUtility.setCallData(this.alertProcess, sitePublication,false);        
            this.alertUtility.setCallData(this.alertProcess, sitemapDetail);        
            const insertArticle = await this.insertOriginalArticle(result, sitePublication, sitemapDetail, scrapeWebsite);            
            if( insertArticle instanceof Error ) {                
                this.alertUtility.setError(this.alertProcess, `insertOriginalArticle`, false );
                this.alertUtility.setError(this.alertProcess, insertArticle );
                return false;
            }
            this.alertUtility.setCallResponse(this.alertProcess, `insertOriginalArticle`, false);
            this.alertUtility.setCallResponse(this.alertProcess, insertArticle);
        }        
    }


    //Prende solo il primo nodo di una sitemap
    private async readFirstNodeSitemapFromUrl(url: string): Promise<ReadSitemapSingleNodeResponse> {
        try {
            const response = await axios.get(url);
            const xmlData = response.data;

            // Carica il documento XML utilizzando cheerio
            const node = cheerio.load(xmlData, { xmlMode: true });

            // Estrai il primo nodo 'sitemap'
            const firstSitemapNode = node('sitemap').first();

            // Puoi fare qualcosa con il nodo estratto
            const locValue = firstSitemapNode.find('loc').text();
            const lastmodValue = firstSitemapNode.find('lastmod').text();

            // Costruisci il risultato
            const result: ReadSitemapSingleNodeResponse = {
                success: true,
                data: {
                    loc: locValue,
                    lastmod: lastmodValue,
                    // Aggiungi altre proprietà se necessario
                }
            };
            return result;

        } catch (error) {
            const errorMessage: string = (error as AxiosError).message || 'Errore sconosciuto';
            const result: ReadSitemapSingleNodeResponse = {
                success: false,
                error: `Errore nella richiesta per ${url}: ${errorMessage || error}`
            };
            await writeErrorLog(`Errore nella richiesta per ${url}`);
            await writeErrorLog(errorMessage || error);
            return result;
        }
    }

    //Prende n elementi di una sitemap
    protected async readSitemapFromUrl(url: string): Promise<ReadSitemapResponse|Error> {
        try {
            const response = await axios.get(url);
            const xmlData = response.data;
            return BaseApi.readSitemapXML(xmlData);

        } catch (error: unknown) {                      
            if (isError(error)) {
                return error as Error;
            } else {                
                return new Error('readSitemapFromUrl errore generico');
            }
        } 
    }

    static async readSitemapXML(xmlData: string): Promise<ReadSitemapResponse|Error> {
        try {
            
            // Carica il documento XML utilizzando cheerio
            const node = cheerio.load(xmlData, { xmlMode: true });

            // Estrai il primo nodo 'sitemap'
            const urlNodes = node('url');

            // Creo un array vuoto per contenere tutti i dati degli URL
            const urlData: UrlNode[] = [];

            // Itero su tutti gli elementi <url>
            urlNodes.each((index, element) => {
                const locValue = node(element).find('loc').text();
                let lastmodValue = node(element).find('lastmod').text();                
                if( lastmodValue == '' ) {
                    lastmodValue = node(element).find('news\\:publication_date').text()
                }

                if (index <= 9) {
                    let urlNode: UrlNode = { loc: locValue, lastmod: lastmodValue };
                    urlData.push(urlNode);
                }
            });

            // Costruisco il risultato con l'array contenente tutti i dati degli URL
            const result: ReadSitemapResponse = {
                success: true,
                data: urlData
            };

            return result;

        } catch (error: unknown) {                      
            if (isError(error)) {
                return error as Error;
            } else {                
                return new Error('readSitemapFromUrl errore generico');
            }
        } 
    }

    /**
     * Legge una sitemap in formato .gz url
     */
    protected async readGzSitemap(url: string): Promise<ReadSitemapResponse|Error> {
        try{
            const min:number       = 1;
            const max:number       = 100;
            const random:number    = Math.floor(Math.random() * (max - min + 1)) + min;
            const pathSave:string  = `${process.env.PATH_DOWNALOAD}${random}.gz`;
            const pathXml:string   = pathSave.replace('.gz','.xml');
            await download(url, pathSave);    
            await extractGzip(pathSave, pathXml);    
            const dataXML = await readFileToServer(pathXml);


            const dataXml:ReadSitemapResponse|Error   = await BaseApi.readSitemapXML(dataXML);        
            return dataXml;        
        } catch (error: unknown) {                      
            if (isError(error)) {
                return error as Error;
            } else {                
                return new Error('readGzSitemap errore generico');
            }
        } 
    }

    public async insertOriginalArticle(site: SiteWithIdType, sitePublication: SitePublicationWithIdType, sitemapDetail: ReadSitemapResponse, scrapeWebsite: ScrapeWebsiteFunction):Promise<boolean|Error> {        
        try {            
            if (sitemapDetail.data) {            
                for (const urlNode of sitemapDetail.data) {                               
                    const existArticle = await this.getArticleByUrl(urlNode.loc);
                    if (existArticle === null) {
                          
                        const loc = urlNode.loc;
                        const lastmod = urlNode.lastmod;
                        const scrapedData: ScrapedData | null = await scrapeWebsite(loc, site.selectorBody, site.selectorImg);
                        
                        if (scrapedData
                            && scrapedData.bodyContainerHTML !== undefined
                            && scrapedData.metaTitle !== undefined
                            && scrapedData.metaDescription !== undefined
                            && scrapedData.h1Content !== undefined
                            && scrapedData.img !== undefined
                        ) {
                            
                            //Prende random tra gli id definiti un utente con cui pubblicare
                            const aUserPublish = site.userPublishSite.split(',');                             
                            const randomIndex = Math.floor(Math.random() * aUserPublish.length);
                            const userPublish = aUserPublish[randomIndex];
                            console.log(userPublish);

                            const articleData: ArticleType = {
                                site:                   site._id,
                                sitePublication:        sitePublication._id,
                                url:                    urlNode.loc,
                                body:                   scrapedData?.bodyContainerHTML,
                                title:                  scrapedData?.metaTitle,
                                description:            scrapedData?.metaDescription,
                                h1:                     scrapedData?.h1Content,
                                img:                    scrapedData?.img,
                                genarateGpt:            0,
                                send:                   0,
                                lastMod:                new Date(urlNode.lastmod),
                                publishDate:            new Date(),
                                categoryPublishSite:    site.categoryPublishSite,
                                userPublishSite:        userPublish,
                            };

                            
                            let insertArticle =  this.insertArticle(articleData);
                            if( insertArticle instanceof Error ) {
                                return insertArticle;
                            }
                        } else {
                            let fieldEmpty:string = '';
                            if (scrapedData !== null) {
                                fieldEmpty += scrapedData.bodyContainerHTML === undefined ? 'bodyContainerHTML' : '';
                                fieldEmpty += scrapedData.metaTitle === undefined ? 'metaTitle' : '';
                                fieldEmpty += scrapedData.metaDescription === undefined ? 'metaDescription' : '';
                                fieldEmpty += scrapedData.h1Content === undefined ? 'h1Content' : '';
                                fieldEmpty += scrapedData.img === undefined ? 'img' : '';                            
                            }

                            const errors = JSON.stringify(scrapedData);
                            return new Error('insertOriginalArticle: Mancano i seguenti campi: ==>'+fieldEmpty+'<== || CONTROLLARE I SELETTORI SEL SITO || ');
                        }                                           
                    }
                }
            }
            return true;
        } catch (error: unknown) {                      
            if (isError(error)) {
                return error as Error;
            } else {                
                return new Error('insertOriginalArticle errore generico');
            }
        }        
    }

    public async insertArticle(articleData: ArticleType):Promise<boolean|Error> {
        try {

            
            // Crea una nuova istanza dell'articolo utilizzando i dati forniti
            const newArticle = new Article(articleData);

            await newArticle.validate();
            console.log('Validazione riuscita');
            
            // Salva l'articolo nel database
            const savedArticle = await newArticle.save();
            console.log(savedArticle);
            
            return true;

        }  catch (error: unknown) {                      
            if (isError(error)) {
                return error as Error;
            } else {                
                return new Error('insertOriginalArticle errore generico');
            }
        }
    }


    public isValidDataType<T>(data: T | null | undefined): data is T {
        return data !== null && data !== undefined && data !== false;
    }

}

export default BaseApi;