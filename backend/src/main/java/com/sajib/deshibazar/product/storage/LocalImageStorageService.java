
package com.sajib.deshibazar.product.storage;

import com.sajib.deshibazar.common.exception.InvalidImageException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@Service
public class LocalImageStorageService implements ImageStorageService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp"
    );

    private final Path uploadDirectory;

    public LocalImageStorageService(
            @Value("${app.upload.dir:uploads/products}") String uploadDir
    ) {
        this.uploadDirectory = Paths.get(uploadDir)
                .toAbsolutePath()
                .normalize();
    }

    @Override
    public String upload(MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new InvalidImageException("Image file is required");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new InvalidImageException("Image size cannot exceed 5 MB");
        }

        String extension = ALLOWED_TYPES.get(file.getContentType());

        if (extension == null) {
            throw new InvalidImageException(
                    "Only JPG, PNG and WEBP images are allowed"
            );
        }

        try {
            Files.createDirectories(uploadDirectory);

            String filename = UUID.randomUUID() + extension;

            Path targetPath = uploadDirectory.resolve(filename).normalize();

            if (!targetPath.startsWith(uploadDirectory)) {
                throw new InvalidImageException("Invalid file path");
            }

            Files.copy(file.getInputStream(), targetPath);

            return "/uploads/" + filename;

        } catch (IOException exception) {
            throw new RuntimeException("Image upload failed", exception);
        }
    }

    @Override
    public void delete(String imageUrl) {

        if (imageUrl == null || imageUrl.isBlank()) {
            return;
        }

        String filename = imageUrl.replace("/uploads/", "");

        try {
            Path imagePath = uploadDirectory.resolve(filename).normalize();

            if (!imagePath.startsWith(uploadDirectory)) {
                throw new InvalidImageException("Invalid image path");
            }

            Files.deleteIfExists(imagePath);

        } catch (IOException exception) {
            throw new RuntimeException("Image deletion failed", exception);
        }
    }
}
