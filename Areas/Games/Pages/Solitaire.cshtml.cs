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
    public class SolitaireModel : PageModel
    {
        public string Style { get; set; }

        public string Title { get; set; }

        public void OnGet(string style)
        {
            this.Style = style;
        }
    }
}