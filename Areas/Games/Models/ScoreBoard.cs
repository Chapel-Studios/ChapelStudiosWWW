using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Areas.Games.Models
{
    public class ScoreBoard
    {
        public string GameTitle { get; }

        public List<IScore> Scores { get; }

        public ScoreBoard()
        {
            this.GameTitle = "Mine Sweeper";


        }
    }
}
