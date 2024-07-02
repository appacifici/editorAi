# OpenAI

## Chat Completition
* **messages**: Contiene i mesaggi user o system
* **model**: Modello gpt da utilizzare
* **frequency_penalty**: 
    * **Valori positivi**: Penalizzano le nuove occorrenze di token (parole o frasi) in base alla loro frequenza nel testo generato finora. In altre parole, se un token è già stato usato, è meno probabile che venga ripetuto. Questo aiuta a evitare ripetizioni e rende il testo più vario.
        * **Esempio**: Se imposti frequency_penalty a 1.0, le parole già utilizzate avranno meno probabilità di essere scelte di nuovo rispetto a un valore di 0.
    * **Valori negativi**: Al contrario, incentivano la ripetizione di parole già utilizzate. Questo può essere utile se vuoi che il modello ripeta certi concetti o termini.
        * **Esempio**: Se imposti frequency_penalty a -1.0, il modello sarà più propenso a ripetere parole già utilizzate.
* **logit_bias**:
    * **valori di bias** possono variare da -100 a 100.
    * **Valori tra -1 e 1:** Questi valori modificano leggermente la probabilità che un token venga scelto. Un valore negativo riduce la probabilità, mentre un valore positivo la aumenta.
    * **Valori estremi** (-100 o 100): Un valore di -100 impedirà praticamente che il token venga scelto, mentre un valore di 100 renderà quasi certo che il token venga scelto.
        ```json
            {
                "prompt": "Parla degli animali domestici.",
                "logit_bias": {
                    "1234": 50,  // Supponiamo che 1234 sia il token ID per "gatto"
                    "5678": -50  // Supponiamo che 5678 sia il token ID per "cane"
                }
            }
        ```
    * Per ricavare token parola:
        ```ts
            npm install @huggingface/tokenizers 
            const { GPT2Tokenizer } = require('@huggingface/tokenizers');

            async function getTokenIds(word) {
            // Carica il tokenizer del modello GPT-2
            const tokenizer = await GPT2Tokenizer.fromPretrained('gpt2');

            // Tokenizza la parola
            const encoded = tokenizer.encode(word);

            // Estrai i token ID
            const tokenIds = encoded.ids;

            // Stampa i token ID
            console.log(`I token ID per la parola '${word}' sono:`, tokenIds);
            }

            // La parola per cui vuoi trovare il token ID
            const parola = "gatto";
            getTokenIds(parola);
        ```

* **top_logprobs**:
    * Per utilizzare top_logprobs, devi prima impostare il parametro logprobs a true. Senza questa impostazione, il parametro top_logprobs non funzionerà.
    * Reastituisce un array con i token più probabili che avrebbe usato il modello. Serve per capire esentuali parole importanti

* **max_tokens**:
    * Se desideri generare una risposta che non superi i 50 token, puoi configurare il parametro max_tokens come segue:
    ```json
        {
        "prompt": "Spiega il processo della fotosintesi",
        "max_tokens": 50
        }
    ```
* **n**:
    * Il parametro "n" è un'opzione disponibile nelle API di OpenAI che permette di specificare il numero di risposte di completamento che si desidera generare per ogni input. Default:1
    * ES: n=3
        ```json
            {
            "choices": [
                {
                "text": "La fotosintesi è il processo attraverso il quale le piante verdi e alcuni altri organismi trasformano l'energia luminosa in energia chimica...",
                "index": 0
                },
                {
                "text": "Il processo della fotosintesi permette alle piante di convertire l'anidride carbonica e l'acqua in glucosio e ossigeno usando l'energia del sole...",
                "index": 1
                },
                {
                "text": "Durante la fotosintesi, le piante utilizzano la luce solare per sintetizzare nutrienti dai gas presenti nell'aria e dall'acqua...",
                "index": 2
                }
            ]
            }
        ```

