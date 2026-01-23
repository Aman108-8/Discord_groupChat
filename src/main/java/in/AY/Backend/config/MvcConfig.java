package in.AY.Backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.CorsRegistry;

@Configuration
public class MvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve uploaded images from "uploads" directory
    	// /uploads/abc.jpg
    	// Maps to local folder:
    	// it tells spring When a browser asks for THIS URL, serve a FILE from HERE
    	/*
    	  		Without registry				With registry
    	 
    	  Need controller to serve image	Browser fetches directly
    	  More server load							Faster
    	  Manual response handling				  Automatic
    	  Bad for large files					  Optimized
    	*/
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }

	    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Allow your frontend to access backend
        registry.addMapping("/**") // all endpoints
                .allowedOrigins("http://localhost:5173") // frontend URL
                .allowedMethods("GET","POST","PUT","DELETE","OPTIONS")
                .allowCredentials(true);
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
