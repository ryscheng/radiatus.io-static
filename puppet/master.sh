#!/bin/bash
wget https://dl.dropboxusercontent.com/u/16740992/load.zip
aptitude -y install unzip
unzip load.zip
cd load/
npm install
#node index.js
