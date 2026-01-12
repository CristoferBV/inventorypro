using InventoryPro.Api.Data;
using InventoryPro.Api.Dtos;
using InventoryPro.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StockMovementsController : ControllerBase
{
    private readonly InventoryDbContext _db;

    public StockMovementsController(InventoryDbContext db)
    {
        _db = db;
    }

    // GET: api/stockmovements?productId=1&take=50
    [HttpGet]
    public async Task<ActionResult<List<StockMovementDto>>> GetHistory(
        [FromQuery] int? productId,
        [FromQuery] int take = 50)
    {
        take = take is < 1 or > 200 ? 50 : take;

        var query = _db.StockMovements
            .AsNoTracking()
            .Include(m => m.Product)
            .AsQueryable();

        if (productId.HasValue)
            query = query.Where(m => m.ProductId == productId.Value);

        var items = await query
            .OrderByDescending(m => m.CreatedAtUtc)
            .Take(take)
            .Select(m => new StockMovementDto
            {
                Id = m.Id,
                ProductId = m.ProductId,
                Sku = m.Product != null ? m.Product.Sku : "",
                ProductName = m.Product != null ? m.Product.Name : "",
                Type = m.Type.ToString(),
                QuantityChange = m.QuantityChange,
                Note = m.Note,
                CreatedAtUtc = m.CreatedAtUtc
            })
            .ToListAsync();

        return Ok(items);
    }
}
