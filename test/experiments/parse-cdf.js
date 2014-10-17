var fs = require('fs');

var times = [];

fs.readFile('./collection.json', 'utf-8', function(err, data) {
  if (err) throw err;

  var lines = data.split('\n');
  for (var i=0; i<lines.length; i++) {
    if (lines[i] == '') {
      break;
    }
    var obj = JSON.parse(lines[i]);
    times.push(obj.time[0] + (obj.time[1]*1e-9));
  }

  times = times.sort();
  var out = '';
  for (var i=0; i<times.length; i++) {
    out += times[i] + '\t' + (i/times.length) + '\n';
  }
  console.log(out);

  fs.writeFileSync('./graph.dat', out)

});
