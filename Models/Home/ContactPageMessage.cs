using System.ComponentModel.DataAnnotations;

namespace ChapelStudiosWWW.Models.Home
{
    public class ContactPageMessage
    {
        [Required]
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
