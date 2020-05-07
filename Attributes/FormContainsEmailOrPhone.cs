using ChapelStudiosWWW.Models.Home;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Attributes
{
    public class FormContainsEmailOrPhone : ValidationAttribute
    {
        public FormContainsEmailOrPhone()
        {
            ErrorMessage = "You must enter either a phone number or an email address.";
        }

        public override bool IsValid(object value)
        {
            if (value != null)
            {
                if (typeof(ContactPageMessage) == value.GetType())
                {
                    var val = (ContactPageMessage)value;
                    return (!string.IsNullOrEmpty(val.Phone) || !string.IsNullOrEmpty(val.Email));
                }
            }

            return false;
        }
    }
}
