namespace InventoryPro.Api.Dtos;

public class StockChangeDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } // siempre positivo
    public string? Note { get; set; }
}
