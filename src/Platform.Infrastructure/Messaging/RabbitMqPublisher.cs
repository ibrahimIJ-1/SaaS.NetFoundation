using Platform.Application.Messaging.Interfaces;
using RabbitMQ.Client;
using System.Text;
using System.Text.Json;

namespace Platform.Infrastructure.Messaging
{
    public class RabbitMqPublisher(RabbitMqConnection connection) : IMessageBus
    {
        private readonly IConnection _connection = connection.Connection;

        public async Task PublishAsync<T>(T message, string queueName)
        {
            var channel = await _connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: queueName,
                durable: true,
                exclusive: false,
                autoDelete: false);

            var body = Encoding.UTF8.GetBytes(JsonSerializer.Serialize(message));

            await channel.BasicPublishAsync(
                exchange: "",
                routingKey: queueName,
                body: body);
        }
    }
}
