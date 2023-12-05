/**
 * Fades out an element
 *
 * @param {object} el - element that's being faded out
 */
function fadeOut(el) {
    el.style.opacity = 1;
    (function fade() {
        if ((el.style.opacity -= 0.1) <= 0) {
            el.style.display = 'none';
        } else {
            requestAnimationFrame(fade);
        }
    })();
}

/**
 * Fades in an element with an optional display setting
 *
 * @param {object} el - element that's being faded in
 * @param {string} display - display type
 */
function fadeIn(el, display) {
    el.style.opacity = 0;
    el.style.display = display || 'block';
    (function fade() {
        var val = parseFloat(el.style.opacity);
        if (!((val += 0.1) > 1)) {
            el.style.opacity = val;
            requestAnimationFrame(fade);
        }
    })();
}

(function () {
    initMegaMenu();
    // initPriorityNav();
    initResponsiveMenu();
    initMmenu();
    initMenuEdge();
    initStickyHeader();
    initSuperfish();
    initSideNav();
    initInPageNav();
    initScrollToTop();
    // initImageComparison();
    initResponsiveTable();
    initFlickity();
    // initCountUp();
    initResizeButtons();
    initVideoControl();
    initSumoSelect();
})();

function initSumoSelect() {
    const selectWithMultipleSelection = $('#vacancySearchForm select[multiple]');
    selectWithMultipleSelection.SumoSelect({search: true, searchText: 'Enter here.'});

    const selectWithSingleSelection = $('#vacancySearchForm select:not([multiple])');
    selectWithSingleSelection.SumoSelect();
}

function initStickyHeader() {
    const header = document.querySelector(".page-header-container");
    const banner = document.querySelector(".ntg-banner");
    if (!banner) {
        var stickyHeader = new StickyHeader(header);
    } else {
        var stickyHeader = new StickyHeader(header, banner);
    }
    stickyHeader.init();
}

function initMegaMenu() {
    ResponsiveHelper.addRange({
        '1200..': {
            on: function () {
                $('.ntg-main-nav__wrapper').accessibleMegaMenu('init');
                $('.ntg-main-nav__panel').css('display', 'block');
            },
            off: function () {
                $('.ntg-main-nav__wrapper').accessibleMegaMenu('destroy');
            },
        },
    });

    const header = document.querySelector('.page-header-container');
    const navLinks = document.querySelectorAll('.ntg-main-nav__link > a');
    const scrollSensor = 100;
    var openPanel = false;

    navLinks.forEach(function (link) {
        const config = {
            attributes: true
        };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                // listen for changes in the link's attributes
                if (mutation.type === "attributes") {
                    var scrollPosition = scrollY;
                    for (i = 0; i < navLinks.length; i++) {
                        if (navLinks[i].classList.contains('open')) {
                            header.classList.add('header-scroll');
                            openPanel = true;
                            break;
                        } else {
                            if (scrollPosition <= scrollSensor) {
                                header.classList.remove('header-scroll');
                            }
                            openPanel = false;
                        }
                    }
                }
            }
        }
        // initialise MutationObserver
        const observer = new MutationObserver(callback);
        observer.observe(link, config);
    });

    // custom sticky header functionality - refer to sticky header plugin
    var lastScrollTop = 0;
    const delta = 5;
    window.addEventListener('scroll', function () {
        var scrollTop = window.scrollY;
        var scrollUp = (lastScrollTop > scrollTop);
        // ensure scroll is more than delta
        if (Math.abs(lastScrollTop - scrollTop) <= delta) {
			return false;
        }
        if (scrollUp) {
            // don't remove compact header styling at the top of the page if a panel is open
            if (scrollTop <= scrollSensor) {
                if (!openPanel) {
                    header.classList.remove('header-scroll');
                }
            }
        } else {
            // hide header if scrolling down and no panels are open
            if (scrollTop > scrollSensor) {
                if (!openPanel) {
                    header.classList.add('header-hide');
                }
            }
        }
        lastScrollTop = scrollTop;
    });

    window.addEventListener('resize', function () {
        const breakpoint = 1200;
        var scrollPosition = scrollY;
        if (window.matchMedia(`(max-width: ${breakpoint}px)`)) {
            if (scrollPosition <= scrollSensor) {
                header.classList.remove('header-scroll');
            }
        }
        if (window.matchMedia(`(min-width: ${breakpoint}px)`)) {
            if (openPanel) {
                header.classList.add('header-scroll');
            }
        }
    });

    /*
     * detects if there is only one group of links in the columns section
     * of a panel and adds a class that spreads the links across the width
     * of the panel
    */
    var panels = document.querySelectorAll('.ntg-main-nav__panel');
    panels.forEach(function (panel) {
        var columns = panel.querySelector('.ntg-main-nav__panel-columns');
        if (!columns) {
            return false;
        }
        var children = columns.childElementCount;
        if (children <= 1) {
            panel.classList.add('one-group');
        }
    });
}


