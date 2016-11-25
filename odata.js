var fs = require('fs');
var dstore=require('nedb');
var db={
    ois:new dstore({filename:'./data_dir/ois.json', autoload: true })
}
//////////




/////
var counters={
    writeCounter:0,
    write:function(){
        console.log('Write speed '+counters.writeCounter+' val/sec');
        mdl.logger('odata','Write speed '+counters.writeCounter+' val/sec');

        counters.writeCounter=0;
    }
}
setInterval(counters.write,1000)



var mdl={};
var writetimeout=null;
function parseJsData(filename) {
    var json = fs.readFileSync(filename, 'utf8');
    return JSON.parse(json);
}
function writeOIDb(nval,param)
{
    mdl.db.data[param].insert(nval,function(e,d)
    {
           counters.writeCounter+=nval.length;
    });
}
function writeBuf(param)
{
    writeOIDb(nval,mdl.writeBuff[param]) 
}





module.exports=function(logger){    
    this.logger=logger;
    this.db=db
    mdl=this;
    mdl.logger('odata','Start OData');
    mdl.db.data={};
    mdl.writeBuff={};
    mdl.db.ois.find({},function(e,d){    
    for(var i in d)
    {
        
        var crnt=d[i];
        var param=crnt.cat+crnt.id;
        mdl.logger('odata','Read data for '+param);
        var pdata=[];
        try{
            pdata=new dstore({filename:'./data_dir/d_'+param+'.json', autoload: true });
        }
        catch(e){
            mdl.logger('odata','Error');
           

        }
        mdl.db.data[param]=pdata;
        mdl.writeBuff[param]=[]

    }});
    
    this.writeOI=function(cat,id,value,prizn,t1,t2)
    {

        clearTimeout(writetimeout);
        var nval={
            value:value,
            flag:prizn,
            t1:t1,
            t2:t2
        }
        var param=cat+id;
        var pdata=this.db.data[param];
        if(pdata)
        {
            this.writeBuff[param].push(nval)
             
           if(this.writeBuff[param].length==10000)
           {   
               writeOIDb(this.writeBuff[param],param) 
               this.writeBuff[param]=[];
           }
           else
           {
               writetimeout=setTimeout(writeBuf,500,param);
           }
        }
        else
        this.logger('odata','Error. Try write non-existent OI - '+param);
        

    }
    
    
}



