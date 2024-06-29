FROM mongo:latest


USER root
COPY entrypoint.sh /entrypoint.sh
RUN chmod a+x /entrypoint.sh

# Copia il file di configurazione personalizzato (se necessario)
COPY mongod.conf /etc/mongod.conf
RUN chown mongodb:mongodb /etc/mongod.conf

# Esponi la porta predefinita di MongoDB
EXPOSE 27017

COPY init-mongo.js /docker-entrypoint-initdb.d/

ENTRYPOINT [ "/entrypoint.sh" ]
CMD [ "init" ]