#!/bin/bash

init() {
  # Assicura che MongoDB sia arrestato correttamente quando il contenitore viene terminato.
  trap "echo 'Stopping MongoDB'; mongod --shutdown; exit 0" SIGTERM SIGINT

  # Avvia MongoDB in background
  mongod --bind_ip_all --fork --logpath /var/log/mongodb/mongod.log

  echo "Starting MongoDB..."

  # Attendi che MongoDB sia completamente avviato
  for i in {1..60}; do
    if mongo --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
      echo "MongoDB started successfully."
      break
    fi
    echo "Waiting for MongoDB to start... ($i)"
    sleep 1
  done

  if ! mongo --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    echo "MongoDB failed to start."
    exit 1
  fi

  # Crea gli utenti nel database
  echo "Creating MongoDB users..."
  mongo admin --eval "db.createUser({ user: 'openaiuser', pwd: 'h98834958fh3405870', roles: [ { role: 'root', db: 'admin' } ] });"

  echo "MongoDB users created."

  # Mantieni il processo in primo piano per evitare che il contenitore esca immediatamente
  tail -f /dev/null
}

case "$1" in
  init)
    init
    ;;
  bash)
    /bin/bash
    ;;
  sh)
    /bin/sh
    ;;
  *)
    echo "This container accepts the following commands:"
    echo "- init"
    echo "- bash"
    exit 1
    ;;
esac
