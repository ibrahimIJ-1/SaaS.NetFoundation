using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Platform.Persistence.Identity;

namespace Platform.Application.Multitenancy
{
    public interface IUserManagerFactory
    {
        UserManager<IdentityUser> Create(TenantIdentityDbContext dbContext);
    }

    public class UserManagerFactory : IUserManagerFactory
    {
        public UserManager<IdentityUser> Create(TenantIdentityDbContext dbContext)
        {
            var store = new UserStore<IdentityUser>(dbContext);
            return new UserManager<IdentityUser>(
                store,
                null,
                new PasswordHasher<IdentityUser>(),
                new List<IUserValidator<IdentityUser>>(),
                new List<IPasswordValidator<IdentityUser>>(),
                new UpperInvariantLookupNormalizer(),
                new IdentityErrorDescriber(),
                null,
                null
            );
        }
    }
}
