var un = '';
+function($) {
  var sounds = {
    clicks : {
      last : -1,
      files : ['msc/sound/cl1.mp3', 'msc/sound/cl2.mp3', 'msc/sound/cl3.mp3', 'msc/sound/cl4.mp3']
    }
  };
  'use strict';

  var touched = false;
  var cnode = null;
  var dir = "http://cstate.marikun.ru/clients/rpg/data/";
  $.irpg = {
    player : {},
    genericChain : 'generic_loc.json',
    dataSources : [],
    avalibleChains : [],
    savedInfo : {},
    initial : {},
    mainDivs : {},
    currentstep : {}

  };
  //player.life.value

  var rpg = $.irpg;
  var player = rpg.player;
  rpg.player = {
    place : 'town',
    life : {
      value : 100
    },
    objects : [],
    states:[]
  };
  rpg.load = function () {
    rpg.main_content.trigger({
      type : 'loadstate',
      message : 'Load: Settings',
      prc : 20
    });
    /*$.ajax(fName("config.json"), {
    datatype : 'json'
    })
    .done(*/
    loadJson({
      file : "config.json"
    }, function (e) {
      rpg.initial = e;
      console.log(e);
      loadchapts();
      //   rpg.main_content.trigger('done');
    }).fail(function (e) {
      rpg.initial = e;
      console.log(e);
    })

  }
  rpg.step = function (id) {
    console.log('GoTo step ' + id);
  }
  rpg.make_turn = function (stepid, answerid) {
    rpg.mainDivs.steparea.fadeOut(function () {
      if (stepid == -1) {
        gotoch('generic');
        console.log('GoTo step ' + rpg.generic);

      } else {
        console.log('step:' + stepid + ' answ:' + answerid);
        var step = getbyid(rpg.currentds.steps, stepid);
        var action = getbyid(step.actions, answerid);        
        var nextid = action.nextid;
        var res = eval(action.action);
        if (res != null) {
          nextid = res;
        }
        console.log('action', action.action);
        console.log('next', action.nextid);
        var nextstep = getbyid(rpg.currentds.steps, nextid);
        var re = new RegExp('\r\n', 'g');
        nextstep.text = nextstep.text.replace(re, '<br>');
        
        //nextstep.text = nextstep.text.replace('\r\n', '<br>');
        rpg.processReq(nextstep);
        rpg.currentstep = nextstep;
        if(rpg.player.states['ch_'+rpg.avalibleChains.indexOf(rpg.currentds)])
          rpg.player.states['ch_'+rpg.avalibleChains.indexOf(rpg.currentds)].step=nextid;
        else
        {
          rpg.player.states['ch_'+rpg.avalibleChains.indexOf(rpg.currentds)]={};
          rpg.player.states['ch_'+rpg.avalibleChains.indexOf(rpg.currentds)].step=nextid;
        }
        for (var i in nextstep.addafterstep) {
          if (rpg.player.objects.indexOf(nextstep.addafterstep[i]) == -1) {
            rpg.player.objects.push(nextstep.addafterstep[i])
            console.log("Add object " + nextstep.addafterstep[i]);
          }
        }
        console.log(player.life);
        checkLive();
      }
      rpg.mainDivs.steparea.fadeIn(function () {
        rpg.eventsAdd();
      });
    });
  }
  rpg.processReq = function (step) {
    step.hidenansv = 0;
    step.hidenshow = true;
    $.each(step.actions, function (k, e) {
      var nextid = e.nextid;
      var nstep = getbyid(rpg.currentds.steps, nextid);
      var can = true;
      if(nstep){
      for (var i in nstep.request) {
        can = can && ($.inArray(nstep.request[i], rpg.player.objects) != -1)

      }}
      if (!can) {
        e.avl = !false;
        console.log("Answer disable " + e.id);
        step.hidenansv++;
        step.hidenshow = false;
      } else
        e.avl = !true;

      //getbyid(step.answers, e.id).avl = e.avl;

    });

  }
  function checkLive() {
    if (rpg.player.life.value <= 0)
      console.log("DIE!!!");
  }
  function loadJson(config, callback) {
    console.log('Begin load', config);
    var script = document.createElement('script');
    var dd = $.Deferred();
    script.src = './data/' + config.file;
    script.onload = function () {
      callback(val);
      console.log('Loaded ', val);
      dd.resolve();
    };
    script.onerror = function (e) {
      console.log('Error load:', e);
      dd.resolve();
    }
    document.body.appendChild(script);
    return dd.promise();
  }
  rpg.eventsAdd = function () {
    var div = rpg.mainDivs.steparea;
    div.find('.cbtn').off('click');
    div.find('.cbtn').on('click', function (e) {
      var elem = $(this);
      //console.log(elem.attr('stepid'),elem.attr('answ'));
      rpg.make_turn(elem.attr('stepid'), elem.attr('answ'))
      playSound('clicks');

    });
  }
  function playSound(type) {
    var cnt = sounds[type].files.length;
    if (sounds[type].last == -1) {
      var audio = new Audio(sounds[type].files[0]);
      sounds[type].last = 0;
      audio.play();
    } else {
      if (sounds[type].last == cnt - 1) {
        var audio = new Audio(sounds[type].files[0]);
        sounds[type].last = 0;
        audio.play();
      } else {
        sounds[type].last++;
        var audio = new Audio(sounds[type].files[sounds[type].last]);

        audio.play();
      }
    }
  }
  function getbyid(arr, id) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].id == id)
        return arr[i]; // Return as soon as the object is found
    }
    return null;
  }
  function getbyname(arr, name) {
    for (var i = 0, len = arr.length; i < len; i++) {
      if (arr[i].name == name)
        return arr[i]; // Return as soon as the object is found
    }
    return null;
  }
  function loadchapts() {
    var chapters = rpg.initial.mainChains;
    var deferred = $.when();

    $.each(chapters, function (k, e) {
      deferred = deferred.then(function () {
          var d = $.Deferred();
          console.log("loaded: " + e.name);
          rpg.main_content.trigger({
            type : 'loadstate',
            message : 'Load: ' + e.name,
            prc : 40
          });
          //var a=$.ajax(fName(e.file),{datatype:'json'});
          return loadJson({
            file : e.file
          }, function (e) {
            console.log(e);
            rpg.dataSources.push(e);
            e.currentStep = 1;
            rpg.avalibleChains.push(e);
          });

        });

    })
    deferred = deferred.then(function () {
        console.log('json begin load')
        return loadJson({
          file : 'generic_loc.json'
        }, function (generic) {
          getGenericChain(generic);
        });

      });
    deferred = deferred.then(function () {
        console.log('json loaded')
      })
      deferred.always(function () {
        rpg.main_content.trigger('done');
        console.log('done');
      });

  }
  function fName(name) {
    return dir + name;
  }

  ///////////////Generic chain
  var templateMap = [{
      word : 'ch_cnt',
      ev : 'rpg.avalibleChains.length'
    }, {
      word : 'place',
      ev : 'rpg.player.place'
    }, {
      word : 'ch_name',
      ev : 'temp.name'
    }, {
      word : '\r\n',
      ev : "'<br>'"
    }

  ];
  function gotoch(chname) {
    if (chname == 'generic') {
      rpg.currentds = rpg.generic;
      rpg.currentstep = getbyid(rpg.currentds.steps, 1);
    } else {
      rpg.currentds = getbyname(rpg.avalibleChains, chname);
      var stepid=1;
      if(rpg.player.states['ch_'+rpg.avalibleChains.indexOf(rpg.currentds)])
        stepid=rpg.player.states['ch_'+rpg.avalibleChains.indexOf(rpg.currentds)].step;
      rpg.currentstep = getbyid(rpg.currentds.steps, stepid);
      console.log(rpg.currentstep.addafterstep);
      return stepid;
    }

  }
  function processTMap(str, temp) {

    for (var tie in templateMap) {
      var te = templateMap[tie];
      var repl = '';
      var rpg = $.irpg;
      try {
        repl = eval(te.ev);
      } catch (err) {
        repl = '!err!';
      }
      var re = new RegExp(te.word, 'g');
      str = str.replace(re, repl);
      //str = str.replace(/te.word/, repl);

    }
    return str;

  }
  function getGenericChain(dt) {
    rpg.generic_source = dt;
    rpg.generic = dt;

    var a = $.each(rpg.generic.steps, function (k, e) {
        //Entire text replace
        e.text = processTMap(e.text);
        //Prepare answers

        var newaction = [];
        $.each(e.actions, function (ank, ane) {
          if (ane.text.startsWith('/select_ch/')) {
            var ansid = 1;
            $.each(rpg.avalibleChains, function (ack, ace) {
              var text = ane.text.replace('/select_ch/', '')
              var newact = {
                id : ansid,
                action : 'gotoch(\'' + ace.name + '\')',
                nextid:0,
                text : processTMap(text, ace)
              }
              newaction.push(newact);
            });

          } else {
            newaction.push(ane);
            
          }

        });
        e.actions = newaction;
 
      });

  }

  //////////////

}
(jQuery);
function datafromdevice(e) {
  $.cstate.fingerprint = e;
}
