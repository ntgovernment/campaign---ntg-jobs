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

let mapTabCarousel;
let jobCarouselMenu;
let currentWindowWidth = $(window).width(), currentWindowHeight = $(window).height();

(function () {
    
    let jobsMenuInit = false;

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
    initInteractiveMap();
    initTabsAsAccordions();
    initSlidingMenu();
    initJobsSlidingMenu();
    initLinkCheck();

    window.addEventListener('resize', debounce(function(e){
        initSlidingMenu(e);
        initJobsSlidingMenu(e);
    }));

})();

//debounce for resize
function debounce(func){
    var timer;
    return function(event){
      if(timer) clearTimeout(timer);
      timer = setTimeout(func,400,event);
    };
  }

//Helper function
function getContainerWidthWithPadding(container) {
    const containerStyles = window.getComputedStyle(container);
    const containerPaddingLeft = parseFloat(containerStyles.paddingLeft);
    const containerPaddingRight = parseFloat(containerStyles.paddingRight);

    const containerWidthWithPadding = container.clientWidth - containerPaddingLeft - containerPaddingRight;

    return containerWidthWithPadding;
}

function initJobsSlidingMenu() {
    const jobSubsiteMenu = document.getElementById("jobCarouselMenu");
    const container = document.querySelector(".ntg-jobs-subsite__menu .container");

    if(jobSubsiteMenu) {
        const isOverflowing = jobSubsiteMenu.scrollWidth > getContainerWidthWithPadding(container);

        if(isOverflowing) {
            if(!jobCarouselMenu) {
                jobCarouselMenu = new Flickity(jobSubsiteMenu, {
                    cellAlign: "left",
                    percentPosition: false,
                    pageDots: false,
                    contain: false
                });    
            }
        }
    }
}

function initSlidingMenu() {
    const mq = window.matchMedia( "(max-width: 993px)" );
    const mapTabs = document.getElementById("map-tab");

    if(mapTabs) {
        if(mq.matches) {
            if(!mapTabCarousel) {
                mapTabCarousel = new Flickity(mapTabs, {
                    cellAlign: "left",
                    percentPosition: false,
                    pageDots: false,
                    contain: true
                });
    
                mapTabCarousel.on('change', (index) => {
                    mapTabCarousel.cells[index].element.querySelector("button").dispatchEvent(new Event("click"));
                });
    
                mapTabCarousel.select(0);
            }
        } else {
            mapTabCarousel && mapTabCarousel.destroy();
            mapTabCarousel = undefined;
        }
    }

}

function initTabsAsAccordions() {
    // Screen-width breakpoint
    const tc_breakpoint = 992;

    const collapseElementList = $('.vertab-content .panel-collapse.collapse');
    const collapseList = collapseElementList.map((_, collapseEl) => new bootstrap.Collapse(collapseEl, { toggle: false }));

    // Switch tabs and update panels classes - Adjust container height
    $(".vertab-container .vertab-menu .list-group a").click(function (e) {
        var index = $(this).index();
        var container = $(this).parents('.vertab-container');
        var accordion = container.find('.vertab-accordion');
        var contents = accordion.find(".vertab-content");

        e.preventDefault();

        $(this).addClass("active");
        $(this).siblings('a.active').removeClass("active");

        contents.removeClass("active");
        contents.eq(index).addClass("active");
        container.data('current', index);
    });

    // Collapse accordion panels (except the one the user just opened) and add "active" class to the panel heading
    $('.vertab-accordion').on('show.bs.collapse', '.collapse', function () {
        var accordion, container, current, index;

        accordion = $(this).parents('.vertab-accordion');
        container = accordion.parents('.vertab-container');

        collapseList.each((_, collapse) => {
            if (collapse._element.classList.contains("show")) {
                collapse.hide();
            }
        });

        $(this).siblings('.panel-heading').addClass('active');

        current = accordion.find('.panel-heading.active');
        index = accordion.find('.panel-heading').index(current);

        container.data('current', index);
    });

    // Remove "active" class from heading when collapsing the current panel
    $('.vertab-accordion .panel-collapse').on('hide.bs.collapse', function () {
        $(this).siblings('.panel-heading').removeClass('active');
    });

    // Manage resize / rotation events
    $(window).on("resize", debounce(function () {
        if($(window).width() != currentWindowWidth || $(window).height() != currentWindowHeight){
            resizeVerticalAccordions();
            currentWindowWidth = $(window).width(), currentWindowHeight = $(window).height();
        }
    }));

    // Scroll accordion to show the current panel
    $(".vertab-accordion .panel-heading").click(function () {
        var el = this;
        setTimeout(function () {
            $("html, body").animate({ scrollTop: $(el).offset().top - 10 }, 200);
        }, 200);

        return true;
    });

    // Initial Panels setup
    resizeVerticalAccordions();

    function resizeVerticalAccordions() {
        $('.vertab-container').each(function () {
            var index, menu, contents;
            var container = $(this);

            // Setup current tab/panel (default to first tab/panel)
            index = container.data('current');

            if (index === undefined) {
                container.data('index', 0);
                index = 0;
            }

            // If using a desktop-size screen, manage as tabbed panels
            if ($(window).width() > tc_breakpoint) {
                collapseList.each((_, collapse) => collapse.show());

                // Reset panels heights (Bootstrap's accordions sets heights to zero)
                container.find('.panel-collapse.collapse').css('height', 'auto');

                // Clean tab-navigation styles
                menu = container.find('.vertab-menu .list-group a');
                menu.removeClass("active");

                // Clean tab-panels styles
                contents = container.find(".vertab-accordion .vertab-content");
                contents.removeClass("active");

                // Update tab navigation and panels styles
                menu.eq(index).addClass('active');
                contents.eq(index).addClass("active");
            } else { 
                collapseList.each((_, collapse) => collapse.hide());

                container.find('.vertab-content .panel-heading').removeClass('active');

                setTimeout(function () {
                    container.find('.vertab-content .panel-heading').eq(index).addClass("active");
                    collapseList[index].show();
                }, 1000);
            }
        });
    }
}

