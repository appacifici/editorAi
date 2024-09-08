import express from 'express';
import cors from 'cors';
import connectMongoDB from '../database/mongodb/connect';
import Alert from '../database/mongodb/models/Alert';
import Site, { SiteWithIdType } from '../database/mongodb/models/Site';
import SitePublication, { SitePublicationWithIdType } from '../database/mongodb/models/SitePublication';
import PromptAi, { PromptAiArrayWithIdType, PromptAiType } from '../database/mongodb/models/PromptAi';
import Article, { ArticleWithIdType } from '../database/mongodb/models/Article';
import OpenAiService from '../services/OpenAi/OpenAiService';
import WordpressApi from '../services/WordpressApi';
import DinamycScraper from '../siteScrapers/api/DinamycScraper';
import SocketServer from '../services/Socket/SocketServer';
import { bool } from 'sharp';
import RestToken from '../services/Security/RestToken';

connectMongoDB();

interface MongoDBQuery {
	[key: string]: { $nin: Array<string | null> } | string | any;
	$or?: Array<{ [key: string]: { $nin: Array<string | null> } | string }>;
}

const app = express();
const PORT = 3001;
 
app.use(cors());
app.use(express.json());

//Avvia il socker server che fara da intermediario tra i socketClient installati sui vari cron per comandarne il riavvio
const socketServer = new SocketServer(3002);
socketServer.connectClientSocket();

/**
 * Metodo che viene invocato dal frontend per ricevere i dati di giornata
 */
app.get('/api/testToken', async (req, res) => {
	RestToken.generateToken().then(token => {
		console.log('Generated token:', token);
	}).catch(error => {
		console.error('Error generating token:', error);
	});
	res.status(200).send({'success':false});
});



/**
 * Metodo che viene invocato dal frontend per ricevere i dati di giornata
 */
app.get('/api/alerts/:id', async (req, res) => {

	try {
		const alert = await Alert.findById(req.params.id);
		res.json(alert);
	} catch (error) {
		console.error('Errore durante il recupero dei dati dell\'alert:', error);
		res.status(500).json({ error: 'Errore durante il recupero dei dati dell\'alert' });
	}
});

// ########### ########### ########### KEYWORDS ########### ########### ###########


// ########### ########### ########### SITE ########### ########### ###########

app.get('/api/site/import/:id', async (req, res) => {
	try {
		const site:SiteWithIdType|null = await Site.findById(req.params.id);
		if( site == null ) {
			return res.status(200).send({'success':false});  
		}

		const dinamycScraper = new DinamycScraper(site.format, site.site);
		const processName: string  	= `importSitemapArticle`;
		const processLabel: string 	= `importSitemapArticle ${site.sitePublication} ${site.site}`;
		const alertProcess: string 	= dinamycScraper.alertUtility.initProcess(processLabel);
		dinamycScraper.alertUtility.setLimitWrite(60000); 
		await dinamycScraper.init(alertProcess, processName);

		await dinamycScraper.alertUtility.write(alertProcess, processName, site.site, site.sitePublication);		
		return res.status(200).send({'successss':true});			

	} catch (error) {		
		return res.status(200).send({'success':false});  
	}
});

app.get('/api/site/:id', async (req, res) => {
	try {
		const site = await Site.findById(req.params.id);
		res.json(site);
	} catch (error) {
		console.error('Errore durante il recupero dei dati del site:', error);
		res.status(500).json({ error: 'Errore durante il recupero dei dati del site' });
	}
});

app.get('/api/site', async (req, res) => {
	try {
		const site = await Site.find().sort({ site: 1 })
		res.json(site);
	} catch (error) {
		console.error('Errore durante il recupero dei dati del site:', error);
		res.status(500).json({ error: 'Errore durante il recupero dei dati del site' });
	}
});

// API per creare un nuovo record
app.post('/api/site', async (req, res) => {
	try {
		const newItem = new Site(req.body);
		await newItem.save();

		res.status(201).send(newItem);
	} catch (error) {
		res.status(400).send(error);
	}
});

