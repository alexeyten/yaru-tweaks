// ==UserScript==
// @name           Friends calendar
// @version        1.0.1
// @namespace      http://gm.lynn.ru/
// @description    Календарь для страницы «Что нового»
// @copyright      2009, Alexey Ten (Lynn) (http://lynn.ru)
// @include        http://my.ya.ru/
// @include        http://my.ya.ru/?*
// @include        http://*.ya.ru/friends.xml
// @include        http://*.ya.ru/friends.xml?*
// ==/UserScript==

;(function() {
var the_script = function() {
    try {
        if (g_globals.current_location.page !== 'friends') return
    } catch(e) {
        return
    }

    var tb = y5.Url().getParam('tb')
    if (tb) {
        tb = new Date(parseInt(tb.replace(/...$/,''))-1)
    } else {
        tb = new Date()
    }
    tb = tb.getFullYear() + '-' + (tb.getMonth()+1) + '-' + tb.getDate()

    var comp = document.createElement('span')
    comp.onclick = function() { return { limitDates: { min: null, max: new Date() } } }
    jQuery(comp).addClass('y5-c-Components-Calendar-TextInput b-pseudo-link')
        .css({position: 'absolute', margin: '0.5em'})
        .html('<input class="y5-Calendar-result-date" type="hidden" value="' + tb + '" />' +
            '<span class="y5-Calendar-button">календарь</span>')
        .prependTo('td.b-page-body .h-posts-decor')


    y5.Components.init(comp)
    y5.Events.observe('y5:Calendar:selectDate',
        function(d){
            var a = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1)
            y5.Url().replaceParams({tb: (a.getTime()-1) + '999'}).go()
        },
        comp, true)
}

if (window.opera) {
    the_script()
} else {
    var script = document.createElement('script')
    script.type = 'application/javascript'
    script.appendChild(document.createTextNode('(' + the_script.toString() + ')()'))
    document.body.appendChild(script)
}
})();