function initInteractiveMap() {
    const interactiveMapWrapper = document.getElementById("interactive-map");
    const allGroupsNT = interactiveMapWrapper && interactiveMapWrapper.querySelectorAll("#NT g:not(.exclude)");
    const mapTabs = document.getElementById("map-tab");

    if(interactiveMapWrapper && mapTabs && allGroupsNT) {
        const navLinks = document.querySelectorAll(".nav-link");

        //Add Listener to navLinks to toggle map
        if(navLinks.length > 0) {
            navLinks.forEach(button => {
                button.addEventListener("click", toggleMapRegion);
                button.addEventListener("shown.bs.tab", toggleMapRegion);
            })
        }

        //Add listener to map
        if(interactiveMapWrapper) {
            const ntRegion = interactiveMapWrapper.querySelector("#NT");

            if(ntRegion) {
                ntRegion.addEventListener("click", e => {
                    const closestGroup = e.target.closest("g");
                    const isExcluded = closestGroup && closestGroup.classList.contains("exclude");

                    if(closestGroup && !isExcluded) {
                        const closestGroupId = closestGroup.id;

                        navLinks && navLinks.forEach(button => {
                            const dataMapRegion = button.getAttribute("data-map-region");

                            if(closestGroupId == dataMapRegion) {
                                button.dispatchEvent(new Event("click"));
                            }
                        })
                    }   
                })
            }
        }

        function toggleMapRegion(e) {
            const dataMapRegion = e.target.getAttribute("data-map-region");

            if(dataMapRegion) {
                allGroupsNT.forEach(region => {
                    if(region.id == dataMapRegion) {
                        //Fill White if the tab references to the region
                        region.querySelectorAll("path").forEach(path=> {
                            path.setAttribute("fill", "#FFFFFF");
                        })
                    } else {
                        region.querySelectorAll("path").forEach(path=> {
                            path.setAttribute("fill", "#6E8094");
                        })
                    }
                })
            }
        }
    }
}

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
    const pageHeader = document.getElementsByClassName("page-header-container")[0];

    if (!mmenuWrapper) {
        return false;
    }

    if (pageHeader.getAttribute("data-bs-theme")) {
        mmenuWrapper.setAttribute("data-bs-theme", pageHeader.getAttribute("data-bs-theme"))
    }

    document.addEventListener("DOMContentLoaded", () => {
        let btnContent = ``;

        if(mmenuWrapper.getAttribute("data-btn-link") && mmenuWrapper.getAttribute("data-btn-text")) {
            btnContent = `<a class="btn btn-chevron-right btn-default" href="${mmenuWrapper.getAttribute("data-btn-link")}">${mmenuWrapper.getAttribute("data-btn-text")}</a>`
        }

        const mmenu = new Mmenu('#mmenu-wrapper', {
            "offCanvas": {
                "position": "right-front"
            },
            "navbars": [{
               use: true,
               position: "bottom",
               content: btnContent,
            }]
        });

        const API = mmenu.API;

        // closes the menu automatically if screen is resized above 992px
        window.addEventListener('resize', function () {
            if (window.matchMedia('(min-width: 992px)').matches) {
                API.close();
            }
        });
        
        // inserts close button to navbars
        var panels = document.querySelector('.mm-panels');
        var close = document.createElement('a');
        close.setAttribute('class', "mm-btn mm-btn--close-wrapper mm-navbar__btn");
        close.setAttribute('aria-label', "Close menu");
        close.setAttribute('href', "#wrapper");
        close.innerHTML = `<div class="mm-btn--close">
                                <span class="top-line" aria-hidden="true"></span>
                                <span class="bot-line" aria-hidden="true"></span>
                            </div>
                            <span class="mm-btn--close__text">Close</span>`;
        panels.prepend(close);
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
    document.querySelectorAll('#content h2:not(.excludeAnchorList h2)').forEach(function (element, index) {
        var heading = element;
        if (element.querySelector('a')) {
            element = element.querySelector('a');
            heading = element.parentElement;
        }
        
        list.insertAdjacentHTML(
            'beforeend',
            '<li><a href="#' +
                element.innerText
                    .replace(/&amp;/g, 'and')
                    .replace(/[^a-z0-9 ]/gi, '')
                    .replace(/\s/g, '-')
                    .toLowerCase() +
                '">' +
                element.innerText +
                '</a></li>'
        );
        element.setAttribute(
            'id',
            element.innerText
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
            pageDots: false,
            lazyLoad: 2,
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

function initLinkCheck() {
    var links = document.querySelectorAll('#content a');
    if(!links) {
        return false;
    }
    
    links.forEach(function(link) {
        if( location.hostname === link.hostname || !link.hostname.length ) {
            return false;
        } else {
            if(!link.querySelector('[class*="fa-external-link"]') && !link.querySelector('img')) {
                link.insertAdjacentHTML('beforeend', '<i class="far fa-external-link mx-1" aria-hidden="true"></i>');
            }
            link.setAttribute('rel', 'noopener');
            link.setAttribute('title', 'Opens in a new window');
            link.setAttribute('target', '_blank');
        }
    });
}