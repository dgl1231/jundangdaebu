(function (window, document) {
    'use strict';

    const $toggles = document.querySelectorAll('.toggle'); // NodeList
    const $toggleBtn = document.getElementById('toggle-btn');

    $toggleBtn.addEventListener('click', function () {
        toggleElements();
    });

    window.addEventListener('resize', function () {
        if (window.innerWidth > 1024) {
            offElements();

        }
    });

    function toggleElements() {
        [].forEach.call($toggles, function (toggle) {
            toggle.classList.toggle('on');
        });
    }

    function offElements() {
        [].forEach.call($toggles, function (toggle) {
            toggle.classList.remove('on');
        });
    }
})(window, document)


$(document).ready(function () {
    $(".title").lettering();
    $(".button").lettering();
});

$(document).ready(function () {
    animation();
}, 1000);

$('.button').click(function () {
    animation();
});

function animation() {
    var title1 = new TimelineMax();
    title1.to(".button", 0, {
        visibility: 'hidden',
        opacity: 0
    })
    title1.staggerFromTo(".title span", 0.5, {
        ease: Back.easeOut.config(1.7),
        opacity: 0,
        bottom: -80
    }, {
        ease: Back.easeOut.config(1.7),
        opacity: 1,
        bottom: 0
    }, 0.05);
    title1.to(".button", 0.2, {
        visibility: 'visible',
        opacity: 1
    })
}