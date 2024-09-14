// Creazione dell'utente amministratore
db.createUser({
    user: "admin",
    pwd: "12qwaszx",
    roles: [{ role: "userAdminAnyDatabase", db: "admin" }]
  });
  
  // Creazione di un utente per il database specifico
  db.getSiblingDB('newsgpt').createUser({
    user: "editorGpt",
    pwd: "12qwaszx",
    roles: [{ role: "readWrite", db: "newsgpt" }]
  });

  console.log('create utente');