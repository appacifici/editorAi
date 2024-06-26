import mongoose, { Document, Schema, Model } from 'mongoose';
import { SiteWithIdType } from './Site';
import { SitePublicationWithIdType } from './SitePublication';

type ArticleType = {        
    site:               SiteWithIdType;
    sitePublication:    SitePublicationWithIdType;
    url:                string;
    body:               string;
    title:              string;
    description:        string;
    h1?:                string;
    img:                string;
    bulletPoints?:      string;
    tecnicalInfo?:      string;
    bodyGpt?:           string;
    titleGpt?:          string;
    descriptionGpt?:    string;
    h1Gpt?:             string;
    send?:              number;   
    genarateGpt:        number;   
    categoryPublishSite:string;   
    userPublishSite:    Number;   
    lastMod:            Date;   
    publishDate:        Date;   
    [key: string]:      any;
}

interface IArticle extends Document, Omit<ArticleType, '_id'> {}
type ArticleWithIdType      = ArticleType & { _id: Document['_id'] };
type ArticleArrayWithIdType = ArticleWithIdType[];
type ArticleArrayType       = ArticleType[];

const ArticleSchema   = new Schema({
    site: { 
        type: Schema.Types.ObjectId, 
        ref: 'Site',
        required: true
    },
    sitePublication: {
        type: Schema.Types.ObjectId, 
        ref: 'SitePublication',
        required: true
    },
    url: { 
        type:       String, 
        required:   true, 
        maxlength:  500
    },  
    body: { 
        type:       String, 
        required:   true,        
    },  
    title: { 
        type:       String, 
        required:   true,        
    },  
    description: { 
        type:       String, 
        required:   true,        
    },  
    h1: { 
        type:       String, 
        required:   true,        
    },      
    img: { 
        type:       String, 
        required:   true,        
    },      
    bulletPoints: { 
        type:       String, 
        required:   false,        
    },  
    tecnicalInfo: { 
        type:       String, 
        required:   false,        
    }, 
    bodyGpt: { 
        type:       String, 
        required:   false,        
    },  
    titleGpt: { 
        type:       String, 
        required:   false,        
    },  
    descriptionGpt: { 
        type:       String, 
        required:   false,        
    },  
    h1Gpt: { 
        type:       String, 
        required:   false,        
    },  
    send: { 
        type:       Number, 
        required:   false, 
        min:        0, 
        max:        1 
    },
    genarateGpt: { 
        type:       Number, 
        required:   false, 
        min:        0, 
        max:        1 
    },
    lastMod: { 
        type:       Date, 
        required:   false,
    },
    publishDate: { 
        type:       Date, 
        required:   false,
    },
    categoryPublishSite: { 
        type:       String, 
        required:   false        
    },    
    userPublishSite: { 
        type:       Number, 
        required:   false        
    }    
});

ArticleSchema.index({ site: 1, url:1 }, { unique: true });
ArticleSchema.index({ send: -1 });
ArticleSchema.index({ generate: -1, sitePublication: -1, lastMod:-1 });

const Article:Model<IArticle> = mongoose.models.Article || mongoose.model<IArticle>('Article', ArticleSchema);

export type {IArticle,ArticleType, ArticleWithIdType, ArticleArrayWithIdType, ArticleArrayType};
export {ArticleSchema};
export default Article;