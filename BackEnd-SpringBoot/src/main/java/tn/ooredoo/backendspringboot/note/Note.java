package tn.ooredoo.backendspringboot.note;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;

import java.io.Serializable;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity
@Table(name = "call_Notes")
public class Note implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private User agent;

    @ManyToOne
    private Customer customer;

    private String description;

    @OneToOne
    @JoinColumn(name = "call_record_id")
    private CallRecord call;



}
