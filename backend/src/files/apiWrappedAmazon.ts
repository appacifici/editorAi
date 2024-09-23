// Definizione delle interfacce

// Interfaccia per le immagini
interface Image {
  Height: number;
  URL: string;
  Width: number;
}

// Interfaccia per le immagini principali
interface PrimaryImage {
  Large: Image;
}

// Interfaccia per le informazioni sulle immagini
interface Images {
  Primary: PrimaryImage;
}

// Interfaccia per il titolo dell'articolo
interface Title {
  DisplayValue: string;
  Label: string;
  Locale: string;
}

// Interfaccia per le informazioni sull'articolo
interface ItemInfo {
  Title: Title;
}

// Interfaccia per la condizione dell'offerta
interface Condition {
  DisplayValue: string;
  Label: string;
  Locale: string;
  Value: string;
}

// Interfaccia per il prezzo e i risparmi
interface Price {
  Amount: number;
  Currency: string;
  DisplayAmount: string;
  Savings?: {
    Amount: number;
    Currency: string;
    DisplayAmount: string;
    Percentage: number;
  };
}

// Interfaccia per l'offerta
interface Listing {
  Condition: Condition;
  Id: string;
  Price: Price;
}

// Interfaccia per le offerte
interface Offers {
  Listings: Listing[];
}

// Interfaccia per l'elemento singolo
interface ItemProductAmazon {
  ASIN: string;
  DetailPageURL: string;
  Images: Images;
  ItemInfo: ItemInfo;
  Offers: Offers;
}

// Interfaccia per il risultato della ricerca
interface SearchResult {
  Items: ItemProductAmazon[];
  SearchURL: string;
  TotalResultCount: number;
}

// Interfaccia per l'oggetto principale
interface ProductsJson {
  SearchResult: SearchResult;
}

// Oggetto esportato conforme all'interfaccia
const producsJson: ProductsJson = {
  "SearchResult": {
    "Items": [
      {
        "ASIN": "B0CTCCSQKQ",
        "DetailPageURL": "https://amzn.to/3B6Tgvv",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/716wI6j39YL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Pulizia Veloce Estrattore Automatico, 115mm Senza Preparazione Estrattore di Frutta e Verdura Intera, LINKchef Estrattore di Succo, Facile da Pulire, 1.2L 200w Nero",
            "Label": "Title",
            "Locale": "en_US"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "nuevo",
                "Label": "Condición",
                "Locale": "es_US",
                "Value": "New"
              },
              "Id": "l2dKMJRrPVX3O7DAPQ6DWLXBjBeRYsruAnKVf1LNXyjFTUw%2FnNBn41CJV2489iPYMSGuynW8uuwMQ7GhGrcT9F%2F%2FgO5bdp%2B2l0HbPvvHy05ASCdqrOaxWA%3D%3D",
              "Price": {
                "Amount": 159,
                "Currency": "USD",
                "DisplayAmount": "$52.16",
                "Savings": {
                  "Amount": 34.77,
                  "Currency": "USD",
                  "DisplayAmount": "$34.77 (40%)",
                  "Percentage": 40
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B0CDL35Y73",
        "DetailPageURL": "https://amzn.to/3XSW4FH",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/619TvTYML3L._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Eureka NERE10s Robot Aspirapolvere Lavapavimenti con Stazione, Pulizia Senza Sforzo per 45 Giorni, 4000Pa, Raccolta Automatica della Polvere, Autonomia 180min, Navigazione con LiDAR, WiFi/APP",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "nuevo",
                "Label": "Condición",
                "Locale": "es_US",
                "Value": "New"
              },
              "Id": "l2dKMJRrPVX3O7DAPQ6DWLXBjBeRYsruAnKVf1LNXyjFTUw%2FnNBn41CJV2489iPYMSGuynW8uuwMQ7GhGrcT9F%2F%2FgO5bdp%2B2l0HbPvvHy05ASCdqrOaxWA%3D%3D",
              "Price": {
                "Amount": 479,
                "Currency": "EUR",
                "DisplayAmount": "$160.80",
                "Savings": {
                  "Amount": 160.80,
                  "Currency": "EUR",
                  "DisplayAmount": "$160.80 (40%)",
                  "Percentage": 40
                }
              }
            }
          ]
        }
      }
    ],
    "SearchURL": "https://www.amazon.com/s/?field-keywords=Harry+Potter&search-alias=aps&tag=dgfd&linkCode=osi",
    "TotalResultCount": 146
  }
};

export {ProductsJson,ItemProductAmazon}
export default producsJson;
