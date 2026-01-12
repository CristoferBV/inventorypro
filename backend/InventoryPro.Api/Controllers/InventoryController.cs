using InventoryPro.Api.Data;
using InventoryPro.Api.Dtos;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly InventoryDbContext _db;

    public InventoryController(InventoryDbContext db)
    {
        _db = db;
    }

    // GET: api/inventory?search=&onlyLowStock=false&onlyActive=true
    [HttpGet]
    public async Task<ActionResult<List<InventoryItemDto>>> GetAll(
        [FromQuery] string? search,
        [FromQuery] bool onlyLowStock = false,
        [FromQuery] bool onlyActive = true)
    {
        var query = _db.Inventories
            .AsNoTracking()
            .Include(i => i.Product)!.ThenInclude(p => p!.Category)
            .AsQueryable();

        if (onlyActive)
            query = query.Where(i => i.Product != null && i.Product.IsActive);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(i =>
                i.Product != null &&
                (i.Product.Name.ToLower().Contains(s) || i.Product.Sku.ToLower().Contains(s)));
        }

        if (onlyLowStock)
            query = query.Where(i => i.Product != null && i.Quantity <= i.Product.StockMin);

        var items = await query
            .OrderBy(i => i.Product!.Name)
            .Select(i => new InventoryItemDto
            {
                ProductId = i.ProductId,
                Sku = i.Product!.Sku,
                Name = i.Product.Name,
                CategoryId = i.Product.CategoryId,
                CategoryName = i.Product.Category != null ? i.Product.Category.Name : "",
                Quantity = i.Quantity,
                StockMin = i.Product.StockMin,
                IsActive = i.Product.IsActive
            })
            .ToListAsync();

        return Ok(items);
    }

    // GET: api/inventory/1
    [HttpGet("{productId:int}")]
    public async Task<ActionResult<InventoryItemDto>> GetByProduct(int productId)
    {
        var item = await _db.Inventories
            .AsNoTracking()
            .Include(i => i.Product)!.ThenInclude(p => p!.Category)
            .FirstOrDefaultAsync(i => i.ProductId == productId);

        if (item is null) return NotFound();

        return Ok(new InventoryItemDto
        {
            ProductId = item.ProductId,
            Sku = item.Product!.Sku,
            Name = item.Product.Name,
            CategoryId = item.Product.CategoryId,
            CategoryName = item.Product.Category?.Name ?? "",
            Quantity = item.Quantity,
            StockMin = item.Product.StockMin,
            IsActive = item.Product.IsActive
        });
    }
}
