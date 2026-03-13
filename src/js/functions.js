let mapTabCarousel;
let tabContentCarousel;
let jobCarouselMenu;
let currentWindowWidth = $(window).width(),
    currentWindowHeight = $(window).height();

(function () {
    let jobsMenuInit = false;

    initMegaMenu();
    initSubNav();
    initPriorityNav();
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
    initToNextSection();
    initRedirectPopup();
    initSubMenu();
    initStepProgress();
    initFlipCards();
    initShowHideText();

    window.addEventListener(
        'resize',
        debounce(function (e) {
            initSlidingMenu(e);
            initJobsSlidingMenu(e);
        })
    );
})();

//debounce for resize
function debounce(func) {
    var timer;
    return function (event) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(func, 400, event);
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
    const jobSubsiteMenu = document.getElementById('jobCarouselMenu');
    const container = document.querySelector('.ntg-jobs-subsite__menu .container');

    if (jobSubsiteMenu) {
        const isOverflowing = jobSubsiteMenu.scrollWidth > getContainerWidthWithPadding(container);

        if (isOverflowing) {
            if (!jobCarouselMenu) {
                jobCarouselMenu = new Flickity(jobSubsiteMenu, {
                    cellAlign: 'left',
                    percentPosition: false,
                    pageDots: false,
                    contain: false,
                });

                // set active link as selected cell
                const carousel = document.getElementById('jobCarouselMenu');
                const cells = carousel.querySelectorAll('.nav-cell');
                const cellsArr = Array.from(cells);

                for (let i = 0; i < cellsArr.length; i++) {
                    var cell = cellsArr[i];
                    if (cell.querySelector('a.active')) {
                        jobCarouselMenu.select(i, false, true);
                    }
                }
            }
        }
    }
}

function initSlidingMenu() {
    const mq = window.matchMedia('(max-width: 993px)');
    const mapTabs = document.getElementById('map-tab');
    const tabContentTabsGroup = document.querySelectorAll('.nav-tabs');

    if (mapTabs) {
        if (mq.matches) {
            if (!mapTabCarousel) {
                mapTabCarousel = new Flickity(mapTabs, {
                    cellAlign: 'left',
                    percentPosition: false,
                    pageDots: false,
                    contain: true,
                });

                mapTabCarousel.on('change', (index) => {
                    mapTabCarousel.cells[index].element.querySelector('button').dispatchEvent(new Event('click'));
                });

                mapTabCarousel.select(0);
            }
        } else {
            mapTabCarousel && mapTabCarousel.destroy();
            mapTabCarousel = undefined;
        }
    }

    if (tabContentTabsGroup) {
        tabContentTabsGroup.forEach((tabContentTabs) => {
            if (mq.matches) {
                if (!tabContentCarousel) {
                    tabContentCarousel = new Flickity(tabContentTabs, {
                        cellAlign: 'left',
                        percentPosition: false,
                        pageDots: false,
                        contain: true,
                    });

                    tabContentCarousel.on('change', (index) => {
                        tabContentCarousel.cells[index].element.querySelector('button').dispatchEvent(new Event('click'));
                    });

                    tabContentCarousel.select(0);
                }
            } else {
                tabContentCarousel && tabContentCarousel.destroy();
                tabContentCarousel = undefined;
            }
        });
        
    }
}

