package tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ComplaintServicesImpl implements ComplaintServices {
    private final  ComplaintRepository complaintRepository;


    @Override
    public List<Complaint> getComplaints() {

        return complaintRepository.findAll();
    }
}
