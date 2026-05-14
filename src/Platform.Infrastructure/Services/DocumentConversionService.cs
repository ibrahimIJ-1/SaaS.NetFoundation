using Microsoft.Extensions.Logging;
using Platform.Application.Abstractions;
using System;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

namespace Platform.Infrastructure.Services
{
    public class DocumentConversionService : IDocumentConversionService
    {
        private readonly ILogger<DocumentConversionService> _logger;

        private static readonly string[] ConvertibleMimeTypes =
        {
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/rtf",
            "text/plain"
        };

        private static readonly string[] ConvertibleExtensions =
        {
            ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".rtf", ".txt"
        };

        public DocumentConversionService(ILogger<DocumentConversionService> logger)
        {
            _logger = logger;
        }

        public bool CanConvert(string contentType)
        {
            return ConvertibleMimeTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase)
                || ConvertibleExtensions.Any(ext =>
                    contentType.EndsWith(ext, StringComparison.OrdinalIgnoreCase));
        }

        public async Task<Stream> ConvertToPdfAsync(Stream fileStream, string fileName)
        {
            var tempInput = Path.Combine(Path.GetTempPath(), $"convert_{Guid.NewGuid()}_{fileName}");
            var tempDir = Path.GetDirectoryName(tempInput)!;
            var tempOutputBase = Path.Combine(tempDir, Path.GetFileNameWithoutExtension(tempInput));

            try
            {
                using (var fs = File.Create(tempInput))
                {
                    await fileStream.CopyToAsync(fs);
                }

                var libreOfficePath = FindLibreOffice();
                if (libreOfficePath == null)
                    throw new InvalidOperationException("LibreOffice not found. Install LibreOffice to enable document conversion.");

                var psi = new ProcessStartInfo
                {
                    FileName = libreOfficePath,
                    Arguments = $"--headless --convert-to pdf \"{tempInput}\" --outdir \"{tempDir}\"",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                using var process = Process.Start(psi);
                if (process == null)
                    throw new InvalidOperationException("Failed to start LibreOffice process.");

                var stdout = await process.StandardOutput.ReadToEndAsync();
                var stderr = await process.StandardError.ReadToEndAsync();

                if (!process.WaitForExit(60000))
                {
                    process.Kill();
                    throw new TimeoutException("LibreOffice conversion timed out after 60 seconds.");
                }

                if (process.ExitCode != 0)
                {
                    _logger.LogError("LibreOffice conversion failed: {Stderr}", stderr);
                    throw new InvalidOperationException($"LibreOffice conversion failed: {stderr}");
                }

                var pdfPath = tempOutputBase + ".pdf";
                if (!File.Exists(pdfPath))
                {
                    var dirPdf = Directory.GetFiles(tempDir, $"{Path.GetFileNameWithoutExtension(tempInput)}.pdf")
                                         .FirstOrDefault();
                    pdfPath = dirPdf ?? throw new FileNotFoundException("PDF output not found after conversion.");
                }

                var result = new MemoryStream();
                using (var fs = File.OpenRead(pdfPath))
                {
                    await fs.CopyToAsync(result);
                }
                result.Position = 0;
                return result;
            }
            finally
            {
                TryDelete(tempInput);
                TryDelete(Path.Combine(tempDir, Path.GetFileNameWithoutExtension(tempInput) + ".pdf"));
            }
        }

        private static string? FindLibreOffice()
        {
            var candidates = new List<string>();

            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                candidates.AddRange(new[]
                {
                    @"C:\Program Files\LibreOffice\program\soffice.exe",
                    @"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
                    @"C:\Program Files\LibreOffice\program\soffice.bin",
                });

                // Search PATH
                var pathEnv = Environment.GetEnvironmentVariable("PATH");
                if (pathEnv != null)
                {
                    foreach (var dir in pathEnv.Split(Path.PathSeparator))
                    {
                        try
                        {
                            var exe = Path.Combine(dir.Trim('"'), "soffice.exe");
                            if (File.Exists(exe)) candidates.Add(exe);
                            exe = Path.Combine(dir.Trim('"'), "soffice");
                            if (File.Exists(exe)) candidates.Add(exe);
                        }
                        catch { }
                    }
                }
            }
            else
            {
                // Linux/macOS — try `which` first
                try
                {
                    var which = Process.Start(new ProcessStartInfo
                    {
                        FileName = "which",
                        Arguments = "libreoffice",
                        UseShellExecute = false,
                        RedirectStandardOutput = true
                    });
                    if (which != null)
                    {
                        var path = which.StandardOutput.ReadToEnd().Trim();
                        which.WaitForExit();
                        if (which.ExitCode == 0 && !string.IsNullOrEmpty(path))
                            return path;
                    }
                }
                catch { }

                candidates.AddRange(new[]
                {
                    "/usr/bin/libreoffice",
                    "/usr/local/bin/libreoffice",
                    "/snap/bin/libreoffice",
                });
            }

            return candidates.FirstOrDefault(File.Exists);
        }

        private static void TryDelete(string path)
        {
            try { if (File.Exists(path)) File.Delete(path); } catch { }
        }
    }
}
