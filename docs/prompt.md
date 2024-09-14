```json
//CALLS
[
  {
    "key": "scegliCategoriaPubblicazione",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "Article",
        "field": "title"
      }
    ],
    "saveTo": [
      {
        "schema": "Article",
        "field": "categoryPublishSite"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "emptyCreataDataSave": true,
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replace": [
        {
          "field": "categories",
          "callFunction": "getSectionsCmsAdmin"
        },
        {
          "schema": "Article",
          "field": "title"
        }
      ],
      "user": [
        {
          "message": "Struttura:[#categories#]  <article>[#title#]<article>"
        }
      ]
    }
  },
  {
    "key": "getKeywordArticle",
    "saveFunction": "readWriteDimanycSchema",
    "saveTo": [
      {
        "schema": "PromptAi",
        "field": "data"
      },
      {
        "schema": "Article",
        "field": "keywords"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "emptyCreataDataSave": false,
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replace": [
        {
          "field": "jsonBacklinks",
          "callFunction": "getSectionKeywordsCmsAdmin"
        }
      ],
      "user": [
        {
          "message": "**Elenco delle parole chiave:** [#jsonBacklinks#]"
        }
      ]
    }
  },
  {
    "key": "getArticle",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "Article",
        "field": "title"
      },
      {
        "schema": "PromptAi",
        "field": "data"
      }
    ],
    "saveTo": [
      {
        "schema": "Article",
        "field": "bodyGpt"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "emptyCreataDataSave": false,
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replace": [
        {
          "schema": "PromptAi",
          "field": "data"
        },
        {
          "schema": "Article",
          "field": "title"
        }
      ],
      "user": [
        {
          "message": "**Elenco delle parole chiave:** [#data#] |  [#title#]"
        }
      ]
    }
  },
  {
    "key": "getMeta",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "Article",
        "field": "title"
      },
      {
        "schema": "PromptAi",
        "field": "data"
      }
    ],
    "saveTo": [
      {
        "schema": "Article",
        "jsonField": {
          "titleGpt": "Article",
          "descriptionGpt": "Article",
          "h1Gpt": "Article"
        },
        "callFunction": "setUseSectionKeywordsCmsAdmin"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "emptyCreataDataSave": true,
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replace": [
        {
          "schema": "PromptAi",
          "field": "data"
        },
        {
          "schema": "Article",
          "field": "title"
        }
      ],
      "user": [
        {
          "message": "**Elenco delle parole chiave:** [#data#] |  [#title#]"
        }
      ]
    }
  },
  {
    "key": "getConcettiChiave",
    "saveFunction": "createDataSave",
    "readTo": "bodyGpt",
    "saveTo": "data",
    "saveKey": "getConcettiChiave",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "emptyCreataDataSave": false,
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
  {
    "key": "setConcettiChiave",
    "saveFunction": "writeBodyArticle",
    "readTo": "bodyGpt",
    "saveTo": "bodyGpt",
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "emptyCreataDataSave": true,
    "complete": 1,
    "msgUser": {
      "type": "readStructureFieldAndArticle",
      "field": "data",
      "readKey": "getConcettiChiave",
      "message": "Ecco la lista delle frasi e parole in Json: [plachehorderContent]"
    }
  },
  {
    "key": "getBulletPoints",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "Article",
        "field": "bodyGpt"
      }
    ],
    "saveTo": [
      {
        "schema": "Article",
        "field": "bulletPoints",
        "responseField": "bulletList"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replace": [
        {
          "schema": "Article",
          "field": "bodyGpt"
        }
      ],
      "user": [
        {
          "message": "<article>[#bodyGpt#]<article>"
        }
      ]
    }
  },
  {
    "key": "getTecnicalInfo",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "Article",
        "field": "titleGpt"
      }
    ],
    "saveTo": [
      {
        "schema": "Article",
        "field": "tecnicalInfo"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replaceSystem": [
        {
          "field": "output",
          "callFunction": "getTecnicalTemplateCmsAdmin"
        }
      ],
      "replace": [
        {
          "schema": "Article",
          "field": "titleGpt"
        }
      ],
      "user": [
        {
          "message": "<title>[#titleGpt#]<title>"
        }
      ]
    }
  },
  {
    "key": "getBacklinks",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "Article",
        "field": "bodyGpt"
      }
    ],
    "saveTo": [
      {
        "schema": "PromptAi",
        "field": "data"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 1,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replaceSystem": [
        {
          "field": "jsonBacklinks",
          "callFunction": "getBacklinkSectionsCmsAdmin"
        }
      ],
      "replace": [
        {
          "schema": "Article",
          "field": "bodyGpt"
        }
      ],
      "user": [
        {
          "message": "[#bodyGpt#]"
        }
      ]
    }
  },
  {
    "key": "setBacklinks",
    "saveFunction": "readWriteDimanycSchema",
    "readTo": [
      {
        "schema": "PromptAi",
        "field": "data"
      },
      {
        "schema": "Article",
        "field": "bodyGpt"
      }
    ],
    "saveTo": [
      {
        "schema": "Article",
        "field": "bodyGpt",
        "callFunction": "setUseSectionbacklinksCmsAdmin"
      }
    ],
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 0,
    "msgUser": {
      "type": "readWriteDimanycSchema",
      "replace": [
        {
          "schema": "Article",
          "field": "bodyGpt"
        },
        {
          "schema": "PromptAi",
          "field": "data"
        }
      ],
      "user": [
        {
          "message": "[#data#]. [#bodyGpt#]"
        }
      ]
    }
  },
  {
    "key": "getAllCallsCompelte",
    "saveFunction": "callsCompete",
    "readTo": "bodyGpt",
    "saveTo": "bodyGpt",
    "saveKey": "",
    "removeHtmlTags": false,
    "lastBodyAppend": "false",
    "complete": 0,
    "msgUser": {
      "type": "",
      "user": [
        {
          "message": ""
        }
      ]
    }
  }
]
```

