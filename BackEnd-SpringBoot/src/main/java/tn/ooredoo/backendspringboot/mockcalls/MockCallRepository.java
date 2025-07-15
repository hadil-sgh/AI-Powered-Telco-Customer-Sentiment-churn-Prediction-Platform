package tn.ooredoo.backendspringboot.mockcalls;

import org.springframework.data.jpa.repository.JpaRepository;

public interface MockCallRepository extends JpaRepository<MockCall, Long> {
}
