const cards = document.getElementsByClassName("copyBox_card");
const catSelect = document.getElementById("Message_Category");
let changeCard = () => {
    for (const card of cards) {
        if (catSelect.value === card.attributes["asp-forcard"].value) {
            card.classList.add("active");
        }
        else {
            card.classList.remove("active");
        }

    };
}
catSelect.addEventListener("change", changeCard);
changeCard();