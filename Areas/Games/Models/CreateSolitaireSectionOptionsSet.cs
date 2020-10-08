using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Areas.Games.Models
{
    public class CreateSolitaireSectionOptionsSet
    {
        public string Suit { get; set; }
        public bool IsCenterNeeded { get; set; }

        public CreateSolitaireSectionOptionsSet(bool isCenterNeeded, string suit = "")
        {
            this.IsCenterNeeded = isCenterNeeded;
            this.Suit = suit;
        }
    }
}
