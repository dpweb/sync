var fs = require('fs');
var crypto = require('crypto');
var exec = require('child_process').exec;

var ls = {};
var remls = {};

function checksum (str, algorithm, encoding) {
    return crypto
        .createHash(algorithm || 'md5')
        .update(str, 'utf8')
        .digest(encoding || 'hex')
}

function putfiles(){

}

function getfiles(a){
  a.forEach(function(fn){
    fn = fn.split('/').pop();
    console.log('getting', fn);
    exec('scp ' + remhost + ':' + remdir + '/' + fn + ' ' + dir + fn, function(e, r){
      console.log(arguments);
    }); 
  });
}

function compare(local, remote){

  delete remote[remdir + '/.syncsome'];
  delete local[dir + '/.syncsome'];

  var toget = [], toput = [];

  for(file in remote){
    if(!local[file] || (local[file] != remote[file] && remote[file] != remls[file]))
      toget.push(file);
  }

  for(file in local){
    if(!remote[file] || (remote[file] != local[file] && local[file] != ls[file]))
      toput.push(file);
  }
  
  console.log(toget, toput);
  getfiles(toget);

  ls = local, remls = remote;
}

function checkRemote(remhost, remdir, cb){
  exec('ssh ' + remhost + ' cat ' + remdir + '/.syncsome', function(e, r){
    cb(JSON.parse(r));
  })
}

function update(dir, file){
    var ls = {};

    if(file){
      var f = fs.readFileSync(file);
      ls[file] = checksum(f); 
      return ls;
    }

    var files = fs.readdirSync(dir);
    for(var i in files){
        if (!files.hasOwnProperty(i)) continue;
        var name = dir+'/'+files[i];
        if (fs.statSync(name).isDirectory()){
            update(name);
        }else{
            var f = fs.readFileSync(name);
            ls[name] = checksum(f);
        }
    }
    return ls;
}

function start(){
  checkRemote(remhost, remdir, function(remote){
    compare(update(dir), remote);
    fs.writeFileSync('./'+dir+'/.syncsome', JSON.stringify(ls, null, 4));
  });
}


var dir, remhost, remdir;
var a = process.argv;

if(a.length < 4){
  dir = a[2];
  console.log('starting master on dir', dir);

  setInterval(function(){
    var info = update(dir);
    console.log('updating', dir);
    fs.writeFileSync('./'+dir+'/.syncsome', JSON.stringify(info, null, 4));
  }, 10000);

} else {
  dir = a[2]; remhost = a[3]; remdir = '/' + a[4];
  console.log('starting slave with dirs', dir, remhost, remdir); 
  setInterval(start, 10000)
}
