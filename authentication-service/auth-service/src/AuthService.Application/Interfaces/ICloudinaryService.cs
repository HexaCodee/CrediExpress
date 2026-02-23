namespace AuthService.Application.Interfaces;

public interface ICloudinaryService
{
    Task<string> UploadImageAsync(IFileData imageFile, string fileName);
    Task<bool> DeleteImageAsync(string publicId);
    string GetDefaultAvatarUrl();
    string GetFullImageUrl(string imagePath);
}
