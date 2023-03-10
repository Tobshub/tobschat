#! /usr/bin/bash

echo -e "Starting Client Deploy Sequence($1)\n"

cd client && yarn build

echo -e "Deploying to Netlify"

if [ $1 == "--prod" ]
then 
  netlify deploy $1
else 
  netlify deploy
fi