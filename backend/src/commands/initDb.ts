import mongoose, { Model }                              from 'mongoose';
import connectMongoDB                                   from '../database/mongodb/connect';
import {ISite, SiteSchema, SiteArrayType}               from '../database/mongodb/models/Site';
import {IArticle, ArticleSchema}                        from '../database/mongodb/models/Article';
import {IImage, ImageWPSchema}                          from '../database/mongodb/models/ImageWP';
import {IPromptAi, PromptAiArrayType, PromptAiSchema}   from '../database/mongodb/models/PromptAi';
import { SitePublicationSchema, ISitePublication, 
    SitePublicationArrayType }                          from '../database/mongodb/models/SitePublication';

connectMongoDB();

const SitePublication:      Model<ISitePublication>         = mongoose.model<ISitePublication>('SitePublication', SitePublicationSchema);
const Site:                 Model<ISite>                    = mongoose.model<ISite>('Site', SiteSchema);
const Article:              Model<IArticle>                 = mongoose.model<IArticle>('Article', ArticleSchema);
const ImageWP:              Model<IImage>                   = mongoose.model<IImage>('ImageWP', ImageWPSchema);
const PromptAi:             Model<IPromptAi>                = mongoose.model<IPromptAi>('PromptAi', PromptAiSchema);

const sitePublicationToInsert:SitePublicationArrayType = [
    {   sitePublication:    'cronacalive.it', 
        tokenUrl:           'https://www.cronacalive.it/wp-json/jwt-auth/v1/token',
        url:                'https://www.cronacalive.it/wp-json/wp/v2/posts',
        urlImages:          'https://www.cronacalive.it/wp-json/wp/v2/media',
        username:           'Admin',  
        password:           'dUJ44cXYK5%DtCKBW8B%6xy(',  
        active:             1,
        page:               1,
    },
    {   sitePublication:    'roma.cronacalive.it', 
        tokenUrl:           'https://roma.cronacalive.it/wp-json/jwt-auth/v1/token',
        url:                'https://roma.cronacalive.it/wp-json/wp/v2/posts',
        urlImages:          'https://roma.cronacalive.it/wp-json/wp/v2/media',
        username:           'Administrator',  
        password:           'rl5Bmi&$9VXAVyEZJv',  
        active:             1,
        page:               1,
    },
];

SitePublication.insertMany(sitePublicationToInsert)
.then((docs) => {
    console.log('SitePublication inserted successfully:', docs);
})
.catch((err) => {
    console.error('Error inserting SitePublication:', err);
});

const promptAiToInsert:PromptAiArrayType = [
    {   sitePublication:    'acquistigiusti.it', 
        calls:              [{"key":"getStructure","saveTo":"data","saveKey":"getStructure","complete":0},{"key":"getArticle","saveTo":"data","saveKey":"getStructure","complete":0}],
        steps:              [{"getStructure":{"messages":[{"role":"system","content":"You are a useful assistant designed to produce JSON, expert in generating buying guides. Your goal is to generate the structure of a guide that answers all the questions a user needs to make a purchase. You will be provided with titles for which you will have to generate the structure of the chapters and subchapters of the text to be written. The text generated must be very comprehensive and contain all the useful information to make a choice to purchase a product. Maximum 10 chapters. Reply with a JSON with this format: [{\"introduction\": { \"h2\": \"string\", \"h3\": [\"string\",\"string\",\"string\"]},...]"}],"model":"gpt-3.5-turbo-1106","temperature":0.6,"top_p":0.9,"response_format":{"type":"json_object"}}}],
        data:               [{"getStructure":{"introduction":{"complete":0,"h2":"Come scegliere un cardiofrequenzimetro","h3":["Cos'è un cardiofrequenzimetro","Benefici dell'utilizzo di un cardiofrequenzimetro","Considerazioni prima dell'acquisto"]},"tipi_di_cardiofrequenzimetri":{"complete":0,"h2":"Tipi di cardiofrequenzimetri","h3":["Cardiofrequenzimetri da polso","Cardiofrequenzimetri da torace","Cardiofrequenzimetri da dito"]},"funzionalità_da_valutare":{"complete":0,"h2":"Funzionalità da valutare","h3":["Precisione della misurazione","Connettività e compatibilità con dispositivi","Modalità di visualizzazione dei dati"]},"comfort_e_durata_della_batteria":{"complete":0,"h2":"Comfort e durata della batteria","h3":["Materiali e design","Autonomia della batteria","Impermeabilità e resistenza al sudore"]},"applicazioni_e_compatibilità":{"complete":0,"h2":"Applicazioni e compatibilità","h3":["Applicazioni per il monitoraggio","Compatibilità con smartphone e smartwatch","Integrazione con altri dispositivi fitness"]}}}],
        numStep:            1,  
        complete:           0,
        typePrompt:         1
    }
];

PromptAi.insertMany(promptAiToInsert)
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
        userPublishSite:        19,
    },
    { 
        site:                   'ilcorrieredellacitta.com', 
        sitePublication:        'roma.cronacalive.it', 
        url:                    'https://www.ilcorrieredellacitta.com/sitemap-news.xml',
        active:                 1, 
        format:                 'sitemap',
        categoryPublishSite:    1,
        userPublishSite:        19,
    },
    { 
        site:                   'romatoday.it', 
        sitePublication:        'roma.cronacalive.it', 
        url:                    'https://www.romatoday.it/sitemaps/sitemap_news.xml',
        active:                 1, 
        format:                 'sitemap',
        categoryPublishSite:    1,
        userPublishSite:        19,
    }
];

Site.insertMany(sitesToInsert)
.then((docs) => {
    console.log('Sites inserted successfully:', docs);
    process.exit(1);
})
.catch((err) => {
    console.error('Error inserting Sites:', err);
    process.exit(0);
});