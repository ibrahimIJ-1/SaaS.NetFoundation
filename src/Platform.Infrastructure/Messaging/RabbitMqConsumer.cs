using Microsoft.Extensions.DependencyInjection;
using Platform.Application.Abstractions;
using Platform.Application.Messaging.DTOs;
using Platform.Application.Notifications.Interfaces;
using Platform.Infrastructure.Messaging;
using RabbitMQ.Client;
using RabbitMQ.Client.Events;
using System.Text;
using System.Text.Json;

namespace Platform.Infrastructure.Messaging
{
    public class RabbitMqConsumer
    {
        private readonly IServiceProvider _sp;
        private readonly IConnection _connection;

        public RabbitMqConsumer(IServiceProvider sp, RabbitMqConnection connection)
        {
            _sp = sp;
            _connection = connection.Connection;
        }

        public async Task StartAsync()
        {
            var channel = await _connection.CreateChannelAsync();

            await channel.QueueDeclareAsync(
                queue: "order-created",
                durable: true,
                exclusive: false,
                autoDelete: false);

            var consumer = new AsyncEventingBasicConsumer(channel);

            consumer.ReceivedAsync += async (sender, args) =>
            {
                var json = Encoding.UTF8.GetString(args.Body.ToArray());

                var data = JsonSerializer.Deserialize<OrderCreatedEvent>(json);

                using var scope = _sp.CreateScope();

                var tenantProvider = scope.ServiceProvider.GetRequiredService<ITenantProvider>();
                await tenantProvider.SetTenantByIdAsync(data!.TenantId);
                
                var notification = scope.ServiceProvider.GetRequiredService<INotificationService>();

                await notification.SendToUserAsync(data.UserId, "Order created 🚀");

                // ✅ acknowledge
                await channel.BasicAckAsync(args.DeliveryTag, false);
            };

            await channel.BasicConsumeAsync(
                queue: "order-created",
                autoAck: false,
                consumer: consumer);
        }
    }
}
