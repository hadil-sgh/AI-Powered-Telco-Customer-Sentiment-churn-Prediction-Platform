package tn.ooredoo.backend.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity

public class Customer  {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
     Long alertID;
     Long CustomerID;
     String gender;
     int seniorCitizen;
     String partner;
     String dependents;
     int tenure;
     String phoneService;
     String multipleLines;
     String internetService;
     String onlineSecurity;
     String onlineBackup;
     String deviceProtection;
     String techSupport;
     String streamingTV;
     String streamingMovies;
     String contract;
     String paperlessBilling;
     String paymentMethod;
     double monthlyCharges;
     double totalCharges;

}
