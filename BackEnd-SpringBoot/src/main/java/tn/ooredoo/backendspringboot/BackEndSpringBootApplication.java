package tn.ooredoo.backendspringboot;


import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class BackEndSpringBootApplication {

	public static void main(String[] args) {
		SpringApplication.run(BackEndSpringBootApplication.class, args);
	}

}