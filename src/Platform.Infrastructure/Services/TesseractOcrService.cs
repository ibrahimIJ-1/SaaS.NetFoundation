using Microsoft.Extensions.Logging;
using Platform.Application.Abstractions;
using System.Diagnostics;
using System.Runtime.InteropServices;

namespace Platform.Infrastructure.Services
{
    public class TesseractOcrService : IDocumentOcrService
    {
        private readonly ILogger<TesseractOcrService> _logger;

        private static readonly string[] OcrMimeTypes =
        {
            "image/jpeg", "image/png", "image/gif", "image/webp", "image/bmp",
            "application/pdf"
        };

        private static readonly string[] OcrExtensions =
        {
            ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".pdf"
        };

        public TesseractOcrService(ILogger<TesseractOcrService> logger)
        {
            _logger = logger;
        }

        public bool CanOcr(string contentType, string? fileName = null)
        {
            if (OcrMimeTypes.Contains(contentType, StringComparer.OrdinalIgnoreCase))
                return true;

            if (OcrExtensions.Any(ext =>
                    contentType.EndsWith(ext, StringComparison.OrdinalIgnoreCase)))
                return true;

            // Fallback: check file extension for old docs with empty contentType
            if (!string.IsNullOrEmpty(fileName))
            {
                var ext = Path.GetExtension(fileName)?.ToLowerInvariant();
                if (!string.IsNullOrEmpty(ext) && OcrExtensions.Contains(ext))
                    return true;
            }

            return false;
        }

        public async Task<Stream> OcrToSearchablePdfAsync(
            Stream fileStream, string fileName, string language = "ara+eng")
        {
            var tesseractPath = FindTesseract()
                ?? throw new InvalidOperationException(
                    "Tesseract OCR not found. Install tesseract-ocr:\n" +
                    "  Ubuntu: sudo apt install tesseract-ocr tesseract-ocr-ara tesseract-ocr-eng\n" +
                    "  Windows: https://github.com/UB-Mannheim/tesseract/wiki");

            var tempDir = Path.Combine(Path.GetTempPath(), $"ocr_{Guid.NewGuid()}");
            Directory.CreateDirectory(tempDir);

            var inputPath = Path.Combine(tempDir, $"input{Path.GetExtension(fileName)}");
            var outputPath = Path.Combine(tempDir, "output");

            try
            {
                using (var fs = File.Create(inputPath))
                {
                    await fileStream.CopyToAsync(fs);
                }

                var isPdf = Path.GetExtension(fileName)?.Equals(".pdf", StringComparison.OrdinalIgnoreCase) == true;

                // For PDFs, try Ghostscript fallback if Tesseract can't read PDFs directly
                var tesseractInput = inputPath;
                if (isPdf)
                {
                    var gsPath = FindGhostscript();
                    if (gsPath != null)
                    {
                        var tiffPath = Path.Combine(tempDir, "pages.tiff");
                        var gsArgs = $"-dNOPAUSE -dBATCH -sDEVICE=tiffgray -r300 -sOutputFile=\"{tiffPath}\" \"{inputPath}\"";
                        var gsPsi = new ProcessStartInfo
                        {
                            FileName = gsPath,
                            Arguments = gsArgs,
                            CreateNoWindow = true,
                            UseShellExecute = false,
                            RedirectStandardError = true,
                        };

                        using var gsProcess = Process.Start(gsPsi);
                        if (gsProcess != null)
                        {
                            var gsErr = await gsProcess.StandardError.ReadToEndAsync();
                            if (gsProcess.WaitForExit(120_000) && gsProcess.ExitCode == 0 && File.Exists(tiffPath))
                            {
                                tesseractInput = tiffPath;
                            }
                        }
                    }
                }

                var psi = new ProcessStartInfo
                {
                    FileName = tesseractPath,
                    Arguments = $"\"{tesseractInput}\" \"{outputPath}\" -l {language} pdf",
                    CreateNoWindow = true,
                    UseShellExecute = false,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true
                };

                using var process = Process.Start(psi);
                if (process == null)
                    throw new InvalidOperationException("Failed to start Tesseract process.");

                var stderr = await process.StandardError.ReadToEndAsync();

                if (!process.WaitForExit(300_000))
                {
                    process.Kill();
                    throw new TimeoutException("Tesseract OCR timed out after 5 minutes.");
                }

                if (process.ExitCode != 0)
                {
                    _logger.LogError("Tesseract failed: {Error}", stderr);

                    if (stderr.Contains("Pdf reading is not supported", StringComparison.OrdinalIgnoreCase))
                    {
                        throw new InvalidOperationException(
                            "Tesseract was installed without PDF reading support, and Ghostscript " +
                            "(GS) was not found as a fallback. Install one of:\n" +
                            "  1. Ghostscript: https://ghostscript.com/releases/gsdnld.html\n" +
                            "  2. Reinstall Tesseract from UB-Mannheim with PDF Support component\n" +
                            "  3. Chocolatey: choco install ghostscript");
                    }

                    throw new InvalidOperationException($"Tesseract OCR failed: {stderr}");
                }

                var pdfPath = outputPath + ".pdf";
                if (!File.Exists(pdfPath))
                    throw new FileNotFoundException("Tesseract did not produce a PDF output.");

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
                try { Directory.Delete(tempDir, true); } catch { }
            }
        }

