import React                            from 'react';
import dotenv                           from 'dotenv';
import Head                             from 'next/head';
import { GetServerSideProps }           from 'next';

import Header                           from '../components/Header/Header';
// import Footer                           from '../components/Footer';
import { connectMongoDB }               from '../services/globalNext';
import Main                             from '../components/Main';
import AlertComponent                   from '../components/Alert/Alert';
import Alert                            from '../dbService/models/Alert';

// const matchesUpdate:MatchesInterface = {"654bcb0850ad1ee8c57aa3da":{"competition":{"id":"654bcb0850ad1ee8c57aa3da","matches":{"6560e1416d929032388a4c61":{"current_time":"83"}}}},"654bcaf550ad1ee8c57aa2b9":{"competition":{"id":"654bcaf550ad1ee8c57aa2b9","matches":{"6560e1416d929032388a4c9d":{"current_time":"90"},"6560e1416d929032388a4c9b":{"current_time":"88"}}}},"654bcaf950ad1ee8c57aa2ed":{"competition":{"id":"654bcaf950ad1ee8c57aa2ed","matches":{"6560e84dd7a15903991f8d67":{"current_time":"57"},"6560e84dd7a15903991f8d65":{"current_time":"53"},"6560e84dd7a15903991f8d6c":{"current_time":"59"},"6560e84dd7a15903991f8d6e":{"current_time":"60"},"6560e84dd7a15903991f8d81":{"current_time":"58"},"6560e84dd7a15903991f8d83":{"current_time":"59"}}}},"654bcb0c50ad1ee8c57aa40c":{"competition":{"id":"654bcb0c50ad1ee8c57aa40c","matches":{"6560e87fd7a15903991f9ced":{"current_time":"60"}}}},"654bcb0350ad1ee8c57aa37f":{"competition":{"id":"654bcb0350ad1ee8c57aa37f","matches":{"6560ef5b519abfa26c025188":{"status":"ADDED TIME","current_time":"45+"},"6560ef5b519abfa26c025192":{"status":"ADDED TIME","current_time":"45+"},"6560ef5b519abfa26c0251ce":{"status":"HALF TIME BREAK","current_time":"HT","first_half_away_score":"1","first_half_home_score":"0"}}}},"654bd88be5a4549faacdaf62":{"competition":{"id":"654bd88be5a4549faacdaf62","matches":{"6560ef83519abfa26c02563b":{"status":"ADDED TIME","current_time":"45+"}}}},"654bd87be5a4549faacdaf35":{"competition":{"id":"654bd87be5a4549faacdaf35","matches":{"6560ef97519abfa26c025875":{"status":"HALF TIME BREAK","current_time":"HT","first_half_away_score":"3","first_half_home_score":"0"}}}},"654bcb0650ad1ee8c57aa3b2":{"competition":{"id":"654bcb0650ad1ee8c57aa3b2","matches":{"6560f663519abfa26c030cf2":{"current_time":"16"}}}},"654bcb0650ad1ee8c57aa3bb":{"competition":{"id":"654bcb0650ad1ee8c57aa3bb","matches":{"6560f663519abfa26c030cf6":{"current_time":"15"}}}},"654bcaf950ad1ee8c57aa2f6":{"competition":{"id":"654bcaf950ad1ee8c57aa2f6","matches":{"6560f663519abfa26c030d41":{"current_time":"18"}}}},"654bcafd50ad1ee8c57aa334":{"competition":{"id":"654bcafd50ad1ee8c57aa334","matches":{"6560fa10519abfa26c037634":{"status":"IN PLAY","current_time":"1","home_score":"0","away_score":"0"}}}}};

interface MongoDBQuery {
    [key: string]: { $nin: Array<string | null> } | string | any;
    $or?: Array<{ [key: string]: { $nin: Array<string | null> } | string }>;
}

const formatDate = (dateString:string) => {
    const date = new Date(dateString);
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
    const query = context.query;

    // oggetto di filtro basato sui parametri di query, se presenti
    const filters: MongoDBQuery = {};

    // Parametri di paginazione dalla query string, con valori di default
    const page = parseInt(query.page as string) || 1;
    const pageSize = parseInt(query.pageSize as string) || 30;

    // Calcola il numero totale di documenti che corrispondono ai filtri (senza limiti di paginazione)
    const total = await Alert.countDocuments(filters);

    if (query.originSite) filters.originSite = query.originSite as string;
    if (query.destinationSite) filters.destinationSite = query.destinationSite as string;
    if (query.processName) filters.processName = query.processName as string;
    if (query.process) filters.process = query.process as string;

    const notEmptyCondition = { $nin: [null, ""] };

    // Crea un array per le condizioni "OR"
    let orConditions = [];

    if (query.filterError === 'on') {
        orConditions.push({ error: notEmptyCondition });
    }
    if (query.filterAlert === 'on') {
        orConditions.push({ alert: notEmptyCondition });
    }
    if (query.filterCallResponse === 'on') {
        orConditions.push({ callResponse: notEmptyCondition });
    }

    // Se ci sono condizioni "OR" da applicare, aggiungile all'oggetto di filtro
    if (orConditions.length > 0) {
        filters.$or = orConditions;
    }

    if (query.startDate || query.endDate) {
        filters.createdAt = {};
        
        if (query.startDate) {
          // Converte startDate da stringa a Date
          filters.createdAt.$gte = new Date(query.startDate as string);
        }
      
        if (query.endDate) {
          // Converte endDate da stringa a Date e aggiunge un giorno per includere tutta la giornata di endDate
          const endDate = new Date(query.endDate as string);
          filters.createdAt.$lt = new Date(endDate.getTime());
        }
    }

    console.log(filters);

    let alerts = await Alert.find(filters).sort({ _id: -1 }).sort({ _id: -1 })
    .skip((page - 1) * pageSize)
    .limit(pageSize)
    .lean();

    const alertsData = alerts.map(alert => ({
        ...alert,
        _id: alert._id.toString(),
        createdAt: alert.createdAt ? formatDate(alert.createdAt.toString()) : null,
        updatedAt: alert.updatedAt ? formatDate(alert.updatedAt.toString()) : null
    }));

    return {
        props: {
            alerts: alertsData,
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
                <title>AI DASHBOARD | Alert Monitoraggio</title>                
            </Head>                                             
            <Header/>            
            <Main MainPage={<AlertComponent alerts={data.alerts} total={data.total} page={data.page} pageSize={data.pageSize} />} />
            {/* <Footer/>             */}
        </>
    );
}

export default MatchesBoardPage;