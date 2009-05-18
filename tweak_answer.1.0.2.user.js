// ==UserScript==
// @name           Tweak answer
// @version        1.0.2
// @namespace      http://gm.lynn.ru/
// @description    Кастомизация формы ответа
// @copyright      2009, Alexey Ten (Lynn) (http://lynn.ru)
// @include        http://*.ya.ru/*
// @exclude        */update_session.xml*
// ==/UserScript==

;(function() {
var _win = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window
if (!_win.Friends) {
    return
}

var form_preparer = function(form) {
    var type = form.elements['type'].value
    if (type == 'link' || type == 'subscribe') {
        return
    }
    if (type == 'text' || type == 'photo') {
        var tb = form.elements['trackback']
        if (!tb) {
            var t = form.elements['type']
            tb = document.createElement('input')
            tb.value = 1
            tb.name = 'trackback'
            t.parentNode.insertBefore(tb, t)
        } else if (type == 'photo') {
            tb.checked = false
        } else {
            tb.checked = true
        }
        tb.type = 'checkbox'
        tb.id = 'lbl' + (new Date().getTime())
        tb.style.marginRight = '3px'
        tb.style.verticalAlign = 'middle'
        var lbl = document.createElement('label')
        lbl.setAttribute('for', tb.id)
        lbl.appendChild(document.createTextNode('у себя'))
        tb.parentNode.insertBefore(lbl, tb.nextSibling)
    } else if (type == 'congratulation') {
        var e = form.elements['event']
        if (e.value == 'birthday') {
            return
        }
        e.type = 'text'
        e.id = 'lbl' + (new Date().getTime())
        var b = form.elements['body']
        b.parentNode.insertBefore(e, b)
        var lbl = document.createElement('label')
        lbl.setAttribute('for', e.id)
        lbl.appendChild(document.createTextNode('с чем?'))
        b.parentNode.insertBefore(lbl, e)
    }
}

var add_congratulation = function(r) {
    var s = _win.y5.Dom.getDescendant(r.control, 'div', 'b-actions-select')
    var links = s.getElementsByTagName('a')
    for (var i = 2; i < links.length; i++) {
        var l_par = links[i].onclick()
        if (l_par[0] == 'congratulation') {
            if (l_par[3] == 'birthday') {
                return
            }
            l_par[3] = l_par[4]
            l_par[4] = ''
            var a = document.createElement('a')
            a.href = links[i].href
            a.innerHTML = links[i].innerHTML
            a.setAttribute('onclick', "return " + l_par.toSource())
            links[i].parentNode.appendChild(a)
            links[i].parentNode.removeChild(links[i])
            return
        }
    }
    var h = links[0].parentNode.parentNode
    var d = document.createElement('div')
    var a = document.createElement('a')
    a.href = "#"
    a.innerHTML = 'поздравить!'
    d.appendChild(a)
    h.insertBefore(d, null)
    var _par = [
        'congratulation',
        {   id:    r.commonParams.author_id,
            login: r.commonParams.author_login,
            title: r.commonParams.author_title },
        '', '', ''
    ]
    a.setAttribute('onclick', "return " + _par.toSource())
}

var ta_watcher = function(p1, p2, ta) {
    form_preparer(ta.form)
    return ta
}

var ac_prepare = function(p1, p2, ac) {
    var old_cft = ac.createFromTag
    ac.createFromTag = function(element, params) {
        var r = old_cft(element, params)
        r.$iam = r.initActionsMenu
        r.initActionsMenu = function() {
            add_congratulation(r)
            this.$iam()
        }
        if (r.form) {
            form_preparer(r.form)
        }
        r.watch('textArea', ta_watcher)
        return r
    }
    return ac
}

if (_win.Friends.ActionsControl) {
    ac_prepare(null, null, _win.Friends.ActionsControl);
} else {
    _win.Friends.watch('ActionsControl', ac_prepare)
}

var ctrls = _win.y5.Dom.getDescendants(_win.y5.Dom.getBody(), 'div', 'Friends-c-ActionsControl')
for (var i = 0; i < ctrls.length; i++) {
    if (ctrls[i].control) {
        if (ctrls[i].control.form) {
            form_preparer(ctrls[i].control.form)
        }
        ctrls[i].control.watch('textArea', ta_watcher)
    }
}
})()
