package tn.ooredoo.backendspringboot.note;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;

import java.time.Duration;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "callNotes")
public class Note {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User agent;

    @ManyToOne
    private Customer customer;

    private String description;

    @OneToOne
    private CallRecord call;



}
