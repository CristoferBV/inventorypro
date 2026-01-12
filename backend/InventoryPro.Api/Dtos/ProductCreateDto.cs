namespace InventoryPro.Api.Dtos;

public class ProductCreateDto
{
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public decimal Cost { get; set; }
    public decimal Price { get; set; }

    public int StockMin { get; set; }
    public bool IsActive { get; set; } = true;

    public int CategoryId { get; set; }
}
