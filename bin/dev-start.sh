#! /usr/bin/bash

mongo_status=`sudo systemctl status mongod | grep inactive`

if [[ "$mongo_status" == *"inactive"* ]]; then
  echo -e "Starting Local Mongodb Server with 'systemctl start mongod'...\n"
  sudo systemctl start mongod
fi

echo -e "Mongodb Server is on\n"

