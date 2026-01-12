namespace InventoryPro.Api.Models;

public class Product
{
    public int Id { get; set; }

    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public decimal Cost { get; set; }
    public decimal Price { get; set; }

    public int StockMin { get; set; }

    public bool IsActive { get; set; } = true;

    // FK
    public int CategoryId { get; set; }
    public Category? Category { get; set; }
}
