using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Areas.ResumeBuilder.Models
{
    public class Resume
    {
        [Key]
        public int LocalId { get; set; }

        [StringLength(250)]
        public string Notes { get; set; }
    }
}
