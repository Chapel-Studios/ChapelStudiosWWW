using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Areas.Games.Models
{
    public interface IScore
    {
        int Score { get; set; }

        string Player { get; set; }

        int Rank { get; set; }


    }
}
