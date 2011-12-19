// ==UserScript==
// @name           Tweak answer
// @version        2.0.0
// @namespace      http://gm.lynn.ru/
// @description    Кастомизация формы ответа
// @copyright      2009-2011, Alexey Ten (Lynn) (http://lynn.ru)
// @include        http://*.ya.ru/*
// @exclude        */update_session.xml*
// ==/UserScript==

(function() {
  var w = unsafeWindow || window;
  var $ = w.$;
  var actions = w.ya.controls.actions;

  function replace_prepare(name) {
    var old_prepare = actions[name].prepare;
    var old_init = actions[name].init;
    var old_buttons = actions[name].buttons;
    actions[name].prepare = function(postData) {
      console.log(arguments);
      var res = old_prepare.apply(this, arguments) || {};
      $.extend(res, {noTrackback: true, checkbox: true});
      w.console.log('prepared ', name, res);
      return res;
    }
    if ('comment' == name) {
      actions[name].init = function(postData) {
        old_init.apply(this, arguments);
        $(this).prepend('<input name="title" style="width:98%;display:none" disabled>');
      }
      actions[name].buttons = function($placeholder, postData) {
        old_buttons.apply(this, arguments);
        $placeholder.find('[name=trackback]').click(function() {
          var c = !!this.checked;
          var e = $('[name=title]', this.form);
          if (c) {
            e.removeAttr('disabled');
          } else {
            e.attr('disabled', '');
          }
          e.toggle(c);
        });
      }
    }
  }
  for (var k in {photo: true, comment: true, slashme: true}) {
    replace_prepare(k);
  }

  var ac = w.ya.controls.ActionsControl;
  var init = ac.prototype.init;
  ac.prototype.init = function(o) {
    var res = init.apply(this, [o]);
    var enabled = {};
    var actions = this.data.actions;
    for (var i = 0; i < actions.length; i++) {
      enabled[actions[i].action] = true;
    }
    if (!enabled.slashme) {
      this.data.actions.push({title:'ответить действием', action: 'slashme'});
    }
    /*
    if (!enabled.holiday) {
      this.data.actions.push({title:'поздравить!', action: 'congratulation'});
      this.data.holiday = {
        id: 'с восстановлением рюшечек',
        preposition: '', 
        title: 'с восстановлением рюшечек'
      }
    }*/
    return res;
  }
})()
