using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using ChapelStudiosWWW.Areas.ResumeBuilder.Models;
using ChapelStudiosWWW.Data;

namespace ChapelStudiosWWW.Areas.ResumeBuilder.Controllers
{
    [Area("ResumeBuilder")]
    public class ResumesController : Controller
    {
        private readonly ApplicationDbContext _context;

        public ResumesController(ApplicationDbContext context)
        {
            this._context = context;
        }

        // GET: ResumeBuilder/Resumes
        public async Task<IActionResult> Index()
        {
            return View(await this._context.Resume.ToListAsync().ConfigureAwait(false));
        }

        // GET: ResumeBuilder/Resumes/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                id = 0;
            }

            var resume = await _context.Resume
                .FirstOrDefaultAsync(m => m.LocalId == id).ConfigureAwait(false);
            if (resume == null)
            {
                return NotFound();
            }

            return View(resume);
        }

        // GET: ResumeBuilder/Resumes/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: ResumeBuilder/Resumes/Create
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("LocalId,Notes")] Resume resume)
        {
            if (ModelState.IsValid)
            {
                _context.Add(resume);
                await _context.SaveChangesAsync().ConfigureAwait(false);
                return RedirectToAction(nameof(Index));
            }
            return View(resume);
        }

        // GET: ResumeBuilder/Resumes/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var resume = await _context.Resume.FindAsync(id);
            if (resume == null)
            {
                return NotFound();
            }
            return View(resume);
        }

        // POST: ResumeBuilder/Resumes/Edit/5
        // To protect from overposting attacks, please enable the specific properties you want to bind to, for 
        // more details see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("LocalId,Notes")] Resume resume)
        {
            if (id != resume.LocalId)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(resume);
                    await _context.SaveChangesAsync().ConfigureAwait(false);
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ResumeExists(resume.LocalId))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(resume);
        }

        // GET: ResumeBuilder/Resumes/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var resume = await _context.Resume
                .FirstOrDefaultAsync(m => m.LocalId == id);
            if (resume == null)
            {
                return NotFound();
            }

            return View(resume);
        }

        // POST: ResumeBuilder/Resumes/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var resume = await _context.Resume.FindAsync(id);
            _context.Resume.Remove(resume);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool ResumeExists(int id)
        {
            return _context.Resume.Any(e => e.LocalId == id);
        }
    }
}
