package tn.ooredoo.backend.entities;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity

public class SentimentAnalysis {


    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long sentimentID;
    @Enumerated(EnumType.STRING)
    SentimentType sentimentType;
}
