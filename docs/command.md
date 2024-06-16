# Node 21

NODE_ENV=development npx tsx src/commands/initDb.ts
NODE_ENV=development npx tsx src/commands/importSitemapArticle.ts -s ilcorrieredellacitta.com -a sitemap
NODE_ENV=development npx tsx src/commands/generateGptArticle.ts -s roma.cronacalive.it
NODE_ENV=development npx tsx src/commands/sendToWpApi.ts -s roma.cronacalive.it

NODE_ENV=development npx tsx src/commands/importSitemapArticle.ts -s inabruzzo.it -a sitemap
NODE_ENV=development npx tsx src/commands/generateGptArticle.ts -s bluedizioni.it
NODE_ENV=development npx tsx src/commands/sendToWpApi.ts -s bluedizioni.it


NODE_ENV=production npx tsx src/commands/initDb.ts
NODE_ENV=production npx tsx src/commands/importSitemapArticle.ts -s ilcorrieredellacitta.com -a sitemap
NODE_ENV=production npx tsx src/commands/generateGptArticle.ts -s roma.cronacalive.it
NODE_ENV=production npx tsx src/commands/sendToWpApi.ts -s roma.cronacalive.it

NODE_ENV=production npx tsx src/commands/importSitemapArticle.ts -s wineandfoodtour.it -a sitemap
NODE_ENV=production npx tsx src/commands/generateGptArticle.ts -s bluedizioni.it
NODE_ENV=production npx tsx src/commands/sendToWpApi.ts -s bluedizioni.it

## Inizializzazione struttura e dati db
npx ts-node src/commands/initDb.ts 

## Inserimento Country da feed API

NODE_ENV=development npx ts-node src/commands/initDb.ts
NODE_ENV=development npx ts-node src/commands/getWpApiCategories.ts -s bluedizioni.it
NODE_ENV=development npx ts-node src/commands/importSitemapArticle.ts -s ilcorrieredellacitta.com -a sitemap
NODE_ENV=development npx ts-node src/commands/generateGptArticle.ts -s bluedizioni.it
NODE_ENV=development npx ts-node src/commands/sendToWpApi.ts -s bluedizioni.it
NODE_ENV=development npx ts-node src/services/OpenAi/OpenAiService.ts
NODE_ENV=development npx ts-node src/commands/getWpApi.ts -s bluedizioni.it


NODE_ENV=production npx ts-node src/commands/initDb.ts
NODE_ENV=production npx ts-node src/commands/importSitemapArticle.ts -s ilcorrieredellacitta.com -a sitemap
NODE_ENV=production npx ts-node src/commands/generateGptArticle.ts -s ilcorrieredellacitta.com
NODE_ENV=production npx ts-node src/commands/getWpApi.ts -s roma.cronacalive.it
NODE_ENV=production npx ts-node src/commands/sendToWpApi.ts -s roma.cronacalive.it


## Backend 

NODE_ENV=production forever start  src/forever/foreverGetWpApi.cjs
NODE_ENV=production forever start  src/forever/foreverImportSitemapArticle.cjs
NODE_ENV=production forever start  src/forever/foreverGenerateGptArticle.cjs
NODE_ENV=production forever start  src/forever/foreverSendToWpApi.cjs
NODE_ENV=production forever start -c "npx tsx" src/commands/Server.ts
NODE_ENV=production forever start -c "npx tsx" src/cron/mantainance.ts


## Frontend

NODE_ENV=production forever start -c "npm run start"
cp node_modules/ace-builds/src-noconflict/worker-json.js .next/static/chunks/pages/worker-json.js


info:    Logs for running Forever processes
data:        script                                      logfile                        
data:    [0] src/commands/Server.ts                      /home/ubuntu/.forever/jxT1.log 
data:    [1] src/cron/mantainance.ts                     /home/ubuntu/.forever/kCn6.log 
data:    [2] startFrontend.js                            /home/ubuntu/.forever/8BQB.log 
data:    [3] src/forever/foreverImportSitemapArticle.cjs /home/ubuntu/.forever/5eqj.log 
data:    [4] src/forever/foreverGenerateGptArticle.cjs   /home/ubuntu/.forever/_zyl.log 
data:    [5] src/forever/foreverSendToWpApi.cjs          /home/ubuntu/.forever/sH5U.log 