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

public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long userID;
    String firstName;
    String lastName;
    @Enumerated(EnumType.STRING)
    UserRole role;
    Integer phoneNumber;
    String emailAddress;
    String password;


}
