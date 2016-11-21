+function($) {
  'use strict';
  var touched = false;
  $.cstate = {
    scrolling : false,
    load_label : null,
    session : null,
    localize:null,
    baseUrl : null,
    State : null,
    Reforms : null,
    Events : null,
    Effects : null,
    Account : {},
    ModalElement : null,
    main_content : null,
    MainDivs : {
      Heading : null,
      stateinfo : null,
      reforms : null,
      areforms : null,
      effects : null,
      events : null,
      Footer : null
    },
    tRows:{},
  };
  ////   First called initialisation proc
  $.cstate.initial = function () {
    customFormaterAdd();
    $('.pbody').on("scrollstart", {
      latency : 650
    }, function () {

      $.cstate.swipe_content.slick.fixed = true; // && !touched;
      //  if(!$.cstate.swipe_content.slick.dragging)
      //$('.pbody').css('background','white');
      //console.log('scrollstart');
    });
    $('.pbody').on("scrollstop", {
      latency : 650
    }, function () {

      $.cstate.swipe_content.slick.fixed = false; // && !touched;
      // if($.cstate.swipe_content.slick.dragging)
      // $('.pbody').css('background','green');
      //console.log('scrollstop');
    });
    $.cstate.ModalElement.on('show.bs.modal', function (event) {
      var button = $(event.relatedTarget) // Button that triggered the modal
        var type = button.data('itemtype') // Extract info from data-* attributes
        var id = button.data('itemid') // Extract info from data-* attributes
        // If necessary, you could initiate an AJAX request here (and then do the updating in a callback).
        // Update the modal's content. We'll use jQuery here, but you could use a data binding library or other methods instead.
        var modal = $(this)
        var head = 'test';

      var cont = '<a>Test A</a>';
      $.ajax($.cstate.baseUrl + 'getResource.csc/data/' + type + '_' + id, {
        dataType : 'json'
      }).done(function (data) {

        modal.find('.modal-title').text(data.Name);
        modal.find('.modal-body').html('');        
        modal.find('.modal-body').html('<div class="media" ><div class="media-left" style="width: 40%;"><div  class="btn-cstate-normal-pannel"><img class="media-object" src="' + $.cstate.baseUrl + 'getResource.csc/image/reforms_' + data.Id + '" ></div>  </div>  <div class="media-body">    <h4 class="media-heading">Описание</h4>' + data.Desc + '<h4 class="media-heading">Эффект</h4>' + data.Effect + '<h4 class="media-heading">Требования</h4>' + data.Req + '</div></div>');
        var vh = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);
        var def = vh * 0.50 - modal.find('.modal-dialog').height() / 2;
        modal.find('.modal-dialog').css('margin-top', def + 'px');
        this.show = true;

      });

    });

    $.cstate.ModalElement.on('shown.bs.modal', function () {
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
    $.when($.ajax($.cstate.baseUrl + 'getResource.csc/getlocale/ru', {
        dataType : 'json'
      }),$.ajax($.cstate.baseUrl + 'authmodule.csc/login', {
        dataType : 'json'
      })).done(function (local, acc) {
        var model = {};
        $.cstate.localize=local[0];
        model.local = local[0];
        model.acc = acc[0];
        $.cstate.session = model.acc.Data.Session;
        initialDisplay(model);
        ok = true;
        $.cstate.main_content.trigger('auth', {
        code : model.acc.Data.Session
      });
    }).fail(function (e) {
      error('error');
    });
    return ok;

  };
  $.cstate.load = function () {
    var $queue = $('<div/>');

      $.ajax($.cstate.baseUrl + 'statefunction.csc/getalldata', {
        dataType : 'json',
        data : {
          session : $.cstate.session
        },
        type : 'POST'
      }).done(function (e) { 
      $.cstate.Account.data=e.Data;
      loadAccData();
      $('body').waitForImages(function(){
        $.cstate.main_content.trigger('done', {
          code : e.Session
        });
       });
      });
  

  }

  function initialDisplay(e) {
    var cs = $.cstate;
    rivets.bind(cs.MainDivs.Heading, {
      accinfo : e.acc.Data
    });
    rivets.bind(cs.MainDivs.Footer, {
      localz : e.local
      });
    //$.cstate.MainDivs.statename.html('').html(e.Data.Name + '(' + e.Data.Account + ')');
  }
  
  function customFormaterAdd()
  {
    rivets.formatters.imgurl = function(value,type){
      return $.cstate.baseUrl + 'getResource.csc/image/'+type+'_' + value;
    }
  }
  function error(e) {
    alert(e);
  }
  function loadAccData() {

    var cs=$.cstate; 

    var modalid = $.cstate.ModalElement.attr('id');
   // for (var t = 0; t < 20; t++) {
       
      rivets.bind($.cstate.MainDivs.reforms,{accdata:cs});
      rivets.bind($.cstate.MainDivs.areforms,{accdata:cs});
      rivets.bind($.cstate.MainDivs.effects,{accdata:cs});
      rivets.bind($.cstate.tRows.esrow,{accdata:cs});
      rivets.bind($.cstate.tRows.ssrow,{accdata:cs});
      rivets.bind($.cstate.MainDivs.events,{accdata:cs});
      $('.event').on('touchstart',function(e){
      e.preventDefault();
      touched=true;
      console.log('Touched:'+$(this).data('eid'));
      })
      $('.event').on('touchend',function(e){
      e.preventDefault();
      touched=true;
      })
    /*  $.each(refs.crnt, function (k, e) {
        // $.cstate.MainDivs.reforms.append('<div class="media"><div class="row"><div class="col-md-2 col-xs-4""><div class="media-left"><a href="#" class="thumbnail"><img class="media-object" src="' + $.cstate.baseUrl + 'getResource.csc/image/reforms_' + e.Id + '" alt="..."></a></div></div><div class="col-md-10 col-xs-8"><div class="media-body"><h4 class="media-heading">'+e.Name+'</h4>'+e.Desc+'</div></div></div></div>')
        $.cstate.MainDivs.reforms.append('')

      });*/
     // $.each(refs.avl, function (k, e) {

      

     // });
    //}
    $(function () {
      $('[data-toggle="tooltip"]').tooltip({delay:{"show":200,"hide":300}});
      })

    $.cstate.Reforms.find("img.media-object").lazyload({
      container : $.cstate.Reforms
    });

  }
}
(jQuery);
