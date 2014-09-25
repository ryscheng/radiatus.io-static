var freedom = require('freedom-for-node');
var MongoClient = require('mongodb').MongoClient

var config = {
  numModules: 5,
  numNodes: 3,
  numReads: 10000,
  numWrites: 1000,
  routerUrl: 'ws://localhost:8082/route',
  mongoUrl: 'mongodb://localhost:27017/test',
  mongoCollection: 'test',
  manifestPath: './manifest.json'
};

if (process.argv.length > 2) { config.routerUrl = process.argv[2]; }
if (process.argv.length > 3) { config.mongoUrl = process.argv[3]; }
if (process.argv.length > 4) { config.mongoCollection = process.argv[4]; }
if (process.argv.length > 5) { config.numNodes = process.argv[5]; }
if (process.argv.length > 6) { config.numModules = process.argv[6]; }
if (process.argv.length > 7) { config.numReads = process.argv[7]; }
if (process.argv.length > 8) { config.numWrites = process.argv[8]; }

var startTime = null;
var started = false;
var username = null;
var roster = [];
var containers = [];
var times = [];
var collection = null;

MongoClient.connect(config.mongoUrl, function(err, db) {
  if(err) throw err;
  collection = db.collection(config.mongoCollection);
});

for (var i=0; i<config.numModules; i++) {
  var context = freedom.freedom(config.manifestPath, {
    debug: 'error'
  }, function(register) {
    register('core.websocket', require('./websocket.js'));
  });

  context.on('serverMsg', function(obj) {
    var toAdd = [];
    if (obj.cmd == 'roster') {
      toAdd.push(obj.userId);
    } else if (obj.cmd == 'state') {
      username = obj.userId;
      toAdd = obj.roster;
    }
    for (var i=0; i<toAdd.length; i++) {
      if (roster.indexOf(toAdd[i]) == -1) {
        roster.push(toAdd[i]);
      }
    }

    if (roster.length >= config.numNodes &&
        !started) {
      started = true;
      start();
    }
  });

  context.once('done', function(n, stats) {
    console.error("DONE with "+n);
    stats.time = process.hrtime(startTime);
    times.push(stats);
    collection.insert(stats, function(err, docs) {});
    if (times.length >= config.numModules) {
      console.log('=========ENDING=========');  
      console.log(times);
    }
  }.bind({}, i));
  
  context.emit('config', config);

  containers.push(context);
}

function start() {
  console.log('=======STARTING========');
  startTime = process.hrtime();
  for (var i=0; i<config.numModules; i++) {
    containers[i].emit('start', {
      username: username,
      index: i,
      roster: roster
    });
  }


}

