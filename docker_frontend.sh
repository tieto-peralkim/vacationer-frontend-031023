#!/bin/bash
INSTANCE=frontend
echo "Sign in to AWS"
aws ecr get-login-password --region eu-west-1 | docker login --username AWS --password-stdin 629517020360.dkr.ecr.eu-west-1.amazonaws.com/
echo "Pull the new $INSTANCE image"
docker pull 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$INSTANCE":latest
echo "Stopping old $INSTANCE"
docker stop vacationer-"$INSTANCE"
echo "Removing old $INSTANCE"
docker rm vacationer-"$INSTANCE";
echo "Run the new $INSTANCE image"
ports=80:80
docker run -d -p $ports --name=vacationer-"$INSTANCE" 629517020360.dkr.ecr.eu-west-1.amazonaws.com/ecr-vacationer-"$INSTANCE":latest
echo "Docker run done, exiting EC2"
exit