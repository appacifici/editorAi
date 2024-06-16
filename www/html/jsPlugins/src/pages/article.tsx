import React                    from 'react';
import dotenv                   from 'dotenv';
import Head                     from 'next/head';
import { GetServerSideProps }   from 'next';
import Header                   from '../components/Header/Header';
import { connectMongoDB }       from '../services/globalNext';
import Main                     from '../components/Main';
import ArticleComponent         from '../components/Article/Article';
import Article, 
{ ArticleArrayWithIdType }      from '../dbService/models/Article';

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
    const query:    any = context.query;

    // oggetto di filtro basato sui parametri di query, se presenti
    const filters:  MongoDBQuery = {};

    // Parametri di paginazione dalla query string, con valori di default
    const page:     number = parseInt(query.page as string) || 1;
    const pageSize: number = parseInt(query.pageSize as string) || 30;

    // Calcola il numero totale di documenti che corrispondono ai filtri (senza limiti di paginazione)
    const total:    number = await Article.countDocuments(filters);

    if (query.id) filters._id                                   = query.id.trim() as string;
    if (query.site) filters.site                                = query.site.trim() as string;
    if (query.sitePublication) filters.sitePublication          = query.sitePublication.trim() as string;
    if (query.categoryPublishSite) filters.categoryPublishSite  = new RegExp(query.categoryPublishSite.trim(), 'i');
    if (query.userPublishSite) filters.userPublishSite          = new RegExp(query.userPublishSite.trim(), 'i'); 
    if (query.url) filters.url                                  = new RegExp(query.url.trim(), 'i');
    if (query.title) filters.title                              = new RegExp(query.title.trim(), 'i');
    if (query.titleGpt) filters.titleGpt                        = new RegExp(query.titleGpt.trim(), 'i');
    if (query.startDate || query.endDate) {
        filters.createdAt = {};
        
        if (query.startDate) {
          // Converte startDate da stringa a Date
          filters.publishDate.$gte = new Date(query.startDate as string);
        }
      
        if (query.endDate) {
          // Converte endDate da stringa a Date e aggiunge un giorno per includere tutta la giornata di endDate
          const endDate = new Date(query.endDate as string);
          filters.publishDate.$lt = new Date(endDate.getTime());
        }
    }

    let articles: ArticleArrayWithIdType  = await Article.find(filters).populate('site').populate('sitePublication').sort({ _id: -1 }).sort({ _id: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean();    
 
    const articlesData = articles.map(article => ({
        ...article,
        _id: article._id.toString(),
        site: {
            ...article.site,
            _id: article.site && article.site._id ? article.site._id.toString() : null,
            lastMod: null
        },
        sitePublication: {
            ...article.sitePublication,
            _id: article.sitePublication && article.sitePublication._id ? article.sitePublication._id.toString() : null
        }, 
        lastMod: article.lastMod.toISOString(),  // Converti Date in stringa ISO
        publishDate: article.publishDate.toISOString()
    }));

    console.log(articlesData);

    return {
        props: {
            articles: articlesData,
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
                <title>AI DASHBOARD | Articoli</title>
            </Head>
            <Header />
            <Main MainPage={<ArticleComponent articles={data.articles} total={data.total} page={data.page} pageSize={data.pageSize} />} />            
        </>
    );
}

export default MatchesBoardPage;