using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using ChapelStudiosWWW.Data;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Identity.UI.Services;
using ChapelStudiosWWW.Services;
using ChapelStudiosWWW.Services.Models;
using ChapelStudiosWWW.Services.Contracts;

namespace ChapelStudiosWWW
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    Configuration.GetConnectionString("DefaultConnection")));
            services.AddDefaultIdentity<IdentityUser>(options => options.SignIn.RequireConfirmedAccount = true)
                .AddEntityFrameworkStores<ApplicationDbContext>();

            services.AddTransient<IEmailSender, GridEmailSender>();
            services.AddTransient<IEmailService, GridEmailSender>(); // ToDo: look into combining these during identity overhaul;
            services.Configure<AuthMessageSenderOptions>(Configuration);

            var views = services.AddControllersWithViews();
            var pages = services.AddRazorPages();

#if (DEBUG)
            views.AddRazorRuntimeCompilation();
            pages.AddRazorRuntimeCompilation();
#endif

            services.AddAuthentication()
                .AddMicrosoftAccount(microsoftOptions =>
                {
                    microsoftOptions.ClientId = Configuration["Authentication:Microsoft:ClientId"];
                    microsoftOptions.ClientSecret = Configuration["Authentication:Microsoft:ClientSecret"];
                })
                .AddGoogle(googleOptions =>
                {
                    IConfigurationSection googleAuthNSection = Configuration.GetSection("Authentication:Google");

                    googleOptions.ClientId = googleAuthNSection["ClientId"];
                    googleOptions.ClientSecret = googleAuthNSection["ClientSecret"];
                });
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseDatabaseErrorPage();
            }
            else
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }
            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthentication();
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");

                endpoints.MapAreaControllerRoute(
                    name: "Games",
                    pattern: "{controller=Index}/{action=Index}/{id?}",
                    areaName: "Games");

                endpoints.MapRazorPages();

                endpoints.MapAreaControllerRoute(
                    name: "ResumeBuilder",
                    pattern: "{controller=Resumes}/{action=Index}/{id?}",
                    areaName: "ResumeBuilder");
            });
        }
    }
}
