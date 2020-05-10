using System.ComponentModel.DataAnnotations;

namespace ChapelStudiosWWW.Models.Home
{
    public class ContactPageMessage
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Subject { get; set; }

        [EmailAddress]
        public string Email { get; set; }

        [Phone]
        public string Phone { get; set; }
        public string Category { get; set; }

        [MinLength(5)]
        [StringLength(500)]
        [Display(Name = "What would you like to discuss?")]
        public string Message { get; set; }
    }
}
