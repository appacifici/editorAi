import React                            from 'react';
import dotenv                           from 'dotenv';
import Head                             from 'next/head';
import { GetServerSideProps }           from 'next';

import Header                           from '../components/Header/Header';
import { connectMongoDB }               from '../services/globalNext';
import Main                             from '../components/Main';
import SitePublicationComponent         from '../components/SitePublication/SitePublication';
import SitePublication, 
{ SitePublicationArrayWithIdType }      from '../dbService/models/SitePublication';

interface MongoDBQuery {
    [key: string]: { $nin: Array<string | null> } | string | any;
    $or?: Array<{ [key: string]: { $nin: Array<string | null> } | string }>;
}

const formatDate = (dateString:string) => {
    const date      = new Date(dateString);
    const formatter = new Intl.DateTimeFormat('it-IT', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'UTC' // Assicurati di specificare il fuso orario se necessario
    });
    return formatter.format(date);
  };
  
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
    const total:number          = await SitePublication.countDocuments(filters);

    if (query.sitePublication) filters.sitePublication  = query.sitePublication as string;
    if (query.siteType) filters.siteType                = query.siteType as string;
    if (query.url) filters.url                          = query.url as string;
    if (query.tokenUrl) filters.tokenUrl                = query.tokenUrl as string;
    if (query.urlImages) filters.urlImages              = query.urlImages as string;
    if (query.urlImages) filters.urlCategories          = query.urlCategories as string;
    if (query.username) filters.username                = query.username as string;
    if (query.password) filters.password                = query.password as string;
    if (query.active) filters.active                    = query.active as string;    
    if (query.promptAiId) filters.promptAiId            = query.promptAiId as string;    

    let sitePublications:SitePublicationArrayWithIdType = await SitePublication.find(filters).sort({ sitePublication: 1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

    const sitePublicationsData = sitePublications.map(sitePublication => ({
        ...sitePublication,
        _id: sitePublication._id.toString()        
    }));

    return {
        props: {
            sitePublications: sitePublicationsData,
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
            <Main MainPage={<SitePublicationComponent sitePublications={data.sitePublications} total={data.total} page={data.page} pageSize={data.pageSize} />} />
            {/* <Footer/>             */}
        </>
    );
}

export default MatchesBoardPage;