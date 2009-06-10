// ==UserScript==
// @name           Friends calendar
// @version        0.9a
// @namespace      http://gm.lynn.ru/
// @description    Календарь для страницы «Что нового»
// @copyright      2009, Alexey Ten (Lynn) (http://lynn.ru)
// @include        http://my.ya.ru/
// @include        http://*.ya.ru/friends.xml
// ==/UserScript==

;(function() {
var calendar = function() {
    if (typeof window.y5 == 'undefined') return

    var comp = document.createElement('span')
    jQuery(comp).addClass('y5-c-Components-Calendar-TextInput b-pseudo-link')
        .css({position: 'absolute', margin: '0.5em'})
        .html('<input class="y5-Calendar-result-date" type="hidden"/>' +
            '<span class="y5-Calendar-button">календарь</span>')
        .prependTo('td.b-page-body .b-posts-first')

    y5.Components.init(comp)
    y5.Events.observe('y5:Calendar:selectDate',
        function(d){
            var a = new Date(d.getFullYear(), d.getMonth(), d.getDate()+1)
            console.log(a.getTime() + '000', d)
        },
        comp, true)
}

location.href = "javascript:("+encodeURI(calendar.toString())+")();"
})()
