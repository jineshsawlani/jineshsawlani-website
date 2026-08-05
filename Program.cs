var builder = WebApplication.CreateBuilder(args);

var app = builder.Build();

app.UseDefaultFiles();   // Looks for index.html
app.UseStaticFiles();

app.UseStatusCodePagesWithRedirects("/404.html");

app.Run();
