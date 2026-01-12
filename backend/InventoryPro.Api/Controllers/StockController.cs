using InventoryPro.Api.Data;
using InventoryPro.Api.Dtos;
using InventoryPro.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockController : ControllerBase
{
    private readonly InventoryDbContext _db;

    public StockController(InventoryDbContext db)
    {
        _db = db;
    }

    [HttpPost("receive")]
    public async Task<ActionResult> Receive([FromBody] StockChangeDto dto)
        => await Apply(dto, StockMovementType.Receive, dto.Quantity);

    [HttpPost("issue")]
    public async Task<ActionResult> Issue([FromBody] StockChangeDto dto)
        => await Apply(dto, StockMovementType.Issue, -dto.Quantity);

    [HttpPost("adjust")]
    public async Task<ActionResult> Adjust([FromBody] StockChangeDto dto)
    {
        // Ajuste puede ser + o - según lo quieras. Para mantenerlo simple:
        // Usaremos Quantity positivo y Note indica el motivo.
        // Si querés ajuste negativo, lo hacemos en el siguiente paso.
        return await Apply(dto, StockMovementType.Adjust, dto.Quantity);
    }

    private async Task<ActionResult> Apply(StockChangeDto dto, StockMovementType type, int quantityChange)
    {
        if (dto.ProductId <= 0) return BadRequest("ProductId is required.");
        if (dto.Quantity <= 0) return BadRequest("Quantity must be > 0.");

        var productExists = await _db.Products.AnyAsync(p => p.Id == dto.ProductId);
        if (!productExists) return BadRequest("ProductId is invalid.");

        // Obtener o crear Inventory
        var inventory = await _db.Inventories.FirstOrDefaultAsync(i => i.ProductId == dto.ProductId);
        if (inventory is null)
        {
            inventory = new Inventory { ProductId = dto.ProductId, Quantity = 0 };
            _db.Inventories.Add(inventory);
        }

        // Validar que no quede negativo
        var newQty = inventory.Quantity + quantityChange;
        if (newQty < 0) return Conflict("Insufficient stock.");

        inventory.Quantity = newQty;

        // Registrar movimiento
        _db.StockMovements.Add(new StockMovement
        {
            ProductId = dto.ProductId,
            Type = type,
            QuantityChange = quantityChange,
            Note = dto.Note
        });

        await _db.SaveChangesAsync();

        return Ok(new { productId = dto.ProductId, newQuantity = inventory.Quantity });
    }
}
