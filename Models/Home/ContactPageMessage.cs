using System.ComponentModel.DataAnnotations;

namespace ChapelStudiosWWW.Models.Home
{
    public class ContactPageMessage
    {
        [StringLength(5)]
        [Display(Name = "What would you like to discuss?")]
        public string Message { get; set; }
        [Required]
        public string Name { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [Phone]
        public string Phone { get; set; }
        public string Category { get; set; }
    }
}
