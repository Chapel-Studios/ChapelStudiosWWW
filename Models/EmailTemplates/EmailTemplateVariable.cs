using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Models.EmailTemplates
{
    public class EmailTemplateVariable
    {
        public string Variable { get; set; }
        public string Data { get; set; }

        public EmailTemplateVariable(string variable = "", string data = "")
        {
            Variable = variable;
            Data = data;
        }
    }
}
