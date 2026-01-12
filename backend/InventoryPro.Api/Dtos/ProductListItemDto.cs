namespace InventoryPro.Api.Dtos;

public class ProductListItemDto
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;

    public decimal Price { get; set; }
    public bool IsActive { get; set; }

    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
}
