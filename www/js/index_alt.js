$(function () {
  'use strict';
  var rpg = $.irpg;
  document.getElementById('msic').play()
  rpg.baseUrl = 'http://cstate.marikun.ru/'
    //rpg.baseUrl = 'http://cstateweb.azurewebsites.net/'
    //rpg.baseUrl = 'http://localhost:59638/'
    rpg.mainDivs.heading = $('.head-container');
  rpg.mainDivs.footer = $('.sub-header');
  rpg.mainDivs.steparea = $('#steparea');
  rpg.modalElement = $('#mainModal');
  rpg.main_content = $('.main-container');
  //rpg.mareforms = $('#tabs-reforms');
  rpg.load();
  rpg.load_label = $('#load_label');

  $(document).ready(function () {
    rpg.main_content.on('auth.cstate', function () {
      rpg.load('reforms');
    });
    rpg.main_content.on('loadstate.load', function (e) {
      rpg.load_label.html(e.message);
      $(rpg.load_label.get(0).parentNode).find('.progress-bar').css("width", e.prc + '%');
    })

    rpg.main_content.on('done.load', function () {
      loadInit();
      rpg.currentds = rpg.dataSources[0];
      rpg.currentstep = rpg.dataSources[0].steps[0];      
      for (var i in rpg.currentstep.addafterstep) {
        rpg.player.objects.push(rpg.currentstep.addafterstep[i])
        console.log("Add object " + rpg.currentstep.addafterstep[i]);
      }
      for(var i in rpg.currentstep.answers)
      {
        rpg.currentstep.answers[i].avl=true;
      }
      rpg.processReq(rpg.currentstep);


      
      rivets.bind($('body'), {
        data : rpg
      });
      rpg.eventsAdd();
    });
    $('#sndswitch').on('click', function () {

      if (document.getElementById('msic').paused) {
        document.getElementById('msic').play();
      } else {
        document.getElementById('msic').pause();
      }
    });

  });

  function loadInit() {
    $('#loading').fadeOut();
    var elem = $('.main-container').get(0);
    window.mySwipe = Swipe(elem, {
        // startSlide: 4,
        // auto: 3000,
        // continuous: true,
        // disableScroll: true,
        // stopPropagation: true,
        callback : function (index, element) {
          var stab = $('.swipe-tabs').find('.swipe-tab').get(index);
          $('.swipe-tabs').find('.swipe-tab').removeClass('active-tab');
          $(stab).addClass('active-tab');

        },

      });
    $('.slick-initialized').on('click', function (e) {
      var nodeList = Array.prototype.slice.call(e.currentTarget.parentElement.children);
      var i = nodeList.indexOf(e.currentTarget);
      window.mySwipe.slide(i, 300);
    });

  }
  Initialization();

  function Initialization() {
    resizeToDim();
  }

  function resizeToDim() {
    $('.main-container').height(Math.max(document.documentElement.clientHeight, window.innerHeight || 0) - 92);
    $('.swipe-tab-content').height($('.main-container').height());

    $('.pbody').height($('.main-container').height());
    var cnt = $('.swipe-tab').length;
    $('.swipe-tab').width(Math.max(document.documentElement.clientWidth, window.innerWidth || 0) / cnt)
  }
  

});

function getLoginData(data) {
  alert(data);
}
