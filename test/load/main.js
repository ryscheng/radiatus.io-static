var config = null;
var stats = {};
var socket = null;
var users = null;

freedom.on('echo', function(val) {
  freedom.emit('echo', '');
});

freedom.on('config', function(val) {
  config = val;
  socket = freedom['core.websocket'](config.routerUrl);
  socket.on('onMessage', function(msg) {
    var obj = JSON.parse(msg.text);
    if (obj.cmd == 'state' || obj.cmd == 'roster') {
      freedom.emit('serverMsg', obj);
    } else if (obj.cmd == 'message') {
      processMessage(obj.msg, obj.from);
    } else {
      console.error('WTF!!!!!!!!!'+msg.text);
    }

  });
  socket.on('onError', function(msg) {});
  socket.on('onClose', function(msg) {});
});

freedom.on('start', function(val) {
  users = val;
  stats.completedReads = 0;
  stats.completedWrites = 0;
  loopNextRequest();
});

function processMessage(msg, from) {
  var tokens = msg.split(':');
  var last = tokens[tokens.length-1];

  if (last == 'read') {
    stats.completedReads++;
    nextRequest();
  } else if (last == 'writeResp') {
    stats.completedWrites++;
    nextRequest();
  } else if (last == 'writeReq') {
    socket.send({text:JSON.stringify({
      to: from,
      msg: tokens[1]+':writeResp'
    })}, function() {});
  } else {
    console.error("Unprocessed: "+msg);
  }


}

function loopNextRequest() {
  nextRequest();
  setTimeout(loopNextRequest, 500);
}

function nextRequest() {
  var leftReads = config.numReads - stats.completedReads;
  var leftWrites = config.numWrites - stats.completedWrites;
  /**
  if (((stats.completedReads + stats.completedWrites)%500)==0) {
    console.error(stats);
  }
  **/
  if ((leftReads + leftWrites) <= 0) {
  //if (leftReads <= 0 && leftWrites <= 0) {
    freedom.emit('done', stats);
  } else if (leftReads > 0 && leftWrites > 0) {
    var totalLeft = leftReads + leftWrites;
    var x = getRandomInt(1,totalLeft);
    if (x <= leftWrites) { write(); } 
    else { read(); }
  } else if (stats.completedReads >= config.numReads) {
    write();
  } else {
    read();
  }
}

function read() {
  var msg = users.index+':read';
  socket.send({text:JSON.stringify({
    to: users.username,
    msg: msg
  })}, function(){});
}

function write() {
  var msg = getRandomInt(0,config.numModules-1)+':'+users.index+':writeReq'
  socket.send({text: JSON.stringify({
    to: users.roster[getRandomInt(0,config.numNodes-1)],
    msg: msg
  })}, function() {});
}

function getRandomInt (min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

console.error('Module Loaded');
