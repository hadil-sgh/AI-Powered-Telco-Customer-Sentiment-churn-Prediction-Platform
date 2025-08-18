package tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ComplaintRepository extends JpaRepository<Complaint, Integer> {

    List<Complaint> findByCallTranscripts_Id(Integer callTranscriptsId);
}
