using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace LoginService.Persistence.Data;

public class DesignTimeDbContextFactory 
    : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5436;Database=crediexpress;Username=IN6AM;Password=In6amKnl!");

        return new ApplicationDbContext(optionsBuilder.Options);
    }
}
