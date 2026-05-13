using Amazon;
using Amazon.Runtime;
using Amazon.Textract;
using Amazon.Textract.Model;
using Microsoft.Extensions.Configuration;
using Platform.Application.Common.Interfaces;
using System;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Platform.Infrastructure.Services
{
    public class AWSTextractService : IOCRService
    {
        private readonly AmazonTextractClient _textractClient;

        public AWSTextractService(IConfiguration configuration)
        {
            var accessKey = configuration["AWS:AccessKey"];
            var secretKey = configuration["AWS:SecretKey"];
            var region = configuration["AWS:Region"] ?? "eu-north-1";

            var credentials = new BasicAWSCredentials(accessKey, secretKey);
            _textractClient = new AmazonTextractClient(credentials, RegionEndpoint.GetBySystemName(region));
        }

        public async Task<string> ExtractTextAsync(Stream fileStream, string fileName)
        {
            try
            {
                using var memoryStream = new MemoryStream();
                await fileStream.CopyToAsync(memoryStream);
                
                var request = new DetectDocumentTextRequest
                {
                    Document = new Document
                    {
                        Bytes = memoryStream
                    }
                };

                var response = await _textractClient.DetectDocumentTextAsync(request);
                
                var sb = new StringBuilder();
                foreach (var block in response.Blocks.Where(b => b.BlockType == BlockType.LINE))
                {
                    sb.AppendLine(block.Text);
                }

                return sb.ToString();
            }
            catch (Exception ex)
            {
                // In production, log this error
                return $"OCR Error: {ex.Message}";
            }
        }
    }
}
