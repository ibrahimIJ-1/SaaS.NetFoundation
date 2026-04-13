using RabbitMQ.Client;

namespace Platform.Infrastructure.Messaging
{
    public class RabbitMqConnection
    {
        public IConnection Connection { get; }

        public RabbitMqConnection(string connectionString)
        {
            var factory = new ConnectionFactory
            {
                Uri = new Uri(connectionString)
            };

            // ✅ NEW API
            Connection = factory.CreateConnectionAsync().GetAwaiter().GetResult();
        }
    }
}
