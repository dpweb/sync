var cp = require('child_process');
var userhost, localdir, remotedir, timeoffset;
var debug = process.env.debugsync ? console.log.bind(console):function(){};
var fs = require('fs');

function getTimeOffset(cb){
  var me = ~~(new Date().getTime()/1000);
  cp.exec('ssh ' + userhost + ' date +"%s"', function(a, b, c){
    if(a||c) throw Error(a||c);
    b = b.substring(0, 10);
    debug('local time is', me);
    debug('server time is', b);
    cb(timeoffset = me-b);
  })
}

function start(u, l, r){
  userhost = u;
  localdir = l || '.';
  remotedir = r || '.';
  
  getTimeOffset(function(){
    console.log('My time offset is', timeoffset, 'seconds');
    ls();

  })
}

function ls(){

  var cmd_loc = 'find ' + localdir + ' -maxdepth 1 -printf "%Ts%f\\n" | sort -r';
  var cmd_rem = 'find ' + remotedir + ' -maxdepth 1 -printf "%Ts\\\t%f@@" | sort -r';

  cp.exec(cmd_loc, function(a, b, c){
    if(a||c) throw Error(a||c);
    var local = b;
  
    console.log(cmd_rem)

    cp.exec('ssh ' + userhost + ' ' + cmd_rem, function(a, b, c){
      if(a||c) throw Error(a||c);
      var remote = b.replace('\n','')
          .split('@@')
          .map(function(r){ return r.split('\t')});

      var local = fs.readdirSync(localdir)
          .map(function(f){ return [fs.statSync(f).mtime.getTime()/1000, f] })

      compare(local, remote);
    })
  })  
}

function compare(local, remote){
  var tasks = {push: [], pull: []};
  console.log(local, remote);
  local.forEach(function(localFile){
    if(localFile[1])
  })
}

start('root@72.46.149.225');
