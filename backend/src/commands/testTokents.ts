import RestToken, { TokenStructure, TokenStructureValidation } from '../services/Security/RestToken';

const structure:TokenStructure = {    
    'separator1': 7,
    'year': '',
    'separator2': 15,
    'month': '',
    'separator3': 25,
    'day': '',
    'hexToken':'fh8938z323djdd3@fJ',
    'separator4': 9,
    'hours': 5,
    'separator5': 2,
    'minute': 5,
    'separator6': 20,
    'seconds': 5,
    'token':'fh8938z323djdd3@fJd',    
};

const init = async () => {
    const token:string|Error = RestToken.generateTimerToken(structure,'base64');
    console.log('Generated token:', token);

    await sleep(2000);

    if( token instanceof Error) {
    } else {
        const parsedStructure:TokenStructure|Error = RestToken.parseTimerToken(token,structure,'base64');
        if( parsedStructure instanceof Error ) {
            
        } else {
            const validateToken:TokenStructureValidation = {                    
                'hexToken':'fh8938z323djdd3@fJ',
                'token':'fh8938z323djdd3@fJd',
                'base64token':'fh8938z323djdddasfdsds3@fJd',
                'secondsDuration': 3                
            };
            RestToken.isValidTimingToken(parsedStructure,validateToken);
        }
    }
}
init();

function sleep(ms:any) {
    return new Promise(resolve => setTimeout(resolve, ms));
}