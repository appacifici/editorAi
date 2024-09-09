import mongoose, { Model }                              from 'mongoose';
import connectMongoDB                                   from '../database/mongodb/connect';
import {ISite, SiteSchema, SiteArrayType}               from '../database/mongodb/models/Site';
import {IArticle, ArticleSchema, ArticleArrayType, ArticleType}      from '../database/mongodb/models/Article';
import {IImage, ImageWPSchema, ImageArrayType}          from '../database/mongodb/models/ImageWP';
import {IPromptAi, PromptAiArrayType, PromptAiSchema}   from '../database/mongodb/models/PromptAi';
import { SitePublicationSchema, ISitePublication, 
    SitePublicationArrayType }                          from '../database/mongodb/models/SitePublication';
import { AlertSchema, IAlert } from '../database/mongodb/models/Alert';



const SitePublication:      Model<ISitePublication>         = mongoose.model<ISitePublication>('SitePublication', SitePublicationSchema);
const Site:                 Model<ISite>                    = mongoose.model<ISite>('Site', SiteSchema);
const Article:              Model<IArticle>                 = mongoose.model<IArticle>('Article', ArticleSchema);
const ImageWP:              Model<IImage>                   = mongoose.model<IImage>('ImageWP', ImageWPSchema);
const PromptAi:             Model<IPromptAi>                = mongoose.model<IPromptAi>('PromptAi', PromptAiSchema);
const Alert:                Model<IAlert>                   = mongoose.model<IAlert>('Alert', AlertSchema);

