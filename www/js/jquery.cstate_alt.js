var un = '';
+function($) {
  'use strict';
  var touched = false;
  var cnode = null;
  $.cstate = {
    scrolling : false,
    load_label : null,
    session : null,
    localize : null,
    baseUrl : null,
    state : null,
    reforms : null,
    events : null,
    effects : null,
    account : {},
    modalElement : null,
    main_content : null,
    mainDivs : {
      heading : null,
      stateinfo : null,
      reforms : null,
      areforms : null,
      effects : null,
      events : null,
      footer : null
    },
    modelBind : {
      mModal : {
        crnt : null
      },
    },
    tRows : {},
    fingerprint : new Fingerprint({
      canvas : true
    }).get(),
  };
  var engine = $.cstate;
  $.cstate.ajax_a = function (url, params) {
    var nparam = {};
    if (params) {
      nparam = params;
      nparam.data = {
        cs_auth : $.cstate.session,
        data : nparam.data
      };
    } else {
      nparam = {
        data : {
          cs_auth : $.cstate.session
        }
      };
    }
    return $.ajax(url, nparam)
  }
  ////   First called initialisation proc
  $.cstate.initial = function () {

    var cs = $.cstate;
    customFormaterAdd();
    $('.pbody').on("scrollstart", {
      latency : 650
    }, function () {

      // $.cstate.swipe_content.slick.fixed = true; // && !touched;
      //  if(!$.cstate.swipe_content.slick.dragging)
      //$('.pbody').css('background','white');
      //console.log('scrollstart');
    });
    $('.pbody').on("scrollstop", {
      latency : 650
    }, function () {

      //$.cstate.swipe_content.slick.fixed = false; // && !touched;
      // if($.cstate.swipe_content.slick.dragging)
      // $('.pbody').css('background','green');
      //console.log('scrollstop');
    });
    $.cstate.modalElement.on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget) // Button that triggered the modal
        var type = button.attr('data-itemtype') // Extract info from data-* attributes
        var id = button.attr('data-itemid') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        var head = 'test';
      var sender = $(event.relatedTarget);
      cs.modelBind.mModal.crnt = getAccElement(sender.attr('data-itemtype'), sender.attr('data-itemid'));
      cs.modelBind.mModal.crnt.type = sender.attr('data-itemtype');
      rivets.bind($.cstate.modalElement, {
        elem : cs.modelBind.mModal
      });
      modal.find('#procbtn').off('click');
      if(sender.attr('data-itemtype')=='reforms')
      {
        modal.find('#procbtn').on('click',function(){
          modal.modal('hide');
          engine.ajax_a(engine.baseUrl+ 'statefunction.csc/processreform', {dataType:'json',type:'POST',data:{rid:sender.attr('data-itemid')}})
          .done(function (t) {
          if(t.ResultCode!=0){
          engine.notify(t.data.message);
          }
          else
          {
          $.cstate.update(0);
          }
          });

        });
      }
      var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      var def = vh * 0.50 - modal.find('.modal-dialog').height() / 2;
      modal.find('.modal-dialog').css('margin-top', def + 'px');
      this.show = true;

    });

    $.cstate.modalElement.on('shown.bs.modal', function () {
      var modal = $(this);
      var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
      var def = vh * 0.50 - modal.find('.modal-dialog').height() / 2;
      modal.find('.modal-dialog').css('margin-top', def + 'px');
    });
    if (!this.show)
      $(this).hide();
    rivets.configure({

      // Attribute prefix in templates
      prefix : 'rv',

      // Preload templates with initial data on bind
      preloadData : true,

      // Root sightglass interface for keypaths
      rootInterface : '.',

      // Template delimiters for text bindings
      templateDelimiters : ['{', '}'],

      // Alias for index in rv-each binder
      iterationAlias : function (modelName) {
        return '%' + modelName + '%';
      },

      // Augment the event handler of the on-* binder
      handler : function (target, event, binding) {
        this.call(target, event, binding.view.models)
      },

      // Since rivets 0.9 functions are not automatically executed in expressions. If you need backward compatibilty, set this parameter to true
      executeFunctions : false

    })
  }
  $.cstate.auth = function (data) {
    var ok = false;
    if (un != '')
      engine.fingerprint = un;
    $.cstate.main_content.trigger({type:'loadstate',message:'Authentication',prc:0});
    console.log('Start auth');
    var model = {};
    var fingerprint = $.cstate.fingerprint;
    var locale = navigator.language;
    //alert(fingerprint);
    console.log('Uniq:' + fingerprint);
    console.log('locale:' + locale);

    $.ajax($.cstate.baseUrl + 'authmodule.csc/login', {
      dataType : 'json',
      method : 'POST',
      data : {
        uniq : fingerprint,
        locale : locale
      }
    }).then(function (d) {
      console.log('Got auth result');
      if (d.ResultCode == 0) {
        console.log('All good ' + d.Data.Session);
            $.cstate.main_content.trigger({type:'loadstate',message:'Authorized',prc:10});
        model.acc = d;
        $.cstate.session = model.acc.Data.Session;
        $.cstate.account.name=model.acc.Data.Name; 

      }
      if (d.ResultCode == 1) {
        console.log('No acc. Start registration');
        $.cstate.main_content.trigger({type:'loadstate',message:'Registration',prc:10});
        $.cstate.main_content.trigger('reg');
        return $.Deferred().reject('Start registration');
      }
      if (d.ResultCode == -1)
        errorHandle(d.Data.message);
    }).done(function () {

      loadLocale(model);
    }).fail(function (reason) {

      console.log('Auth chain canceled:' + reason)
    });

    return ok;

  };
  function loadLocale(model) {
    $.cstate.ajax_a($.cstate.baseUrl + 'getResource.csc/getlocale/ru', {
      dataType : 'json'
    }).done(function (local) {

      $.cstate.localize = local;
      model.local = local;
      initialDisplay(model);
      $.cstate.main_content.trigger('auth', {
        code : model.acc.Data.Session

      })
    });
  }
  $.cstate.load = function () {
    var $queue = $('<div/>');      
    $.cstate.main_content.trigger({type:'loadstate',message:'Load: Resources',prc:20});
    $.cstate.ajax_a($.cstate.baseUrl + 'getdata.csc/getfulldata/resource', {
      dataType : 'json',
    })
    .done(function (d) {
    console.log('resources loaded');

      $.cstate.resources = d.Data;
      $.cstate.resources_c=d.Data;
    }).then(function () {
          $.cstate.main_content.trigger({type:'loadstate',message:'Load: Reforms',prc:40});
     return $.cstate.ajax_a($.cstate.baseUrl + 'getdata.csc/getfulldata/reforms', {
        dataType : 'json',

      })
    })
    .done(function (d) {
    console.log('reform loaded');
      $.cstate.reforms = d.Data;
      $.cstate.reforms_c = d.Data;
      $.cstate.main_content.trigger('reforms_load', {
        code : d.Session
      });
    }).then(function () {
      $.cstate.main_content.trigger({type:'loadstate',message:'Load: State Data',prc:60});
      $.cstate.ajax_a($.cstate.baseUrl + 'statefunction.csc/getalldata', {
        dataType : 'json',
        type : 'POST'
      }).done(function (e) {
      console.log('alldata loaded');
        $.cstate.account.data = e.Data;
        $.cstate.account.data.res_count=$.cstate.account.data.resources.length;
        loadAccData();
        // loadAccData();
        $.cstate.main_content.trigger({type:'loadstate',message:'Load images',prc:80});
        $('body').waitForImages(function () {
          $.cstate.main_content.trigger('done', {
            code : e.Session
          });
        });
        setTimeout(engine.update, 1000);
      });
    });

  }
  $.cstate.popup = function (txt) {
    $.notify({
      message : txt
    }, {
      type : 'cstate-normal',
      placement : {
        from : 'bottom',
        align : 'center'
      },
      offset : 60
    });
  }
  $.cstate.update = function (fl) {
    console.log('update');
    var $queue = $('<div/>');
    $.cstate.ajax_a($.cstate.baseUrl + 'StateFunction.csc/getupdate', {
      dataType : 'json'
    })
    .done(function (r) {
      if (r.ResultCode == 0) {
        r.Data.Sm = $.parseJSON(r.Data.Sm);
        $.cstate._updData=r.Data.Sm;

        $.cstate.main_content.trigger('upd');

        console.log('Have changes', r);
        //$.cstate.ajax_a($.cstate.baseUrl + 'getdata.csc/getfulldata/reforms', {
        //  dataType : 'json',

       // })
       // .done(function (d) {
       //   $.cstate.reforms = d.Data;
       // }).then(function () {

          $.cstate.ajax_a($.cstate.baseUrl + 'statefunction.csc/getalldata', {
            dataType : 'json',
            type : 'POST'
          }).done(function (e) {
          $('.event').show();
                       $.cstate.account.data = e.Data;
            $.each($.cstate.account.data.events, function (k, e) {
              e.ans_count = e.ViewData.answers.length;
            }); 

            eventAdd();

          });
       // });
      }

    });
    if(!fl)
    setTimeout(engine.update, 10000);
  }
  $.cstate.processEvent = function (evt, ans) {
    engine.ajax_a($.cstate.baseUrl + 'statefunction.csc/processEvent', {
      type : 'POST',
      dataType : 'json',
      data : {
        eid : $(evt).attr('data-eid'),
        answ : ans
      }
    }).done(function (dt) {
      if (dt.ResultCode == 0) {
        if (dt.Data)
          $.cstate.popup(dt.Data.message);
        $(evt).fadeOut();
        $.grep(engine.account.data.events,function(e,k){
        return e.Id==$(evt).attr('data-eid');
        });
      } else {
        console.log(dt.Data.message);
      }
    });
  }

  $.cstate.showGraph = function showGraph(divid) { // on dom ready
var cy;
    // photos from flickr with creative commons license
    //var testdata = '{"nodes":[{"data":{"id":"10723c21-a2a2-4f37-b2ac-48694f7aeb60","name":"678" }},{"data":{"id":"ba43f525-a17d-40f1-8b0f-5d8ae72eab9a","name":"123" }},{"data":{"id":"68d8398d-e756-4377-93e0-e1d3d2145065","name":"345" }}],"edges":[{"data":{"source":"ba43f525-a17d-40f1-8b0f-5d8ae72eab9a","target":"68d8398d-e756-4377-93e0-e1d3d2145065" }},{"data":{"source":"ba43f525-a17d-40f1-8b0f-5d8ae72eab9a","target":"10723c21-a2a2-4f37-b2ac-48694f7aeb60" }}]}';
    engine.ajax_a(
     $.cstate.baseUrl + 'statefunction.csc/getGraphData',{data:{echo:'0'}}
    ).done(function (testdata) {
      var data = JSON.parse(testdata);
      var cstyle = cytoscape.stylesheet()
        .selector('node')
        .css({
          'height' : 100,
          'width' : 100,
          'background-fit' : 'cover',
          'border-color' : '#000',
          'border-width' : 3,
          'border-opacity' : 0.5,
          'content' : 'data(name)',
          'text-outline-width': 2,
          'text-outline-color': '#888',
          'color':'#fff',
          'text-size':35
        })
        .selector('.eating')
        .css({
          'border-color' : '#aaa'
        })
        .selector('.eater')
        .css({
          'border-width' : 9
        })
        .selector('edge')
        .css({
          'width' : 3,
          'target-arrow-shape' : 'triangle',
          'line-color' : 'grey',
          'target-arrow-color' : 'grey',
          'curve-style' : 'bezier'
        }).selector('.selected').css({
          'border-width' : 5,
          'border-color' : 'blue'
        }).selector('.current-ref').css({
        'border-color':'green',
        'border-width':10})
        .selector('.avl-ref').css({
        'border-color':'yellow',
        'border-width':10})
      $.each(data.nodes, function (key, elem) {
        cstyle = cstyle.selector('#' + elem.data.id)
          .css({
            'background-image' : $.cstate.baseUrl + 'getResource.csc/image/reforms_' + elem.data.id+'?cs_auth='+engine.session
          })
      });
       cy = cytoscape({
          container : document.getElementById(divid),

          boxSelectionEnabled : false,
          autounselectify : true,

          style : cstyle,

          elements : data,

          layout : {
            name : 'preset'
           ////////////////
           
           
           
           //////////
          }
        }); // cy init
      cy.on('cxttapstart', 'node', function (e) {
        var node = this;
        if (cnode)
          cnode.removeClass('selected');
        cnode = node;

        $('#info').html('').html(node.data().name + ' id:' + node.data().id);
        cnode.addClass('selected');
      });
      var tappedBefore;
      var tappedTimeout;
      cy.on('tap', function (event) {
       
      });
      cy.on('doubleTap', 'node', function (event) {
      });
   
    
    
    //mark crnt
    cy.startBatch();
    $.each($.cstate.account.data.reforms.crnt,function(k,e)
    {
      cy.$('#'+e.Id).addClass('current-ref');
    });
        $.each($.cstate.account.data.reforms.avl,function(k,e)
    {
      cy.$('#'+e.Id).addClass('avl-ref');
    });
    cy.endBatch();
    
    
var options = {
  name: 'circle',

  fit: true, // whether to fit the viewport to the graph
  padding: 30, // the padding on fit
  boundingBox: undefined, // constrain layout bounds; { x1, y1, x2, y2 } or { x1, y1, w, h }
  avoidOverlap: true, // prevents node overlap, may overflow boundingBox and radius if not enough space
  radius: undefined, // the radius of the circle
  startAngle: 3 / 2 * Math.PI, // where nodes start in radians
  sweep: undefined, // how many radians should be between the first and last node (defaults to full circle)
  clockwise: true, // whether the layout should go clockwise (true) or counterclockwise/anticlockwise (false)
  sort: undefined, // a sorting function to order the nodes; e.g. function(a, b){ return a.data('weight') - b.data('weight') }
  animate: false, // whether to transition the node positions
  animationDuration: 500, // duration of animation in ms if enabled
  animationEasing: undefined, // easing of animation if enabled
  ready: undefined, // callback on layoutready
  stop: undefined // callback on layoutstop
};

cy.layout( options );




    });
  } // on dom ready

  $.cstate.registration = function (modal) {
    var name = modal.find('#rname').val();
    var sname = modal.find('#rsname').val();
    console.log('Check names');
    console.log('Platform ' + navigator.platform);
    if ((name) && (sname)) {
      $.ajax(engine.baseUrl + 'authmodule.csc/register', {
        dataType : 'json',
        data : {
          uniq : engine.fingerprint,
          name : name,
          sname : sname,
          platform : navigator.platform
        }
      }).done(function (d) {
        if (d.ResultCode == 0) {
          engine.session = d.Data.Session;
          console.log('Registered for ' + d.Data.Time + '. Get session ' + d.Data.Session);
          var model = {};
          model.acc = d;
          modal.modal('hide');
          loadLocale(model);

        } else {
          console.log('Error', d.message);
        }

      });
    }
  }
  function initialDisplay(e) {
    var cs = $.cstate;
    rivets.bind(cs.mainDivs.heading, {
      accinfo : cs
    });
    rivets.bind(cs.mainDivs.footer, {
      localz : e.local
    });
    //$.cstate.MainDivs.statename.html('').html(e.Data.Name + '(' + e.Data.Account + ')');
  }

  function customFormaterAdd() {
    rivets.formatters.imgurl = function (value, type) {
      return $.cstate.baseUrl + 'getResource.csc/image/' + type + '_' + value + '?cs_auth=' + engine.session;
    }
    rivets.formatters.itemname = function (value, type) {
    
    var arr=$.cstate[type];
    var name='';
    $.each(arr,function(k,e)
    {
      if(e.id==value)
        name=e.name;
    });
     // engine.
      return name;
    }
    rivets.formatters.width_row = function (value) {
    var col=100/value;
    return 'width:'+col+'%';}
  
  }

  function loadAccData() {

    var cs = $.cstate;

    var modalid = $.cstate.modalElement.attr('id');
    // for (var t = 0; t < 20; t++) {
    $.each(cs.account.data.events, function (k, e) {
      e.ans_count = e.ViewData.answers.length;
    });
    rivets.bind($.cstate.mainDivs.reforms, {
      accdata : cs
    });
    rivets.bind($.cstate.mainDivs.areforms, {
      accdata : cs
    });
    rivets.bind($.cstate.mainDivs.effects, {
      accdata : cs
    });
    rivets.bind($.cstate.tRows.esrow, {
      accdata : cs
    });
    rivets.bind($.cstate.tRows.ssrow, {
      accdata : cs
    });

    rivets.bind($.cstate.tRows.resrow, {
      accdata : cs
    });
    rivets.bind($.cstate.mainDivs.events, {
      accdata : cs
    });
            rivets.bind($('#updModal'), {
          e : engine
        });

    eventAdd();
  }
  function eventAdd() {
    $('.event').off('touchstart').off('touchend');
    $('.event').find('.cbtn').off('click');
    $('.event').on('touchstart', function (e) {
      //e.preventDefault();
      if ($(this).attr('data-acnt') == '0') {
        var now = Date.now();
        if (this.tDT) {

          var dif = now - this.tDT;
          if (dif < 1000) {
            $.cstate.processEvent(this, 'def');
          } else
            this.tDT = now;
        } else
          this.tDT = now;
        this.tDT = new Date();

        touched = true;
        //console.log('Touched:' + $(this).attr('data-eid'));
      }
    })
    $('.event').on('touchend', function (e) {
      //e.preventDefault();
      touched = true;
    })
    $('.event').find('.cbtn').on('click', function () {
      var e_text = 'Procces event';
      var eid = $(this).attr('data-eid');
      var id = $(this).attr('data-aid');
      engine.processEvent(this.parentNode.parentNode, id);
    });

    /*  $.each(refs.crnt, function (k, e) {
    // $.cstate.MainDivs.reforms.append('<div class="media"><div class="row"><div class="col-md-2 col-xs-4""><div class="media-left"><a href="#" class="thumbnail"><img class="media-object" src="' + $.cstate.baseUrl + 'getResource.csc/image/reforms_' + e.Id + '" alt="..."></a></div></div><div class="col-md-10 col-xs-8"><div class="media-body"><h4 class="media-heading">'+e.Name+'</h4>'+e.Desc+'</div></div></div></div>')
    $.cstate.MainDivs.reforms.append('')

    });*/
    // $.each(refs.avl, function (k, e) {


    // });
    //}
    $(function () {
      $('[data-toggle="tooltip"]').tooltip({
        delay : {
          "show" : 200,
          "hide" : 300
        }
      });
    })

    //$.cstate.Reforms.find("img.media-object").lazyload({
    //   container : $.cstate.Reforms
    //  });

  }
  function getAccElement(type, id) {
    var cs = $.cstate;
    var tp = cs[type+'_c'];
    var res = {};
    $.each(tp, function (k, e) {
      if (e.id == id)
        res = e;
    });
    return res;
  }
  function errorHandle(e) {
    $('#loading').fadeIn();
    $('#limg').fadeOut();
    $('#load_label').html('<h4 style="color:red;" onclick="$(\'#loading\').fadeOut()">Error in function</h4>' + e);
    //alert(e);
  }
}
(jQuery);
function datafromdevice(e) {
  $.cstate.fingerprint = e;
}
