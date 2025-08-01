package tn.ooredoo.backendspringboot.churn_prediction;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.customer.CustomerRepository;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ChurnPredictionService {

    private final WebClient webClient;
    private final CustomerRepository customerRepository;

    @Value("${python.ml.service.url:http://localhost:5000}")
    private  String pythonServiceUrl;



    public Mono<ChurnPrediction> predictChurn(Integer customerId) {
        Customer customerData = customerRepository.findById(customerId).orElse(null);
        if (customerData == null) {
            return Mono.error(new RuntimeException("Customer not found with ID: " + customerId));
        }

        // Convert Customer to the exact format expected by Flask API
        Map<String, Object> modelInput = convertToFlaskFormat(customerData);

        System.out.println("Model input data being sent: " + modelInput);
        System.out.println("Python service URL: " + pythonServiceUrl + "/predict");

        return webClient.post()
                .uri(pythonServiceUrl + "/predict")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON)
                .bodyValue(modelInput) // Send Map with exact field names Flask expects
                .retrieve()
                .bodyToMono(String.class)
                .doOnNext(response -> System.out.println("Raw response: " + response))
                .flatMap(response -> {
                    try {
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

    private Map<String, Object> convertToFlaskFormat(Customer customer) {
        Map<String, Object> modelInput = new HashMap<>();
        modelInput.put("gender", customer.getGender());
        modelInput.put("SeniorCitizen", customer.getSeniorCitizen());
        modelInput.put("Partner", customer.getPartner());
        modelInput.put("Dependents", customer.getDependents());
        modelInput.put("tenure", customer.getTenure());
        modelInput.put("PhoneService", customer.getPhoneService());
        modelInput.put("MultipleLines", customer.getMultipleLines());
        modelInput.put("InternetService", customer.getInternetService());
        modelInput.put("OnlineSecurity", customer.getOnlineSecurity());
        modelInput.put("OnlineBackup", customer.getOnlineBackup());
        modelInput.put("DeviceProtection", customer.getDeviceProtection());
        modelInput.put("TechSupport", customer.getTechSupport());
        modelInput.put("StreamingTV", customer.getStreamingTV());
        modelInput.put("StreamingMovies", customer.getStreamingMovies());
        modelInput.put("Contract", customer.getContract());
        modelInput.put("PaperlessBilling", customer.getPaperlessBilling());
        modelInput.put("PaymentMethod", customer.getPaymentMethod());
        modelInput.put("MonthlyCharges", customer.getMonthlyCharges());
        modelInput.put("TotalCharges", customer.getTotalCharges());

        return modelInput;
    }
}