const cards = document.getElementsByClassName("copyBox_card");
document.getElementById("Message_Category").addEventListener("change", function () {
    for (const card of cards) {
        if (this.value === card.attributes["asp-forcard"].value) {
            card.classList.add("active");
        }
        else {
            card.classList.remove("active");
        }

    };
});