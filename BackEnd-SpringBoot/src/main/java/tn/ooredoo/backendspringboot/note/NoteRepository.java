package tn.ooredoo.backendspringboot.note;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.user.User;

import java.util.List;
import java.util.Optional;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    Optional<Object> findByAgent(User agent);

    Note findByCustomer(Customer customer);


    List<Note> findByCall_Id(Integer callId);
}

