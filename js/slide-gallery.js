var slide_gallery = new (function(){
    // 過剰にイベントを送信しないようにするタイマー
    var timer = 0;
    var fps = 30;
    var flameTime = 1000 / fps;

    // activeクラスを付与するための関数
    function SetActive(activeElement, parentElement = null) {
        if (parentElement == null)
            parentElement = $(activeElement).parents('ul')[0];
        var ul_index = Number(parentElement.getAttribute('index'));
        var figures = $(parentElement).find('figure');
        figures.removeClass('active');
        figures.attr({tabindex: -1});
        $(activeElement).addClass('active');
        $(activeElement).attr({tabindex: 0});
        SetMaxMin(ul_index);
    }

    function SetMaxMin(ul_index){
        s = m_slides[ul_index];
        ul = s['ul']
        var lis = $(ul).find('li');
        var activeElement = lis[s['active']];
        s['min'] = (parent.offsetWidth / 2) - (activeElement.offsetWidth + activeElement.offsetLeft);
        s['max'] = (parent.offsetWidth / 2) - (activeElement.offsetLeft);
    }

    function MoveToActive(ul_index, activeElement = null, time = 400){
        s = m_slides[ul_index];
        parent = s['ul']
        var figures = $(parent).find('figure');
        if (activeElement == null)
            activeElement = figures[s['active']];
        SetActive(activeElement, parent);
        var x_px = (parent.offsetWidth / 2)
             - (activeElement.offsetWidth / 2 + activeElement.offsetLeft);
        $(parent).css({
            '-webkit-transform':'translate3d(' + x_px + 'px,0,0)', 
            '-webkit-transition':'-webkit-transform ' + time + 'ms cubic-bezier(0,0,0.25,1)'
        });
        s['x'] = x_px;
        return activeElement;
    }
    function MoveUpdate(){
        for (i = 0; i < m_slides.length; i++){
            MoveToActive(i);
        }
    }
    m_slides = [];
    var m_slide = $('.slide-gallery');
    m_slide.removeClass('wp-block-gallery');
    for (i = 0; i < m_slide.length; i++){
        var s = m_slide[i];
        s.setAttribute('index', i);
        s.insertAdjacentHTML('afterend', document.createElement('div').outerHTML);

        var m_div = $(m_slide[i]).parent('.slide-gallery-navi');
        if (m_div.length === 0){
            m_div = s.nextElementSibling;
            m_div.setAttribute('class', 'slide-gallery-navi');
            m_div.appendChild(m_slide[i]);
        } else {
            m_div = m_div[0];
        }
            $(m_div).addClass('wp-block-image');
        m_slides.push({ul: m_div.firstElementChild, active: 0, x: 0,
            lastEvent: null, isAnim: false, x_cr: null});
        function SwipeAnim(ul, index){
            var s = m_slides[index];
            if (!s['isAnim']) {
                MoveToActive(index).focus();
                
                return;
            }
            var figures = (ul).find('figure');
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
                '-webkit-transition':'-webkit-transform 40ms cubic-bezier(0,0,0.25,1)'
            });
            setTimeout(() => {
                SwipeAnim(ul, index);
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
                    SwipeAnim(ul, s_index);
                } 
            } else {
                s['x'] = s['x_cr'];
                s['x_cr'] = null;
                s['isAnim'] = false;                
            }
        });
            
        var m_li = $(s).children('li');
        var m_figures = m_li.children('figure');
    
        for (j = 0; j < m_figures.length; j++){
            var s = m_figures[j];
            s.setAttribute('index', j);
            s.addEventListener('click', function(){
                var index = Number(this.getAttribute('index'));
                var parents = $(this).parents('.slide-gallery');
                var s_index = Number(parents[0].getAttribute('index'));
                m_slides[s_index]['active'] = index;
                MoveToActive(s_index, this).focus();
            });
            $(s).keydown(function(e){
                var index = Number(this.getAttribute('index'));
                var parents = $(this).parents('.slide-gallery');
                var li = $(parents[0]).children('li');
                var s_index = parents[0].getAttribute('index');
                var keyEvent = e.originalEvent;
                var toIndex = -1
                switch (keyEvent.keyCode){
                    case 37: // ←
                    case 65: // a
                        toIndex = index - 1;
                        break;
                    case 39: // →
                    case 68: // d
                        toIndex = index + 1;
                        break;
                }
                if (toIndex >= 0 && toIndex < li.length)
                    m_slides[s_index]['active'] = toIndex;
                MoveToActive(s_index).focus();
            })
        }
    }
    $(window).on('resize', function(){
        if (timer > 0) clearTimeout(timer);
        timer = setTimeout(function(){
            MoveUpdate()
        }, 200);
    });
    $(window).on('load', 
        function(){
            MoveUpdate();
            MoveUpdate();
        }
    );
})();
