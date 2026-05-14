using System.ComponentModel.DataAnnotations;

namespace Platform.Application.Auth
{
    public class LoginRequest
    {
        [Required]
        public string Email { get; set; } = default!;

        [Required]
        public string Password { get; set; } = default!;
    }
}
