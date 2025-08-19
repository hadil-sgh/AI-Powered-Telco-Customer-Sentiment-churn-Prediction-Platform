package tn.ooredoo.backendspringboot.post_call_analysis.complaintscustomer;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintServices complaintServices;


     @GetMapping
     public List<Complaint> getAllComplaints() {
         return complaintServices.getComplaints();
     }


}
