var slide_gallery = new (function(){
    var fps = 30;
    var flameTime = 1000 / fps;
    var m_ActiveElement = null;
    var mousewheelevent = 'onwheel' in document ? 'wheel' : 'onmousewheel' in document ? 'mousewheel' : 'DOMMouseScroll';

    // activeクラスを付与するための関数
    function SetActive(activeElement, parentElement = null) {
        if (parentElement == null)
            parentElement = $(activeElement).parents('ul')[0];
        var ul_index = Number(parentElement.getAttribute('index'));
        var figures = $(parentElement).find('li>div>figure');
        figures.removeClass('active');
        $(activeElement).addClass('active');
        var index = Number(activeElement.getAttribute('index'));
        if (index === 0) {
            $(parentElement.parentElement).attr({active: 'first'});
        } else if(index > (figures.length - 2)) {
            $(parentElement.parentElement).attr({active: 'last'});
        } else {
            $(parentElement.parentElement).attr({active: index});
        }
        SetMaxMin(ul_index);
    }

    function SetMaxMin(ul_index){
        s = m_slides[ul_index];
        ul = s['ul'];
        var lis = $(ul).find('li');
        var activeElement = lis[s['active']];
        s['min'] = (parent.offsetWidth / 2) - (activeElement.offsetWidth + activeElement.offsetLeft);
        s['max'] = (parent.offsetWidth / 2) - (activeElement.offsetLeft);
    }

    function MoveToActive(ul_index, activeElement = null, time = 400){
        s = m_slides[ul_index];
        parent = s['ul']
        var figures = $(parent).find('li>div>figure');
        if (activeElement == null)
            activeElement = figures[s['active']];
        SetActive(activeElement, parent);
        var x_px = (parent.offsetWidth / 2)
             - (activeElement.offsetWidth / 2 + activeElement.offsetLeft);
        $(parent).css({
            '-webkit-transform':'translate3d(' + x_px + 'px,0,0)', 
            '-webkit-transition':'-webkit-transform ' + time + 'ms cubic-bezier(0,0,0.25,1)',
    });
        s['x'] = x_px;
        return activeElement;
    }
    function MoveUpdate(){
        for (i = 0; i < m_slides.length; i++){
            var s = m_slides[i]
            if (s['x_cr'] !== null) s['x'] = s['x_cr'];
            s['x_cr'] = null;
            s['isAnim'] = false;
            MoveToActive(i);
        }
    }
    var m_slides = [];
    var m_slide = $('.slide-gallery');
    m_slide.removeClass('wp-block-gallery');
    // ここのループはスワイプギャラリーに紐づけされた分の付与
    for (i = 0; i < m_slide.length; i++){
        var s = m_slide[i];
        s.setAttribute('index', i);
        s.insertAdjacentHTML('afterend', document.createElement('div').outerHTML);
        var m_div = $(m_slide[i]).parents('.slide-gallery-frame');
        if (m_div.length === 0){
            m_div = s.nextElementSibling;
            m_div.setAttribute('class', 'slide-gallery-frame');
            m_div.appendChild(m_slide[i]);
        } else {
            m_div = m_div[0];
        }
        $(m_div).attr({tabindex: 0});


        m_div.insertAdjacentHTML('afterbegin', (function(){
            var childrenElem = [];
            childrenElem[0] = document.createElement('div');
            childrenElem[0].setAttribute('class', 'slide-inner-button left');
            childrenElem[1] = childrenElem[0].appendChild(document.createElement('div'))
                .appendChild(document.createElement('span'));
            childrenElem[1].innerText = '<'
            childrenElem[2] = document.createElement('div');
            childrenElem[2].setAttribute('class', 'slide-inner-button right');
            childrenElem[3] = childrenElem[2].appendChild(document.createElement('div'))
                .appendChild(document.createElement('span'));
            childrenElem[3].innerText = '>'
            return (childrenElem[0].outerHTML + "\n" + childrenElem[2].outerHTML);
        })());
        
        $(m_div).addClass('wp-block-image');
        m_slides.push({ul: $(m_div).children('ul')[0], active: 0, x: 0,
            lastEvent: null, isAnim: false, x_cr: null});
        // スワイプしたときに呼び出される再帰関数
        function SwipeAnim(ul, index, msec = 40){
            var s = m_slides[index];
            if (!s['isAnim']) {
                MoveToActive(index);
                return;
            }
            var figures = (ul).find('li>div>figure');
            var toIndex = null;
            if (s['x_cr'] < s['min'])
                toIndex = s['active'] + 1;
            else if (s['x_cr'] > s['max'])
                toIndex = s['active'] - 1;
            if (toIndex !== null) {
                if (toIndex >= 0 && toIndex < figures.length){
                    s['active'] = toIndex;
                    SetActive(figures[toIndex], ul[0]);
                }
            }
            ul.css({
                '-webkit-transform':'translate3d(' + s['x_cr'] + 'px,0,0)',
                '-webkit-transition':'-webkit-transform ' 
                    + msec + 'ms cubic-bezier(0,0,0.25,1)',
            });
            setTimeout(() => {
                SwipeAnim(ul, index, msec);
            }, flameTime);
        }
        $(m_div).hammer().on('pan', function(e){
            var ul = $(this).children('ul');
            var s_index = Number(ul[0].getAttribute('index'));
            var s = m_slides[s_index];
            var isFirst = (s['x_cr'] === null);
            if (!e.gesture.isFinal) {
                s['x_cr'] = s['x'] + e.gesture.deltaX;
                if (isFirst){
                    s['isAnim'] = true;
                    this.focus();
                    SwipeAnim(ul, s_index);
                } 
            } else {
                s['x'] = s['x_cr'];
                s['x_cr'] = null;
                s['isAnim'] = false;
            }
        });
        $(m_div).on('click', function(){
            this.focus();
        })
        $(m_div).keydown(function(e){
            var keyEvent = e.originalEvent;
            switch (keyEvent.keyCode){
                case 37: // ←
                case 65: // a
                    GoButtonEvent(this, -1);
                    break;
                case 39: // →
                case 68: // d
                    GoButtonEvent(this, 1);
                    break;
            }
        });

        var m_mousewheel_timer = 0;
        $(m_div).on(mousewheelevent,function(e){
            e.preventDefault();
            var ul = $(this).children('ul');
            var s_index = Number(ul[0].getAttribute('index'));
            var s = m_slides[s_index];
            var isFirst = (s['x_cr'] === null);
            var delta = e.originalEvent.deltaY ? -(e.originalEvent.deltaY) : e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta : -(e.originalEvent.detail);
            if (isFirst){
                s['x_cr'] = s['x']
                s['isAnim'] = true;
                SwipeAnim(ul, s_index, 200);
            } 
            s['x_cr'] += delta;

            if (m_mousewheel_timer > 0) clearTimeout(m_mousewheel_timer);
            m_mousewheel_timer = setTimeout(function(){
                s['x'] = s['x_cr'];
                s['x_cr'] = null;
                s['isAnim'] = false;
            }, 400);
        });
    
        var m_li = $(s).children('li');
        var m_figures = m_li.children('figure');
        if (m_figures.length === 0) m_figures = m_li.find('div>figure');
        for (j = 0; j < m_li.length; j++){
            var li = m_li[j];
            var s = m_figures[j];
            if ($(li).children('div').length === 0){
                var cfig = document.createElement('div');
                cfig.appendChild(s);
                li.appendChild(cfig);
            }
            s.setAttribute('index', j);
            s.addEventListener('click', function(){
                var index = Number(this.getAttribute('index'));
                var parents = $(this).parents('.slide-gallery');
                var s_index = Number(parents[0].getAttribute('index'));
                if (m_slides[s_index]['active'] === index){
                    var img = $(this).find('img')[0];
                    var url = img.getAttribute('src');
                    // data-linkに値が入ってるときは元の画像を表示させるように仕向けます
                    var datalink = img.getAttribute('data-link');
                    datalink = (datalink === null) ? '' : datalink;
                    if (datalink !== '') {
                        url = url.replace(/^(.*)(\-\d*x\d*)(\.\w*)$/, "$1$3");
                    }
                    window.open(url);
                } else {
                    m_slides[s_index]['active'] = index;
                    m_ActiveElement = MoveToActive(s_index);
                }
            });
        }
    }
    function GoButtonEvent(obj, inc){
        var parent;
        if ($(obj.parentElement).children('.slide-gallery-frame').length === 0){
            parent = $(obj).parents('.slide-gallery-frame')[0];
        } else {
            parent = obj;
        }
        var ul = $(parent).find('ul')[0];
        var ul_index = ul.getAttribute('index');
        var figures = $(ul).find('li>div>figure');
        var li_length = figures.length;
        var index = Number(m_slides[ul_index]['active']);
        m_ActiveElement = figures[index];
        index += inc;
        if (index >= 0 && index < li_length) {
            m_slides[ul_index]['active'] = index;
            m_ActiveElement = MoveToActive(ul_index);
        }
    }
    $('.slide-inner-button.left').on('click', function(){
        GoButtonEvent(this, -1);
    });
    $('.slide-inner-button.right').on('click', function(){
        GoButtonEvent(this, 1);
    });
    $(window).on('blur', function(){
        MoveUpdate();
    });
    // 過剰にイベントを送信しないようにするタイマー
    var m_resize_timer = 0;
    $(window).on('resize', function(){
        if (m_resize_timer > 0) clearTimeout(m_resize_timer);
        m_resize_timer = setTimeout(function(){
            MoveUpdate();
        }, 200);
    });
    $(window).on('load', 
        function(){
            MoveUpdate();
            MoveUpdate();
        }
    );
})();
