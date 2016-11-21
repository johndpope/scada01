$(function () {
  'use strict';
  $.cstate.baseUrl = 'http://cstate.marikun.ru/'
    $.cstate.MainDivs.Heading = $('.head-container');
  $.cstate.MainDivs.reforms = $('#reforms');
  $.cstate.MainDivs.areforms = $('#areforms');
  $.cstate.MainDivs.effects = $('#p1_effects');
  $.cstate.MainDivs.Footer = $('.sub-header');
  $.cstate.ModalElement = $('#mainModal');
  $.cstate.Reforms = $('#tabs-reforms');
  $.cstate.tRows.esrow = $('#esrow');
  $.cstate.tRows.ssrow = $('#ssrow');
  $.cstate.MainDivs.events=$('#p_events');
  $.cstate.initial();
  $.cstate.load_label = $('#load_label');
  $.cstate.main_content = $('.main-container');
  $(document).ready(function () {
    $.cstate.main_content.on('auth.cstate', function () {
      $.cstate.load_label.html('Авторизация. OK.');
      $.cstate.load('reforms');
    });
    $.cstate.main_content.on('reforms_load.load', function () {
      $.cstate.load_label.html('Реформы. OK.');
    });
    $.cstate.main_content.on('done.load', function () {
      loadInit();
    });
    $.cstate.auth();
  });

  function loadInit() {
    $('#loading').fadeOut();

    var $swipeTabsContainer = $('.swipe-tabs'),
    $swipeTabs = $('.swipe-tab'),
    $swipeTabsContentContainer = $('.swipe-tabs-container'),
    currentIndex = 0,
    activeTabClassName = 'active-tab';

    $swipeTabsContainer.on('init', function (event, slick) {
      $swipeTabsContentContainer.removeClass('invisible');
      $swipeTabsContainer.removeClass('invisible');

      currentIndex = slick.getCurrent();
      $swipeTabs.removeClass(activeTabClassName);
      $('.swipe-tab[data-slick-index=' + currentIndex + ']').addClass(activeTabClassName);
    });

    $.cstate.swipe_tabs = $swipeTabsContainer.slick({
        //slidesToShow: 3.25,
        slidesToShow : 4,
        slidesToScroll : 1,
        arrows : false,
        infinite : true,
        swipeToSlide : true,
        touchThreshold : 15,

      })[0];
    $.cstate.swipe_tabs.lock = false;

    $.cstate.swipe_content = $swipeTabsContentContainer.slick({
        asNavFor : $swipeTabsContainer,
        slidesToShow : 1,
        slidesToScroll : 1,
        arrows : false,
        infinite : true,
        swipeToSlide : true,
        //fade : true,
        // draggable : true,
        touchThreshold : 15,
        useTransform : true,
        useCSS : true,
        zIndex : 10,
        mobileFirst : true,
        // touchMove:false,
      })[0];
    $.cstate.swipe_content.lock = false;

    $swipeTabs.on('click', function (event) {
      // gets index of clicked tab
      //console.log('Navigate:click',event);
      currentIndex = $(this).data('slick-index');
      $swipeTabs.removeClass(activeTabClassName);
      $('.swipe-tab[data-slick-index=' + currentIndex + ']').addClass(activeTabClassName);
      $swipeTabsContainer.slick('slickGoTo', currentIndex);
      $swipeTabsContentContainer.slick('slickGoTo', currentIndex);

    });

    //initializes slick navigation tabs swipe handler
    $swipeTabsContentContainer.on('swipe', function (event, slick, direction) {
      //console.log('Navigate:swipe',event);
      currentIndex = $(this).slick('slickCurrentSlide');
      $swipeTabs.removeClass(activeTabClassName);
      $('.swipe-tab[data-slick-index=' + currentIndex + ']').addClass(activeTabClassName);
      event.preventDefault();
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

  }
});

function getLoginData(data) {
  alert(data);
}
