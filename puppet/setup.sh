#!/bin/bash
wget https://dl.dropboxusercontent.com/u/16740992/load.zip
unzip load.zip
mv load/* ./
mkdir node_modules
npm install
#node index.js
node index.js ws://10.215.4.49:8082/route mongodb://10.215.4.49:27017/test test0 1 10 10000 1000 > LOG.txt
