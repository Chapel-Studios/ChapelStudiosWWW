(function () {
    // Scroll locking for mobile menu
    const body = document.getElementsByTagName("body")[0];
    document.getElementById('navbar-checkbox').addEventListener('click', function () {
        if (this.checked) {
            body.classList.add("lock-scroll");
        }
        else {
            body.classList.remove("lock-scroll");
        }
    });

    // Automated scrolling functions
    const ToTopBtn = document.getElementsByClassName("to-top-btn")[0];
    //const pageElements = [document.getElementsByTagName('body'), document.getElementsByTagName('html')];

    function checkScrollPos() {
        let currentPos = document.documentElement.scrollTop || document.body.scrollTop;
        if (currentPos === 0) {
            ToTopBtn.classList.remove("active");
        }
        else {
            ToTopBtn.classList.add("active");
        }
    }

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

    // Add behaviour to all anchor links on page
    function filterPath(string) {
        return string
            .replace(/^\//, '')
            .replace(/(index|default).[a-zA-Z]{3,4}$/, '')
            .replace(/\/$/, '');
    }
    let locationPath = filterPath(location.pathname);
    document.querySelectorAll('a[href*="#"]').forEach(link => {
        let thisPath = filterPath(link.pathname) || locationPath;
        let hash = link.hash;
        let hashName = hash.replace(/#/, '');
        if (hashName) {
            let targetEl = document.getElementById(hashName);

            if (targetEl) {
                if (locationPath == thisPath
                    && (location.hostname == link.hostname || !link.hostname)
                ) {
                    link.addEventListener('click', () => {
                        event.preventDefault();
                        targetEl.scrollIntoView({
                            top: 50,
                            left: 0,
                            behavior: "smooth"
                        });
                    });
                }
            }
        }
        else {
            // Disable links with no href
            link.addEventListener('click', () => {
                event.preventDefault();
            });
        }
        
    });

}());

