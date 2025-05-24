package tn.ooredoo.backendspringboot;


import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableAsync;
import tn.ooredoo.backendspringboot.role.Role;
import tn.ooredoo.backendspringboot.role.RoleRepository;

@SpringBootApplication
@EnableJpaAuditing
@EnableAsync
public class BackEndSpringBootApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackEndSpringBootApplication.class, args);
    }

    @Bean
    public CommandLineRunner commandLineRunner(RoleRepository roleRepository) {
        return args -> {
            if (roleRepository.findByName("USER").isEmpty()) {
                roleRepository.save(
                        Role.builder().name("USER").build()
                );
            }
        };
    }
}