package tn.ooredoo.backendspringboot.note;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.customer.Customer;
import tn.ooredoo.backendspringboot.customer.CustomerServices;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserService;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NoteServiceImpl implements NoteService {
    private final NoteRepository noteRepository;
    private final CustomerServices customerServices;
    private final UserService userService;


    @Override
    public Note createNote(CallRecord callRecord, String description) {
        User agent = callRecord.getAgent();
        Customer customer = callRecord.getCustomer();
        Note note = new Note();

        note.setCustomer(customer);
        note.setDescription(description);
        note.setAgent(agent);
        note.setCall(callRecord);
        return noteRepository.save(note);
    }

    @Override
    public List<Note> getNoteByAgentId(String email) {
        User agent = userService.findByEmail(email);
        List<Note> notes = new ArrayList<>();
        for (Note note : noteRepository.findAll()) {
            if (note.getAgent().equals(agent)) {
                notes.add(note);
            }
        }
        return notes;
    }


    @Override
    public List<Note> getNoteCustomerId(Integer customerId) {
        Customer customer = customerServices.getCustomerById(customerId);
        List<Note> notes = new ArrayList<>();
        for (Note note : noteRepository.findAll()) {
            if (note.getCustomer().equals(customer)) {
                notes.add(note);
            }
        }
        return notes;
    }


    @Override
    public void deleteNote(Long id) {
        noteRepository.deleteById(id);
    }
}

