_ = function (D,C,A,Q,f,b,v,e) {
f = D[C]('form');
f.action = 'http://my.ya.ru/request_to_session.xml';
f.method = 'post';
f.style.display = 'none';
f.target = '_blank';
D.documentElement[A](f);
try {
    b = D[C]('div');
    b[A](getSelection().getRangeAt(0).cloneContents());
    b = b.innerHTML;
} catch(x) {
    b = '';
}
v = {
    body:  b ? '<'+Q+b+'</'+Q : '',
    title: D.title,
    URL:   D.location,
    YARU_retpath: '/posts_add_link.xml'
};
for (b in v) {
    e = D[C]('input');
    e.name = b;
    e.value = v[b];
    f[A](e);
}
f.submit();
}
//(function(D,C,A,Q,f,b,v,e){f=D[C]("form");f.action="http://my.ya.ru/request_to_session.xml";f.method="post";f.style.display="none";f.target="_blank";D.documentElement[A](f);try{b=D[C]("div");b[A](getSelection().getRangeAt(0).cloneContents());b=b.innerHTML}catch(x){b=""}v={body:b?"<"+Q+b+"</"+Q:"",title:D.title,URL:D.location,YARU_retpath:"/posts_add_link.xml"};for(b in v){e=D[C]("input");e.name=b;e.value=v[b];f[A](e)}f.submit()})
//(document, 'createElement', 'appendChild', 'blockquote>')