function initPriorityNav() {
    var mainNav = document.querySelector('.ntg-main-nav');
    if (!mainNav) {
        return false;
    }
    
    new PriorityNav('.ntg-main-nav');
}

function initResponsiveMenu() {
    var mainNav = document.getElementById('mainmenu');
    if( !mainNav) {
        return false;
    }

    responsivemenu.init({
        wrapper: document.querySelector('#mainmenu'),
    });
}

function initMmenu() {
    const mmenuWrapper = document.getElementById('mmenu-wrapper');
    if (!mmenuWrapper) {
        return false;
    }

    document.addEventListener("DOMContentLoaded", () => {
        const mmenu = new Mmenu('#mmenu-wrapper', {
            "offCanvas": {
                "position": "right-front"
            }
        });

        const API = mmenu.API;

        // closes the menu automatically if screen is resized above 992px
        window.addEventListener('resize', function () {
            if (window.matchMedia('(min-width: 992px)').matches) {
                API.close();
            }
        });
    });
}

// dynamically shifts main nav dropdown position based on window width
function initMenuEdge() {
    var links = document.querySelectorAll('.ntg-main-nav__links > li');

    if (!links) {
        return false
    }

    links.forEach(link => {
        var second = link.querySelector('ul > li > ul');
        var third = link.querySelector('ul > li > ul > li > ul');

        if ((second || third) && !link.classList.contains("more")) {
            link.addEventListener('mouseenter', function () {
                avoidEdge();
            });
            link.addEventListener('keydown', function () {
                avoidEdge();
            });
            link.addEventListener('touchstart', function () {
                avoidEdge();
            });
        }

        function avoidEdge() {
            var offset = offset(link);
            var left = offset.left;
            var width_1 = 300; // second level width
            var width_2 = 600; // third level width
            var wnWidth = window.innerWidth;

            var isSecondVisible = left + width_1 <= wnWidth;
            var isThirdVisible = left + width_2 <= wnWidth;

            if (!isThirdVisible) {
                link.classList.add("edge");
            } else {
                link.classList.remove("edge");
            }

            if (!isSecondVisible) {
                link.classList.add("all");
            } else {
                link.classList.remove("all");
            }

            function offset(elem) {
                var rect = elem.getBoundingClientRect();
                
                return {
                    left: rect.left + window.scrollX,
                }
            }
        }
    });
}

function initSuperfish() {
    $(document).ready(function () {
        $('ul.sf-menu').superfish({
            // options
            delay: 250,
            speed: 250,
            speedOut: 250,
            cssArrows: false
        });
    });
}

