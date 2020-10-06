using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Areas.Games.Models
{
    public class CardBackOption
    {
        public string CSSClassName { get; set; }
        public bool IsActive { get; set; }

        public string Url => $"../../assets/Images/Games/Cards/Backs/cardback_{this.CSSClassName}.jpg";

        public CardBackOption(string name)
        {
            this.CSSClassName = name;
            this.IsActive = false;
        }
    }
}
