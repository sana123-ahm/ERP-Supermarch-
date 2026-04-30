package com.erpsupermarche.service;

import com.erpsupermarche.dto.ProductDTO;
import com.erpsupermarche.entity.Product;
import com.erpsupermarche.entity.Stock;
import com.erpsupermarche.repository.ProductRepository;
import com.erpsupermarche.repository.StockRepository;
import com.erpsupermarche.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private StockRepository stockRepository;

    public ProductDTO createProduct(ProductDTO dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .description(dto.getDescription())
                .price(dto.getPrice() != null ? BigDecimal.valueOf(dto.getPrice()) : BigDecimal.ZERO)
                .salePrice(dto.getPrice() != null ? BigDecimal.valueOf(dto.getPrice()) : BigDecimal.ZERO)
                .costPrice(dto.getCostPrice() != null ? BigDecimal.valueOf(dto.getCostPrice()) : BigDecimal.ZERO)
                .tva(dto.getTva() != null ? dto.getTva() : 20.0)
                .barcode(dto.getBarcode())
                .sku(dto.getSku())
                .category(dto.getCategory())
                .imageUrl(dto.getImageUrl())
                .active(true)
                .build();

        product = productRepository.save(product);
        
        Stock stock = Stock.builder()
                .product(product)
                .quantity(dto.getStock() != null ? dto.getStock() : 0)
                .minQuantity(dto.getThreshold() != null ? dto.getThreshold() : 10)
                .build();
        stockRepository.save(stock);
        
        return convertToDTO(product);
    }

    public ProductDTO getProductById(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return convertToDTO(product);
    }

    public List<ProductDTO> getAllProducts() {
        return productRepository.findAll().stream()
                .filter(p -> p.getActive() == null || p.getActive())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<ProductDTO> getProductsByCategory(String category) {
        return productRepository.findByCategory(category).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public ProductDTO getProductByBarcode(String barcode) {
        Product product = productRepository.findByBarcode(barcode)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return convertToDTO(product);
    }

    public ProductDTO updateProduct(String id, ProductDTO dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

        if (dto.getName() != null) product.setName(dto.getName());
        if (dto.getDescription() != null) product.setDescription(dto.getDescription());
        if (dto.getPrice() != null) {
            product.setPrice(BigDecimal.valueOf(dto.getPrice()));
            product.setSalePrice(BigDecimal.valueOf(dto.getPrice()));
        }
        if (dto.getCostPrice() != null) product.setCostPrice(BigDecimal.valueOf(dto.getCostPrice()));
        if (dto.getTva() != null) product.setTva(dto.getTva());
        if (dto.getBarcode() != null) product.setBarcode(dto.getBarcode());
        if (dto.getCategory() != null) product.setCategory(dto.getCategory());

        productRepository.save(product);
        
        stockRepository.findByProductId(id).ifPresentOrElse(stock -> {
            if (dto.getStock() != null) stock.setQuantity(dto.getStock());
            if (dto.getThreshold() != null) stock.setMinQuantity(dto.getThreshold());
            stockRepository.save(stock);
        }, () -> {
            Stock newStock = Stock.builder()
                    .product(product)
                    .quantity(dto.getStock() != null ? dto.getStock() : 0)
                    .minQuantity(dto.getThreshold() != null ? dto.getThreshold() : 10)
                    .build();
            stockRepository.save(newStock);
        });
        
        return convertToDTO(product);
    }

    public void fixZeroPrices() {
        var products = productRepository.findAll();
        for (var product : products) {
            if (product.getPrice() == null || product.getPrice().compareTo(BigDecimal.ZERO) == 0) {
                
                // Si la base de données a déjà un prix de vente valide dans sale_price (comme vu sur la capture)
                if (product.getSalePrice() != null && product.getSalePrice().compareTo(BigDecimal.ZERO) > 0) {
                    product.setPrice(product.getSalePrice());
                    // Estimer le cost_price à 70% du prix de vente
                    product.setCostPrice(product.getSalePrice().multiply(BigDecimal.valueOf(0.7)));
                } else {
                    // Sinon, générer un prix aléatoire
                    double randomPrice = 5 + (Math.random() * 50);
                    double randomCost = randomPrice * 0.7;
                    
                    product.setPrice(BigDecimal.valueOf(Math.round(randomPrice * 100.0) / 100.0));
                    product.setSalePrice(product.getPrice());
                    product.setCostPrice(BigDecimal.valueOf(Math.round(randomCost * 100.0) / 100.0));
                }
                
                productRepository.save(product);
            }
        }
    }

    public void deleteProduct(String id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        
        // Soft delete pour éviter de casser l'historique des ventes/stocks
        product.setActive(false);
        productRepository.save(product);
    }

    private ProductDTO convertToDTO(Product product) {
        var stockOpt = stockRepository.findByProductId(product.getId());
        
        return ProductDTO.builder()
                .id(product.getId())
                .name(product.getName())
                .description(product.getDescription())
                .price(product.getPrice().doubleValue())
                .costPrice(product.getCostPrice() != null ? product.getCostPrice().doubleValue() : 0.0)
                .tva(product.getTva() != null ? product.getTva() : 20.0)
                .stock(stockOpt.map(s -> s.getQuantity()).orElse(0))
                .threshold(stockOpt.map(s -> s.getMinQuantity()).orElse(0))
                .barcode(product.getBarcode())
                .sku(product.getSku())
                .category(product.getCategory())
                .imageUrl(product.getImageUrl())
                .active(product.getActive())
                .build();
    }
}
