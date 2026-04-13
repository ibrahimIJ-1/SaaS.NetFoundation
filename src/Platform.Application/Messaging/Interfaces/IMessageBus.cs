using System;
using System.Collections.Generic;
using System.Text;

namespace Platform.Application.Messaging.Interfaces
{
    public interface IMessageBus 
    {
        Task PublishAsync<T>(T message, string queueName);
    }
}
