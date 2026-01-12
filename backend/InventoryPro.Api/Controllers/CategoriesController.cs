using InventoryPro.Api.Data;
using InventoryPro.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace InventoryPro.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CategoriesController : ControllerBase
{
    private readonly InventoryDbContext _db;

    public CategoriesController(InventoryDbContext db)
    {
        _db = db;
    }

    // GET: api/categories
    [HttpGet]
    public async Task<ActionResult<List<Category>>> GetAll()
    {
        var categories = await _db.Categories
            .AsNoTracking()
            .OrderBy(c => c.Name)
            .ToListAsync();

        return Ok(categories);
    }

    // GET: api/categories/5
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Category>> GetById(int id)
    {
        var category = await _db.Categories
            .AsNoTracking()
            .FirstOrDefaultAsync(c => c.Id == id);

        return category is null ? NotFound() : Ok(category);
    }

    // POST: api/categories
    [HttpPost]
    public async Task<ActionResult<Category>> Create([FromBody] Category input)
    {
        var name = (input.Name ?? "").Trim();

        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Name is required.");

        var exists = await _db.Categories.AnyAsync(c => c.Name.ToLower() == name.ToLower());
        if (exists)
            return Conflict("A category with that name already exists.");

        var category = new Category { Name = name };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = category.Id }, category);
    }

    // PUT: api/categories/5
    [HttpPut("{id:int}")]
    public async Task<ActionResult<Category>> Update(int id, [FromBody] Category input)
    {
        var name = (input.Name ?? "").Trim();
        if (string.IsNullOrWhiteSpace(name))
            return BadRequest("Name is required.");

        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return NotFound();

        var exists = await _db.Categories.AnyAsync(c => c.Id != id && c.Name.ToLower() == name.ToLower());
        if (exists)
            return Conflict("A category with that name already exists.");

        category.Name = name;
        await _db.SaveChangesAsync();

        return Ok(category);
    }

    // DELETE: api/categories/5
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var category = await _db.Categories.FirstOrDefaultAsync(c => c.Id == id);
        if (category is null)
            return NotFound();

        _db.Categories.Remove(category);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}