// dynamically add all h2 elements on the page into anchor list
function initInPageNav() {
    var inPageNav = document.getElementById('in-page-nav');
    if (!inPageNav) {
        return false;
    }

    var list = inPageNav.querySelector('ul');
    document.querySelectorAll('#content h2').forEach(function (element, index) {
        if (index === 0) {
            return false;
        }

        var heading = element;
        if (element.querySelector('a')) {
            element = element.querySelector('a');
            heading = element.parentElement;
        }
        
        list.insertAdjacentHTML(
            'beforeend',
            '<li><a href="#' +
                element.innerHTML
                    .replace(/&amp;/g, 'and')
                    .replace(/[^a-z0-9 ]/gi, '')
                    .replace(/\s/g, '-')
                    .toLowerCase() +
                '">' +
                element.innerHTML +
                '</a></li>'
        );
        element.setAttribute(
            'id',
            element.innerHTML
                .replace(/&amp;/g, 'and')
                .replace(/[^a-z0-9 ]/gi, '')
                .replace(/\s/g, '-')
                .toLowerCase()
        );
    });
}

// adds accordion functionality to nested items in the side navigation
function initSideNav() {
    var sideNavParents = document.querySelectorAll('.ntg-side-nav__collapser');
    if (!sideNavParents) {
        return false;
    }

    for (var i = 0; i < sideNavParents.length; i++) {
        sideNavParents[i].addEventListener('click', function (e) {
            e.preventDefault();

            var thisNext = this.parentElement.getElementsByClassName('collapse')[0];

            if (thisNext.classList.contains('show')) {
                thisNext.classList.remove('show');
                this.classList.add('collapsed');
            } else {
                thisNext.classList.add('show');
                this.classList.remove('collapsed');
            }
        });
    }
}

function initScrollToTop() {
    var backToTop = document.querySelector('.back-to-top');
    if (!backToTop) {
        return false;
    }

    var backToTopLink = backToTop.querySelector('.back-to-top button');
    var footer = document.querySelector('.ntg-footer');
    var isGoUpOn = false;
    var scrollHighSensor = 500;

    window.addEventListener('scroll', function () {
        buttonUpService(this);
        checkFooterPosition();
    });

    window.addEventListener('resize', function () {
        checkFooterPosition();
    });

    backToTopLink.addEventListener('click', function (e) {
        e.preventDefault();
        // workaround to ensure the focus is reset to the top of the page when using keyboard
        document.querySelector('header a').focus({ preventScroll: true });
        scroll({
            top: 0,
            left: 0,
            behavior: 'smooth',
        });
    });

    // checks the scroll position of the page and determines whether the back to top button should be visible
    function buttonUpService() {
        if (!isGoUpOn) {
            if (window.scrollY > scrollHighSensor) {
                isGoUpOn = true;
                fadeIn(backToTop);
            }
        } else {
            if (window.scrollY <= scrollHighSensor) {
                fadeOut(backToTop);
                isGoUpOn = false;
            }
        }
    }

    function checkFooterPosition() {
        var scrollBottom = document.body.clientHeight - document.documentElement.clientHeight - document.documentElement.scrollTop;
        var backToTopHeight = backToTop.offsetHeight;
        var backToTopOffset = parseFloat(getComputedStyle(backToTop).getPropertyValue('bottom'));
        if (scrollBottom < footer.offsetHeight - (backToTopHeight / 2) - backToTopOffset) {
            backToTop.style.marginBottom = footer.offsetHeight - scrollBottom - (backToTopHeight / 2) - backToTopOffset + 'px';
        } else {
            backToTop.style.marginBottom = 0;
        }
    }
}

function initImageComparison() {
    var imageComparison = document.querySelectorAll('.ntg-image-comparison__wrapper');
    if (!imageComparison) {
        return false;
    }

    imageComparison.forEach(function(element) {
        new Cocoen(element);
    });
}

function initResponsiveTable() {
    document.querySelectorAll('[class*="custom-table-"]').forEach(function (element) {
        responsiveCellHeaders(element);
        addTableAria(element);
    });
}

