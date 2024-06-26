
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

export default CmsAdminApi;

