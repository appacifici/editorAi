import axios                from 'axios';
import mongoose             from 'mongoose';
import { ParsedUrlQuery }   from 'querystring';
import { BACKEND_ENDPOINT } from '../constants';

const connectMongoDB = async () => {
    try {

        await mongoose.connect(`mongodb://openaiuser:h98834958fh3405870@${process.env.NEXT_PUBLIC_MONGO_DB_HOST}:27017/newsgpt?authSource=admin`, {            
            
        });
        console.log(`Mongoose connected to MongoDB: mongodb://openaiuser:h98834958fh3405870@${process.env.NEXT_PUBLIC_MONGO_DB_HOST}:27017/newsgpt`);
    } catch (err) {
        console.error('Error connecting to MongoDB');
        process.exit(1);
    }
};

const handleCreate = async (schema: string, event: any): Promise<boolean> => {
    try {
        event.preventDefault();
        event.stopPropagation();

        // Crea un'istanza di FormData dal form event.target
        const formData = new FormData(event.target);

        // Crea un oggetto semplice dai dati del FormData
        const formProps = Object.fromEntries(formData.entries());

        await axios.post(`${BACKEND_ENDPOINT}/api/${schema}`, formProps);
        return true;
    } catch (error) {
        return false;
    }
};

const handleUpdate = async (schema: string, id: string, event: any): Promise<boolean> => {
    try {
        event.preventDefault();
        event.stopPropagation();

        // Crea un'istanza di FormData dal form event.target
        const formData = new FormData(event.target);

        // Crea un oggetto semplice dai dati del FormData
        const formProps = Object.fromEntries(formData.entries());

        await axios.put(`${BACKEND_ENDPOINT}/api/${schema}/${id}`, formProps);
        return true;
    } catch (error) {
        return false;
    }
};

const handleDelete = async (schema: string, id: string, event: any): Promise<boolean> => {
    try {
        event.preventDefault();
        event.stopPropagation();

        await axios.delete(`${BACKEND_ENDPOINT}/api/${schema}/${id}`);
        return true;
    } catch (error) {
        return false;
    }
};

//Metodo centralizzato che gestisce i parametri inviati dai form per la ricerca nelle pagine lista
const handleSubmitFormParams = (event: React.FormEvent<HTMLFormElement>, router: any) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    // Utilizza ParsedUrlQuery per una tipizzazione più accurata
    const query: ParsedUrlQuery = {};

    formData.forEach((value, key) => {
        const stringValue = value instanceof File ? value.name : value.toString();

        // Controllo di tipo per garantire che query[key] sia trattato correttamente
        if (query[key] === undefined) {
            // Se il campo non esiste, inizializzalo come stringa
            query[key] = stringValue;
        } else if (Array.isArray(query[key])) {
            // Se è già un array, utilizza push per aggiungere il nuovo valore
            //query[key].push(stringValue);
        } else {
            // Se esiste come stringa, convertilo in array con il valore corrente e il nuovo valore
            query[key] = [query[key] as string, stringValue];
        }
    });

    router.push({
        pathname: router.pathname,
        query: query,
    });
};


//Metodo che gestisce la pagine corrente aggiornandola nella url di ricerca attraverso il sistema router di react
const handlePagination = (newPage: number, router: any) => {
    // Aggiorna la pagina corrente nella query string
    const currentQuery = router.query;
    router.push({
        pathname: router.pathname,
        query: { ...currentQuery, page: newPage }
    });
};

export { connectMongoDB, handleSubmitFormParams, handlePagination, handleCreate, handleUpdate, handleDelete };