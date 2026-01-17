package in.AY.Backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded images from "uploads" directory
    	// /uploads/abc.jpg
    	// Maps to local folder:
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
    
    // You can add other WebMvcConfigurer methods here
}

/*
Application start
		↓
Spring scans @Configuration
		↓
Registers ResourceHandler
		↓
Maps /uploads/** → file system
		↓
Enables static image access
*/