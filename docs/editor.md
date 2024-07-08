# Guida Editor AI

Struttura DB:

* Alert
    * Tabella con i dati di debug di tutto il sistema 
* Article
    * Tabella con gli articoli o prodotti da generare
* ImageWP
    * Lista delle immagini di wp se utilizzate
* PromptAI
    * Tabella principale che gestisce i processi di generazione
    * Calls: Json contenente l'elenco in sequenza delle chiamata da effettuare per generare i dati di un article o un product  
* Site
    * Siti fonte da cui prendere gli articoli da generare 
* SitePubblication
    * Siti di pubblicazione, in questa tabella ci sono tutti gli endPoint e le regole di cron di generazione 


## Tipi
```ts
const TYPE_IN_JSON:string                               = 'inJson';
//Significa che il valore con cui deve essere fatto il replace nel message user è dentro l'article

const TYPE_READ_STRUCTURE_FIELD:string                  = 'readStructureField';
//In caso di generazione di una guida gestisce la creazione con un json struttura del testo nel campo promptAi data 

const TYPE_READ_FROM_DATA_PROMPT_AND_ARTICLE:string     = 'readStructureFieldAndArticle'; 
//Prende il testo dallo schema article e il json o il testo salvato nel campo specificato nella chiave field del json call del promptAi

const TYPE_READ_WRITE_DYNAMIC_SCHEMA:string             = 'readWriteDimanycSchema'; 
//Tipo da usare prevalentemente, gestisce il recupero dei campi e la scrittura dei message system e user dinamicamente, con la possibilità di chiamare delle funzioni specifiche per il recupero o il set di dati

```

## Action
```ts
const ACTION_CREATE_DATA_SAVE:string            = 'createDataSave'; 
//salvataggio in campo data promptAi

const ACTION_UPDATE_SCHEMA_ARTICLE:string       = 'updateSchemaArticle'; 
//Salvataggio capitolo scritto nell'articolo

const ACTION_WRITE_BODY_ARTICLE:string          = 'writeBodyArticle'; 
//Salvataggio bodyGpt article

const ACTION_WRITE_TOTAL_ARTICLE:string         = 'writeTotalArticle'; 
//Salvataggio articolo in 1 step body + h1 + meta title + meta desc

const ACTION_CALLS_COMPLETE:string              = 'callsCompete'; 
//Tutte le calls eseguite

const ACTION_READ_WRITE_DYNAMIC_SCHEMA:string   = 'readWriteDimanycSchema'; 
//Action dinamica da associtale al TYPE_READ_WRITE_DYNAMIC_SCHEMA
```



## Calls
Specificano la sequenza di chiamata necessarie alla generazione di un product o article

## Steps
Gestisce i message system di ogni calls

## Esempi Calls

```json
 {
    "key": "scegliCategoriaPubblicazione",
    "saveFunction": "readWriteDimanycSchema",
    //Il nodo readTo deve sempre essere un array di oggetti, da 1 a n. 
    "readTo": [
      {
        "schema": "Article", //Schema mongoose 
        "field": "title" //Campo da leggere
      }
    ],
    //Specifica dove deve essere salvato il risultato finale
    "saveTo": [
      {
        "schema": "Article", //Schema mongoose 
        "field": "categoryPublishSite" //Campo in cui scrivere
        //responseField => Se questa key non è specificata significa che openAi torna direttamente il testo da prendere e non un json con chiavi
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      //Il nodo replace serve per effettuare dei replace con dati dinamici nel message user da inviare ad openAi
      "replace": [
        {
          "field": "categories", //Nome del placeholder
          "callFunction": "getSectionsCmsAdmin" //Funzione js da invocare
        },
        {
          "schema": "Article", //Schema mongoose da leggere
          "field": "title" //Campo da leggere e anche nome del placeholder
        }
      ],
      "user": [
        {
        //[#categories#] verrà sostituito dal risultato della callFunction categories
        //[#title#] verrà sostituito dal valore del campo title dell'article
          "message": "Struttura:[#categories#]  <article>[#title#]<article>"
        }
      ]
    }
  },


```

