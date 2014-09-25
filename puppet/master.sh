#!/bin/bash
wget https://dl.dropboxusercontent.com/u/16740992/load.zip
aptitude -y install unzip
unzip load.zip
cd load/
npm install
#node index.js
#node index.js ws://localhost:8082/route mongodb://localhost:217/test test2 1 10 1000 10
