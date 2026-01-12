using InventoryPro.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Data;

public class InventoryDbContext : DbContext
{
    public InventoryDbContext(DbContextOptions<InventoryDbContext> options) : base(options) { }

    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<Inventory> Inventories => Set<Inventory>();
    public DbSet<StockMovement> StockMovements => Set<StockMovement>();


    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Product>()
            .HasIndex(p => p.Sku)
            .IsUnique();

        modelBuilder.Entity<Product>()
            .Property(p => p.Cost)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Product>()
            .Property(p => p.Price)
            .HasPrecision(12, 2);

        modelBuilder.Entity<Inventory>()
            .HasIndex(i => i.ProductId)
            .IsUnique();

        modelBuilder.Entity<StockMovement>()
            .Property(m => m.Type)
            .HasConversion<int>();

    }


}