function initFlickity() {
    var carousels = document.querySelectorAll('.flickity-carousel');
    if (!carousels) {
        return false;
    }

    carousels.forEach(function (carousel) {
        var alignment = carousel.getAttribute('data-align');
        if (!alignment) {
            alignment = 'center';
        }

        var flkty = new Flickity(carousel, {
            // options
            cellAlign: alignment,
            pageDots: false
        });

        const cellElements = flkty.getCellElements();

        for (let i = 0; i < cellElements.length; i++) {
            const links = cellElements[i].querySelectorAll('a');

            if (links.length > 0) {
                links.forEach((link) => {
                    link.addEventListener("focus", (e) => {
                        flkty.select(i);
                    })
                });
            }
        }
    });
}

function toggleCarouselButton() {
    var carousels = document.querySelectorAll('.carousel');
    var paused = false;
    
    // filter out carousels that haven't been initialized
    var initializedCarousels = Array.prototype.filter.call(carousels, function(carousel) {
      return carousel.getAttribute('data-bs-interval') !== null || carousel.getAttribute('data-bs-interval') !== "false";
    });
    
    initializedCarousels.forEach(function(carousel) {
        let bootstrapCarousel = new bootstrap.Carousel(carousel);
        const toggleButton = carousel.querySelector('.toggleCarouselBtn');
        
        if (toggleButton) {
            let playPauseIcon = toggleButton.querySelector('i');
            toggleButton.addEventListener('click', function(e) {
                if (paused){
                    bootstrapCarousel.cycle();
                    playPauseIcon.classList.remove("fa-play");
                    playPauseIcon.classList.add("fa-pause");
                    paused = false;
                }
                else {
                    bootstrapCarousel.pause();
                    playPauseIcon.classList.remove("fa-pause");
                    playPauseIcon.classList.add("fa-play");
                    paused = true;
                }
            })
        }
        
    })
}

function initCountUp() {
    var values = document.querySelectorAll('.count-up');

    values.forEach(function (value) {
        var target = value.innerHTML.replace(/[^\d.]/g, '');

        // default options
        var decimalPlaces = 0;
        var prefix = '';
        var suffix = '';

        // check for decimal places
        if (target.includes('.')) {
            decimalPlaces = target.split('.')[1].length;
        }

        // check for prefix
        if (value.hasAttribute('data-prefix')) {
            prefix = value.getAttribute('data-prefix');
        }

        // check for suffix
        if (value.hasAttribute('data-suffix')) {
            suffix = value.getAttribute('data-suffix');
        }

        const countUp = new CountUp(value, target, {
            decimalPlaces: decimalPlaces,
            duration: 3,
            prefix: prefix,
            suffix: suffix,
            enableScrollSpy: true,
            scrollSpyOnce: 1
        });
    });
}

// resizes any buttons on a page as small buttons below a certain breakpoint
function initResizeButtons() {
    $('.btn:not(.btn-sm)').each(function () {
        var btn = $(this);
        const breakpoint = 974;

        handleSizing(btn, breakpoint);

        $(window).on('resize', function () {
            handleSizing(btn, breakpoint);
        });
    });

    function handleSizing(e, breakpoint) {
        if ($(window).width() <= breakpoint) {
            e.addClass('btn-sm');
        } else {
            e.removeClass('btn-sm');
        }
    }
}

function initVideoControl() {
    var btns = document.querySelectorAll('.video-control');

    btns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            handlePlayPause(btn);
        });
    });

    function handlePlayPause(e) {
        var videoID = e.getAttribute('data-video');
        if (videoID) {
            var video = document.getElementById(videoID);
            if (!video) {
                return false;
            }
        } else {
            return false;
        }
        
        if (e.classList.contains('pause')) {
            // switch icon
            e.classList.remove('pause');
            e.classList.add('play');

            // pause video
            video.pause();
        } else if (e.classList.contains('play')) {
            // switch icon
            e.classList.remove('play');
            e.classList.add('pause');

            // play video
            video.play();
        }
    }
}