import React                    from 'react';
import dotenv                   from 'dotenv';
import Head                     from 'next/head';
import { GetServerSideProps }   from 'next';

import Header                   from '../components/Header/Header';
import { connectMongoDB }       from '../services/globalNext';
import Main                     from '../components/Main';
import SiteComponent            from '../components/Site/Site';
import Site, 
{ ISite,
SiteArrayWithIdType, 
SiteSchema}         from '../dbService/models/Site';
import mongoose, { Model } from 'mongoose';

//Intefaccia per filtrare i risultati su mongo
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
    const Site:Model<ISite> = mongoose.models.Site || mongoose.model<ISite>('Site', SiteSchema);

    // Ottieni parametri di query per i filtri
    const query:    any = context.query;

    // oggetto di filtro basato sui parametri di query, se presenti
    const filters:  MongoDBQuery = {};

    // Parametri di paginazione dalla query string, con valori di default
    const page:     number = parseInt(query.page as string) || 1;
    const pageSize: number = parseInt(query.pageSize as string) || 30;

    // Calcola il numero totale di documenti che corrispondono ai filtri (senza limiti di paginazione)
    const total:    number = await Site.countDocuments(filters);

    if (query.site) filters.site = query.site as string;
    if (query.url) filters.url = query.url as string;
    if (query.active) filters.active = query.active as string;
    if (query.sitePublication) filters.sitePublication = query.sitePublication as string;

    let sites: SiteArrayWithIdType  = await Site.find(filters).sort({ site: 1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();

    const sitesData = sites.map(site => ({
        ...site,
        _id: site._id.toString(),
        lastMod: null
    }));

    return {
        props: {
            sites: sitesData,
            total,
            page,
            pageSize
        }
    };
};


function MatchesBoardPage(data: any) {
    return (
        <>
            <Head>
                <title>AI DASHBOARD | Siti Origine</title>
            </Head>
            <Header />
            <Main MainPage={<SiteComponent sites={data.sites} total={data.total} page={data.page} pageSize={data.pageSize} />} />            
        </>
    );
}

export default MatchesBoardPage;