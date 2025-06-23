package tn.ooredoo.backendspringboot.churn_prediction;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.customer.CustomerRepository;

@Service
public class ChurnPredictionService {

    private final WebClient webClient;

    private final CustomerRepository customerRepository;

    @Value("${python.ml.service.url:http://localhost:5000}")
    private String pythonServiceUrl;

    public ChurnPredictionService(WebClient webClient, CustomerRepository customerRepository) {
        this.webClient = webClient;
        this.customerRepository = customerRepository;
    }

    public Mono<ChurnPrediction> predictChurn(Integer customerId) {
        Customer customerData = customerRepository.findById(customerId).orElse(null);
        if (customerData == null) {
            return Mono.error(new RuntimeException("Customer not found with ID: " + customerId));
        }

        System.out.println("Customer data being sent: " + customerData);
        System.out.println("Python service URL: " + pythonServiceUrl + "/predict");

        return webClient.post()
                .uri(pythonServiceUrl + "/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(customerData)
                .retrieve()
                .bodyToMono(String.class) // First get as String to see raw response
                .doOnNext(response -> System.out.println("Raw response: " + response))
                .flatMap(response -> {
                    try {
                        // Parse manually or use ObjectMapper
                        ObjectMapper mapper = new ObjectMapper();
                        ChurnPrediction prediction = mapper.readValue(response, ChurnPrediction.class);
                        return Mono.just(prediction);
                    } catch (Exception e) {
                        return Mono.error(new RuntimeException("Failed to parse response: " + response, e));
                    }
                })
                .onErrorResume(WebClientResponseException.class, ex -> {
                    System.err.println("Response status: " + ex.getStatusCode());
                    System.err.println("Response body: " + ex.getResponseBodyAsString());
                    System.err.println("Request headers: " + ex.getRequest().getHeaders());
                    return Mono.error(new RuntimeException("ML service returned error: " + ex.getResponseBodyAsString()));
                });
    }
}
