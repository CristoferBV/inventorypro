namespace InventoryPro.Api.Dtos;

public class InventoryItemDto
{
    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;

    public int Quantity { get; set; }
    public int StockMin { get; set; }

    public bool IsActive { get; set; }
}