const insert = async () => {
    await connectMongoDB();
    
    const sitePublicationToInsert:SitePublicationArrayType = [
        {   sitePublication:    'acquistigiusti.it', 
            tokenUrl:           '...',
            url:                '...',
            urlImages:          '...',
            urlCategories:      'http://82.55.228.55:8050/api/getSections',
            categories:         null,
            username:           '',  
            password:           '',  
            active:             1,
            page:               1,
            cronGenerateAi:     '*/3 * * * *',
            cronSendToWp:       '*/50 * * * *',
        }
    ];

    await SitePublication.insertMany(sitePublicationToInsert)
    .then((docs) => {
        console.log('SitePublication inserted successfully:', docs);
    })
    .catch((err) => {
        console.error('Error inserting SitePublication:', err);
    });


    const promptAiToInsert:PromptAiArrayType = [
        {   sitePublication:    'acquistigiusti.it', 
            calls:              [{"key":"scegliCategoriaPubblicazione","saveFunction":"readWriteDimanycSchema","readTo":[{"schema":"Article","field":"title"}],"saveTo":[{"schema":"Article","field":"categoryPublishSite"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":1,"msgUser":{"type":"readWriteDimanycSchema","replace":[{"field":"categories","callFunction":"getSectionsCmsAdmin"},{"schema":"Article","field":"title"}],"user":[{"message":"Struttura:[#categories#]  <article>[#title#]<article>"}]}},{"key":"getKeywordArticle","saveFunction":"readWriteDimanycSchema","saveTo":[{"schema":"PromptAi","field":"data"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":1,"msgUser":{"type":"readWriteDimanycSchema","replaceSystem":[{"field":"keywords","callFunction":"getSectionKeywordsCmsAdmin"}],"replace":[{"schema":"PromptAi","field":"data"}],"user":[{"message":""}]}},{"key":"getArticle","saveFunction":"readWriteDimanycSchema","readTo":[{"schema":"Article","field":"title"},{"schema":"PromptAi","field":"data"}],"saveTo":[{"schema":"Article","field":"bodyGpt"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"readWriteDimanycSchema","replace":[{"schema":"PromptAi","field":"data"},{"schema":"Article","field":"title"}],"user":[{"message":"**Elenco delle parole chiave:** [#data#] |  [#title#]"}]}},{"key":"getConcettiChiave","saveFunction":"createDataSave","readTo":"bodyGpt","saveTo":"data","saveKey":"getConcettiChiave","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"inJson","user":[{"message":"<article>[plachehorderContent]</article>"}]}},{"key":"setConcettiChiave","saveFunction":"writeBodyArticle","readTo":"bodyGpt","saveTo":"bodyGpt","saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"readStructureFieldAndArticle","field":"data","readKey":"getConcettiChiave","message":"Ecco la lista delle frasi e parole in Json: [plachehorderContent]"}},{"key":"getBulletPoints","saveFunction":"readWriteDimanycSchema","readTo":[{"schema":"Article","field":"bodyGpt"}],"saveTo":[{"schema":"Article","field":"bulletPoints","responseField":"bulletList"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"readWriteDimanycSchema","replace":[{"schema":"Article","field":"bodyGpt"}],"user":[{"message":"<article>[#bodyGpt#]<article>"}]}},{"key":"getTecnicalInfo","saveFunction":"readWriteDimanycSchema","readTo":[{"schema":"Article","field":"titleGpt"}],"saveTo":[{"schema":"Article","field":"tecnicalInfo"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"readWriteDimanycSchema","replaceSystem":[{"field":"output","callFunction":"getTecnicalTemplateCmsAdmin"}],"replace":[{"schema":"Article","field":"titleGpt"}],"user":[{"message":"<title>[#titleGpt#]<title>"}]}},{"key":"getBacklinks","saveFunction":"readWriteDimanycSchema","readTo":[{"schema":"Article","field":"bodyGpt"}],"saveTo":[{"schema":"PromptAi","field":"data"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"readWriteDimanycSchema","replaceSystem":[{"field":"jsonBacklinks","callFunction":"getBacklinkSectionsCmsAdmin"}],"replace":[{"schema":"Article","field":"bodyGpt"}],"user":[{"message":"[#bodyGpt#]"}]}},{"key":"setBacklinks","saveFunction":"readWriteDimanycSchema","readTo":[{"schema":"PromptAi","field":"data"},{"schema":"Article","field":"bodyGpt"}],"saveTo":[{"schema":"Article","field":"bodyGpt"}],"saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"readWriteDimanycSchema","replace":[{"schema":"Article","field":"bodyGpt"},{"schema":"PromptAi","field":"data"}],"user":[{"message":"[#data#]. [#bodyGpt#]"}]}},{"key":"getAllCallsCompelte","saveFunction":"callsCompete","readTo":"bodyGpt","saveTo":"bodyGpt","saveKey":"","removeHtmlTags":false,"lastBodyAppend":"false","complete":0,"msgUser":{"type":"","user":[{"message":""}]}}],
            steps:              [{"scegliCategoriaPubblicazione":{"messages":[{"role":"system","content":"Ruolo: Sei un esperto di contenuti per siti web. Obbiettivo: Scegliere la categoria in cui pubblicare un articolo. Ti verra fornita la lista delle categorie in formato JSON: {\"1\":{\"id\":\"int\",\"name\":\"string\",\"subcategory\":{\"2\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},\"1\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},...}},\"2\":{\"id\":\"int\",\"name\":\"string\",\"subcategory\":{\"5\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},\"7\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},...}},\"5\":{\"id\":\"int\",\"name\":\"string\",\"subcategory\":{\"int\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},...}}}. E ti verrà fornito il titolo dell'articolo nel tag xml <article>. Output: {\"category\":{\"id\":\"int|null\"},\"subcategory\":{\"id\":\"int|null\"},\"typology\":{\"id\":\"int|null\"}}"}],"model":"gpt-3.5-turbo","temperature":0.2,"top_p":1,"response_format":{"type":"json_object"}}},{"getKeywordArticle":{"messages":[{"role":"system","content":"Sei un copriwriter professionista con un'esperienza di 20 anni nel settore di recensioni di prodotti.  Scopo: Ho un elenco di parole chiave divise per importanza in formato JSON, ogni parola chiave è un oggetto con due campi [name(string), occurrences(int)]. Seleziona 1 parole chiave primarie, 2 parole chiave secondarie e 2 parole chiave correlate dall'elenco, selezionando le parole chiave ordinate per occurrences ASC. **Elenco delle parole chiave:** [#keywords#]. Output JSON: {\"Primary Keywords\":[{\"name\":\"string\",\"occurrences\":\"int\"},...],\"Secondary Keywords\":[{\"name\":\"string\",\"occurrences\":\"int\"},...],\"Related Keywords\":[{\"name\":\"string\",\"occurrences\":\"int\"},...]}"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9,"response_format":{"type":"json_object"}}},{"getArticle":{"messages":[{"role":"system","content":"Ruolo: Sei un copriwriter professionista con un'esperienza di 20 anni nel settore di recensioni di prodotti. **Obbiettivo** Descrivi in maniera accurata e dettagliata il prodotto, spiegandone caratteristiche e funzionalità. Per ogni funzionalita descrivi bene a cosa serve e cosa fa. **Regole** Inizia il testo con il/la \"nome del prodotto\". Evita di aggiungere conclusioni personali. Utilizza tutte le keywords fornite e usa i sinomini, per generare il testo. Non usare pi di 2 volte la stessa keyword. **Struttura risposta**<root><meta><metatitle maxprimarykeywords=\"1\" maxlength=\"80\" characters=\"\">Meta title dell'articolo in formato umano non in camecase</metatitle><metadescription maxlength=\"130\" characters=\"\">Meta maxPrimaryKeywords=\"1\" maxSecondaryKeywords=\"1\" description dell'articolo in formato umano non in came</metadescription><metakeywords>Stampa le keywords scelte dalla lista fornita</metakeywords><h1>Titolo dell'articolo in formato umano non in came</h1><article><p maxprimarykeywords=\"2\" maxsecondarykeywords=\"2\" maxrelatedkeywords=\"1\" minlength=\"300\" words=\"500\" maxlength=\"500\">Descrizione del prodotto</p></article></root>"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":1}},{"getConcettiChiave":{"messages":[{"role":"system","content":"Ruolo: sei un assistente esperto giornalista copriwriter. Obbietti: Identifica le parole e frasi che potrebbero essere messe in grassetto o in corsivo, per enfatizzare concetti chiave o elementi salienti del testo. Lunghezza: Massimo 5 parole. Regola 1. Non utilizzare più di una volta la stessa parola o frase. Struttura: [{\"frase\":{\"Testo\":\"Frase del testo senza cambiarla\",\"Tipo\":\"bold\"}},{\"frase\":{\"Testo\":\"Frase del testo senza cambiarla\",\"Tipo\":\"bold\"}}]. Ti fornisco il testo in un tag <xml>."}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"setConcettiChiave":{"messages":[{"role":"system","content":"Ruolo: Sei un utile editor di testo. Obbiettivi: Modificare il testo, inserendo le frasi o parole nei tag di enfatizzazione <strong></stron> e <italic></italic>. Regola 1. Non utilizzare più di una volta la stessa parola o frase. Ti verra fornito il testo nel tag xml <article>. Ti verra fornita la lista delle frasi e parole in Json: [{\"frase\":{\"Testo\":\"Frase del testo da evidenziare\",\"Tipo\":\"<strong></srtrong>\"}},{\"frase\":{\"Testo\":\"Frase del testo senza cambiarla\",\"Tipo\":\"<italic></italic>\"}}]"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"correggiH2":{"messages":[{"role":"system","content":"Scopo: Trasforma il testo nei tag<h2> in formato classico italiano non in camelcase. Azione: <h2>testo in formato giornalistico, non in camelcase</h2>.  Struttura testo: <article><p minLength=\"100 words\" maxLength=\"150 words\">Introduzione dell'articolo</p><h2 minLength=\"100 words\" maxLength=\"200 words\">Primo paragrafo dell'articolo</h2><h2 minLength=\"100 words\" maxLength=\"200 words\">Secondo paragrafo dell'articolo.</h2><h2 minLength=\"100 words\" maxLength=\"200 words\">Terzo paragrafo dell'articolo.</h2></article> Regola 1. Ti verra fornito il testo nel tag xml <article>"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"getBulletPoints":{"messages":[{"role":"system","content":"Ruolo: Sei un esperto di contenuti per siti web. Obbiettivo: Genera massimo 5 bullet point che evidenziano le caratteristiche e i vantaggi principali di un prodotto. Regole: Ogni bullet point deve essere di massimo 3 parole. Separali con ';'. Non usare le congiunzioni grammaticali. Ti verra fornita il testo del prodotto nel tag xml <article>. Output: {\"bulletList\":string}"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"getTecnicalInfo":{"messages":[{"role":"system","content":"Ruolo: Sei un esperto di contenuti per siti web. Obbiettivo: Genera la scheda tecnica con le caratteristiche tecniche di un prodotto. Ti verra fornita il titolo del prodotto nel tag xml <title>. Output: [#output#]"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"getBacklinks":{"messages":[{"role":"system","content":"Ruolo: Sei un esperto SEO con esperienza di 20 anni nel posizionamento di siti web. Obbiettivo: Selezionare massimo 2 link da inserire nel testo, selezionandolo dalla lista in json fornita. Regole: Ogni elemento del json ha un campo [numBacklink], che indica il numero di link che ha ricevuto, scegli il nuovo link per attinenza a testa, ma bilanciando la scelta in base al numero di link ricevuti. Struttura: [#jsonBacklinks#]. Ti verra fornita il titolo del prodotto nel tag xml <article>. Output: {\"item_id\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"},\"item_id2\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"}}"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"setBacklinks":{"messages":[{"role":"system","content":"Ruolo: Sei un esperto seo copywriter. Obbiettivi: Insersici i link forniti nel json. Regole: 1. Cita nel testo e aggiungili come link i modelli forniti nel json; 2. Non inserire più volte lo stesso link. Ti verra fornito il testo nel tag xml <article>. Ti verra fornita la lista dei link da inserire in Json: {\"item_id\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"},\"item_id2\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"}}. Output: Testo finale completo dei link aggiunti"}],"model":"gpt-3.5-turbo","temperature":0.6,"top_p":0.9}},{"getAllCallsCompelte":{"messages":[{"role":"system","content":"Ruolo: FAKE CALL"}],"model":"gpt-3.5-turbo-1106","temperature":0.6,"top_p":0.9}}],
            data:               [],
            numStep:            1,  
            complete:           0,
            typePrompt:         1,
            title:              'Test Comparatore'
        }
    ];


    await PromptAi.insertMany(promptAiToInsert)
    .then((docs) => {
        console.log('PromptAi inserted successfully:', docs);
    })
    .catch((err) => {
        console.error('Error inserting PromptAi:', err);
    });

    const sitesToInsert:SiteArrayType = [
        { 
            site:                   'vanityfair.it', 
            sitePublication:        'cronacalive.it', 
            url:                    'https://www.vanityfair.it/sitemap.xml',
            active:                 1, 
            format:                 'sitemap',
            categoryPublishSite:    1,
            userPublishSite:        '3',
            selectorBody:           'cheerioLoad(".body__container").html() || ""',
            selectorImg:            'cheerioLoad("img.responsive-image__image").first().attr("src")',
            cronImportSitemap:      '10 * * * *'
        }
    ];

    await Site.insertMany(sitesToInsert)
    .then((docs) => {
        console.log('Sites inserted successfully:');
        
    })
    .catch((err) => {
        console.error('Error inserting Sites:', err);
        
    });


    const site = await Site.findOne({ site:'vanityfair.it'});
    console.log(site);
    const sitePublication = await SitePublication.findOne({sitePublication:'acquistigiusti.it'});
    console.log(sitePublication);
        if( site !== null && sitePublication !== null ) {

        const articleData: ArticleArrayType = [{
            site:                   site._id,
            sitePublication:        sitePublication._id,
            url:                    'https://amzn.to/3xviuSM',
            body:                   "IRobot ha oltre 30 anni di esperienza nel mondo della robotica, con oltre 30 milioni di robot domestici venduti in tutto il mondo Grazie alla sua tecnologia di navigazione, l'i7 può catturare e rimuovere lo sporco dove vuoi, quando vuoi; e altrettanto importante, può evitare di andare dove non vuoi che vada La mappatura Cutting-Edge e la navigazione intelligente consentono di inviare l'i7 verso lo sporco quando serve, con un semplice comando vocale; funziona con i dispositivi Google Assistant e Alexa Polvere sottile e grossi detriti: aspira di tutto con il sistema a 3 fasi basato su doppie spazzole in gomma multi-superficie e unâ€aspirazione 10 volte più potente della Serie 600 Impara dalle tue abitudini e ascolta la tua voce, dandoti suggerimenti e preoccupandosi anche di ciò che a te potrebbe sfuggire, come la pulizia extra durante la stagione delle allergie Con la navigazione vSLAM, Roomba i7i7 mappa la casa per seguire percorsi ordinati e pulire già al primo passaggio, se la batteria si scarica, si ricarica da solo e riprende da dove aveva interrotto Preparati a goderti la serenità di una casa pulita e ordinata Roomba i7 sfrutta la tecnologia intelligente iRobot OS per memorizzare le tue routine e pulire in funzione del tuo stile di vita",
            title:                  'iRobot Roomba I7156 Robot Aspirapolvere, Memorizza La Planimetria Della Tua Casa, Adatto Per Peli Di Animali Domestici, Spazzole In Gomma, Potente Aspirazione, Wi-Fi, Programmabile Con App, Argento',
            description:            'sss',
            h1:                     'ss',
            img:                    'https://m.media-amazon.com/images/I/8122sjGdh3L._AC_SL1500_.jpg',
            genarateGpt:            0,
            send:                   0,
            lastMod:                new Date(),
            publishDate:            new Date(),
            categoryPublishSite:    '2',
            userPublishSite:        '2',
        }];

        Article.insertMany(articleData)
            .then((docs) => {
                console.log('articleData inserted successfully:', docs);
                process.exit(1);
            })
            .catch((err) => {
                console.error('Error inserting articleData:', err);
                process.exit(0);
            });
    }

}

insert();