* **presence_penalty**: 
    * Il parametro presence_penalty regola la probabilità che il modello introduca nuovi argomenti o concetti nel testo generato. Aumentando questo valore, il modello sarà incentivato a esplorare nuovi argomenti piuttosto che ripetere ciò che è già stato menzionato.
    * Valore predefinito: 0.
    * Gamma di valori: Tra -2.0 e 2.0.
    * **Valori Positivi**:
        * Penalizzano la presenza di token già utilizzati, rendendo il modello più incline a introdurre nuovi argomenti.
        * Ad esempio, un valore positivo di 1.0 ridurrà la probabilità che il modello ripeta concetti o parole già presenti nel testo.
        * Utilizza valori positivi per incentivare la diversità e la creatività nel testo generato. È utile per generare contenuti lunghi o variegati, come articoli, storie o brainstorming di idee.
    * **Valori Negativi**:
        * Favoriscono la ripetizione di token già utilizzati, rendendo il modello più propenso a rimanere sugli stessi argomenti.
        * Ad esempio, un valore negativo di -1.0 aumenterà la probabilità che il modello ripeta concetti o parole già presenti nel testo.
        * Utilizza valori negativi se desideri che il modello approfondisca argomenti già trattati o mantenga la coerenza su un tema specifico. È utile per scrivere testi più coerenti e dettagliati su un singolo argomento.
    ```json
        {
            "prompt": "Parlami delle ultime innovazioni tecnologiche.",
            "max_tokens": 100,
            "presence_penalty": 1.0
        }
        /*
        Con un valore di presence_penalty di 1.0, il modello sarà incentivato a introdurre nuovi argomenti relativi alle innovazioni tecnologiche, evitando di ripetere gli stessi concetti.
        */
    ```
* **response_format**:
    * **text**: Risposta testuale
    * **JSON**: Garantisce che l'output sia un JSON valido, facilitando l'elaborazione automatizzata del testo generato.
    * **finish_reason="length"**: significa che la generazione ha superato max_tokens

* **seed**:
    * **Tipo di valore: Integer (intero) o null.
    * Valore predefinito: null.
    * Scopo: Rendere deterministica la generazione di testo, cioè fare in modo che ripetute richieste con lo stesso seme e parametri producano lo stesso risultato.
    Limitazioni: La determinazione non è garantita al 100%, e ci possono essere variazioni dovute a cambiamenti nel backend del sistema.
    * Determinismo:
        * Specificando un valore per seed, il modello cercherà di generare lo stesso output per la stessa richiesta. Questo è utile per casi di test, debugging, o situazioni in cui si desidera ripetibilità.
        * Esempio: Se imposti seed a 42, ogni volta che fai una richiesta con questo seme e gli stessi parametri, dovresti ottenere un risultato molto simile o identico.
        * Anche se il determinismo non è garantito, il parametro system_fingerprint nella risposta può essere utilizzato per monitorare eventuali cambiamenti nel backend che potrebbero influenzare il risultato.
    ```json
        {
            "model": "gpt-4-turbo",
            "prompt": "Descrivi le caratteristiche di un moderno smartphone.",
            "max_tokens": 100,
            "seed": 42
        }
    ```
* **stop**:
    * Specificare fino a quattro sequenze (stringhe) che, se incontrate, faranno sì che il modello interrompa la generazione di ulteriori token. Questo parametro è utile per controllare il comportamento del modello e garantire che la risposta generata sia conforme a determinati criteri o limiti.
    * Interruzione della Generazione:
        * Quando il modello incontra una delle sequenze specificate nel parametro stop durante la generazione del testo, si fermerà immediatamente.
        * Questo è utile per evitare la generazione di testo superfluo o per garantire che la risposta termini in modo appropriato.
    * Configurazione:
        * Puoi specificare fino a quattro sequenze di interruzione. Queste sequenze possono essere singole parole, frasi, o qualsiasi stringa di testo.
        * Le sequenze possono essere specificate come una stringa singola o come un array di stringhe.
    * **Esempio**: Supponiamo che tu stia generando un testo e desideri che la generazione si interrompa quando il modello produce una delle seguenti sequenze: "Fine", "Conclusione", "Termina qui". Puoi configurare la richiesta API come segue:
    ```json
        {
            "prompt": "Descrivi il processo della fotosintesi.",
            "max_tokens": 100,
            "stop": ["Fine", "Conclusione", "Termina qui"]
        }
    ```

* **stream**: Consente di ricevere i token generati in tempo reale man mano che vengono prodotti. Utile per replicare il comportamento di visualizzazione della risposta come chapGPT

* **temperature**:
    * **Valore predefinito**: 1.
    * **Gamma di valori: Da 0 a 2**.
    * **Valori alti (vicini a 2)**:
        * **Creatività e Varietà**: Con valori più alti, come 0.8 o 1.5, il modello produce output più variegati e creativi. Questo perché le probabilità dei token sono più uniformemente distribuite, aumentando la probabilità di scegliere token meno comuni.
        * Esempio: Buono per generare **storie creative, poesie,** o altre forme di testo dove la varietà e l'originalità sono importanti.
        ```json
            {
                "prompt": "Inventami una storia fantastica su un drago e un cavaliere.",
                "max_tokens": 100,
                "temperature": 1.2
            }
        ```
    * **Valori bassi (vicini a 0)**:
        * **Focalizzazione e Determinismo**: Con valori più bassi, come 0.2, il modello è più deterministico e tende a produrre risposte più prevedibili e coerenti. Le probabilità dei token successivi sono più concentrate sui token più probabili.
        * Esempio: Buono per compiti che richiedono **risposte precise e coerenti**, come la generazione di codice o la risposta a domande tecniche.
        ```json
            {                
                "prompt": "Descrivi il processo della fotosintesi.",
                "max_tokens": 100,
                "temperature": 0.2
            }
        ```
