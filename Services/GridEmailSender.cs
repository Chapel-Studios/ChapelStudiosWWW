using ChapelStudiosWWW.Services.Models;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Services
{
    public class GridEmailSender : Microsoft.AspNetCore.Identity.UI.Services.IEmailSender
    {
        public GridEmailSender(IOptions<AuthMessageSenderOptions> optionsAccessor)
        {
            Options = optionsAccessor.Value;
        }

        public AuthMessageSenderOptions Options { get; }
        public Task SendEmailAsync(string emailAddy, string subject, string message)
        {
            return Execute(Options.SendGridKey, subject, message, emailAddy);
        }

        public Task Execute(string apiKey, string sbject, string message, string emailAddy)
        {
            var client = new SendGridClient(apiKey);
            var msg = new SendGridMessage()
            {
                From = new EmailAddress("DoNotReply@chapelstudios.dev", "Chapel Studios Development"),
                Subject = sbject,
                PlainTextContent = message,
                HtmlContent = message
            };
            msg.AddTo(new EmailAddress(emailAddy));
            msg.SetClickTracking(false, false);
            return client.SendEmailAsync(msg);
        }
    }
}
