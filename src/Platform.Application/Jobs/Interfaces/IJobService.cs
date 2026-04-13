namespace Platform.Application.Jobs.Interfaces
{
    public interface IJobService
    {
        void EnqueueOrderCreated(string tenantId, string userId);
    }
}
