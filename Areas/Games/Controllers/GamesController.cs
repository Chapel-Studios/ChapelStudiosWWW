using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ChapelStudiosWWW.Areas.Games.Models;
using Microsoft.AspNetCore.Mvc;

namespace ChapelStudiosWWW.Areas.Games.Controllers
{
    [Area("Games")]
    public class GamesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [Route("Games/Minesweeper")]
        public IActionResult MineSweeper(string mode)
        {
            return View(new MineSweeperViewModel (mode, GetScoreBoard()));
        }

        

        private ScoreBoard GetScoreBoard()
        {
            return new ScoreBoard();
        }
    }
}