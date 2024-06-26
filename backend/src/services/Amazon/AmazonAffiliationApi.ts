import aws4 from 'aws4';
import axios from 'axios';

const accessKeyId = 'AKIAJEV2EKB432G23LYQ';
const secretAccessKey = '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';
const associateTag = 'miglioreprezz-21';
const region = 'eu-west-1';
const endpoint = 'webservices.amazon.it';
const service = 'ProductAdvertisingAPI';

const searchProducts = async () => {
  const path = '/paapi5/searchitems';
  const body = {
    PartnerType: 'Associates',
    PartnerTag: associateTag,
    Keywords: 'kindle',
    SearchIndex: 'All',
    ItemCount: 3,
    Resources: ['Images.Primary.Large', 'ItemInfo.Title', 'Offers.Listings.Price']
  };

  const requestOptions = {
    host: endpoint,
    path,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=UTF-8',
      'Content-Encoding': 'amz-1.0',
      'X-Amz-Target': 'com.amazon.paapi5.v1.ProductAdvertisingAPIv1.SearchItems',
      'User-Agent': 'paapi-docs-curl/1.0.0'
    },
    body: JSON.stringify(body),
    service,
    region
  };

  aws4.sign(requestOptions, {
    accessKeyId,
    secretAccessKey
  });

  try {
    const response = await axios.post(`https://${endpoint}${path}`, body, {
      headers: {
        ...requestOptions.headers,
        // 'Authorization': requestOptions.headers.Authorization,
        // 'X-Amz-Date': requestOptions.headers['X-Amz-Date']
      }
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.dir(error.response ? error.response.data : error.message);
    } else {
      console.dir(error);
    }
    throw error;
  }
};

// Esempio di utilizzo
searchProducts()
  .then(data => {
    console.log('Risultati della ricerca:', JSON.stringify(data, null, 2));
  })
  .catch(error => {
    
  });