```json
//STEPS
[
  {
    "scegliCategoriaPubblicazione": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un esperto di contenuti per siti web. Obbiettivo: Scegliere la categoria in cui pubblicare un articolo. Ti verra fornita la lista delle categorie in formato JSON: {\"1\":{\"id\":\"int\",\"name\":\"string\",\"subcategory\":{\"2\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},\"1\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},...}},\"2\":{\"id\":\"int\",\"name\":\"string\",\"subcategory\":{\"5\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},\"7\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},...}},\"5\":{\"id\":\"int\",\"name\":\"string\",\"subcategory\":{\"int\":{\"id\":\"int\",\"name\":\"string\",\"typology\":{\"int\":{\"id\":\"int\",\"name\":\"string\"},...}},...}}}. E ti verrà fornito il titolo dell'articolo nel tag xml <article>. Output: {\"category\":{\"id\":\"int|null\"},\"subcategory\":{\"id\":\"int|null\"},\"typology\":{\"id\":\"int|null\"}}"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.2,
      "top_p": 1,
      "response_format": {
        "type": "json_object"
      }
    }
  },
  {
    "getKeywordArticle": {
      "messages": [
        {
          "role": "system",
          "content": "Sei un esperto SEO coprywriter. Segui questi passaggi per dare la risposta all'utente. Passaggio 1: Scegli le parole chiave più attinenti all'argomento tra l'elenco delle parole chiave fornite dall'utene. Passaggio 2: Scegli 7 parole chiave ordinandole per il numero minore occurrences **Output JSON**: {\"Primary Keywords\":[{\"name\":\"string\",\"occurrences\":\"int\"}],\"Secondary Keywords\":[{\"name\":\"string\",\"occurrences\":\"int\"},{\"name\":\"string\",\"occurrences\":\"int\"},{\"name\":\"string\",\"occurrences\":\"int\"}],\"Related Keywords\":[{\"name\":\"string\",\"occurrences\":\"int\"},{\"name\":\"string\",\"occurrences\":\"int\"},{\"name\":\"string\",\"occurrences\":\"int\"}]}. "
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9,
      "response_format": {
        "type": "json_object"
      }
    }
  },
  {
    "getArticle": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un copriwriter professionista con un'esperienza di 20 anni nel settore di recensioni di prodotti. **Obbiettivo** Descrivi in maniera accurata e dettagliata il prodotto, spiegando e approfondendo caratteristiche, funzionalità e programmi. Per ogni funzionalita descrivi bene a cosa serve e cosa fa. **Regole** Inizia il testo con il/la \"nome del prodotto\". Evita di aggiungere conclusioni personali. Utilizza tutte le keywords fornite e usa i sinomini, per generare il testo. Non usare pi di 2 volte la stessa keyword. **Struttura risposta**<root><article><p maxprimarykeywords=\"2\" maxsecondarykeywords=\"2\" maxrelatedkeywords=\"1\" minlength=\"300\" words=\"500\" maxlength=\"500\">Descrizione del prodotto</p></article></root>"
        }
      ],
      "model": "gpt-3.5-turbo-16k",
      "temperature": 0.9,
      "top_p": 1
    }
  },
  {
    "getMeta": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un copriwriter SEO con un'esperienza di 20 anni nel settore di recensioni di prodotti. **Obbiettivo** Genera meta title, meta description, e h1 in ottica posizionamento SEO. **Regole** Utilizza tutte le keywords fornite e usa i sinomini, per generare il testo. Non usare più di 2 volte la stessa keyword. **Formato risposta**{\"titleGpt\": \"string\",\"descriptionGpt\": \"string\",\"h1Gpt\": \"string\"}. **Validazione formato rispsta JSON** {\"$schema\": \"http://json-schema.org/draft-07/schema#\",\"type\": \"object\",\"properties\": {\"titleGpt\": {\"type\": \"string\",\"maxLength\": 80,\"pattern\": \"^(?=.*\\b(PrimaryKeyword1|PrimaryKeyword2|PrimaryKeyword3)\\b).*$\"},\"descriptionGpt\": {\"type\": \"string\",\"maxLength\": 160,\"pattern\": \"^(?=.*\\b(SecondaryKeyword1|SecondaryKeyword2|SecondaryKeyword3)\\b)(?=.*\\b(PrimaryKeyword1|PrimaryKeyword2|PrimaryKeyword3)\\b).*$\"},\"h1Gpt\": {\"type\": \"string\"}},\"required\": [\"titleGpt\", \"descriptionGpt\", \"h1Gpt\"]}"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 1
    }
  },
  {
    "getConcettiChiave": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: sei un assistente esperto giornalista copriwriter. Obbietti: Identifica le parole e frasi che potrebbero essere messe in grassetto o in corsivo, per enfatizzare concetti chiave o elementi salienti del testo. Lunghezza: Massimo 5 parole. Regola 1. Non utilizzare più di una volta la stessa parola o frase. Struttura: [{\"frase\":{\"Testo\":\"Frase del testo senza cambiarla\",\"Tipo\":\"bold\"}},{\"frase\":{\"Testo\":\"Frase del testo senza cambiarla\",\"Tipo\":\"bold\"}}]. Ti fornisco il testo in un tag <xml>."
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "setConcettiChiave": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un utile editor di testo. Obbiettivi: Modificare il testo, inserendo le frasi o parole nei tag di enfatizzazione <strong></stron> e <italic></italic>. Regola 1. Non utilizzare più di una volta la stessa parola o frase. Ti verra fornito il testo nel tag xml <article>. Ti verra fornita la lista delle frasi e parole in Json: [{\"frase\":{\"Testo\":\"Frase del testo da evidenziare\",\"Tipo\":\"<strong></srtrong>\"}},{\"frase\":{\"Testo\":\"Frase del testo senza cambiarla\",\"Tipo\":\"<italic></italic>\"}}]"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "correggiH2": {
      "messages": [
        {
          "role": "system",
          "content": "Scopo: Trasforma il testo nei tag<h2> in formato classico italiano non in camelcase. Azione: <h2>testo in formato giornalistico, non in camelcase</h2>.  Struttura testo: <article><p minLength=\"100 words\" maxLength=\"150 words\">Introduzione dell'articolo</p><h2 minLength=\"100 words\" maxLength=\"200 words\">Primo paragrafo dell'articolo</h2><h2 minLength=\"100 words\" maxLength=\"200 words\">Secondo paragrafo dell'articolo.</h2><h2 minLength=\"100 words\" maxLength=\"200 words\">Terzo paragrafo dell'articolo.</h2></article> Regola 1. Ti verra fornito il testo nel tag xml <article>"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "getBulletPoints": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un esperto di contenuti per siti web. Obbiettivo: Genera massimo 5 bullet point che evidenziano le caratteristiche e i vantaggi principali di un prodotto. Regole: Ogni bullet point deve essere di massimo 3 parole. Separali con ';'. Non usare le congiunzioni grammaticali. Ti verra fornita il testo del prodotto nel tag xml <article>. Output: {\"bulletList\":string}"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "getTecnicalInfo": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un esperto di contenuti per siti web. Obbiettivo: Genera la scheda tecnica con le caratteristiche tecniche di un prodotto. Ti verra fornita il titolo del prodotto nel tag xml <title>. Output: [#output#]"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "getBacklinks": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un esperto SEO con esperienza di 20 anni nel posizionamento di siti web. Obbiettivo: Selezionare massimo 2 link da inserire nel testo, selezionandolo dalla lista in json fornita. Regole: Ogni elemento del json ha un campo [numBacklink], che indica il numero di link che ha ricevuto, scegli il nuovo link per attinenza a testa, ma bilanciando la scelta in base al numero di link ricevuti. Struttura: [#jsonBacklinks#]. Ti verra fornita il titolo del prodotto nel tag xml <article>. Output: {\"item_id\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"},\"item_id2\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"}}"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "setBacklinks": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: Sei un esperto seo copywriter. Obbiettivi: Insersici i link forniti nel json. Regole: 1. Cita nel testo e aggiungili come link i modelli forniti nel json; 2. Non inserire più volte lo stesso link. Ti verra fornito il testo nel tag xml <article>. Ti verra fornita la lista dei link da inserire in Json: {\"item_id\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"},\"item_id2\":{\"id\":\"number\",\"name\":\"string\",\"nameUrl\":\"string\",\"numBacklink\":\"number\"}}. Output: Testo finale completo dei link aggiunti"
        }
      ],
      "model": "gpt-3.5-turbo",
      "temperature": 0.6,
      "top_p": 0.9
    }
  },
  {
    "getAllCallsCompelte": {
      "messages": [
        {
          "role": "system",
          "content": "Ruolo: FAKE CALL"
        }
      ],
      "model": "gpt-3.5-turbo-1106",
      "temperature": 0.6,
      "top_p": 0.9
    }
  }
]
```