        private static string? FindGhostscript()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                var baseDirs = new[]
                {
                    @"C:\Program Files\gs",
                    @"C:\Program Files (x86)\gs",
                };

                foreach (var baseDir in baseDirs)
                {
                    if (!Directory.Exists(baseDir)) continue;
                    foreach (var verDir in Directory.EnumerateDirectories(baseDir))
                    {
                        var exe = Path.Combine(verDir, "bin", "gswin64c.exe");
                        if (File.Exists(exe)) return exe;
                        exe = Path.Combine(verDir, "bin", "gswin32c.exe");
                        if (File.Exists(exe)) return exe;
                    }
                }

                var pathEnv = Environment.GetEnvironmentVariable("PATH");
                if (pathEnv != null)
                {
                    foreach (var dir in pathEnv.Split(Path.PathSeparator))
                    {
                        try
                        {
                            var exe = Path.Combine(dir.Trim('"'), "gswin64c.exe");
                            if (File.Exists(exe)) return exe;
                            exe = Path.Combine(dir.Trim('"'), "gswin32c.exe");
                            if (File.Exists(exe)) return exe;
                        }
                        catch { }
                    }
                }
            }
            else
            {
                try
                {
                    var which = Process.Start(new ProcessStartInfo
                    {
                        FileName = "which",
                        Arguments = "gs",
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

                var candidates = new[]
                {
                    "/usr/bin/gs",
                    "/usr/local/bin/gs",
                };
                return candidates.FirstOrDefault(File.Exists);
            }

            return null;
        }

        private static string? FindTesseract()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                var candidates = new List<string>
                {
                    @"C:\Program Files\Tesseract-OCR\tesseract.exe",
                    @"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe",
                };

                var pathEnv = Environment.GetEnvironmentVariable("PATH");
                if (pathEnv != null)
                {
                    foreach (var dir in pathEnv.Split(Path.PathSeparator))
                    {
                        try
                        {
                            var exe = Path.Combine(dir.Trim('"'), "tesseract.exe");
                            if (File.Exists(exe)) candidates.Add(exe);
                        }
                        catch { }
                    }
                }

                return candidates.FirstOrDefault(File.Exists);
            }
            else
            {
                try
                {
                    var which = Process.Start(new ProcessStartInfo
                    {
                        FileName = "which",
                        Arguments = "tesseract",
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

                var candidates = new[]
                {
                    "/usr/bin/tesseract",
                    "/usr/local/bin/tesseract",
                };
                return candidates.FirstOrDefault(File.Exists);
            }
        }
    }
}
