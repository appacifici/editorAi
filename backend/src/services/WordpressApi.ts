
import axios                            from "axios";
import dotenv                           from 'dotenv';
import * as fs                          from 'fs';
import FormData                         from 'form-data';
import sharp                            from "sharp";

import Article, { ArticleWithIdType }   from "../database/mongodb/models/Article";
import Site, { SiteWithIdType }         from "../database/mongodb/models/Site";
import connectMongoDB                   from "../database/mongodb/connect";
import SitePublication,
{ SitePublicationWithIdType }           from "../database/mongodb/models/SitePublication";
import ImageWP, { ImageType }           from "../database/mongodb/models/ImageWP";
import { writeErrorLog }                from "./Log/Log";
import { WordpressCategory }            from "./OpenAi/Interface/WordpressInterface";
import { BaseAlert } from "./Alert/BaseAlert";

const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });

//TODO da definire in altro file
function isError(e: any): e is Error {
    return e instanceof Error;
}

class WordpressApi extends BaseAlert{
    
    constructor() {
        super();        
        connectMongoDB();
    }

    public async getWpApiCategories(siteName: string) {
        try {
            console.log('ecc');
            const sitePublication: any = await SitePublication.findOne({ sitePublication: siteName });
            const page = sitePublication?.page;
            if (sitePublication !== null) {
                const url: string = `${sitePublication.urlCategories}`;
                const response = await axios.get(url);
                console.log(response);
                if (response.data && Array.isArray(response.data)) {
                    const wordpressCategory: WordpressCategory[] = response.data.map((cat: any) => ({
                        id: cat.id,
                        link: cat.link,
                        name: cat.name,
                        slug: cat.slug,
                    }));
                    console.log(wordpressCategory);

                    const filtro = { sitePublication: siteName };
                    const aggiornamento = { categories: wordpressCategory };
                    await SitePublication.findOneAndUpdate(filtro, aggiornamento, { new: true });

                } else {
                    console.log('getWpApiCategories: No Categories found.');
                }

            }

        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('downloadImage errore generico');
            }
        }
    }

    public async getImagesFromWordPress(siteName: string):Promise<Error|void> {
        try {
            const sitePublication: any = await SitePublication.findOne({ sitePublication: siteName });
            const page = sitePublication?.page;
            if (sitePublication !== null) {
                const url = `${sitePublication.urlImages}?per_page=100&page=${page}&orderby=id&order=asc`;
                const response = await axios.get(url);
                if (response.data && Array.isArray(response.data)) {
                    for (const image of response.data) {
                        console.log('Image ID:', image.id);
                        console.log('Image link:', image.link);
                        console.log('Image Title:', image.title.rendered);
                        console.log('Image URL:', image.source_url);
                        console.log('Image Alt Text:', image.alt_text);
                        console.log('Image Description:', image.description);
                        console.log('---------------------------');
                        try {
                            let imageData: ImageType = {
                                sitePublication: sitePublication._id,
                                imageID: image.id,
                                imageLink: image.link,
                                imageTitle: image.title.rendered.replace(/-/g, " "),
                                imageURL: image.source_url,
                                imageAltText: image.alt_text.replace(/-/g, " ")
                            }
                            const newImage = new ImageWP(imageData);
                            await newImage.save();
                            console.log(`getImagesFromWordPress: Immagine con ID ${newImage.imageID} salvata correttamente.`);
                        } catch (error: any) {
                            await writeErrorLog(`getImagesFromWordPress: Si è verificato un errore durante il salvataggio dell'immagine con ID ${image.id}`);
                            await writeErrorLog(error);
                            console.error(`getImagesFromWordPress: Si è verificato un errore durante il salvataggio dell'immagine`);
                        }
                    }
                } else {
                    console.log('getImagesFromWordPress: No images found.');
                }
                
                sitePublication.page += 1;
                await sitePublication.save();
                this.getImagesFromWordPress(siteName);
            
            }

        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('getImagesFromWordPress errore generico');
            }
        }
    }

    private async downloadImage(url: string, outputPath: string): Promise<void|Error> {
        try {
            const response = await axios({
                method: 'GET',
                url: url,
                responseType: 'stream'
            });

            response.data.pipe(fs.createWriteStream(outputPath));

            await new Promise((resolve) => {
                response.data.on('end', () => {
                    console.log('getImagesFromWordPress: immagine scaricata correttamente');
                    resolve(null); // Passiamo null o undefined come argomento
                });

                response.data.on('error', async (err: any) => {                    
                    throw err; // Lancio l'errore per essere catturato dal blocco catch esterno
                });
            });
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('downloadImage errore generico');
            }
        }
    }

    private async resizeAndCompressImage(inputPath: string, outputPath: string): Promise<boolean|Error>  {
        try {
            let quality = 100; // Inizia con la qualità al 100%
            let sizeOk = false;
            let fileSizeInKb = 0;

            // Carica l'immagine e ottiene le sue dimensioni
            const { width, height } = await sharp(inputPath).metadata();
            if (width == undefined || height == undefined) {
                return false;
            }

            const maxWidth = 1280;
            const maxHeight = 900;

            // Calcola le proporzioni per capire se dobbiamo ridimensionare in base alla larghezza o all'altezza
            const widthRatio = maxWidth / width;
            const heightRatio = maxHeight / height;
            const resizeRatio = Math.min(widthRatio, heightRatio);

            let newWidth = width;
            let newHeight = height;

            // Se resizeRatio < 1, l'immagine è più grande di una delle dimensioni massime e deve essere ridimensionata
            if (resizeRatio < 1) {
                newWidth = Math.floor(width * resizeRatio);
                newHeight = Math.floor(height * resizeRatio);
            }

            while (!sizeOk && quality > 0) {
                await sharp(inputPath)
                    .resize(newWidth, newHeight)
                    .jpeg({ quality: quality }) // Imposta la qualità e il formato dell'immagine
                    .toFile(outputPath);

                const stats = await fs.promises.stat(outputPath); // Controlla la dimensione del file
                fileSizeInKb = stats.size / 1024;

                console.log(`Quality: ${quality}% - File Size: ${fileSizeInKb.toFixed(2)} KB`);

                if (fileSizeInKb > 90) {
                    quality -= 1; // Diminuisci la qualità dell'1% e riprova
                } else {
                    sizeOk = true;
                    console.log('Image processing completed.');
                    return true;
                }
            }

            if (!sizeOk) {
                throw new Error("Non è possibile comprimere l'immagine sotto i 90KB mantenendo una qualità visiva accettabile.");
            }
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('resizeAndCompressImage errore generico');
            }
        }
        return false;
    }

    private async uploadImageAndGetId(imagePath: string, sitePublication: SitePublicationWithIdType, titleGpt: string | undefined): Promise<object|Error> {
        const imageName = titleGpt !== undefined ? this.removeStopWords(titleGpt) : 'img_' + Math.floor(Math.random() * (1000 - 1 + 1)) + 1;
        let newImg = imageName.replace(/ /g, "_");
        newImg = imageName.replace(/\//g, "");
        newImg = newImg.replace(/[^\w\s]/gi, '');
        newImg = newImg.replace(/\s+/g, '-');

        const pathSaveTmp   = `${process.env.PATH_DOWNALOAD}${newImg}_temp.jpg`;
        const pathSave      = `${process.env.PATH_DOWNALOAD}${newImg}.jpg`;
        await this.downloadImage(imagePath, pathSaveTmp);
        await this.resizeAndCompressImage(pathSaveTmp, pathSave);

        const formData = new FormData();
        formData.append('file', fs.createReadStream(pathSave));

        const userData = {
            username: sitePublication.username,
            password: sitePublication.password
        };

        const authUrl = sitePublication.tokenUrl;
        try {
            const authResponse = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            const authData = await authResponse.json();
            const token = authData.token;

            const response = await axios.post(sitePublication.urlImages, formData, {
                headers: {
                    ...formData.getHeaders(),
                    'Authorization': `Bearer ${token}`
                }
            });
            return response.data;
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('uploadImageAndGetId errore generico');
            }
        }
    }


    public async sendToWPApi(alertProcess:string,siteName: string, send: number, articleSelected?:ArticleWithIdType|null): Promise<Boolean> {
        

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

        //------------------------------------------------------------------------------------------------------------//
        
        this.alertUtility.setCallData(alertProcess, `Site.findOne: _id`,false);
        this.alertUtility.setCallData(alertProcess, article?.site);            
        const site: SiteWithIdType | null = await Site.findOne({ _id: article?.site });
        if(site === null ) {                  
            this.alertUtility.setError(alertProcess, 'Site.findOne:<br> site == null');                
            return false;                
        }
        this.alertUtility.setCallResponse(alertProcess, `Site.findOne:<br>`, false);
        this.alertUtility.setCallResponse(alertProcess, site);



        // const chatGptApi = new ChatGptApi();
        // let textString: string | null = await chatGptApi.getCsvKeywords(article.titleGpt);
        // console.log(article.titleGpt);

        // if (textString == null) {
        //     console.error(textString);
        //     await writeErrorLog("sendToWPApi textString === null");
        //     return false;
        // }

        // const regex = /\[[^\]]*\]/;
        // const jsonString = textString.match(regex);
        // if (jsonString == null) {
        //     await writeErrorLog("sendToWPApi jsonString === null");
        //     console.error(jsonString);
        //     return false;
        // }                        

        // let results: any = [];
        // results = JSON.parse(jsonString[0]);            
        // console.log(results);            

        // let imageWP = await findImageByWords(results, sitePublication._id);            

        // if (imageWP === undefined && article.titleGpt !== undefined) {
        //     console.log('eccomi');
        //     const words = this.adaptReponseWeight(article.titleGpt);
        //     console.log(words);
        //     imageWP = await findImageByWords(words, sitePublication._id);
        // }

        // const reponseImage: any = await this.uploadImageAndGetId(article.imageLink, sitePublication, article.titleGpt);                


        this.alertUtility.setCallData(alertProcess, `uploadImageAndGetId(article.img, sitePublication, article.titleGpt)`,false);
        this.alertUtility.setCallData(alertProcess, article.img, false);     
        this.alertUtility.setCallData(alertProcess, sitePublication, false);     
        this.alertUtility.setCallData(alertProcess, article.titleGpt);     
        const reponseImage:any|Error = await this.uploadImageAndGetId(article.img, sitePublication, article.titleGpt);
        if( reponseImage instanceof Error ) {
            this.alertUtility.setError(alertProcess, `uploadImageAndGetId:<br> `, false );
            this.alertUtility.setError(alertProcess, reponseImage, false );

            const filtro = { _id: article._id };
            const aggiornamento = { send: 3 };
            await Article.findOneAndUpdate(filtro, aggiornamento, { new: true });
            this.alertUtility.setError(alertProcess, `uploadImageAndGetId Error - Set Article.findOneAndUpdate send:3 `);

            return false;
        }
        this.alertUtility.setCallResponse(alertProcess, `uploadImageAndGetId`,false);
        this.alertUtility.setCallResponse(alertProcess, reponseImage);

        const userData = {
            username: sitePublication.username,
            password: sitePublication.password
        };
        // URL per il punto finale di autenticazione JWT
        const authUrl = sitePublication.tokenUrl;

        this.alertUtility.setCallData(alertProcess, `fetch(authUrl)`,false);
        this.alertUtility.setCallData(alertProcess, authUrl,false);
        this.alertUtility.setCallData(alertProcess, userData);            
        let token;
        try{
            // Effettua una richiesta POST per generare il token di autenticazione
            const tokenResponse = await fetch(authUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });
            
            const tokenData = await tokenResponse.json();
            token = tokenData.token;
            this.alertUtility.setCallResponse(alertProcess, `fetch(authUrl)`,false);
            this.alertUtility.setCallResponse(alertProcess, tokenData);
        } catch (error: unknown) {                     
            this.alertUtility.setError(alertProcess, `fetch(authUrl`, false );
            this.alertUtility.setError(alertProcess, error );
            return false;
        }

        this.alertUtility.setCallData(alertProcess, `PublishWP - auth - postData`, false);            
        const auth = {
            'Authorization': `Bearer ${token}`
        };
        const wordpressAPIURL = sitePublication.url;
        const postData = {
            title: article.h1Gpt,
            content: `<img src="${reponseImage.guid.raw}">` + article.bodyGpt,
            _yoast_wpseo_title: article.titleGpt,
            _yoast_wpseo_metadesc: article.descriptionGpt,
            yoast_title: article.titleGpt,
            yoast_meta: {
                description: article.descriptionGpt
            },
            status: 'publish',
            featured_media: reponseImage.id,
            author: article?.userPublishSite, // Aggiungi lo userId dell'autore
            categories: [article?.categoryPublishSite]
        };

        this.alertUtility.setCallData(alertProcess, auth);   
        this.alertUtility.setCallData(alertProcess, postData);   
        try{            
            await axios.post(wordpressAPIURL, postData, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            this.alertUtility.setCallResponse(alertProcess, `PublishWP: OK`,false);
            
        } catch (error: unknown) {                     
            this.alertUtility.setError(alertProcess, `PublishWP`, false );
            this.alertUtility.setError(alertProcess, error );
            return false;
        }

        this.alertUtility.setCallData(alertProcess, `Article.findOneAndUpdate send: 1`, false);   
        try{         
            // Aggiorna il campo 'send' dell'articolo
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




    public removeStopWords(testo: string): string {
        // Array di congiunzioni e articoli da rimuovere
        const paroleDaRimuovere = /\b(a|:|abbia|abbiamo|abbiano|abbiate|ad|adesso|ai|al|alla|alle|allo|allora|altre|altri|altro|anche|ancora|avemmo|avendo|avesse|avessero|avessi|avessimo|aveste|avesti|avete|aveva|avevamo|avevano|avevate|avevi|avevo|avrai|avranno|avrebbe|avrebbero|avrei|avremmo|avremo|avreste|avresti|avrete|avrà|avrò|avuta|avute|avuti|avuto|c|che|chi|ci|coi|col|come|con|contro|cui|da|dagli|dai|dal|dall|dalla|dalle|dallo|degl|degli|dei|del|dell|della|delle|dello|dentro|di|dopo|dove|e|ebbe|ebbero|ebbi|ecc|ed|era|erano|eravamo|eravate|eri|ero|esempio|essa|esse|essendo|esser|essere|essi|essimo|esso|estate|farai|faranno|fare|farebbe|farebbero|farei|faremmo|faremo|fareste|faresti|farete|farà|farò|fece|fecero|feci|fin|finalmente|finche|fine|fino|forse|fosse|fossero|fossi|fossimo|foste|fosti|fra|frattempo|fu|fui|fummo|furono|giu|ha|hai|hanno|ho|i|il|improvviso|in|infatti|insieme|intanto|io|l|la|lavoro|le|lei|li|lo|loro|lui|lungo|ma|magari|mai|male|malgrado|malissimo|me|medesimo|mediante|meglio|meno|mentre|mesi|mezzo|mi|mia|mie|miei|mila|miliardi|milio|molta|molti|molto|momento|mondo|ne|negli|nei|nel|nell|nella|nelle|nello|no|noi|nome|non|nondimeno|nonsia|nostra|nostre|nostri|nostro|o|od|oggi|ogni|ognuna|ognuno|oltre|oppure|ora|otto|paese|parecchi|parecchie|parecchio|parte|partendo|peccato|peggio|per|perche|perché|perciò|perfino|pero|persino|persone|piu|piuttosto|più|pochissimo|poco|poi|poiche|possa|possedere|posteriore|posto|potrebbe|preferibilmente|presa|press|prima|primo|proprio|puoi|pure|purtroppo|può|qua|quale|quali|qualcosa|qualcuna|qualcuno|quale|quali|qualunque|quando|quanto|quasi|quattro|quel|quella|quelli|quelle|quello|quest|questa|queste|questi|questo|qui|quindi|quinto|realmente|recente|recentemente|registrazione|relativo|riecco|salvo|sara|sarai|saranno|sarebbe|sarebbero|sarei|saremmo|saremo|sareste|saresti|sarete|sarà|sarò|scola|scopo|scorso|se|secondo|seguente|seguito|sei|sembra|sembrare|sembrato|sembrava|sembri|sempre|senza|sette|si|sia|siamo|siano|siate|siete|sig|solito|solo|soltanto|sono|sopra|soprattutto|sotto|spesso|sta|stai|stando|stanno|starai|staranno|starebbe|starebbero|starei|staremmo|staremo|stareste|staresti|starete|starà|starò|stata|state|stati|stato|stava|stavamo|stavano|stavate|stavi|stavo|stemmo|stessa|stesse|stessero|stessi|stessimo|stesso|steste|stesti|stette|stettero|stetti|stia)\b/g;
        // Rimuovi le congiunzioni e gli articoli sostituendoli con una stringa vuota

        const testoPulito = testo.replace(paroleDaRimuovere, '');
        return testoPulito;
    }

    public adaptReponseWeight(testo: string): any {
        // Array di congiunzioni e articoli da rimuovere
        const paroleDaRimuovere = /\b(in|:|con|su|per|tra|fra|sopra|sotto|e|né|o|oppure|ma|anche|neanche|neppure|nemmeno|sia|sia... sia|tanto|quanto|benché|sebbene|perciò|pertanto|quindi|dunque|però|tuttavia|ciononostante|nondimeno|mentre|poiché|siccome|affinché|onde|perché|dato che|in quanto|siccome|giacché|qualora|a meno che|a patto che|salvo che|tranne che|senza che|purché|nel caso che|qualunque|sia... che|che|quando|se|come|anche se|per quanto|pure se|ovunque|dove|dovunque|laddove|finché|fintantoché|purché|fino a che|affinché|tanto che|perché|da... a|da... fino a|da... fino a che|da... da|dal... al|dal... al|dal... al|fra... e|tra... e|tra... e|fra... e|fra... e|al posto di|invece di|piuttosto che|anziché|quanto|quanto|che|qualunque|quale|qualsiasi|qualsivoglia|quale|qualunque|quale|qualsiasi|qualsivoglia|a|abbia|abbiamo|abbiano|abbiate|ad|adesso|ai|al|alla|alle|allo|allora|altre|altri|altro|anche|ancora|avemmo|avendo|avesse|avessero|avessi|avessimo|aveste|avesti|avete|aveva|avevamo|avevano|avevate|avevi|avevo|avrai|avranno|avrebbe|avrebbero|avrei|avremmo|avremo|avreste|avresti|avrete|avrà|avrò|avuta|avute|avuti|avuto|c|che|chi|ci|coi|col|come|con|contro|cui|da|dagli|dai|dal|dall|dalla|dalle|dallo|degl|degli|dei|del|dell|della|delle|dello|dentro|di|dopo|dove|e|ebbe|ebbero|ebbi|ecc|ed|era|erano|eravamo|eravate|eri|ero|esempio|essa|esse|essendo|esser|essere|essi|essimo|esso|estate|farai|faranno|fare|farebbe|farebbero|farei|faremmo|faremo|fareste|faresti|farete|farà|farò|fece|fecero|feci|fin|finalmente|finche|fine|fino|forse|fosse|fossero|fossi|fossimo|foste|fosti|fra|frattempo|fu|fui|fummo|furono|giu|ha|hai|hanno|ho|i|il|improvviso|in|infatti|insieme|intanto|io|l|la|lavoro|le|lei|li|lo|loro|lui|lungo|ma|magari|mai|male|malgrado|malissimo|me|medesimo|mediante|meglio|meno|mentre|mesi|mezzo|mi|mia|mie|miei|mila|miliardi|milio|molta|molti|molto|momento|mondo|ne|negli|nei|nel|nell|nella|nelle|nello|no|noi|nome|non|nondimeno|nonsia|nostra|nostre|nostri|nostro|o|od|oggi|ogni|ognuna|ognuno|oltre|oppure|ora|otto|paese|parecchi|parecchie|parecchio|parte|partendo|peccato|peggio|per|perche|perché|perciò|perfino|pero|persino|persone|piu|piuttosto|più|pochissimo|poco|poi|poiche|possa|possedere|posteriore|posto|potrebbe|preferibilmente|presa|press|prima|primo|proprio|puoi|pure|purtroppo|può|qua|quale|quali|qualcosa|qualcuna|qualcuno|quale|quali|qualunque|quando|quanto|quasi|quattro|quel|quella|quelli|quelle|quello|quest|questa|queste|questi|questo|qui|quindi|quinto|realmente|recente|recentemente|registrazione|relativo|riecco|salvo|sara|sarai|saranno|sarebbe|sarebbero|sarei|saremmo|saremo|sareste|saresti|sarete|sarà|sarò|scola|scopo|scorso|se|secondo|seguente|seguito|sei|sembra|sembrare|sembrato|sembrava|sembri|sempre|senza|sette|si|sia|siamo|siano|siate|siete|sig|solito|solo|soltanto|sono|sopra|soprattutto|sotto|spesso|sta|stai|stando|stanno|starai|staranno|starebbe|starebbero|starei|staremmo|staremo|stareste|staresti|starete|starà|starò|stata|state|stati|stato|stava|stavamo|stavano|stavate|stavi|stavo|stemmo|stessa|stesse|stessero|stessi|stessimo|stesso|steste|stesti|stette|stettero|stetti|stia)\b/g;
        // Rimuovi le congiunzioni e gli articoli sostituendoli con una stringa vuota

        const testoPulito = testo.replace(paroleDaRimuovere, '');
        const parole = testoPulito.split(' ');

        // Crea un array finale nel formato desiderato
        const arrayFinale = parole
            // Filtra le parole vuote
            .filter(parola => parola.trim() !== '')
            // Mappa le parole rimanenti in arrayFinale
            .map(parola => ({ keyword: parola.trim().toLowerCase(), peso: 1 }));

        return arrayFinale;
    }
}

// Francesco Totti e i suoi luoghi preferiti nel Lazio: da Sabaudia ad Anzio

export default WordpressApi;