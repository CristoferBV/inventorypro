using InventoryPro.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
}
