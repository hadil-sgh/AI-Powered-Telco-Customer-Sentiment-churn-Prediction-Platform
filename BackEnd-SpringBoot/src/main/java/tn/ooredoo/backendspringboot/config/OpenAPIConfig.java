package tn.ooredoo.backendspringboot.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Contact;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.info.License;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;

@OpenAPIDefinition(
        info = @Info(
                contact = @Contact(
                        name = "Ooredoo Backend Team",
                        email = "hadil.sghair@esprit.tn"
                ),
                description = "Documentation for Ooredoo's Customer Interactions /Marketing Management",
                title = "Ooredoo Backend API",
                version = "1.0",
                license = @License(
                        name = "license",
                        url = "https://some-url.com"

                ),
                termsOfService = "Terms of service "
        ),
        servers = {
                @Server(
                        description = "Localhost server",
                        url = "http://localhost:8080/api/v1"

                ),
                @Server(
                        description = "Production server",
                        url = "https://api.ooredoo.tn/retention"
                )

        },
        security = {
                @SecurityRequirement(
                        name = "bearerAuth"
                )
        }

)
@SecurityScheme(
        name = "bearerAuth" ,
        description = "JWT auth description",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER

)
public class OpenAPIConfig {
}
