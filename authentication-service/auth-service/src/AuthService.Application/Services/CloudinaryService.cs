using AuthService.Application.Interfaces;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.Extensions.Configuration;
namespace AuthService.Application.Services;

public class CloudinaryService(IConfiguration configuration) : ICloudinaryService
{
    private readonly Cloudinary _cloudinary = new(new Account(
        configuration["CloudinarySettings:CloudName"],
        configuration["CloudinarySettings:ApiKey"],
        configuration["CloudinarySettings:ApiSecret"]
    ));

    public async Task<string> UploadImageAsync(IFileData imageFile, string fileName)
    {
        try
        {
            using var stream = new MemoryStream(imageFile.Data);

            var folder = configuration["CloudinarySettings:Folder"] ?? "auth_service/profiles";
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(imageFile.FileName, stream),
                PublicId = $"{folder}/{fileName}",
                Folder = folder,
                Transformation = new Transformation()
                    .Width(400)
                    .Height(400)
                    .Crop("fill")
                    .Gravity("face")
                    .Quality("auto")
                    .FetchFormat("auto")
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
            {
                throw new InvalidOperationException($"Error uploading image: {uploadResult.Error.Message}");
            }

            return fileName;
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Failed to upload image to Cloudinary: {ex.Message}", ex);
        }
    }

    public async Task<bool> DeleteImageAsync(string publicId)
    {
        try
        {
            var deleteParams = new DelResParams
            {
                PublicIds = [publicId]
            };

            var result = await _cloudinary.DeleteResourcesAsync(deleteParams);
            return result.Deleted?.ContainsKey(publicId) == true;
        }
        catch
        {
            return false;
        }
    }

    public string GetDefaultAvatarUrl()
    {

        var defaultPath = configuration["CloudinarySettings:DefaultAvatarPath"] ?? "default-avatar_ewzxwx.png";
        if (defaultPath.Contains('/')) return defaultPath.Split('/').Last();
        return defaultPath;
    }

    public string GetFullImageUrl(string imagePath)
    {
        var baseUrl = configuration["CloudinarySettings:BaseUrl"] ?? "https://res.cloudinary.com/dug3apxt3/image/upload/";
        var folder = configuration["CloudinarySettings:Folder"] ?? "auth_service/profiles";
        var defaultPath = configuration["CloudinarySettings:DefaultAvatarPath"] ?? "default-avatar_ewzxwx.png";

        var pathToUse = string.IsNullOrWhiteSpace(imagePath) ? defaultPath : imagePath;
        if (!pathToUse.Contains('/')) pathToUse = $"{folder}/{pathToUse}";

        return $"{baseUrl}{pathToUse}";
    }

    private static string SanitizeFileName(string fileName)
    {
        return fileName
            .Trim()
            .Replace(" ", "_")
            .Replace("-", "_")
            .ToLowerInvariant();
    }
}
