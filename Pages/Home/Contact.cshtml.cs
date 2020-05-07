using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;
using ChapelStudiosWWW.Attributes;
using ChapelStudiosWWW.Models.Home;
using ChapelStudiosWWW.Services.Contracts;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Newtonsoft.Json;

namespace ChapelStudiosWWW.Pages
{

    public class ContactModel : PageModel
    {

        public ContactModel(IEmailService emailService)
        {
            _emailService = emailService;
        }

        private IEmailService _emailService;
        
        [BindProperty]
        [FormContainsEmailOrPhone]
        public ContactPageMessage Message { get; set; }
        public string ResponseMessage { get; private set; }


        public void OnGet()
        {
            Message = new ContactPageMessage();
        }

        public void OnPost()
        {
            if (!string.IsNullOrEmpty(Message.Phone) || !string.IsNullOrEmpty(Message.Email))
            {
                if (ModelState.IsValid)
                {
                    var msg = $"Name: {Message.Name}<br />Email: {Message.Email}<br />Phone: {Message.Phone}<br />Message:<br />{Message.Message}";
                    _emailService.SendFromContactPage("Contact Request: " + Message.Category, msg);

                    ResponseMessage = "Thanks for taking the time to contact us.";
                }
            }
        }
    }
}