* **top_p**: Un'alternativa alla temperatura per il campionamento
    * Valore predefinito: 1.
    * Gamma di valori: Da 0 a 1.
    * Valori bassi (vicini a 0):
        * Selettività Elevata: Con valori più bassi, come 0.1, solo i token che rappresentano la top 10% della massa di probabilità vengono considerati.
        * Esempio: Buono per generare testo molto focalizzato e coerente, eliminando le scelte meno probabili.
    * Valori alti (vicini a 1):
        * Maggiore Variabilità: Con valori vicini a 1, il modello considera una gamma più ampia di token, fino al 100% della massa di probabilità.
        * Esempio: Buono per generare testo con maggiore diversità e creatività, permettendo anche scelte meno probabili.
    * Applicazioni:
        * Contenuti Focalizzati: Valori di top_p bassi sono ideali per contenuti che richiedono precisione e coerenza.
        * Creatività e Diversità: Valori di top_p più alti favoriscono la generazione di testi creativi e variegati.

* **tools**: Specificare un elenco di strumenti (funzioni) che il modello può chiamare
    ```ts
        function getWeather(location) {
            const weatherData = {
                "Milano": "soleggiato con una temperatura di 25°C",
                "Roma": "nuvoloso con una temperatura di 20°C"
            };
            return weatherData[location] || "Informazioni meteo non disponibili per questa città.";
        }
    ```
    ```ts
        const openai = require('openai');
        // Configura la tua API key
        openai.apiKey = 'la_tua_api_key';

        // Definizione della funzione
        const tools = [
            {
                "name": "getWeather",
                "description": "Ottieni il meteo attuale per una città specifica.",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {
                            "type": "string",
                            "description": "Il nome della città per cui ottenere il meteo."
                        }
                    },
                    "required": ["location"]
                }
            }
        ];

        // Esempio di richiesta API
        async function getApiResponse() {
            try {
                const response = await openai.Completion.create({
                    model: "gpt-4-turbo",
                    prompt: "Qual è il meteo a Milano?",
                    max_tokens: 100,
                    tools: tools
                });
                
                console.log(response.choices[0].text.trim());
            } catch (error) {
                console.error("Errore nella richiesta API:", error);
            }
        }

        getApiResponse();

    ```
* **tools_choise**: Specifica al modello quale tools usare nella generazione del testo
    ```ts
        // Esempio di richiesta API
        async function getApiResponse() {
            try {
                const response = await openai.Completion.create({
                    model: "gpt-4-turbo",
                    prompt: "Qual è il meteo a Milano?",
                    max_tokens: 100,
                    tools: tools,
                    tool_choice: {
                        "type": "function",
                        "function": {
                            "name": "getWeather"
                        }
                    }
                });
                
                console.log(response.choices[0].text.trim());
            } catch (error) {
                console.error("Errore nella richiesta API:", error);
            }
        }
    ```
* **parallel_tool_calls**: Consente di abilitare o disabilitare la chiamata parallela delle funzioni quando si utilizzano strumenti
    * Chiamate Parallele:
        * Se impostato su true, il modello è autorizzato a eseguire chiamate a funzioni multiple in parallelo. Questo può migliorare l'efficienza e ridurre i tempi di risposta quando è necessario chiamare più funzioni.
        * Efficienza: Utilizzalo quando hai funzioni indipendenti che possono essere eseguite contemporaneamente, migliorando l'efficienza complessiva del sistema.
        * Esempio: Ottenere il meteo da diverse città contemporaneamente.
    * Chiamate Sequenziali:
        * Se impostato su false, le chiamate alle funzioni saranno eseguite in modo sequenziale. Questo può essere utile se le funzioni dipendono l'una dall'altra o se è necessario garantire che una funzione venga eseguita solo dopo il completamento di un'altra.
        * Dipendenze: Utilizzalo quando hai funzioni che devono essere eseguite in un ordine specifico a causa di dipendenze tra di loro.
        * Esempio: Ottenere dati da una funzione e poi passare quei dati a un'altra funzione.