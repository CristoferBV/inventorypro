namespace InventoryPro.Api.Models;

public enum StockMovementType
{
    Receive = 1, // entrada
    Issue = 2,   // salida
    Adjust = 3   // ajuste (+ o -)
}

public class StockMovement
{
    public int Id { get; set; }

    public StockMovementType Type { get; set; }

    public int ProductId { get; set; }
    public Product? Product { get; set; }

    // cantidad del movimiento (ej: +5, -2)
    public int QuantityChange { get; set; }

    public string? Note { get; set; }

    public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
}