// API per l'aggiornamento di un record esistente
app.put('/api/site/:id', async (req, res) => {
	try {
		const updatedItem = await Site.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });		
		res.status(200).send(updatedItem);
	} catch (error) {
		res.status(400).send(error);
	}
});

// API per eliminare un record
app.delete('/api/site/:id', async (req, res) => {
	try {
		const deletedItem = await Site.findByIdAndDelete(req.params.id);
		res.status(200).send(deletedItem);
	} catch (error) {
		res.status(400).send(error);
	}
});

// ########### ########### ########### sitePublication ########### ########### ###########

app.get('/api/sitePublication/:id', async (req, res) => {
	try {
		const sitePublication = await SitePublication.findById(req.params.id);
		res.json(sitePublication);
	} catch (error) {
		console.error('Errore durante il recupero dei dati del sitePublication:', error);
		res.status(500).json({ error: 'Errore durante il recupero dei dati del sitePublication' });
	}
}); 

app.get('/api/sitePublication', async (req, res) => {
	try {
		const sitePublication = await SitePublication.find().sort({ site: 1 })
		return res.json(sitePublication);
	} catch (error) {
		console.error('Errore durante il recupero dei dati del sitePublication:', error);
		return res.status(500).json({ error: 'Errore durante il recupero dei dati del sitePublication' });
	}
});

// API per creare un nuovo record
app.post('/api/sitePublication', async (req, res) => {
	try {
		const newItem = new SitePublication(req.body);
		await newItem.save();
		const wodpressApi = new WordpressApi();
		wodpressApi.getWpApiCategories(req.body.sitePublication);   

		return res.status(201).send(newItem);
	} catch (error) {
		return res.status(400).send(error);
	}
}); 

