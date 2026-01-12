using InventoryPro.Api.Data;
using InventoryPro.Api.Dtos;
using InventoryPro.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly InventoryDbContext _db;

    public ProductsController(InventoryDbContext db)
    {
        _db = db;
    }

    // GET: api/products?search=&page=1&pageSize=10
    [HttpGet]
    public async Task<ActionResult<object>> GetAll([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        page = page < 1 ? 1 : page;
        pageSize = pageSize is < 1 or > 100 ? 10 : pageSize;

        var query = _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(s) ||
                p.Sku.ToLower().Contains(s));
        }

        var total = await query.CountAsync();

        var items = await query
            .OrderBy(p => p.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(p => new ProductListItemDto
            {
                Id = p.Id,
                Sku = p.Sku,
                Name = p.Name,
                Price = p.Price,
                IsActive = p.IsActive,
                CategoryId = p.CategoryId,
                CategoryName = p.Category != null ? p.Category.Name : ""
            })
            .ToListAsync();

        return Ok(new { total, page, pageSize, items });
    }

    // GET: api/products/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<ProductListItemDto>> GetById(int id)
    {
        var product = await _db.Products
            .AsNoTracking()
            .Include(p => p.Category)
            .FirstOrDefaultAsync(p => p.Id == id);

        if (product is null) return NotFound();

        return Ok(new ProductListItemDto
        {
            Id = product.Id,
            Sku = product.Sku,
            Name = product.Name,
            Price = product.Price,
            IsActive = product.IsActive,
            CategoryId = product.CategoryId,
            CategoryName = product.Category?.Name ?? ""
        });
    }

    // POST: api/products
    [HttpPost]
    public async Task<ActionResult> Create([FromBody] ProductCreateDto dto)
    {
        var sku = (dto.Sku ?? "").Trim();
        var name = (dto.Name ?? "").Trim();

        if (string.IsNullOrWhiteSpace(sku)) return BadRequest("Sku is required.");
        if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required.");
        if (dto.Price < 0 || dto.Cost < 0) return BadRequest("Cost/Price must be >= 0.");
        if (dto.StockMin < 0) return BadRequest("StockMin must be >= 0.");

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) return BadRequest("CategoryId is invalid.");

        var skuExists = await _db.Products.AnyAsync(p => p.Sku.ToLower() == sku.ToLower());
        if (skuExists) return Conflict("A product with that SKU already exists.");

        var product = new Product
        {
            Sku = sku,
            Name = name,
            Cost = dto.Cost,
            Price = dto.Price,
            StockMin = dto.StockMin,
            IsActive = dto.IsActive,
            CategoryId = dto.CategoryId
        };

        _db.Products.Add(product);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = product.Id }, new { product.Id });
    }

    // PUT: api/products/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult> Update(int id, [FromBody] ProductUpdateDto dto)
    {
        var sku = (dto.Sku ?? "").Trim();
        var name = (dto.Name ?? "").Trim();

        if (string.IsNullOrWhiteSpace(sku)) return BadRequest("Sku is required.");
        if (string.IsNullOrWhiteSpace(name)) return BadRequest("Name is required.");
        if (dto.Price < 0 || dto.Cost < 0) return BadRequest("Cost/Price must be >= 0.");
        if (dto.StockMin < 0) return BadRequest("StockMin must be >= 0.");

        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null) return NotFound();

        var categoryExists = await _db.Categories.AnyAsync(c => c.Id == dto.CategoryId);
        if (!categoryExists) return BadRequest("CategoryId is invalid.");

        var skuExists = await _db.Products.AnyAsync(p => p.Id != id && p.Sku.ToLower() == sku.ToLower());
        if (skuExists) return Conflict("A product with that SKU already exists.");

        product.Sku = sku;
        product.Name = name;
        product.Cost = dto.Cost;
        product.Price = dto.Price;
        product.StockMin = dto.StockMin;
        product.IsActive = dto.IsActive;
        product.CategoryId = dto.CategoryId;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/products/5
    [HttpDelete("{id:int}")]
    public async Task<ActionResult> Delete(int id)
    {
        var product = await _db.Products.FirstOrDefaultAsync(p => p.Id == id);
        if (product is null) return NotFound();

        _db.Products.Remove(product);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
