using Hangfire;
using Platform.Application.Jobs.Interfaces;
using Platform.Infrastructure.Jobs.Handlers;

namespace Platform.Infrastructure.Jobs.Services
{
    public class JobService : IJobService
    {
        public void EnqueueOrderCreated(string tenantId, string userId)
        {
            BackgroundJob.Enqueue<OrderCreatedJob>(job =>
                job.Execute(tenantId, userId));
        }
    }
}
