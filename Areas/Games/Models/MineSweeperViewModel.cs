using System.Security.Claims;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace ChapelStudiosWWW.Areas.Games.Models
{
    public class MineSweeperViewModel
    {
        public ClaimsPrincipal User { get; }

        public string BuildType { get; }

        public ScoreBoard ScoreBoard { get; }

        public MineSweeperViewModel (string buildType, ScoreBoard scoreBoard)
        {
            this.BuildType = string.IsNullOrEmpty(buildType) ? "P5" : buildType;
            this.ScoreBoard = scoreBoard;
        }
    }
}
