// ==UserScript==
// @name           Tweak answer
// @version        1.2.0
// @namespace      http://gm.lynn.ru/
// @description    Кастомизация формы ответа
// @copyright      2009, Alexey Ten (Lynn) (http://lynn.ru)
// @include        http://*.ya.ru/*
// @exclude        */update_session.xml*
// ==/UserScript==

;(function() {
var _win = (typeof unsafeWindow != 'undefined') ? unsafeWindow : window
if (typeof _win.y5 == 'undefined') return

var tweak_answer = function() {
    var form_preparer = function(form) { // {{{
        var type = form.elements['type'].value
        if (type == 'link' || type == 'subscribe') {
            return
        }
        if (type == 'text' || type == 'photo' || type == 'congratulation') {
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
        }

        if (type == 'text') {
            var title = document.createElement('input')
            title.name = 'title'
            title.disabled = !tb.checked
            title.setAttribute('style', 'width: 100%; border: 0 none; padding: 2px 1px')
            title.style.display = tb.checked ? '' : 'none'
            var title_h = y5.Dom.getDescendants(form, 'td', 'text')[1]
            title_h.insertBefore(title, title_h.firstChild)
            tb.addEventListener('click', function() {
                title.disabled = !this.checked;
                title.style.display = this.checked ? '' : 'none'
            }, true)
        }

        if (type == 'congratulation') {
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
    } // }}}

    var add_congratulation = function(r) { // {{{
        var oclk = function(a) { return (function() {return a;}) }
        var s = y5.Dom.getDescendant(r.control, 'div', 'b-actions-select')
        var links = s.getElementsByTagName('a')
        for (var i = 2; i < links.length; i++) {
            if (!links[i].onclick) return
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
                a.onclick = oclk(l_par)
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
        a.onclick = oclk(_par)
    } // }}}

    var patch_ActionsControl = function(ac) { // {{{
        var p = ac.Constructor.prototype
        var old_createForm = p.createForm
        var old_initActionsMenu = p.initActionsMenu

        p.createForm = function(/* arguments */) {
            old_createForm.apply(this, arguments)
            form_preparer(this.form)
        }
        p.initActionsMenu = function(/* arguments */) {
            add_congratulation(this)
            old_initActionsMenu.apply(this, arguments)
        }
    } // }}}

    var ac = y5.moduleObject('{Friends}.ActionsControl')
    if (ac) {
        patch_ActionsControl(ac)
    } else {
        var old_y5_loaded = y5.loaded
        y5.loaded = function(module) {
            if (y5.moduleName(module) == 'Friends:ActionsControl') {
                patch_ActionsControl(y5.moduleObject(module))
            }
            old_y5_loaded.apply(this, arguments)
        }
    }
}

if (window.opera) {
    tweak_answer()
} else {
    location.href = "javascript:("+encodeURI(tweak_answer.toSource())+")();"
}
})()
