package tn.ooredoo.backendspringboot.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/customer")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerRepository customerRepository;
    @GetMapping("/get/{customerId}")
    public Customer getCustomerById(@PathVariable Integer customerId) {
        return customerRepository.findById(customerId).orElse(null);

    }
}
