#!/bin/bash

trap "exit" INT

while getopts c:b: flag
do
    case "${flag}" in
        c) checkout=${OPTARG};;
        b) buildop=${OPTARG};;
    esac
done

# This script is used for fetching the latest code from the repository and deploying it to the server.

echo "--Fetch from the repository"
git fetch --all

# checkout if flag c is set
if [ -z "$checkout" ]
then
    echo "No checkout set. Defaulting to dev"
    checkout="dev"    
fi

echo "Checkout to $checkout"
    git checkout $checkout -f
    if [ $? -eq 0 ]
    then
        echo "Checkout successful."
    else
        echo "Checkout failed."
        exit 1
    fi

echo "--Check if .env file exists"

if [ ! -f .env ]
then
    echo "File .env does not exist."
    echo "Creating .env file using env.example file."
    cp env.example .env
else
    echo "File .env found."
fi

function build_image() {
  echo "--Building Docker image"
  docker compose -f docker-compose.yml build

  if [ $? -eq 0 ]
  then
      echo "Docker Image successfully built."
  else
      echo "Docker image failed to build."
      exit 1
  fi
}

# build if flag b is set to nobuild then skip
if [ -z "$buildop" ]
then
    build_image
else
    if [ $buildop == "nobuild" ]
    then
        echo "--Skipping build."
    else
        build_image
    fi
fi


echo "--Running the docker containers"

docker compose --env-file ./.env -f docker-compose.yml up -d

# check if docker compose successfully started
if [ $? -eq 0 ]
then
    echo "Container successfully started."
else
    echo "Docker compose failed to start."
    docker compose --env-file ./.env -f docker-compose.yml down
fi
