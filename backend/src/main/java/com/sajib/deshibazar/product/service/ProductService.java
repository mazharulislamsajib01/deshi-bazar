
package com.sajib.deshibazar.product.service;

import com.sajib.deshibazar.product.entity.Product;
import com.sajib.deshibazar.product.repository.ProductRepository;
import com.sajib.deshibazar.product.storage.ImageStorageService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ImageStorageService imageStorageService;

    public ProductService(
            ProductRepository productRepository,
            ImageStorageService imageStorageService
    ) {
        this.productRepository = productRepository;
        this.imageStorageService = imageStorageService;
    }

    public Product save(Product product) {
        return productRepository.save(product);
    }

    public List<Product> findAll() {
        return productRepository.findAll();
    }

    public Optional<Product> findById(Long id) {
        return productRepository.findById(id);
    }

    public List<Product> searchByName(String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> findByCategory(String category) {
        return productRepository.findByCategoryIgnoreCase(category);
    }

    public Page<Product> findAll(Pageable pageable) {
        return productRepository.findAll(pageable);
    }

    public Optional<Product> update(Long id, Product updatedProduct) {

        return productRepository.findById(id)
                .map(existingProduct -> {

                    existingProduct.setName(updatedProduct.getName());
                    existingProduct.setDescription(updatedProduct.getDescription());
                    existingProduct.setPrice(updatedProduct.getPrice());
                    existingProduct.setStock(updatedProduct.getStock());
                    existingProduct.setCategory(updatedProduct.getCategory());

                    return productRepository.save(existingProduct);
                });
    }

    public Optional<Product> uploadImage(
            Long productId,
            MultipartFile file
    ) {
        return productRepository.findById(productId)
                .map(product -> {

                    String oldImageUrl = product.getImageUrl();

                    String newImageUrl = imageStorageService.upload(file);

                    product.setImageUrl(newImageUrl);

                    Product savedProduct = productRepository.save(product);

                    if (oldImageUrl != null) {
                        imageStorageService.delete(oldImageUrl);
                    }

                    return savedProduct;
                });
    }

    public void deleteById(Long id) {

        Product product = productRepository.findById(id)
                .orElse(null);

        if (product == null) {
            return;
        }

        String imageUrl = product.getImageUrl();

        productRepository.delete(product);

        if (imageUrl != null) {
            imageStorageService.delete(imageUrl);
        }
    }
}
