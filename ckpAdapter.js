var net = require('net');
var encrypt=require('./binmodules/addon.node')
var kitname='CKP-TEST01' 
var ckpaddr='10.81.138.211'
var port=931

var client = new net.Socket();
//client.setNoDelay(true);
var steps=0;
var connected=false;
client.connect(port, ckpaddr, function(s) {
	console.log('Connected');
	
});

function initialProc(d)
{
    console.log('R >> '+d)
    switch(steps)
    {
        case 0:            
            if(d.toString().indexOf('This is CKProxy CoreProxy ')!=-1)
            {
                steps++;
                
                var version=d.toString().substring(26)
                console.log('Core version='+version);
                var buf=new Buffer(14);
                buf.fill(0);
                buf.write('e2e5f02e',0,4,'hex');
                buf.writeUInt32LE(100,4);
                buf[8]=15;
                buf[9]=0;
                
                var hs=hexString(buf)
                console.log('Version sending');
                console.log(buf);
                client.write(buf);
                var ts=Date.now() / 1000 | 0;
                console.log(ts);

                var res=encrypt.createkey('CKP-TEST01_02','MONITEL\svp',ts)
                var leng=res.sizeof+res.nout;
                var sendb=new Buffer(leng);
                sendb.fill(0);
                sendb.write(res.tmp_buf);
                sendb.write(res.sbuf,res.sizeof);
                //res.tmp_buf.copy(sendb,0,0,res.sizeof)
                //res.sbuf.copy(sendb,res.sizeof,0,res.nout)
               /// sendb.write(res.sbuf.slice(0,res.nout),res.sizeof,res.nout);
                console.log('Keys sending');
                client.write(sendb);
                console.log(sendb);


               

            }
            break;
        case 1:
            steps++;
            
         
           var kitb=new Buffer('CKP-TEST01_02','binary');
           var res= encrypt.step2(kitb,d,(s)=>{});
         //  res=encrypt.step2('CKP-TEST01_02','twYAHC2uvzUSJ5MnfaID0V1h');
           var buf=new Buffer(36);
           buf.fill(0);
           buf.write(res,0,res.length,'ascii');      
           console.log('ProxyKit sending');   
           console.log(buf);
           client.write(buf);
          
            break;
        case 2:

        break;
        case 3:
        break;
    }
   
}



client.on('data', function(data) {
	if(!connected)
        initialProc(data);
});

client.on('close', function() {
	console.log('Connection closed');
});
function hexString(arr, delim = ' ') {
  var res = '';
  for (var i = 0; i < arr.length; i++) {
    var hex = arr[i].toString(16);
    if (hex.length == 1)
      hex = '0' + hex;
    res = res + delim + hex;
  }
  //console.log(res)
  return res;
}