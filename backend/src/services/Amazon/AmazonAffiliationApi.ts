import path from 'path';
import aws4 from 'aws4';
import axios from 'axios';
import { promises as fs } from 'fs'; 
import producsJson, { ProductsJson } from '../../files/apiWrappedAmazon';
import BaseApi from '../../siteScrapers/api/BaseApi';
import CmsAdminApi from '../CmsAdmin/CmsAdminApi';

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


  public insertNewProduct = async():Promise<boolean|Error> => {
    try {
      // const products = await this.searchProducts('kindle', 3);      
      const productsJson:ProductsJson = producsJson;
      await this.handleAmazonProductResponse(productsJson);

      return true;
    } catch (error) {
      return new Error('Error insertNewProduct');
    }
  };

  private handleAmazonProductResponse = async(response: ProductsJson) => {
    // Verifica se ci sono Items nella risposta
    if (response.SearchResult && response.SearchResult.Items) {
      const items = response.SearchResult.Items;
      const cmsAdmin = new CmsAdminApi();

      // Ciclo su tutti gli item
      await Promise.all(items.map(async item => {
        return cmsAdmin.insertNewProduct(item);
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