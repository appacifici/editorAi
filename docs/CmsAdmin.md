# Chiamata da OpenAI a CmsAdmin

## /api/getSections
Metodo che ritorna il json di tutte le categorie, sottocategorie, e tipolgie

## /api/getTecnicalTemplate
Metodo che ritorna il json del modello della scheda tecnica per sottocategorie, e tipolgie

## /api/getSectionKeywordsCmsAdmin
Metodo che ritorna il json con le keywords per sottocategorie, e tipolgie

## /api/setUseSectionKeywordsCmsAdmin
Metodo che setta il numero di volte che è stata utilizzata un keywords

## /api/insertNewProduct
Metodo che effettua l'inserimento di un nuovo prodotto ma ancora non completo di tutti i dati

## /api/updateProduct
Metodo che effettua l'inserimento di tutti i dati necessari mancanti del prodotto che vengono generate da OpenAI

## /api/getBackLinkSections
Metodo che torna il numero di link ricevuto da un modello

## /api/setUseSectionBacklinksCmsAdmin
Metodo che setta il link ricevuto da un modello



# Chiamate da CsmAdmin a OpenAi

## CoreAdminEditTypology

Invocazione prompt per generare il template della scheda tecnica in fase di primo update
```php
$url = $this->wm->container->getParameter( 'api.getPromptAi' ).'/66e5c14703c87cb1e8f3316f/66804722810a8c8a82ab1794/'.urlencode($nameSection);
```