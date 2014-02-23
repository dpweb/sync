var cp = require('child_process');

function ls(){
  cp.exec('ls -l', function(a, b, c){
    var local = console.log(b);
    cp.exec('ssh root@72.46.149.225 ls -l', function(a, b, c){
      compare(local, b);
    })
  })  
}

function compare(a, b){
  comparing(a, b);
}
