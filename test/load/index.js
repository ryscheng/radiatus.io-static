var freedom = require('freedom-for-node');
var config = {
  numModules: 5,
  numNodes: 3,
  numReads: 1000,
  numWrites: 1000,
  routerUrl: 'ws://localhost:8082/route',
  manifestPath: './manifest.json'
};

var startTime = null;
var started = false;
var username = null;
var roster = [];
var containers = [];
var times = [];

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

