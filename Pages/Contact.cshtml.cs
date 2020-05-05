using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace ChapelStudiosWWW.Pages
{
    public class ContactModel : PageModel
    {
        public class MessageModel
        {
            public string Message { get; set; }

            [EmailAddress]
            public string Email { get; set; }

            [Phone]
            public string Phone { get; set; }
        }

        public MessageModel Message { get; set; }

        public void OnGet()
        {
            Message = new MessageModel();
        }
    }
}