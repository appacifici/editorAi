import { randomBytes } from 'crypto';

interface TokenStructure {
    [key: string]:      string | number;
    year:               string;
    month:              string;
    day:                string;    
    hours:              number;
    minute:             number;
    seconds:            number;
    base64token?:       any|null;
    hexToken?:          any|null;
    token?:             any|null;
}

interface TokenStructureValidation {        
    base64token?:       string|null;
    hexToken?:          string|null;
    token?:             string|null;  
    secondsDuration:    number;  
}


class RestToken {        
    constructor() {
        
    }

    public static generateTimerToken(structure:TokenStructure, returnEncode:string ):string|Error{
        try{
        let timerToken:string = '';

        console.log(RestToken.generateRandomString(5));
        console.log(structure);

        const currentDate = new Date();
        for (const key in structure) {
            if (structure.hasOwnProperty(key)) {
                
                let checkKey = RestToken.removeNumericSeparatorCharacters(key);
                //@ts-ignore                
                console.log(`${checkKey}: ${structure[key]}`);                
                switch( checkKey )  {
                    case 'token':
                        //@ts-ignore
                        timerToken += structure[key];
                    break;
                    case 'base64token':
                        //@ts-ignore
                        timerToken +=  Buffer.from(structure[key]).toString('base64');
                    break;
                    case 'hexToken':
                        //@ts-ignore
                        timerToken +=  Buffer.from(structure[key]).toString('hex');
                    break;
                    case 'string':
                        //@ts-ignore
                        timerToken += structure[key]+' ';
                    break;
                    case 'base64String':
                        //@ts-ignore
                        timerToken += Buffer.from(structure[key]).toString('base64');
                    break;
                    case 'hexString':
                        //@ts-ignore
                        timerToken += Buffer.from(structure[key]).toString('hex');
                    break;
                    case 'separator':
                        //@ts-ignore
                        timerToken += RestToken.generateRandomString(structure[key]);
                    break;
                    case 'year':
                        timerToken +=  currentDate.getUTCFullYear();
                    break;
                    case 'month':
                        timerToken +=  currentDate.getUTCMonth() + 1 < 10 ? '0'+(currentDate.getUTCMonth() + 1) : (currentDate.getUTCMonth() + 1) ;
                    break;
                    case 'day':
                        timerToken +=  currentDate.getUTCDate();
                    break;
                    case 'hours':
                        timerToken +=  currentDate.getUTCHours();
                    break;
                    case 'minute':
                        timerToken +=  currentDate.getUTCMinutes() < 10 ? '0'+(currentDate.getUTCMinutes() ) : currentDate.getUTCMinutes();
                    break;
                    case 'seconds':
                        timerToken +=  currentDate.getUTCSeconds() < 10 ? '0'+(currentDate.getUTCSeconds() ) : currentDate.getUTCSeconds();
                    break;
                }
            }
            }
            console.log(``);

            switch( returnEncode ) {
            case 'base64':                
                timerToken =  Buffer.from(timerToken).toString('base64');
            break;
            case 'hex':             
                timerToken =  Buffer.from(timerToken).toString('hex');
            break;
            }

            return timerToken;
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('generateTimerToken errore generico');
            }
        }
    }  

    // Metodo inverso per decodificare il timerToken
    public static parseTimerToken(timerToken: string, structure: {}, returnEncode: string):TokenStructure|Error {
        try {
            if (returnEncode === 'base64') {
                timerToken = Buffer.from(timerToken, 'base64').toString();
            } else if (returnEncode === 'hex') {
                timerToken = Buffer.from(timerToken, 'hex').toString();
            }

            console.log('');
            console.log('Uncript token:',timerToken);
            let currentIndex = 0;
            const parsedStructure: any = {};
            const currentDate = new Date();

            for (const key in structure) {
                if (structure.hasOwnProperty(key)) {
                    let checkKey = RestToken.removeNumericSeparatorCharacters(key);
                    switch (checkKey) {
                        case 'token':
                            //@ts-ignore
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + structure[key].length);
                            //@ts-ignore
                            currentIndex += structure[key].length;
                            break;
                        case 'base64token':
                            //@ts-ignore
                            const base64Token    =  Buffer.from(structure[key]).toString('base64');
                            //@ts-ignore
                            parsedStructure[key] = Buffer.from(timerToken.substring(currentIndex, currentIndex + base64Token.length), 'base64').toString();
                            currentIndex += base64Token.length;
                            break;
                        case 'hexToken':
                            //@ts-ignore
                            const hexToken       = Buffer.from(structure[key]).toString('hex');
                            parsedStructure[key] = Buffer.from(timerToken.substring(currentIndex, currentIndex + hexToken.length), 'hex').toString();
                            currentIndex += hexToken.length;
                            break;
                        case 'string':
                            //@ts-ignore
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + structure[key]);
                            //@ts-ignore
                            currentIndex += structure[key];
                            break;
                        case 'base64String':
                            //@ts-ignore
                            const base64StringLength = Math.ceil((structure[key] * 3) / 4) * 4; // Calculate padded base64 length
                            console.log('==>'+base64StringLength);
                            parsedStructure[key] = Buffer.from(timerToken.substring(currentIndex, currentIndex + base64StringLength), 'base64').toString();
                            currentIndex += base64StringLength;
                            break;
                        case 'hexString':
                            //@ts-ignore
                            const hexStringLength = structure[key] * 2; // Each hex character represents half a byteì                        
                            parsedStructure[key] = Buffer.from(timerToken.substring(currentIndex, currentIndex + hexStringLength), 'hex').toString();
                            currentIndex += hexStringLength;
                            break;
                        case 'separator':
                            //@ts-ignore
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + structure[key]);
                            //@ts-ignore
                            currentIndex += structure[key];
                            break;
                        case 'year':
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + 4);
                            currentIndex += 4;
                            break;
                        case 'month':
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + 2);
                            currentIndex += 2;
                            break;
                        case 'day':
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + 2);
                            currentIndex += 2;
                            break;
                        case 'hours':
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + 2);
                            currentIndex += 2;
                            break;
                        case 'minute':
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + 2);
                            currentIndex += 2;
                            break;
                        case 'seconds':
                            parsedStructure[key] = timerToken.substring(currentIndex, currentIndex + 2);
                            currentIndex += 2;
                            break;
                    }
                }
            }
            
            return parsedStructure;
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('parseTimerToken errore generico');
            }
        }
    }

    public static isValidTimingToken(parsedStructure:TokenStructure, validateToken:TokenStructureValidation):boolean|Error {        
        try {
            const dateInit  = `${parsedStructure.year}-${parsedStructure.month}-${parsedStructure.day} ${parsedStructure.hours}:${parsedStructure.minute}:${parsedStructure.seconds}`;
            const dateEnd   = RestToken.getCurrentFormattedDate() ;
            const dateObj1  = RestToken.parseDate(dateInit);
            const dateObj2  = RestToken.parseDate(dateEnd);

            // Verifica se entrambe le date sono valide
            if (dateObj1 && dateObj2) {
                // Calcola la differenza in millisecondi
                const diffInMillis = dateObj2.getTime() - dateObj1.getTime();
            
                // Converti la differenza in secondi
                const diffInSeconds = diffInMillis / 1000;
            
                console.log(parsedStructure);
                console.log(validateToken.secondsDuration);                
                if( diffInSeconds > validateToken.secondsDuration ) {
                    console.log(`Token scaduto`);
                    return false;
                }

                if( validateToken.hexToken !== undefined && parsedStructure.hexToken !== validateToken.hexToken ) {
                    console.log(`hexToken non valido`);
                    return false;
                }

                if( validateToken.base64token !== undefined && parsedStructure.base64token !== validateToken.base64token ) {
                    console.log(`base64token non valido`);
                    return false;
                }

                if( validateToken.token !== undefined && parsedStructure.token !== validateToken.token ) {
                    console.log(`token non valido`);
                    return false;
                }

                return true;
            } else {
                return false;
            }
        } catch (error: unknown) {                     
            if (isError(error)) {
                return error as Error;
            } else {
                // Gestisci il caso in cui `error` non sia un'istanza di `Error`
                // Potresti voler creare e restituire un nuovo Error standard qui
                return new Error('isValidToken errore generico');
            }
        }
    }

    public static getCurrentFormattedDate() {
        const currentDate = new Date();
      
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Mesi indicizzati a partire da 0
        const day = String(currentDate.getDate()).padStart(2, '0');
      
        const hours = String(currentDate.getHours()).padStart(2, '0');
        const minutes = String(currentDate.getMinutes()).padStart(2, '0');
        const seconds = String(currentDate.getSeconds()).padStart(2, '0');
      
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    }
      
    public static parseDate(dateString: string): Date | null {
        const parsedDate = new Date(dateString);
        return isNaN(parsedDate.getTime()) ? null : parsedDate;
    }
      
    public static removeNumericSeparatorCharacters(str:string) {
        if (str.includes('separator')) {
            return str.replace(/[0-9]/g, '');
        }
        return str;
    }

    public static  generateRandomString(length:number) {
        return randomBytes(length)
            .toString('base64')
            .substring(0, length)
            .replace(/\+/g, '0')
            .replace(/\//g, '0');
    }
}

function isError(e: any): e is Error {
    return e instanceof Error;
}

export {TokenStructure,TokenStructureValidation};
export default RestToken;