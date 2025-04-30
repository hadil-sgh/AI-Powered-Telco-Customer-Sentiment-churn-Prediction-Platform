package tn.ooredoo.backend.entities;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Getter
@Setter
@ToString
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
public class CallRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long callID;
    SpeakerType speaker;
    Date date;
    String transcript;


}
