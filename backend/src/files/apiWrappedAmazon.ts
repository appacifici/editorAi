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
        "ASIN": "B09TTZLQG8",
        "DetailPageURL": "https://amzn.to/3SUuTeK",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/61Ai34GLPvL._AC_UY218_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Estrattore di Succo Slow Juicer, 150W, Silenzioso e Facile da Pulire",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567890",
              "Price": {
                "Amount": 129,
                "Currency": "EUR",
                "DisplayAmount": "€129,00",
                "Savings": {
                  "Amount": 30,
                  "Currency": "EUR",
                  "DisplayAmount": "€30,00 (20%)",
                  "Percentage": 20
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B091QZGHN2",
        "DetailPageURL": "https://amzn.to/3Tp8aCp",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/81E4dF6HvTL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Estrattore di Succo a Freddo, 400W, con Funzione Reverse",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567891",
              "Price": {
                "Amount": 159,
                "Currency": "EUR",
                "DisplayAmount": "€159,00",
                "Savings": {
                  "Amount": 40,
                  "Currency": "EUR",
                  "DisplayAmount": "€40,00 (25%)",
                  "Percentage": 25
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B07Y3KCN76",
        "DetailPageURL": "https://amzn.to/3Tpr8aC",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/71c1N7q4FLL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Estrattore di Succo Professionale, 1L, 200W, Nero",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567892",
              "Price": {
                "Amount": 179,
                "Currency": "EUR",
                "DisplayAmount": "€179,00",
                "Savings": {
                  "Amount": 50,
                  "Currency": "EUR",
                  "DisplayAmount": "€50,00 (28%)",
                  "Percentage": 28
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B08J1LZP5P",
        "DetailPageURL": "https://amzn.to/3XWS1Y3",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/71h4dtyzZhL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Estrattore di Succo Centrifuga, 700W, Bocca Larga per Frutta Intera",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567893",
              "Price": {
                "Amount": 89,
                "Currency": "EUR",
                "DisplayAmount": "€89,00",
                "Savings": {
                  "Amount": 10,
                  "Currency": "EUR",
                  "DisplayAmount": "€10,00 (10%)",
                  "Percentage": 10
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B08JDSXDK8",
        "DetailPageURL": "https://amzn.to/3J8KDvV",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/81bQJZfLfhL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Estrattore di Succo, 1200W, con Sistema di Autopulizia",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567894",
              "Price": {
                "Amount": 199,
                "Currency": "EUR",
                "DisplayAmount": "€199,00",
                "Savings": {
                  "Amount": 60,
                  "Currency": "EUR",
                  "DisplayAmount": "€60,00 (30%)",
                  "Percentage": 30
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B08XM5D4RG",
        "DetailPageURL": "https://amzn.to/3TPVV7V",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/61IAbvRDLPL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Robot Aspirapolvere iRobot Roomba, con Controllo App",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567895",
              "Price": {
                "Amount": 249,
                "Currency": "EUR",
                "DisplayAmount": "€249,00",
                "Savings": {
                  "Amount": 50,
                  "Currency": "EUR",
                  "DisplayAmount": "€50,00 (17%)",
                  "Percentage": 17
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B08QJ5VQ9L",
        "DetailPageURL": "https://amzn.to/3TPW7Z1",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/71K5tjgRKhL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Robot Aspirapolvere Proscenic 850T, 3000Pa, Controllo tramite App",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567896",
              "Price": {
                "Amount": 299,
                "Currency": "EUR",
                "DisplayAmount": "€299,00",
                "Savings": {
                  "Amount": 70,
                  "Currency": "EUR",
                  "DisplayAmount": "€70,00 (23%)",
                  "Percentage": 23
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B08PM8ZGZ5",
        "DetailPageURL": "https://amzn.to/3WPlxDf",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/61stKH5lqVL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Robot Aspirapolvere Xiaomi Mi Robot Vacuum, 2100Pa, 120min",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567897",
              "Price": {
                "Amount": 269,
                "Currency": "EUR",
                "DisplayAmount": "€269,00",
                "Savings": {
                  "Amount": 80,
                  "Currency": "EUR",
                  "DisplayAmount": "€80,00 (23%)",
                  "Percentage": 23
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B09HBM8V4K",
        "DetailPageURL": "https://amzn.to/3TpSVZ6",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/61CQttd5MBL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Robot Aspirapolvere e Lavapavimenti Dreame D9, 3000Pa, WiFi",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567898",
              "Price": {
                "Amount": 399,
                "Currency": "EUR",
                "DisplayAmount": "€399,00",
                "Savings": {
                  "Amount": 100,
                  "Currency": "EUR",
                  "DisplayAmount": "€100,00 (20%)",
                  "Percentage": 20
                }
              }
            }
          ]
        }
      },
      {
        "ASIN": "B08K7LD34R",
        "DetailPageURL": "https://amzn.to/3TcWBV8",
        "Images": {
          "Primary": {
            "Large": {
              "Height": 134,
              "URL": "https://m.media-amazon.com/images/I/71d1F0NLvYL._AC_SX679_.jpg",
              "Width": 160
            }
          }
        },
        "ItemInfo": {
          "Title": {
            "DisplayValue": "Robot Aspirapolvere Ecovacs Deebot, Autonomia 120 min, 2300Pa",
            "Label": "Title",
            "Locale": "it_IT"
          }
        },
        "Offers": {
          "Listings": [
            {
              "Condition": {
                "DisplayValue": "Nuovo",
                "Label": "Condizione",
                "Locale": "it_IT",
                "Value": "New"
              },
              "Id": "1234567899",
              "Price": {
                "Amount": 329,
                "Currency": "EUR",
                "DisplayAmount": "€329,00",
                "Savings": {
                  "Amount": 90,
                  "Currency": "EUR",
                  "DisplayAmount": "€90,00 (22%)",
                  "Percentage": 22
                }
              }
            }
          ]
        }
      }
    ],
    "SearchURL": "https://www.amazon.com/s/?field-keywords=Estrattori+Robot+Aspirapolvere&search-alias=aps&tag=dgfd&linkCode=osi",
    "TotalResultCount": 10
  }
};


export {ProductsJson,ItemProductAmazon}
export default producsJson;
