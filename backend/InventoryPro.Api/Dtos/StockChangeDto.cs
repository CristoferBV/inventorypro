namespace InventoryPro.Api.Dtos;

public class StockChangeDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; } // Puede ser positivo o negativo
    public string? Note { get; set; }
}
