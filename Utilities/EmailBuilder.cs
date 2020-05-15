using ChapelStudiosWWW.Models.EmailTemplates;
using System.Collections.Generic;
using System.IO;

namespace ChapelStudiosWWW.Utilities
{
    public class EmailBuilder
    {
        public static string BuildTemplateEmailHTML(EmailTemplateType templateType, IEmailVariableSet variableInfo)
        {
            var emailHTML = File.ReadAllText(templateType.TemplateURL);

            foreach(var variable in variableInfo.VariableList.Values)
            {
                emailHTML = emailHTML.Replace(variable.Variable , variable.Data);
            }

            return emailHTML;
        }
    }
}
