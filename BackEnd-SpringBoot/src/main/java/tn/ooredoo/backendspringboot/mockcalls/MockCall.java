package tn.ooredoo.backendspringboot.mockcalls;

import jakarta.persistence.*;
import lombok.*;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;
@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MockCall {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne
    private Customer customer;
    @OneToOne
    private User agent;



}
