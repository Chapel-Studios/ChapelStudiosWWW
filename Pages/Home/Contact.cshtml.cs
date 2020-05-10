using ChapelStudiosWWW.Attributes;
using ChapelStudiosWWW.Models.Home;
using ChapelStudiosWWW.Services.Contracts;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

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


        public void OnGet(string category = "", string job = "")
        {
            Message = new ContactPageMessage();
            if (!string.IsNullOrEmpty(category))
            {
                Message.Category = category;
            }
            if (!string.IsNullOrEmpty(job))
            {
                Message.Subject = category;
            }
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