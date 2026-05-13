using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;
using Platform.Application.Common.Interfaces;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

namespace Platform.Infrastructure.Services
{
    public class GeminiAIService : IAIService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;
        private const string _baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

        public GeminiAIService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _apiKey = configuration["AI:GeminiApiKey"] ?? "";
        }

        public async Task<string> Chat(string prompt, string? context = null)
        {
            if (string.IsNullOrEmpty(_apiKey)) return "AI service is not configured. Please add GeminiApiKey to settings.";

            var systemPrompt = "You are Qanuni AI, a professional legal assistant for a top-tier law firm. " +
                               "Provide accurate, helpful, and concise legal assistance. " +
                               "Answer in the same language as the user (usually Arabic).";

            var fullPrompt = context != null 
                ? $"{systemPrompt}\n\nContext: {context}\n\nUser: {prompt}" 
                : $"{systemPrompt}\n\nUser: {prompt}";

            return await CallGemini(fullPrompt);
        }

        public async Task<string> SummarizeLegalText(string text)
        {
            var prompt = $"Summarize the following legal text concisely. Extract key dates, parties, and actions required:\n\n{text}";
            return await CallGemini(prompt);
        }

        public async Task<string> AnalyzeDocument(string text)
        {
            var prompt = $"Analyze this legal document. Extract all important names, dates, amounts, and specific obligations in a structured format:\n\n{text}";
            return await CallGemini(prompt);
        }

        public async Task<string> TranscribeVoice(Stream audioStream)
        {
            try
            {
                using var ms = new MemoryStream();
                await audioStream.CopyToAsync(ms);
                var base64Audio = Convert.ToBase64String(ms.ToArray());

                var requestBody = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new object[]
                            {
                                new { text = "Transcribe the following audio precisely. If it is legal dictation, maintain the legal terminology. Return only the transcribed text. Language is likely Arabic or English." },
                                new { inline_data = new { mime_type = "audio/wav", data = base64Audio } }
                            }
                        }
                    }
                };

                var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_baseUrl}?key={_apiKey}", content);

                if (!response.IsSuccessStatusCode)
                {
                    return $"Transcription Error: {response.StatusCode}";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                dynamic jsonResponse = JsonConvert.DeserializeObject(responseString)!;
                
                return jsonResponse.candidates[0].content.parts[0].text;
            }
            catch (Exception ex)
            {
                return $"Transcription failed: {ex.Message}";
            }
        }

        private async Task<string> CallGemini(string prompt)
        {
            try
            {
                var requestBody = new
                {
                    contents = new[]
                    {
                        new { parts = new[] { new { text = prompt } } }
                    }
                };

                var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");
                var response = await _httpClient.PostAsync($"{_baseUrl}?key={_apiKey}", content);

                if (!response.IsSuccessStatusCode)
                {
                    var error = await response.Content.ReadAsStringAsync();
                    return $"Error from AI service: {response.StatusCode}";
                }

                var responseString = await response.Content.ReadAsStringAsync();
                dynamic jsonResponse = JsonConvert.DeserializeObject(responseString)!;
                
                return jsonResponse.candidates[0].content.parts[0].text;
            }
            catch (Exception ex)
            {
                return $"AI error: {ex.Message}";
            }
        }
    }
}
