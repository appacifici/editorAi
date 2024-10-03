import path from 'path';
import aws4 from 'aws4';
import axios from 'axios';
import { promises as fs } from 'fs';
import producsJson, { ItemProductAmazon, ProductsJson } from '../../files/apiWrappedAmazon';
import BaseApi from '../../siteScrapers/api/BaseApi';
import CmsAdminApi from '../CmsAdmin/CmsAdminApi';
import Article, { ArticleType, ArticleWithIdType } from '../../database/mongodb/models/Article';
import { SitePublicationWithIdType } from '../../database/mongodb/models/SitePublication';
import connectMongoDB from '../../database/mongodb/connect';
import Site, { SiteWithIdType } from '../../database/mongodb/models/Site';

// Classe per la gestione dell'API di Amazon
class AmazonProductSearch extends BaseApi {
	private accessKeyId: string;
	private secretAccessKey: string;
	private associateTag: string;
	private region: string;
	private endpoint: string;
	private service: string;

	constructor() {
		super();

		this.accessKeyId = 'AKIAJEV2EKB432G23LYQ';
		this.secretAccessKey = '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';
		this.associateTag = 'miglioreprezz-21';
		this.region = 'eu-west-1';
		this.endpoint = 'webservices.amazon.it';
		this.service = 'ProductAdvertisingAPI';		
	}

	async initialize() {
		try {
		  await connectMongoDB(); // Connessione al DB
		  console.log('Connessione al DB avvenuta con successo.');
		} catch (error) {
		  console.error('Errore nella connessione al DB:', error);
		}
	  }

	public insertNewProduct = async (sitePubblicationName:string): Promise<boolean | Error> => {
		try {
			const site:SiteWithIdType|null = await Site.findOne({site:'fake.it'});
			if( site === null ) {
				// 	this.alertUtility.setError(this.alertProcess, `getSitePublication`, false );
				// 	this.alertUtility.setError(this.alertProcess, sitePublication );
					console.log('empoty site');
					return false;
				}

			const sitePublication: SitePublicationWithIdType | Error = await this.getSitePublication(sitePubblicationName);
			if( sitePublication instanceof Error ) {
			// 	this.alertUtility.setError(this.alertProcess, `getSitePublication`, false );
			// 	this.alertUtility.setError(this.alertProcess, sitePublication );
				console.log('error sitePublication');
			 	return false;
			}


			// const products = await this.searchProducts('kindle', 3);
			

			const productsJson: ProductsJson = producsJson;
			await this.handleAmazonProductResponse(productsJson,sitePublication,site);

			return true;
		} catch (error) {
			return new Error('Error insertNewProduct');
		}
	};

	private handleAmazonProductResponse = async (response: ProductsJson, sitePublication: SitePublicationWithIdType, site:SiteWithIdType) => {
		// Verifica se ci sono Items nella risposta
		if (response.SearchResult && response.SearchResult.Items) {
			const items = response.SearchResult.Items;
			const cmsAdmin = new CmsAdminApi();

			// Ciclo su tutti gli item
			await Promise.all(items.map(async (item:ItemProductAmazon) => {
				const existingProduct = await this.getProductByAsin(item.ASIN);
				if (existingProduct) {
					console.log(`Prodotto con ASIN ${item.ASIN} già presente nel database. Skipping insert.`);
					return; // Se il prodotto esiste già, salta l'inserimento
				}
				
				let respInsert:boolean|Error =  await cmsAdmin.insertNewProduct(item);
				if( respInsert instanceof Error ) {
					console.log(respInsert);
					return false;
				}
				if( respInsert === false ) {
					console.log(respInsert);
					return false;
				}

				const articleData: ArticleType = {
					asin:                   item.ASIN,
					site:        			site._id,
					sitePublication:        sitePublication._id,
					url:                    item.DetailPageURL,
					body:                   item.ItemInfo.Title.DisplayValue,
					title:                  item.ItemInfo.Title.DisplayValue,
					description:            item.ItemInfo.Title.DisplayValue,
					h1:            			item.ItemInfo.Title.DisplayValue,
					img:                 	item.Images.Primary.Large.URL,
					price:                 	String(item.Offers.Listings[0].Price.Amount),
					genarateGpt:            0,
					send:                   0,
					lastMod:                new Date(),
					publishDate:            new Date(),
					categoryPublishSite:    '0',
					userPublishSite:        0,
				};

				
				let insertArticle =  await this.insertArticle(articleData);
				if( insertArticle instanceof Error ) {
					
				}
				console.log(insertArticle);

				console.log('fineee');
			}));


		} else {
			console.log("Nessun prodotto trovato.");
		}
	};

	public async getProductByAsin(asin: string): Promise<ArticleWithIdType | null> {
        try {
            const article:ArticleWithIdType|null = await  Article.findOne({ asin:asin });
            return article || null;
        } catch (error) {
            console.error("Errore durante la ricerca del prodotto:", error);
            throw new Error("Errore durante la ricerca del prodotto per ASIN.");
        }
    }

	// Funzione per costruire il corpo della richiesta
	private buildRequestBody(keywords: string, itemCount: number): Record<string, any> {
		return {
			PartnerType: 'Associates',
			PartnerTag: this.associateTag,
			Keywords: keywords,
			SearchIndex: 'All',
			ItemCount: itemCount,
			Resources: ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price']
		};
	}

	// Funzione per costruire le opzioni della richiesta firmata
	private buildRequestOptions(body: Record<string, any>): AwsRequestOptions {
		const path = '/paapi5/searchitems';

		const requestOptions: AwsRequestOptions = {
			host: this.endpoint,
			path,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json; charset=UTF-8',
				'Content-Encoding': 'amz-1.0',
				'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
				'User-Agent': 'paapi-docs-curl/1.0.0'
			},
			body: JSON.stringify(body),
			service: this.service,
			region: this.region
		};

		aws4.sign(requestOptions, {
			accessKeyId: this.accessKeyId,
			secretAccessKey: this.secretAccessKey
		});

		return requestOptions;
	}

	// Funzione per cercare prodotti su Amazon
	public async searchProducts(keywords: string, itemCount: number): Promise<AmazonProductResponse | void | boolean> {

		console.log('succhiami la mappoona');
		const cmsAdminApi = new CmsAdminApi();
		const randomKey = await cmsAdminApi.getJsonInitAllProductsCmsAdminAction();
		console.log('randomKey');
		console.log(randomKey);
		return false;



		const body = this.buildRequestBody(keywords, itemCount);
		const requestOptions = this.buildRequestOptions(body);

		try {
			const response: AxiosResponse<AmazonProductResponse> = await axios.post(
				`https://${this.endpoint}${requestOptions.path}`,
				body,
				{
					headers: {
						...requestOptions.headers,
						// 'Authorization': requestOptions.headers.Authorization,
						// 'X-Amz-Date': requestOptions.headers['X-Amz-Date']
					}
				}
			);
			return response.data;
		} catch (error) {
			if (axios.isAxiosError(error)) {
				console.dir(error.response ? error.response.data : error.message);
			} else {
				console.dir(error);
			}
			throw error;
		}
	}
}

export default AmazonProductSearch;