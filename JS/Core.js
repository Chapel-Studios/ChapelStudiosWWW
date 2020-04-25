(function () {
    const body = document.getElementsByTagName("body")[0];
    document.getElementById('navbar-checkbox').addEventListener('click', function () {
        if (this.checked) {
            body.classList.add("lock-scroll");
        }
        else {
            body.classList.remove("lock-scroll");
        }
    });
}());