function initTabsAsAccordions() {
    // Screen-width breakpoint
    const tc_breakpoint = 992;

    const collapseElementList = $('.vertab-content .panel-collapse.collapse');
    const collapseList = collapseElementList.map((_, collapseEl) => new bootstrap.Collapse(collapseEl, { toggle: false }));

    // Switch tabs and update panels classes - Adjust container height
    $('.vertab-container .vertab-menu .list-group a').click(function (e) {
        var index = $(this).index();
        var container = $(this).parents('.vertab-container');
        var accordion = container.find('.vertab-accordion');
        var contents = accordion.find('.vertab-content');

        e.preventDefault();

        $(this).addClass('active');
        $(this).siblings('a.active').removeClass('active');

        contents.removeClass('active');
        contents.eq(index).addClass('active');
        container.data('current', index);
    });

    // Collapse accordion panels (except the one the user just opened) and add "active" class to the panel heading
    $('.vertab-accordion').on('show.bs.collapse', '.collapse', function () {
        var accordion, container, current, index;

        accordion = $(this).parents('.vertab-accordion');
        container = accordion.parents('.vertab-container');

        collapseList.each((_, collapse) => {
            if (collapse._element.classList.contains('show')) {
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
    $(window).on(
        'resize',
        debounce(function () {
            if ($(window).width() != currentWindowWidth || $(window).height() != currentWindowHeight) {
                resizeVerticalAccordions();
                (currentWindowWidth = $(window).width()), (currentWindowHeight = $(window).height());
            }
        })
    );

    // Scroll accordion to show the current panel
    $('.vertab-accordion .panel-heading').click(function () {
        var el = this;
        setTimeout(function () {
            $('html, body').animate({ scrollTop: $(el).offset().top - 10 }, 200);
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
                menu.removeClass('active');

                // Clean tab-panels styles
                contents = container.find('.vertab-accordion .vertab-content');
                contents.removeClass('active');

                // Update tab navigation and panels styles
                menu.eq(index).addClass('active');
                contents.eq(index).addClass('active');
            } else {
                collapseList.each((_, collapse) => collapse.hide());

                container.find('.vertab-content .panel-heading').removeClass('active');

                setTimeout(function () {
                    container.find('.vertab-content .panel-heading').eq(index).addClass('active');
                    collapseList[index].show();
                }, 1000);
            }
        });
    }
}

function initInteractiveMap() {
    const interactiveMapWrapper = document.getElementById('interactive-map');
    const allGroupsNT = interactiveMapWrapper && interactiveMapWrapper.querySelectorAll('#NT g:not(.exclude)');
    const mapTabs = document.getElementById('map-tab');

    if (interactiveMapWrapper && mapTabs && allGroupsNT) {
        const navLinks = document.querySelectorAll('.nav-link');

        //Add Listener to navLinks to toggle map
        if (navLinks.length > 0) {
            navLinks.forEach((button) => {
                button.addEventListener('click', toggleMapRegion);
                button.addEventListener('shown.bs.tab', toggleMapRegion);
            });
        }

        //Add listener to map
        if (interactiveMapWrapper) {
            const ntRegion = interactiveMapWrapper.querySelector('#NT');

            if (ntRegion) {
                ntRegion.addEventListener('click', (e) => {
                    const closestGroup = e.target.closest('g');
                    const isExcluded = closestGroup && closestGroup.classList.contains('exclude');

                    if (closestGroup && !isExcluded) {
                        const closestGroupId = closestGroup.id;

                        navLinks &&
                            navLinks.forEach((button) => {
                                const dataMapRegion = button.getAttribute('data-map-region');

                                if (closestGroupId == dataMapRegion) {
                                    button.dispatchEvent(new Event('click'));
                                }
                            });
                    }
                });
            }
        }

        function toggleMapRegion(e) {
            const dataMapRegion = e.target.getAttribute('data-map-region');

            if (dataMapRegion) {
                allGroupsNT.forEach((region) => {
                    if (region.id == dataMapRegion) {
                        region.classList.add('active');
                        region.querySelectorAll('path:not(.exclude):not(.label)').forEach((path) => {
                            path.setAttribute('fill', '#FFFFFF');
                        });
                    } else {
                        region.classList.remove('active');
                        region.querySelectorAll('path:not(.exclude):not(.label)').forEach((path) => {
                            path.setAttribute('fill', '#6E8094');
                        });
                    }
                });
            }
        }
    }
}

function initSumoSelect() {
    const selectWithMultipleSelection = $('#vacancySearchForm select[multiple]');
    selectWithMultipleSelection.SumoSelect({ search: true, searchText: 'Enter here.' });

    const selectWithSingleSelection = $('#vacancySearchForm select:not([multiple])');
    selectWithSingleSelection.SumoSelect();
}

function initStickyHeader() {
    const header = document.querySelector('.page-header-container');
    const banner = document.querySelector('.ntg-banner');
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
            attributes: true,
        };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                // listen for changes in the link's attributes
                if (mutation.type === 'attributes') {
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
        };
        // initialise MutationObserver
        const observer = new MutationObserver(callback);
        observer.observe(link, config);
    });

    // custom sticky header functionality - refer to sticky header plugin
    var lastScrollTop = 0;
    const delta = 5;
    window.addEventListener('scroll', function () {
        var scrollTop = window.scrollY;
        var scrollUp = lastScrollTop > scrollTop;
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

function initSubNav() {
    const subNav = document.querySelector('.ntg-sub-nav');
    if (!subNav) {
        return false;
    }

    const header = document.querySelector('.page-header-container');
    const links = document.querySelectorAll('.ntg-sub-nav__links > li');
    const scrollSensor = 100;

    links.forEach((link) => {
        const config = {
            attributes: true,
        };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                // listen for changes in the link's attributes
                if (mutation.type === 'attributes') {
                    for (i = 0; i < links.length; i++) {
                        if (links[i].classList.contains('sfHover')) {
                            header.classList.add('header-scroll');
                            break;
                        } else {
                            var scrollPosition = scrollY;
                            if (scrollPosition <= scrollSensor) {
                                header.classList.remove('header-scroll');
                            }
                        }
                    }
                }
            }
        };
        // initialise MutationObserver
        const observer = new MutationObserver(callback);
        observer.observe(link, config);
    });

    window.addEventListener('scroll', function () {
        var scrollPosition = scrollY;
        for (i = 0; i < links.length; i++) {
            if (scrollPosition <= scrollSensor && links[i].classList.contains('sfHover')) {
                header.classList.add('header-scroll');
                break;
            }
        }
    });

    document.addEventListener('DOMContentLoaded', function () {
        const more = document.querySelector('.ntg-sub-nav__links .more');

        const config = {
            attributes: true,
        };
        const callback = (mutationList, observer) => {
            for (const mutation of mutationList) {
                // listen for changes in the link's attributes
                if (mutation.type === 'attributes') {
                    if (more.classList.contains('sfHover')) {
                        header.classList.add('header-scroll');
                    } else {
                        var scrollPosition = scrollY;
                        if (scrollPosition <= scrollSensor) {
                            header.classList.remove('header-scroll');
                        }
                    }
                }
            }
        };
        // initialise MutationObserver
        const observer = new MutationObserver(callback);
        observer.observe(more, config);

        window.addEventListener('scroll', function () {
            var scrollPosition = scrollY;
            if (scrollPosition <= scrollSensor && more.classList.contains('sfHover')) {
                header.classList.add('header-scroll');
            }
        });
    });
}

function initPriorityNav() {
    var mainNav = document.querySelector('.ntg-sub-nav');
    if (!mainNav) {
        return false;
    }

    new PriorityNav('.ntg-sub-nav');
}

function initResponsiveMenu() {
    var mainNav = document.getElementById('mainmenu');
    if (!mainNav) {
        return false;
    }
    var subNav = document.getElementById('subnav');
    if (!subNav) {
        return false;
    }
    var subMenu = document.getElementById('submenu');
    if (!subMenu) {
        return false;
    }

    responsivemenu.init({
        wrapper: mainNav,
    });
    responsivemenu.init({
        wrapper: subNav,
    });
    responsivemenu.init({
        wrapper: subMenu,
    });
}

function initMmenu() {
    const mmenuWrapper = document.getElementById('mmenu-wrapper');
    const pageHeader = document.getElementsByClassName('page-header-container')[0];

    if (!mmenuWrapper) {
        return false;
    }

    if (pageHeader.getAttribute('data-bs-theme')) {
        mmenuWrapper.setAttribute('data-bs-theme', pageHeader.getAttribute('data-bs-theme'));
    }

    document.addEventListener('DOMContentLoaded', () => {
        let btnContent = ``;

        if (mmenuWrapper.getAttribute('data-btn-link') && mmenuWrapper.getAttribute('data-btn-text')) {
            btnContent = `<a class="btn btn-chevron-right btn-default" href="${mmenuWrapper.getAttribute('data-btn-link')}">${mmenuWrapper.getAttribute('data-btn-text')}</a>`;
        }

        const mmenu = new Mmenu('#mmenu-wrapper', {
            offCanvas: {
                position: 'right-front',
            },
            navbars: [
                {
                    use: true,
                    position: 'bottom',
                    content: btnContent,
                },
            ],
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
        close.setAttribute('class', 'mm-btn mm-btn--close-wrapper mm-navbar__btn');
        close.setAttribute('aria-label', 'Close menu');
        close.setAttribute('href', '#wrapper');
        close.innerHTML = `<div class="mm-btn--close">
                                <span class="top-line" aria-hidden="true"></span>
                                <span class="bot-line" aria-hidden="true"></span>
                            </div>
                            <span class="mm-btn--close__text">Close</span>`;
        panels.prepend(close);

        // inserts static links on first panel
        if (mmenuWrapper.getAttribute('data-link-urls') && mmenuWrapper.getAttribute('data-link-texts')) {
            var linkUrls = mmenuWrapper.getAttribute('data-link-urls').split(',');
            var linkTexts = mmenuWrapper.getAttribute('data-link-texts').split(',');

            var panelOne = document.getElementById('mm-1');
            var staticLinks = document.createElement('div');
            staticLinks.setAttribute('class', 'mm-static-links');
            var linkContents = document.createElement('ul');

            if (linkUrls.length == linkTexts.length) {
                for (let i = 0; i < linkUrls.length; i++) {
                    var url = linkUrls[i];
                    var text = linkTexts[i];
                    var item = document.createElement('li');
                    item.innerHTML = `<a href="${url}">${text}</a>`;
                    linkContents.append(item);
                }
            }

            staticLinks.append(linkContents);
            panelOne.append(staticLinks);

            mmenuWrapper.removeAttribute('data-link-urls');
            mmenuWrapper.removeAttribute('data-link-texts');
        }
    });
}

// dynamically shifts main nav dropdown position based on window width
function initMenuEdge() {
    var subNav = document.querySelectorAll('.ntg-sub-nav__links > li');
    if (!subNav) {
        return false;
    }
    var subMenu = document.querySelectorAll('.ntg-sub-menu__links > li');
    if (!subMenu) {
        return false;
    }

    handleDropdownFlow(subNav);
    handleDropdownFlow(subMenu);

    function handleDropdownFlow(links) {
        links.forEach((link) => {
            var second = link.querySelector('ul > li > ul');
            var third = link.querySelector('ul > li > ul > li > ul');

            if ((second || third) && !link.classList.contains('more')) {
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
                    link.classList.add('edge');
                } else {
                    link.classList.remove('edge');
                }

                if (!isSecondVisible) {
                    link.classList.add('all');
                } else {
                    link.classList.remove('all');
                }

                function offset(elem) {
                    var rect = elem.getBoundingClientRect();

                    return {
                        left: rect.left + window.scrollX,
                    };
                }
            }
        });
    }
}

function initSuperfish() {
    $(document).ready(function () {
        $('ul.sf-menu').superfish({
            // options
            delay: 200,
            speed: 200,
            speedOut: 200,
            cssArrows: false,
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
    var headings = document.querySelectorAll('#content h2:not(.excludeAnchorList h2)');
    if (!headings) {
        return false;
    }
    headings.forEach(function (element, index) {
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

    // applies active class to selected anchor list element
    var firstListItem = inPageNav.querySelector('ul li:first-of-type');
    if (!firstListItem) {
        return false;
    }
    firstListItem.classList.add('active');
    var indicator = inPageNav.querySelector('span');
    var listItems = inPageNav.querySelectorAll('ul li');
    if (!listItems) {
        return false;
    }
    listItems.forEach(function (item) {
        item.addEventListener('click', function () {
            inPageNav.querySelector('.active').removeAttribute('class');
            item.classList.add('active');
            var top = item.offsetTop;
            indicator.style.top = top + 'px';
        });
    });
}

// adds accordion functionality to nested items in the side navigation
function initSideNav() {
    // var sideNavParents = document.querySelectorAll('.ntg-side-nav__collapser');
    // if (!sideNavParents) {
    //     return false;
    // }

    // for (var i = 0; i < sideNavParents.length; i++) {
    //     sideNavParents[i].addEventListener('click', function (e) {
    //         e.preventDefault();

    //         var thisNext = this.parentElement.getElementsByClassName('collapse')[0];

    //         if (thisNext.classList.contains('show')) {
    //             thisNext.classList.remove('show');
    //             this.classList.add('collapsed');
    //         } else {
    //             thisNext.classList.add('show');
    //             this.classList.remove('collapsed');
    //         }
    //     });
    // }

    // prevents collapse event from firing multiple times due to nested collapse elements
    $(document).on('show.bs.collapse hide.bs.collapse', '.collapse', function (e) {
        e.stopPropagation();
    });
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
        if (scrollBottom < footer.offsetHeight - backToTopHeight / 2 - backToTopOffset) {
            backToTop.style.marginBottom = footer.offsetHeight - scrollBottom - backToTopHeight / 2 - backToTopOffset + 'px';
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

    imageComparison.forEach(function (element) {
        new Cocoen(element);
    });
}

function initResponsiveTable() {
    document.querySelectorAll('[class*="custom-table-"]').forEach(function (element) {
        responsiveCellHeaders(element);
        addTableAria(element);
    });

    document.querySelectorAll('#content table:not([class*="custom-table-"])').forEach(function (element) {
        var parent1 = element.parentElement;
        var parent2 = parent1.parentElement;

        if (!parent1.classList.contains('table-responsive') && !parent2.classList.contains('table-responsive')) {
            var div = document.createElement('div');
            div.classList.add('table-responsive');
            parent1.insertBefore(div, element);
            div.append(element);
        }
    });
}

function initFlickity() {
    var carousels = document.querySelectorAll('.flickity-carousel');
    if (!carousels) {
        return false;
    }

    carousels.forEach(function (carousel) {
        var alignment = carousel.getAttribute('data-align');
        var pageDots = carousel.getAttribute('data-pagedots');

        if (!alignment) {
            alignment = 'center';
        }

        if (!pageDots) {
            pageDots = false;
        }

        var flkty = new Flickity(carousel, {
            // options
            cellAlign: alignment,
            pageDots: pageDots,
            lazyLoad: 2,
        });

        const cellElements = flkty.getCellElements();

        for (let i = 0; i < cellElements.length; i++) {
            const links = cellElements[i].querySelectorAll('a');

            if (links.length > 0) {
                links.forEach((link) => {
                    link.addEventListener('focus', (e) => {
                        flkty.select(i);
                    });
                });
            }
        }
    });
}

function toggleCarouselButton() {
    var carousels = document.querySelectorAll('.carousel');
    var paused = false;

    // filter out carousels that haven't been initialized
    var initializedCarousels = Array.prototype.filter.call(carousels, function (carousel) {
        return carousel.getAttribute('data-bs-interval') !== null || carousel.getAttribute('data-bs-interval') !== 'false';
    });

    initializedCarousels.forEach(function (carousel) {
        let bootstrapCarousel = new bootstrap.Carousel(carousel);
        const toggleButton = carousel.querySelector('.toggleCarouselBtn');

        if (toggleButton) {
            let playPauseIcon = toggleButton.querySelector('i');
            toggleButton.addEventListener('click', function (e) {
                if (paused) {
                    bootstrapCarousel.cycle();
                    playPauseIcon.classList.remove('fa-play');
                    playPauseIcon.classList.add('fa-pause');
                    paused = false;
                } else {
                    bootstrapCarousel.pause();
                    playPauseIcon.classList.remove('fa-pause');
                    playPauseIcon.classList.add('fa-play');
                    paused = true;
                }
            });
        }
    });
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
            scrollSpyOnce: 1,
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
    var links = document.querySelectorAll('#content a:not(.stretched-link):not(.exclude-link-check)');
    if (!links) {
        return false;
    }

    links.forEach(function (link) {
        if (location.hostname === link.hostname || !link.hostname.length) {
            return false;
        } else {
            if (!link.querySelector('[class*="fa-external-link"]') && !link.querySelector('img')) {
                link.insertAdjacentHTML('beforeend', '<i class="far fa-external-link mx-1" aria-hidden="true"></i>');
            }
            link.setAttribute('rel', 'noopener');
            link.setAttribute('title', 'Opens in a new window');
            link.setAttribute('target', '_blank');
        }
    });
}

function initToNextSection() {
    var btn = document.getElementById('to-next-section');
    if (!btn) {
        return false;
    }

    btn.addEventListener('click', function () {
        next = btn.closest('section').nextElementSibling;

        next.scrollIntoView({
            behavior: 'smooth',
        });
    });
}

function initRedirectPopup() {
    document.querySelectorAll('#content a[data-redirect-popup="true"]').forEach(function (link) {
        var href = link.getAttribute('href');
        var desc = link.getAttribute('data-redirect-description');
        var parent = link.parentElement;
        var text = link.innerText;
        var textIDFormat = text.toLowerCase().replace(/\s/g, '-');
        var textARIAFormat = textIDFormat;

        link.setAttribute('data-bs-toggle', 'modal');
        link.setAttribute('data-bs-target', '#' + textIDFormat);

        var modal = document.createElement('div');
        modal.classList.add('modal', 'fade');
        modal.setAttribute('tabindex', '-1');
        modal.setAttribute('id', textIDFormat);
        modal.setAttribute('aria-labelledby', textARIAFormat);
        modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Redirecting...</h2>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>
                <div class="modal-body">
                    <p>${desc}</p>
                </div>
                <div class="modal-footer">
                    <a href="${href}" class="btn btn-sm btn-secondary btn-external">Redirect now</a>
                </div>
            </div>
        </div>
        `;
        parent.insertAdjacentElement('afterend', modal);
    });
}

function initSubMenu() {
    var submenu = document.querySelector('.ntg-sub-menu__links');
    if (!submenu) {
        return false;
    }
    var breakpoint = '(max-width: 993px)';

    if (!window.matchMedia(breakpoint).matches) {
        initFlickity(submenu);
    } else {
        submenu.classList.add('collapse');
    }

    // destroy flickity at tablet width
    window.addEventListener('resize', function () {
        if (window.matchMedia(breakpoint).matches) {
            if (submenu.classList.contains('flickity-enabled')) {
                var slider = Flickity.data('.ntg-sub-menu__links');
                slider.destroy();
            }
            submenu.classList.add('collapse');
        } else {
            if (submenu.classList.contains('collapse')) {
                submenu.classList.remove('collapse');
            }
            // re-initialise flickity
            initFlickity(submenu);
        }
    });

    function initFlickity(elem) {
        var flkty = new Flickity(elem, {
            cellSelector: '.nav-cell',
            cellAlign: 'left',
            pageDots: false,
        });

        const cellElements = flkty.getCellElements();

        for (let i = 0; i < cellElements.length; i++) {
            const links = cellElements[i].querySelectorAll('a');

            if (links.length > 0) {
                links.forEach((link) => {
                    link.addEventListener('focus', (e) => {
                        flkty.select(i);
                    });
                });
            }
        }

        // set active link as selected cell
        const carousel = document.getElementById('submenu');
        const cells = carousel.querySelectorAll('.nav-cell');
        const cellsArr = Array.from(cells);

        for (let i = 0; i < cellsArr.length; i++) {
            var cell = cellsArr[i];
            if (cell.classList.contains('active')) {
                flkty.select(i, false, true);
            }
        }
    }
}

function initStepProgress() {
    var progresses = document.querySelectorAll('.ntg-step-progress .nav-tabs');
    if (!progresses) {
        return false;
    }

    progresses.forEach(function (progress) {
        var steps = progress.querySelectorAll('.nav-link');
        var totalSteps = steps.length;

        steps.forEach(function (step, index) {
            step.addEventListener('shown.bs.tab', function () {
                updateProgress();
            });

            function updateProgress() {
                var progressPercent = (index / (totalSteps - 1)) * 100;
                if (progressPercent === 100) {
                    progressPercent = 99; // set to 99% to prevent overflow
                }
                progress.style.setProperty('--progress-fill', progressPercent + '%');

                for (let i = 0; i < steps.length; i++) {
                    if (i < index) {
                        steps[i].classList.add('completed');
                    } else {
                        steps[i].classList.remove('completed');
                    }
                }
            }
        });
    });
}

function initFlipCards() {
    var flipCards = document.querySelectorAll('.ntg-image-flip-cards__card');
    if (!flipCards.length) {
        return false;
    }

    // Check if device supports touch
    var isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    flipCards.forEach(function (card) {
        // For touch devices, use click/touch to toggle
        if (isTouchDevice) {
            card.addEventListener('click', function (e) {
                // Don't flip if clicking on a link or button in the back
                if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON' || e.target.closest('a') || e.target.closest('button')) {
                    if (!card.classList.contains('is-flipped')) {
                        e.preventDefault();
                    }
                    return;
                }

                // Close all other flipped cards first
                flipCards.forEach(function (otherCard) {
                    if (otherCard !== card) {
                        otherCard.classList.remove('is-flipped');
                    }
                });

                // Toggle this card
                card.classList.toggle('is-flipped');
            });

            // Close flipped cards when clicking outside
            document.addEventListener('click', function (e) {
                if (!e.target.closest('.ntg-image-flip-cards__card')) {
                    flipCards.forEach(function (card) {
                        card.classList.remove('is-flipped');
                    });
                }
            });
        }
    });
}

function initShowHideText() {
    var buttons = document.querySelectorAll('.ntg-show-hide-text__button');
    if (!buttons) {
        return false;
    }

    buttons.forEach(function (button) {
        button.addEventListener('click', function () {
            var expanded = button.getAttribute('aria-expanded') === 'true' ? true : false;
            var text = button.querySelector('span');
            if (expanded) {
                text.innerText = 'Show less';
            } else {
                text.innerText = 'Show more';
            }
        });
    });
}
