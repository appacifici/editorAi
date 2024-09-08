import { ArticleWithIdType } from "../../../database/mongodb/models/Article";
import { SiteArrayWithIdType, SiteWithIdType } from "../../../database/mongodb/models/Site";
import { SitePublicationWithIdType } from "../../../database/mongodb/models/SitePublication";

//Da dove deve leggere i dati per creare il message user nel json call
const TYPE_IN_JSON:string                               = 'inJson';
const TYPE_READ_STRUCTURE_FIELD:string                  = 'readStructureField';
const TYPE_READ_FROM_DATA_PROMPT_AND_ARTICLE:string     = 'readStructureFieldAndArticle'; //Prende il testo dallo schema article e lo genera completando lo user message dal campo data del promptAi
const TYPE_READ_WRITE_DYNAMIC_SCHEMA:string             = 'readWriteDimanycSchema'; 
const TYPE_READ_WRITE_DYNAMIC_INFO:string               = 'readWriteDimanycInfo'; 

//Tipi di azioni(funzioni) che si possono invocare nella call
const ACTION_CREATE_DATA_SAVE:string            = 'createDataSave'; //salvataggio in campo data promptAi
const ACTION_UPDATE_SCHEMA_ARTICLE:string       = 'updateSchemaArticle'; //Salvataggio capitolo scritto nell'articolo
const ACTION_WRITE_BODY_ARTICLE:string          = 'writeBodyArticle'; //Salvataggio articolo in 1 step
const ACTION_WRITE_TOTAL_ARTICLE:string         = 'writeTotalArticle'; //Salvataggio articolo completo in 1 step
const ACTION_CALLS_COMPLETE:string              = 'callsCompete'; //Tutte le calls eseguite
const ACTION_READ_WRITE_DYNAMIC_SCHEMA:string   = 'readWriteDimanycSchema'; //Tutte le calls eseguite
const ACTION_READ_WRITE_DYNAMIC_SECTION:string  = 'readWriteDinamycSection'; //Tutte le calls eseguite
const ACTION_GET_RESPONSE_COMPLETE:string       = 'getResponseComplete'; //Da chiamare dopo il complete se si vuole il return dei dati

interface NextArticleGenerate {
    sitePublication: SitePublicationWithIdType;
    article:ArticleWithIdType | null;
    site:SiteWithIdType | null;
}

interface ChatMessageArray {
    messages:       ChatMessage[];
    model:          string;
    temperature:    number;
    top_p:          number;
    response_format?: {
        type: string;
    };
}

interface ChatMessage {
    role:       string;
    content:    string;
}

type TypeMsgUserRaplace = {
    schema?:        string;//Schema in cui salvare
    field?:         string;//Campo in cui salvare
    callFunction?:  string;//Funziona da chiamare per recuperare dei dati per effettuare poi il replace
    jsonField?:     object//Formato di risposta che deve corrispondere ai campi dello schema
}

type TypeMsgSystemRaplace = {
    field:          string; 
    callFunction:   string;
}

interface TypeSavaToObject extends TypeMsgUserRaplace {
    responseField: string;
    callFunction?: string
}

//TODO da definire bene creando delle sotto interfacce per i tipi di msgUser che abbiamo
interface PromptAICallInterface {
    key:            string;
    saveFunction:   string; //Funzione che si occupa del salvataggio dei dati da chiamare
    readTo:         string|[TypeMsgUserRaplace]; //Il campo da cui leggere
    saveTo:         string|[TypeSavaToObject]; //Il campo in cui salvare
    saveKey:        string; //Il nome della chiave in cui sia il caso di salvataggio di un oggetto
    removeHtmlTags: boolean; //Se deve chiamare la funzione di rimozione dei tags
    lastBodyAppend: boolean;
    emptyCreataDataSave: boolean;// Determina se svuotare il campo settato nel savaTo
    msgUser:    {
        type:   string, //Specifica il type delle costanti per lo switch di OpenAiService che conosce la logica specifica di lettura dell'oggetto
        user?:   [{
            message: string //Message User base in cui effettuare il replace
        }],
        field:       string
        key?:        string, //se i dati da leggere sono dentro il campo data del promptAi in formato json 
        message:     string  //Se il type è uno di quelli semplici lo user message è stampato direttamente qui dentro
        readKey?:    string //Dato il campo sopra specifica quale sia la chiave del json
        replace?:    [TypeMsgUserRaplace] //Se fa effettuato i replace sul user message
        replaceSystem?: [TypeMsgSystemRaplace] //Se fa effettuato i replace sul system message
    };
    complete:       number; //se la call è stata eseguita è 1
}

interface StructureChapter {
    toGenerate: string;
    type:       string;
    value:      string;
}

function isStructureChapter(obj: any): obj is StructureChapter {
    return obj && typeof obj.type === 'string' && typeof obj.value === 'string';
}
  
interface StructureChaptersData extends Array<{
    getStructure: {
        chapters: StructureChapter[];
    }
}> {}
  

type PromptAiCallsInterface = PromptAICallInterface[];

export type {PromptAiCallsInterface,TypeMsgUserRaplace};
export {
    PromptAICallInterface, 
    NextArticleGenerate,
    ChatMessage,
    ChatMessageArray, 
    StructureChapter, 
    StructureChaptersData, 
    TypeSavaToObject,
    TypeMsgSystemRaplace,
    isStructureChapter,
    TYPE_IN_JSON, 
    TYPE_READ_STRUCTURE_FIELD,
    TYPE_READ_FROM_DATA_PROMPT_AND_ARTICLE,
    TYPE_READ_WRITE_DYNAMIC_SCHEMA,
    TYPE_READ_WRITE_DYNAMIC_INFO,
    ACTION_CREATE_DATA_SAVE,
    ACTION_UPDATE_SCHEMA_ARTICLE,
    ACTION_WRITE_BODY_ARTICLE,
    ACTION_WRITE_TOTAL_ARTICLE,
    ACTION_CALLS_COMPLETE,
    ACTION_READ_WRITE_DYNAMIC_SCHEMA,
    ACTION_READ_WRITE_DYNAMIC_SECTION,
    ACTION_GET_RESPONSE_COMPLETE
};