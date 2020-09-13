using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Utilities
{
    public static class LanguageTools
    {
        public static string CapitalizeFirst (string original)
        {
            if (string.IsNullOrEmpty(original)) return string.Empty;
            char[] chars = original.ToCharArray();
            chars[0] = char.ToUpper(chars[0]);
            return new string(chars);
        }
    }
}
