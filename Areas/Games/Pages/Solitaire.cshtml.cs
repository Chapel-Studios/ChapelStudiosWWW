using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChapelStudiosWWW.Utilities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.VisualBasic.CompilerServices;

namespace ChapelStudiosWWW.Pages.Games
{
    public class CardBackOption
    {
        public static string GetUrl(string id)
        {
            return $"../../assets/Images/Games/Cards/Backs/cardback_{id}.jpg";
        }
        public string CSSClassName { get; set; }
        public bool IsActive { get; set; }

        public string Url { get { return GetUrl(this.CSSClassName); } }

        public CardBackOption(string name)
        {
            this.CSSClassName = name;
            this.IsActive = false;
        }
    }

    public class SolitaireModel : PageModel
    {
        public string Style { get; set; }

        public string Title { get; set; }

        public List<CardBackOption> CardBackOptions { get; set; }

        public void OnGet(string style)
        {
            this.Style = style;
            this.CardBackOptions = new List<CardBackOption>() {
                new CardBackOption("beach"),
                // ToDo: pull this from DB for registered users or cookie from non-registered users
                new CardBackOption("peak") { IsActive = true },
                new CardBackOption("hill"),
                new CardBackOption("sky"),
                new CardBackOption("tulip")
            };
        }

        public string ActiveCardBackClassName
        {
            get
            {
                return CardBackOptions.Find(cbo => cbo.IsActive == true).CSSClassName;
            }
        }

        public void SetActiveCardBack(string newOptionName)
        {
            CardBackOptions.Find(cbo => cbo.IsActive == true).IsActive = false;
            CardBackOptions.Find(cbo => cbo.CSSClassName == newOptionName).IsActive = true;
            // ToDo: add to DB for registered users and to cookie for both
        }
    }
}