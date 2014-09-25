/*globals freedom:true, fdom, WebSocket, console, require*/
/*jslint sloppy:true*/
var ws = require('ws');

var siteSockets = {};
var clients = [];
var messageQueue = [];

/**
 * A WebSocket core provider for Radiatus
 * Key feature is that if it detects the radiatus-providers server,
 * it will add a query string to the URL with special credentials
 *
 * @param {port.Module} module The Module requesting this provider
 * @param {Function} dispatchEvent Function to dispatch events.
 * @param {String} url The Remote URL to connect with.
 */
var WS = function (module, dispatchEvent, url) {
  this.dispatchEvent = dispatchEvent;
  this.index = clients.length;
  clients.push(this);

  if (siteSockets.hasOwnProperty(url)) {
    this.websocket = siteSockets[url];
    return;
  }

  try {
    this.websocket = new ws(url);
    this.websocket.binaryType = 'arraybuffer';
  } catch (e) {
    var error = {};
    error.errcode = e.name;
    error.message = e.message;
    dispatchEvent('onError', error);
    return;
  }

  this.websocket.on('message', this.onMessage.bind(this));
  this.websocket.on('open', this.onOpen.bind(this));
  this.websocket.on('close', this.onClose.bind(this, {
    code: 0,
    reason: 'UNKNOWN',
    wasClean: true
  }));
  this.websocket.on('error', this.onError.bind(this));
  // FIX LATER
  siteSockets[url] = this.websocket;

  //Flush Queue
  var newQueue = [];
  for (var i=0; i<messageQueue.length; i++) {
    var index = messageQueue[i].to;
    if (index >= clients.length) {
      newQueue.push(messageQueue[i]);
    } else {
      clients[index].dispatchEvent('onMessage', messageQueue[i].data);
    }
  }
  messageQueue = newQueue;
};

WS.prototype.send = function(data, continuation) {
  var toSend = data.text || data.binary || data.buffer;
  var errcode, message;

  if (toSend) {
    try {
      // For node.js, we have to do weird buffer stuff
      if (toSend instanceof ArrayBuffer) {
        this.websocket.send(
          new Uint8Array(toSend), 
          { binary:true }, 
          this.onError.bind(this)
        );
      } else {
        this.websocket.send(toSend);
      }
    } catch (e) {
      if (e instanceof SyntaxError) {
        errcode = "SYNTAX";
      } else {
        errcode = "INVALID_STATE";
      }
      message = e.message;
    }
  } else {
    errcode = "BAD_SEND";
    message = "No text, binary, or buffer data found.";
  }

  if (errcode) {
    continuation(undefined, {
      errcode: errcode,
      message: message
    });
  } else {
    continuation();
  }
};

WS.prototype.getReadyState = function(continuation) {
  continuation(this.websocket.readyState);
};

WS.prototype.getBufferedAmount = function(continuation) {
  continuation(this.websocket.bufferedAmount);
};

WS.prototype.close = function(code, reason, continuation) {
  try {
    if (code && reason) {
      this.websocket.close(code, reason);
    } else {
      this.websocket.close();
    }
    continuation();
  } catch (e) {
    var errorCode;
    if (e instanceof SyntaxError) {
      errorCode = "SYNTAX";
    } else {
      errorCode = "INVALID_ACCESS";
    }
    continuation(undefined,{
      errcode: errorCode,
      message: e.message
    });
  }
};

WS.prototype.onOpen = function(event) {
  this.dispatchEvent('onOpen');
};

WS.prototype.onMessage = function(event, flags) {
  var data = {};
  if (flags && flags.binary) {
    data.buffer = new Uint8Array(event).buffer;
    this.dispatchEvent('onMessage', data);
    return;
  } 

  data.text = event;
  var msg = JSON.parse(event);
  if (msg.cmd == 'state' || msg.cmd == 'roster') {
    this.dispatchEvent('onMessage', data);
  } else {
    var index = msg.msg.split(':')[0];
    if (index >= clients.length) {
      messageQueue.push({to: index, data: data, flags: flags});
    } else {
      clients[index].dispatchEvent('onMessage', data);
    }
  }

};

WS.prototype.onError = function(event) {
  // Nothing to pass on
  // See: http://stackoverflow.com/a/18804298/300539
  console.error(event);
  this.dispatchEvent('onError');
};

WS.prototype.onClose = function(event) {
  this.dispatchEvent('onClose',
                     {code: event.code,
                      reason: event.reason,
                      wasClean: event.wasClean});
};


/** REGISTER PROVIDER **/
/**
if (typeof fdom !== 'undefined') {
  fdom.apis.register('core.websocket', WS);
}
**/
module.exports = WS;
