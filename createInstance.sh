#!/bin/bash

docker run -dti --name container$1 -p $1:3000 serverssockets