#### SAVE_TO VARIANTI
```json

    //Salvataggio completo risposta openAi (testo)
     "saveTo": [
      {
        "schema": "Article", //Schema mongoose 
        "field": "categoryPublishSite" //Campo in cui scrivere
        //responseField => Se questa key non è specificata significa che openAi torna direttamente il testo da prendere e non un json con chiavi
      }
    ],

    //Salvataggio chiave risposta openAi (json_response)
    "saveTo": [
      {
        "schema": "Article",
        "field": "bulletPoints",
        //Se il responseField è specificato significa che openAi torna un json e quella ne è la chiave
        "responseField": "bulletList"
      }
    ]
```

#### SISTEMA REPLACE DYNAMIC SCHEMA TYPE
```json

//Replace sul message USER openaAI
    "replace": [
        {
          "field": "categories", //Nome del placeholder
          "callFunction": "getSectionsCmsAdmin" //Funzione js da invocare
        },
        {
          "schema": "Article", //Schema mongoose da leggere
          "field": "title" //Campo da leggere e anche nome del placeholder
        },
        {
          "schema": "ReplacesObject", //I campi da leggerte si trovano nell'oggetto globale della classe
          "field": "sectionName" //Nome del placeholder
        }
    ],

//Replace sul message SYSTEM openaAI
    "replaceSystem": [
        {
        "field": "output", 
        //Nome del placeholder presente nel system messagge sul quale fare il replace
        "callFunction": "getTecnicalTemplateCmsAdmin" 
        //Funziona js da chiamare per il recupero dei dati
    }
],

```


```json
 {
    "key": "getArticle", //La chiave deve essere la stessa specificata nello steps
    "saveFunction": "writeTotalArticle", //Scrive tutto l'articolo
    "readTo": "title", //Legge il campo title dell'article
    "saveTo": "bodyGpt", //Salva il risultato di openAi sul campo bodyGpt dell'article
    "saveKey": "",
    "removeHtmlTags": true, //Rimuove i tag dall'articolo fonte
    "lastBodyAppend": "false", //Appende la risposta di openAI al body già presente nell'article
    "complete": 1, //0 call da eseguire - 1 call eseguita
    "msgUser": {
      "type": "inJson",
      "user": [
        {
          "message": "<title>[plachehorderContent]</title>"
        }
      ]
    }
  }
```

```json
 {
    "key": "getConcettiChiave", //La chiave deve essere la stessa specificata nello steps
    "saveFunction": "createDataSave", //Salva il risultato nel campo specificatro in saveTo dello schema PromptAi
    "readTo": "bodyGpt", //Legge il campo bodyGpt della tabella article
    "saveTo": "data", //Campo dello schema PromptAi in cui salvare la risposta
    "saveKey": "getConcettiChiave", //Con che chiave nel json nel campo speficicato viene salvato il dato
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 1,
    "msgUser": {
      "type": "inJson",
      "user": [
        {
          "message": "<article>[plachehorderContent]</article>"
        }
      ]
    }
  },
```

```json
   {
    "key": "setConcettiChiave",
    "saveFunction": "writeBodyArticle", //Funzione che scrive la risposta nel bodyGpt dell'article
    "readTo": "bodyGpt", //Legge il campo bodyGpt dell'article
    "saveTo": "bodyGpt",
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 1,
    "msgUser": {
      "type": "readStructureFieldAndArticle", //Legge l'article e il campo "field" dello schema PromptAi, per la chiave salvata
      "field": "data", //Campo schema PromptAi
      "readKey": "getConcettiChiave", //Chiave del json salvato nel campo del promptAi
      "message": "Ecco la lista delle frasi e parole in Json: [plachehorderContent]"
    }
  },
```



