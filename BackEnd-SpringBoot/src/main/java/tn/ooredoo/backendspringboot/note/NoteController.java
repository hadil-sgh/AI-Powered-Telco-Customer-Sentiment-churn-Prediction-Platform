package tn.ooredoo.backendspringboot.note;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import tn.ooredoo.backendspringboot.call_transcript.CallRecord;
import tn.ooredoo.backendspringboot.call_transcript.CallRecordServices;

import java.util.List;

@RestController
@RequestMapping("/notes")
@RequiredArgsConstructor
public class NoteController {
    private final NoteService noteService;
    private final CallRecordServices callRecordServices;

    @PostMapping("/save")
    public Note createNote(@RequestParam Integer callId, @RequestParam String description) {
        CallRecord callRecord = callRecordServices.getCallRecordById(callId);
        return noteService.createNote(callRecord, description);
    }

    @PutMapping("/update")
    public Note updateNote(@RequestParam Integer callId, @RequestParam String description) {
        CallRecord callRecord = callRecordServices.getCallRecordById(callId);
        return noteService.createNote(callRecord, description);
    }

    @GetMapping("/getALLbyCustomer")
    public List<Note> getAllAgent(@RequestParam Integer callId) {
        return noteService.getNoteCustomerId(callId);
    }

    @GetMapping("/getALLbyAgent")
    public List<Note> getAllAgent(@RequestParam String email) {
        return noteService.getNoteByAgentId(email);
    }


    @DeleteMapping("/{id}")
    public void deleteNote(@PathVariable Long id) {
        noteService.deleteNote(id);
    }
}

