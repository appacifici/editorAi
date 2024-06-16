import React                            from 'react';
import dotenv                           from 'dotenv';
import Head                             from 'next/head';
import { GetServerSideProps }           from 'next';

import Header                           from '../components/Header/Header';
import { connectMongoDB }               from '../services/globalNext';
import Main                             from '../components/Main';
import PromptAiComponent                from '../components/PromptAi/PromptAi';
import PromptAi, 
{ PromptAiArrayWithIdType }             from '../dbService/models/PromptAi';

interface MongoDBQuery {
    [key: string]: { $nin: Array<string | null> } | string | any;
    $or?: Array<{ [key: string]: { $nin: Array<string | null> } | string }>;
}

  export const getServerSideProps: GetServerSideProps = async (context) => {
    const result = dotenv.config({ path: `.env.${process.env.NODE_ENV}` });
    if (result.error) {
        console.error(result.error);
    }

    await connectMongoDB();

    // Ottieni parametri di query per i filtri
    const query:any             = context.query;

    // oggetto di filtro basato sui parametri di query, se presenti
    const filters: MongoDBQuery = {};

    // Parametri di paginazione dalla query string, con valori di default
    const page:number           = parseInt(query.page as string) || 1;
    const pageSize:number       = parseInt(query.pageSize as string) || 30;

    // Calcola il numero totale di documenti che corrispondono ai filtri (senza limiti di paginazione)
    const total:number          = await PromptAi.countDocuments(filters);

    if (query.id) filters._id                          = query.id as string;
    if (query.sitePublication) filters.sitePublication = query.sitePublication as string;


    let promptAis:PromptAiArrayWithIdType = await PromptAi.find(filters).sort({ _id: -1 }).sort({ _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

    const promptAisData = promptAis.map(promptAi => ({
        ...promptAi,
        _id: promptAi._id.toString()        
    }));

    return {
        props: {
            promptAis: promptAisData,
            total,
            page,
            pageSize
        }            
    };
};


function MatchesBoardPage(data:any) {        

    return(  
        <>           
            <Head>
                <title>AI DASHBOARD | Siti Origine</title>                
            </Head>                                             
            <Header/>            
            <Main MainPage={<PromptAiComponent promptsAi={data.promptAis} total={data.total} page={data.page} pageSize={data.pageSize} />} />
            {/* <Footer/>             */}
        </>
    );
}

export default MatchesBoardPage;