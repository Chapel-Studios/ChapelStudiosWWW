using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Models.EmailTemplates
{
    public interface IEmailVariableSet
    {
        public Dictionary<string, EmailTemplateVariable> VariableList { get; }
    }
}
