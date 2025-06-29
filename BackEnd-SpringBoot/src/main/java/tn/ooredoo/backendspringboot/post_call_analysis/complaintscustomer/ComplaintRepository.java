package tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ComplaintRepository extends JpaRepository <Complaint, Integer> {
}
