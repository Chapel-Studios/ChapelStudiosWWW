(function () {
    //-----------------------------------------------------
    // Handle Scroll Locking when hamburger menu is open
    //-----------------------------------------------------
    const html = document.getElementsByTagName("html")[0];
    const navCheckbox = document.getElementById('navbar-checkbox');
    navCheckbox.addEventListener('click', function () {
        if (this.checked) {
            html.classList.add("scroll-lock");
        }
        else {
            html.classList.remove("scroll-lock");
        }
    });


    //----------------------------------
    // Automated scrolling functions
    //----------------------------------

    // To-Top Button
    //----------------------------------
    const ToTopBtn = document.getElementsByClassName("to-top-btn")[0];
    
    function checkScrollPos() {
        let currentPos = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentPos === 0) {
            ToTopBtn.classList.remove("active");
        }
        else {
            ToTopBtn.classList.add("active");
        }
    }
    // Run immediately to ensure is set on page reload
    checkScrollPos();

    let eventStyle = window.addEventListener ? "addEventListener" : "attachEvent";
    let AddEvent = window[eventStyle];
    let scrollEvent = eventStyle == "attachEvent" ? "onscroll" : "scroll";

    AddEvent(scrollEvent, checkScrollPos, false);

    ToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0, left: 0,
            behavior: "smooth"
        });
    });

    // Manage anchor link behaviour (on page only)
    //-----------------------------------------------
    function filterPath(string) {
        return string
            .replace(/^\//, '')
            .replace(/(index|default).[a-zA-Z]{3,4}$/, '')
            .replace(/\/$/, '');
    }

    let locationPath = filterPath(location.pathname);

    document.querySelectorAll('a[href*="#"]').forEach(link => {
        let thisPath = filterPath(link.pathname) || locationPath;

        if ((location.hostname == link.hostname || !link.hostname)
            && (locationPath == thisPath)
        ) {
            let hashName = link.hash.replace(/#/, '');

            if (hashName) {
                let targetEl = document.getElementById(hashName);

                if (targetEl) {
                    link.addEventListener('click', () => {
                        event.preventDefault();
                        if (navCheckbox.checked) {
                            navCheckbox.click();
                        }

                        targetEl.scrollIntoView({
                            top: 0,
                            left: 0,
                            behavior: "smooth"
                        });
                    });
                }
            }
            else {
                // Disable links with no actual destination
                link.addEventListener('click', () => {
                    event.preventDefault();
                });
            }
        }
        
    });

}());

