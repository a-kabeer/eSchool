using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using eSchool.Infrastructure;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace eSchool.WebAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _config;

    public AuthController(AppDbContext context, IConfiguration config)
    {
        _context = context;
        _config = config;
    }

    public record LoginRequest(string Email, string Password);
    public record LoginResponse(
        string Token,
        Guid UserId,
        string FullName,
        string Email,
        string UserType,
        Guid DefaultSchoolId,
        IReadOnlyList<CampusDto> Campuses
    );
    public record CampusDto(Guid Id, string Name, string Code);

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        var user = await _context.Users
            .Include(u => u.SchoolAccess)
            .ThenInclude(sa => sa.School)
            .FirstOrDefaultAsync(u => u.Email.ToLower() == req.Email.ToLower() && u.IsActive);

        if (user == null || !DataSeeder.VerifyPassword(req.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }

        user.LastLoginAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        var defaultSchool = user.SchoolAccess.FirstOrDefault(sa => sa.IsDefault)?.School 
                            ?? user.SchoolAccess.FirstOrDefault()?.School;
        var defaultSchoolId = defaultSchool?.Id ?? Guid.Empty;

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"] ?? "eSchool_Secure_Enterprise_JWT_Signing_Key_2026_Modern_Modular_Monolith!");

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Name, user.FullName),
            new(ClaimTypes.Role, user.UserType),
            new("SchoolId", defaultSchoolId.ToString())
        };

        foreach (var sa in user.SchoolAccess)
        {
            claims.Add(new("AccessibleSchools", sa.SchoolId.ToString()));
        }

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);

        var campuses = user.SchoolAccess
            .Where(sa => sa.School != null)
            .Select(sa => new CampusDto(sa.School!.Id, sa.School.Name, sa.School.Code))
            .ToList();

        return Ok(new LoginResponse(
            tokenHandler.WriteToken(token),
            user.Id,
            user.FullName,
            user.Email,
            user.UserType,
            defaultSchoolId,
            campuses
        ));
    }
}
