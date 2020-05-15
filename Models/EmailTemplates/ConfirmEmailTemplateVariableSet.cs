using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Models.EmailTemplates
{
    public class ConfirmEmailTemplateVariableSet : EmailTemplateVariableSetBase
    {

        public ConfirmEmailTemplateVariableSet()
        {
            VariableList.Add("ConfirmationURL", new EmailTemplateVariable("%ConfirmationURL%"));
        }

        public string ConfirmationURL
        {
            get
            {
                return VariableList["ConfirmationURL"].Data;
            }
            set
            {
                VariableList["ConfirmationURL"].Data = value;
            }
        }
    }
}
