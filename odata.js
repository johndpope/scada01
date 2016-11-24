var fs = require('fs');
var mdl={};
var writetimeout=null;
function parseJsData(filename) {
    var json = fs.readFileSync(filename, 'utf8');
    return JSON.parse(json);
}
function writeToDisk()
{
    for(var i in mdl.ois)
    {
        var param=mdl.ois[i].cat+mdl.ois[i].id;
        writeOData(param,mdl.data[param]);
    }
}
module.exports=function(logger){
    
    this.logger=logger;
    this.ois=parseJsData('./data_dir/OIparams.json');

    mdl=this;
    mdl.logger('odata','Start OData');
    mdl.data={};
    for(var i in mdl.ois)
    {
        
        var crnt=mdl.ois[i];
        var param=crnt.cat+crnt.id;
        mdl.logger('odata','Read data for '+param);
        var pdata=[];
        try{
            pdata=parseJsData('./data_dir/'+param+'.json');
        }
        catch(e){
            mdl.logger('odata','Error');
            writeOData(param,pdata);

        }
        mdl.data[param]=pdata;

    }
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
        var pdata=this.data[param];
        if(pdata)
        {
            pdata.push(nval);            
        }
        else
        this.logger('odata','Error. Try write non-existent OI - '+param);
        writetimeout=setTimeout(writeToDisk,1000);

    }
    setTimeout(writeToDisk,1000);
    
}

function writeOData(param,data)
{
var str=JSON.stringify(data);
fs.writeFileSync('./data_dir/'+param+'.json',str);
}

