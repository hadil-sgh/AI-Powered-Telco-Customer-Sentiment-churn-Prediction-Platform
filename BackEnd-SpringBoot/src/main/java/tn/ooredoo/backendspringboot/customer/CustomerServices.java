package tn.ooredoo.backendspringboot.customer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerServices {

    private final CustomerRepository customerRepository;

    public Customer getCustomerById(@PathVariable Integer customerId) {
        return customerRepository.findById(customerId).orElse(null);

    }

    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }
}
