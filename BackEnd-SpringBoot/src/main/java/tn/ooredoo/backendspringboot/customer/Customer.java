package tn.ooredoo.backendspringboot.customer;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.churn_prediction.ChurnPrediction;

import java.io.Serializable;

@Getter
@Setter
@Builder
@Entity
@NoArgsConstructor
@AllArgsConstructor

public class Customer implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)

    private Integer customerID;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;

    private String gender;

    @JsonProperty("SeniorCitizen")
    private int seniorCitizen;

    @JsonProperty("Partner")
    private String partner;

    @JsonProperty("Dependents")
    private String dependents;

    private int tenure;

    @JsonProperty("PhoneService")
    private String phoneService;

    @JsonProperty("MultipleLines")
    private String multipleLines;

    @JsonProperty("InternetService")
    private String internetService;

    @JsonProperty("OnlineSecurity")
    private String onlineSecurity;

    @JsonProperty("OnlineBackup")
    private String onlineBackup;

    @JsonProperty("DeviceProtection")
    private String deviceProtection;

    @JsonProperty("TechSupport")
    private String techSupport;

    @JsonProperty("StreamingTV")
    private String streamingTV;

    @JsonProperty("StreamingMovies")
    private String streamingMovies;

    @JsonProperty("Contract")
    private String contract;

    @JsonProperty("PaperlessBilling")
    private String paperlessBilling;

    @JsonProperty("PaymentMethod")
    private String paymentMethod;

    @JsonProperty("MonthlyCharges")
    private double monthlyCharges;

    @JsonProperty("TotalCharges")
    private double totalCharges;

    @OneToOne(cascade = CascadeType.ALL)
    private ChurnPrediction churnPrediction;
}
