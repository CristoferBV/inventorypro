namespace InventoryPro.Api.Dtos;

public class StockMovementDto
{
    public int Id { get; set; }

    public int ProductId { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string ProductName { get; set; } = string.Empty;

    public string Type { get; set; } = string.Empty; // Receive / Issue / Adjust
    public int QuantityChange { get; set; }

    public string? Note { get; set; }
    public DateTime CreatedAtUtc { get; set; }
}
