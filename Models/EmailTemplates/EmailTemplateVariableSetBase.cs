using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Models.EmailTemplates
{
    public class EmailTemplateVariableSetBase : IEmailVariableSet
    {
        public EmailTemplateVariableSetBase()
        {
            VariableList = new Dictionary<string, EmailTemplateVariable>()
            {
                {"Name", new EmailTemplateVariable("%Name%") }
            };
        }
        public Dictionary<string, EmailTemplateVariable> VariableList { get; }

        public string Name
        {
            get
            {
                return VariableList["Name"].Data;
            }
            set
            {
                VariableList["Name"].Data = value;
            }
        }

    }
}
