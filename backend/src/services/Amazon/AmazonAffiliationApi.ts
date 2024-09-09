import path from 'path';
import aws4 from 'aws4';
import axios from 'axios';
import { promises as fs } from 'fs';
import producsJson, { ItemProductAmazon, ProductsJson } from '../../files/apiWrappedAmazon';
import BaseApi from '../../siteScrapers/api/BaseApi';
import CmsAdminApi from '../CmsAdmin/CmsAdminApi';
import { ArticleType } from '../../database/mongodb/models/Article';
import { SitePublicationWithIdType } from '../../database/mongodb/models/SitePublication';
import connectMongoDB from '../../database/mongodb/connect';

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
			// const products = await this.searchProducts('kindle', 3);      


			const sitePublication: SitePublicationWithIdType | Error = await this.getSitePublication(sitePubblicationName);
			if( sitePublication instanceof Error ) {
			// 	this.alertUtility.setError(this.alertProcess, `getSitePublication`, false );
			// 	this.alertUtility.setError(this.alertProcess, sitePublication );
				console.log(sitePublication);
			 	return false;
			}

			const productsJson: ProductsJson = producsJson;
			await this.handleAmazonProductResponse(productsJson,sitePublication);

			return true;
		} catch (error) {
			return new Error('Error insertNewProduct');
		}
	};

	private handleAmazonProductResponse = async (response: ProductsJson, sitePublication: SitePublicationWithIdType) => {
		// Verifica se ci sono Items nella risposta
		if (response.SearchResult && response.SearchResult.Items) {
			const items = response.SearchResult.Items;
			const cmsAdmin = new CmsAdminApi();

			// Ciclo su tutti gli item
			await Promise.all(items.map(async (item:ItemProductAmazon) => {
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
					site:        			sitePublication._id,
					sitePublication:        sitePublication._id,
					url:                    item.DetailPageURL,
					body:                   item.ItemInfo.Title.DisplayValue,
					title:                  item.ItemInfo.Title.DisplayValue,
					description:            item.ItemInfo.Title.DisplayValue,
					h1:            			item.ItemInfo.Title.DisplayValue,
					img:                 	item.Images.Primary.Large.URL,
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
	public async searchProducts(keywords: string, itemCount: number): Promise<AmazonProductResponse | void> {
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