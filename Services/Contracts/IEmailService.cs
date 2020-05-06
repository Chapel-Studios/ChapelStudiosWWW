using Microsoft.AspNetCore.Identity.UI.Services;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ChapelStudiosWWW.Services.Contracts
{
    public interface IEmailService : IEmailSender
    {
        public Task SendFromContactPage(string subject, string message);
    }
}
