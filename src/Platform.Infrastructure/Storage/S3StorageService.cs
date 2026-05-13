using Amazon.S3;
using Amazon.S3.Transfer;
using Microsoft.Extensions.Configuration;
using Platform.Application.Abstractions;
using System;
using System.IO;
using System.Threading.Tasks;

namespace Platform.Infrastructure.Storage
{
    public class S3StorageService : IStorageService
    {
        private readonly IAmazonS3 _s3Client;
        private readonly string _bucketName;

        public S3StorageService(IConfiguration configuration)
        {
            var options = new AmazonS3Config
            {
                ServiceURL = configuration["AWS:ServiceURL"],
                AuthenticationRegion = configuration["AWS:Region"] ?? "eu-north-1",
                ForcePathStyle = true
            };
            
            _s3Client = new AmazonS3Client(
                configuration["AWS:AccessKey"],
                configuration["AWS:SecretKey"],
                options);
            _bucketName = configuration["AWS:BucketName"] ?? "qanuni-documents";
        }

        public async Task<string> UploadFileAsync(Stream stream, string fileName, string contentType)
        {
            if (stream == null || stream.Length == 0)
                throw new ArgumentException("Stream is empty or null.");

            var fileTransferUtility = new TransferUtility(_s3Client);

            // Note: UploadAsync does not automatically set ContentType if passed a stream directly
            // We'll use a more detailed request if we need specific metadata
            var uploadRequest = new TransferUtilityUploadRequest
            {
                InputStream = stream,
                BucketName = _bucketName,
                Key = fileName,
                ContentType = contentType,
                AutoCloseStream = false
            };

            await fileTransferUtility.UploadAsync(uploadRequest);

            // In production, we'd return a presigned URL or CDN URL.
            // For now, we return the object key or a mock URL.
            return $"https://{_bucketName}.s3.amazonaws.com/{fileName}";
        }

        public async Task DeleteFileAsync(string fileKey)
        {
            // Remove the URL part if it's a full URL
            var key = fileKey.Contains(".amazonaws.com/") 
                ? fileKey.Split(".amazonaws.com/")[1] 
                : fileKey;

            await _s3Client.DeleteObjectAsync(_bucketName, key);
        }
    }
}
