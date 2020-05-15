using System.Collections.Generic;

namespace ChapelStudiosWWW.Models.EmailTemplates
{
    public class EmailTemplateType
    {
        public readonly string TemplateURL;
        public readonly string EmailSubject;

        public EmailTemplateType(string templateURL, string emailSubject)
        {
            TemplateURL = templateURL;
            EmailSubject = emailSubject;
        }
    }

    public static class EmailTemplateTypes
    {
        public static readonly EmailTemplateType ConfirmEmail = new EmailTemplateType(
            templateURL: "EmailTemplates/ConfirmEmail.html",
            emailSubject: "Please confirm your email address for your Chapel Studios account"
        );
    }
}