// API per l'aggiornamento di un record esistente
app.put('/api/sitePublication/:id', async (req, res) => {
	try {
		const updatedItem = await SitePublication.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		const wodpressApi = new WordpressApi();
		wodpressApi.getWpApiCategories(req.body.sitePublication);   

		return res.status(200).send(updatedItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

// API per eliminare un record
app.delete('/api/sitePublication/:id', async (req, res) => {
	try {
		const deletedItem = await SitePublication.findByIdAndDelete(req.params.id);
		return res.status(200).send(deletedItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

// ########### ########### ########### sitePublication ########### ########### ###########

app.get('/api/article/:id', async (req, res) => {
	try {
		const article:ArticleWithIdType|null = await Article.findById(req.params.id).populate('site').populate('sitePublication');
		if( article !== null ) {
			if (article !== null) {
				const modifiedArticle = {  
					...article.toObject(), 
					categoryPublishSite: 	article.categoryPublishSite.toString(),
					userPublishSite: 		article.userPublishSite.toString(),
					send: 					article.send?.toString(),
					genarateGpt: 			article.genarateGpt?.toString(),				
					tecnicalInfo: 			article.tecnicalInfo?.toString(),					
					titleGpt: 				article.titleGpt?.toString(),					
					descriptionGpt: 		article.descriptionGpt?.toString(),					
					h1Gpt: 					article.h1Gpt?.toString(),					
				};
				return res.json(modifiedArticle); 
			}
		}
		return res.status(500).json({ error: 'Errore durante il recupero dei dati del Article' });
	} catch (error) {
		console.error('Errore durante il recupero dei dati del Article:', error);
		return res.status(500).json({ error: 'Errore durante il recupero dei dati del Article' });
	}
});

// API per creare un nuovo record
app.post('/api/article', async (req, res) => {
	try {
		const newItem = new Article(req.body);
		await newItem.save();
		return res.status(201).send(newItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

// API per l'aggiornamento di un record esistente
app.put('/api/article/:id', async (req, res) => {
	try {
		const updatedItem = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
		return res.status(200).send(updatedItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

// API per eliminare un record
app.delete('/api/article/:id', async (req, res) => {
	try {
		const deletedItem = await Article.findByIdAndDelete(req.params.id);
		return res.status(200).send(deletedItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});


app.get('/api/article/send/:id', async (req, res) => {
	try {		
		
		const article:ArticleWithIdType | null 	= await Article.findOne({ _id: req.params.id }).populate('site').populate('sitePublication')  as ArticleWithIdType | null;    
		if( article === null ) {
			return res.status(200).send({'success':false,'mes':'si'});
		}  else {
				const site:SiteWithIdType 						= article.site as SiteWithIdType;   
				const sitePublication:SitePublicationWithIdType = article.sitePublication as SitePublicationWithIdType;  

				const wodpressApi 			= new WordpressApi();
				const processName: string  	= `sendToWPApi`;
				const processLabel: string 	= `sendToWPApi ${sitePublication.sitePublication} ${article._id}`;
				const alertProcess: string 	= wodpressApi.alertUtility.initProcess(processLabel);
				wodpressApi.alertUtility.setLimitWrite(60000); 

				await wodpressApi.sendToWPApi(alertProcess,sitePublication.sitePublication, 0, article);
				await wodpressApi.alertUtility.write(alertProcess, processName, site.site, sitePublication.sitePublication, article._id);
				const articleUpdate:ArticleWithIdType | null 	= await Article.findOne({ _id: req.params.id })  as ArticleWithIdType | null;    
				return res.status(200).send({'success':true, data: articleUpdate});						
		}		
		return res.status(200).send({'success':false});
	} catch (error) {
		console.error('Errore durante l\'esecuzione del comando:', error);		
		return res.status(200).send({'success':false});
	} 
});

// ########### ########### ########### Prompt AI ########### ########### ###########

app.get('/api/promptAi/:id', async (req, res) => {
	try {
		if( req.params.id == 'default') {
			const promptAi = await PromptAi.findOne({defaultPrompt:1});
			const modifiedPromptAi = {
				...promptAi,
				sitePublication: 	null,
							
			};
			if( promptAi != null ) {
				promptAi.sitePublication = '';
				promptAi.title = '';
				promptAi.defaultPrompt = 0;
			}
			return res.json(promptAi);
		} else {
			const promptAi = await PromptAi.findById(req.params.id);
			return res.json(promptAi);
		}
		
	} catch (error) {
		console.error('Errore durante il recupero dei dati del prompt:', error);
		return res.status(500).json({ error: 'Errore durante il recupero dei dati del site' });
	}
});


app.get('/api/promptAi/sitePubblication/:sitePubblication', async (req, res) => {
	try {
		const filters: MongoDBQuery = {};
		filters.sitePublication = req.params.sitePubblication;
		const promptAis: PromptAiArrayWithIdType = await PromptAi.find(filters).sort({ _id: -1 }).sort({ _id: -1 })
		return res.json(promptAis);
	} catch (error) {
		console.error('Errore durante il recupero dei dati del PromptAi:', error);
		return res.status(500).json({ error: 'Errore durante il recupero dei dati del PromptAi' });
	}
});

// API per creare un nuovo record
app.post('/api/promptAi', async (req, res) => {
	try {
		const newItem = new PromptAi(req.body);
		newItem.title 				= req.body.title;
		newItem.sitePublication 	= req.body.sitePublication;
		newItem.calls 				= JSON.parse(req.body.calls);
		newItem.steps 				= JSON.parse(req.body.steps);
		newItem.defaultPrompt 		= req.body.defaultPrompt;

		await newItem.save();
		return res.status(201).send(newItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

// API per l'aggiornamento di un record esistente
app.put('/api/promptAi/:id', async (req, res) => {
	try {
		let newObj: any = {};
		newObj.title 			= req.body.title;
		newObj.sitePublication 	= req.body.sitePublication;
		newObj.calls 			= JSON.parse(req.body.calls);
		newObj.steps 			= JSON.parse(req.body.steps);
		newObj.defaultPrompt 	= req.body.defaultPrompt;

		const updatedItem = await PromptAi.findByIdAndUpdate(req.params.id, newObj, { new: true, runValidators: true });
		return res.status(200).send(updatedItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

// API per l'aggiornamento di un record esistente
app.put('/api/promptAi/uncomplete/:callKey/:id', async (req, res) => {
	try {
		const promptAI = await PromptAi.findOne({ _id: req.params.id });
		if (!promptAI) {
			return res.status(404).send('Not found');
		}

		let updated = false;

		if (promptAI.calls) {
			Object.entries(promptAI.calls).forEach(([key, call]) => {
				if (call.key === req.params.callKey) {
					console.log(`Updating call with key: ${call.key}`);
					call.complete = 0;
					updated = true;
				}
			});
		}

		if (updated) {
			const updatedItem = await PromptAi.findByIdAndUpdate(req.params.id, promptAI, { new: true, runValidators: true });
			return res.status(200).send(updatedItem);
			
		} else {
			return res.status(404).send('Call not found');
		}
	} catch (error) {
		return res.status(400).send(error);
	}
});


// API per eliminare un record
app.delete('/api/promptAi/:id', async (req, res) => {
	try {
		const deletedItem = await PromptAi.findByIdAndDelete(req.params.id);
		return res.status(200).send(deletedItem);
	} catch (error) {
		return res.status(400).send(error);
	}
});

app.get('/api/promptAi/generateAi/:id/:promptId', async (req, res) => {
	try { 
		
		const openAiService: OpenAiService 				= new OpenAiService();		
		const articleGenerate:ArticleWithIdType | null 	= await Article.findOne({ _id: req.params.id }).populate('site').populate('sitePublication')  as ArticleWithIdType | null;    
		if( articleGenerate === null ) {
			return res.status(200).send({'success':false});
		}  else {
			const site:SiteWithIdType 						= articleGenerate.site as SiteWithIdType;   
			const sitePublication:SitePublicationWithIdType = articleGenerate.sitePublication as SitePublicationWithIdType;  

			if (articleGenerate !== null && articleGenerate.article !== null && articleGenerate.site !== null) {
				const processName: string  = `generateGptArticle`;
				const processLabel: string = `generateGptArticle ${sitePublication.sitePublication} ${articleGenerate._id}`;
				const alertProcess: string = openAiService.alertUtility.initProcess(processLabel); //. date('YmdHis')
				openAiService.alertUtility.setLimitWrite(60000); 

				await openAiService.runPromptAiArticle(alertProcess, processName, sitePublication.sitePublication,req.params.promptId, 0, articleGenerate);
				await openAiService.alertUtility.write(alertProcess, processName, site.site, sitePublication.sitePublication, articleGenerate._id);
				const promptAi = await PromptAi.findById(req.params.promptId);
				return res.status(200).send({'success':true, data: promptAi});			
			}
			return res.status(200).send({'success':false});  
		}		
		
	} catch (error) {
		console.error('Errore durante l\'esecuzione del comando:', error);
		return res.status(200).send({'success':false});
	} 
});

app.get('/api/promptAi/generateAIGetKeywords/:promptId/:spId/:sectionName', async (req, res) => {
	try {
		
		const replace = {sectionName:req.params.sectionName};

		const openAiService: OpenAiService 				= new OpenAiService();		
		const sitePublication:SitePublicationWithIdType | null 	= await SitePublication.findOne({ _id: req.params.spId }) as SitePublicationWithIdType | null;    
		if( sitePublication === null ) {
			return res.status(200).send({'success':false});
		}  else {						

			const processName: string  = `generateGptArticle`;
			const processLabel: string = `generateGptArticle ${sitePublication.sitePublication} ${sitePublication._id}`;
			const alertProcess: string = openAiService.alertUtility.initProcess(processLabel); //. date('YmdHis')
			openAiService.alertUtility.setLimitWrite(60000); 

			let response:string|boolean|object = false;
			for( var x = 0; x < 10; x++ ) {
				if( typeof response === 'boolean' ) {
					response = await openAiService.runPromptAiGeneric(alertProcess, processName, sitePublication.sitePublication,req.params.promptId, undefined, replace);
				}
			}
			
			await openAiService.alertUtility.write(alertProcess, processName, sitePublication.sitePublication, sitePublication.sitePublication);

			return res.status(200).send(response);			
					
		}		
		
	} catch (error) {
		console.error('Errore durante l\'esecuzione del comando:', error);
		return res.status(200).send({'success':false});
	} 
});

app.listen(PORT, () => {
	console.log(`Server Express in esecuzione sulla porta ${PORT}`);
});