// ==UserScript==
// @name           Tweak answer
// @version        1.3.11
// @namespace      http://gm.lynn.ru/
// @description    Кастомизация формы ответа
// @copyright      2009, 2010, Alexey Ten (Lynn) (http://lynn.ru)
// @include        http://*.ya.ru/*
// @exclude        */update_session.xml*
// ==/UserScript==

;(function() {
var p = document.location.pathname
if (/update_session\.xml/.test(p) || /post(s_add|_edit).+\.xml/.test(p)) return

var the_script = function() {
    if (typeof window.y5 == 'undefined') return
    var form_preparer = function(/* _reply, _action */) { // {{{
        var form = this.form
        var type = form.elements['type'].value
        var tb = null
        if (type == 'subscribe') {
            return
        }

        if (type == 'text' || type == 'photo'
            || type == 'friend' || type == 'unfriend'
            || type == 'join' || type == 'unjoin'
            || type == 'slashme' || type == 'congratulation') {
            tb = form.elements['trackback']
            if (!tb) {
                /* кажется больше не нужно */
                var t = form.elements['type']
                tb = document.createElement('input')
                tb.name = 'trackback'
                t.parentNode.insertBefore(tb, t)
            } else if (type == 'photo') {
                tb.checked = false
            } else if (tb.type == 'hidden' && tb.value == '1') {
                tb.checked = true
            }

            if (tb.type == 'hidden') {
                tb.type = 'checkbox'
                tb.id = 'lbl' + (new Date().getTime())
                tb.value = 1
                tb.style.marginRight = '3px'
                tb.style.verticalAlign = 'middle'
                var lbl = document.createElement('label')
                lbl.setAttribute('for', tb.id)
                lbl.appendChild(document.createTextNode('у себя'))
                tb.parentNode.insertBefore(lbl, tb.nextSibling)
            }
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

        if (type == 'text' || type == 'photo') {
            var keywordsContainer = document.createElement('div')
            keywordsContainer.className = 'keywordsContainer'
            keywordsContainer.style.display = tb.checked ? '' : 'none'
            y5.Dom.getAncestor(form.elements['body'], 'td').appendChild(keywordsContainer)
            tb.addEventListener('click', function() {
                keywordsContainer.style.display = this.checked ? '' : 'none'
                if (keywordsContainer.firstChild) return;
                y5.require(['Ajax', 'AjaxJS', 'Dom'], function() {
                    (new y5.Ajax(
                        new y5.AjaxJS(g_source.id),
                        friendsURL('ajax/keywords'),
                        function(request) {
                            keywordsContainer.innerHTML = request.html;
                            y5.Components.init(keywordsContainer);
                        }, y5.Vars.NULL, {})
                     ).send()
                })
            }, true)
        }

        if (type == 'link') {
            var title_h = y5.Dom.getDescendants(form, 'div', 'data')[0]
            var edit_fields = document.createElement('span')
            edit_fields.className = 'b-pseudo-link'
            edit_fields.setAttribute('style', 'float: right; margin: 0; color:#000; font-size:0.8em')
            edit_fields.appendChild(document.createTextNode('Изменить заголовок и ссылку'))
            title_h.parentNode.insertBefore(edit_fields, title_h)
            edit_fields.addEventListener('click', function() {
                var title = form.elements['title']
                title.type = 'text'
                title.setAttribute('style', 'width: 98%; padding: 1px')
                edit_fields.parentNode.insertBefore(title, edit_fields)
                var url = form.elements['URL']
                url.type = 'text'
                url.setAttribute('style', 'width: 98%; padding: 1px; margin-top: 0.3em')
                edit_fields.parentNode.insertBefore(url, edit_fields)
                edit_fields.parentNode.removeChild(edit_fields)
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

    var add_menuitems = function(r) { // {{{
        var oclk = function(a) { return (function() {return a;}) }
        var s = y5.Dom.getDescendant(r.control, 'div', 'b-actions-select')
        var links = s.getElementsByTagName('a')
        var new_items = {
            slashme: { title: 'ответить действием', data: [ 'slashme', '' ] },
            congratulation: { title: 'поздравить!', data: [ 'congratulation', { id: r.commonParams.author_id, login: r.commonParams.author_login, title: r.commonParams.author_title }, '', '', '' ] }
        }

        for (var i = 2; i < links.length; i++) {
            if (!links[i].onclick) return
            var l_par = links[i].onclick()
            if (new_items[l_par[0]]) {
                delete(new_items[l_par[0]])
            }
            if (l_par[0] == 'congratulation') {
                if (l_par[3] != 'birthday') {
                    l_par[3] = l_par[4]
                    l_par[4] = ''
                    links[i].onclick = oclk(l_par)
                }
            }
        }

        var h = links[0].parentNode.parentNode
        for (var i in new_items) {
            var d = document.createElement('div')
            var a = document.createElement('a')
            a.href = "#"
            a.innerHTML = new_items[i].title
            a.onclick = oclk(new_items[i].data)
            d.appendChild(a)
            h.insertBefore(d, null)
        }
    } // }}}

    var patch_ActionsControl = function(ac) { // {{{
        if (ac.$tweaked) {
            return
        }
        ac.$tweaked = true
        var p = ac.Constructor.prototype
        var old_createForm = p.createForm
        var old_initActionsMenu = p.initActionsMenu

        p.createForm = function(/* arguments */) {
            old_createForm.apply(this, arguments)
            form_preparer.apply(this, arguments)
        }
        p.initActionsMenu = function(/* arguments */) {
            add_menuitems(this)
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
    the_script()
} else {
    var script = document.createElement('script')
    script.type = 'application/javascript'
    script.appendChild(document.createTextNode('(' + the_script.toString() + ')()'))
    document.getElementsByTagName('head')[0].appendChild(script)
}
})();
