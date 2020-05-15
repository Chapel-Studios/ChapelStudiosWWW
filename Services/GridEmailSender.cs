using ChapelStudiosWWW.Services.Contracts;
using ChapelStudiosWWW.Services.Models;
using Microsoft.Extensions.Options;
using SendGrid;
using SendGrid.Helpers.Mail;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Services
{
    public class GridEmailSender : IEmailService
    {
        public GridEmailSender(IOptions<AuthMessageSenderOptions> optionsAccessor)
        {
            Options = optionsAccessor.Value;
        }


        private static EmailAddress defaultSender = new EmailAddress("DoNotReply@chapelstudios.dev", "Chapel Studios' Automaton");
        private static string ContactPageSendToAddress = "chapelstudiosdev@gmail.com";

        public AuthMessageSenderOptions Options { get; }

        private Task Execute(string apiKey, string subject, string message, string emailAddy, EmailAddress fromAddress)
        {
            var client = new SendGridClient(apiKey);
            var msg = new SendGridMessage()
            {
                From = fromAddress,
                Subject = subject,
                PlainTextContent = message,
                HtmlContent = message
            };
            msg.AddTo(new EmailAddress(emailAddy));
            msg.SetClickTracking(false, false);
            return client.SendEmailAsync(msg);
        }

        #region Send Signatures
        // This signature is required for MS.ASPNetCore.Identity functionality
        public Task SendEmailAsync(string emailAddy, string subject, string message)
        {
            return Execute(Options.SendGridKey, subject, message, emailAddy, defaultSender);
        }

        public Task SendFromContactPage(string subject, string message)
        {
            return Execute(Options.SendGridKey, subject, message, ContactPageSendToAddress, defaultSender);
        }
        #endregion
    }
}
