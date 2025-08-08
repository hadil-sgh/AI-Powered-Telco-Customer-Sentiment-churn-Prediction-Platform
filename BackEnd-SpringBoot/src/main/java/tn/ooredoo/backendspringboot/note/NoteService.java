package tn.ooredoo.backendspringboot.note;

import tn.ooredoo.backendspringboot.call_transcript.CallRecord;

import java.util.List;

public interface NoteService {
    Note createNote(CallRecord callRecord, String description);

    List<Note> getNoteByAgentId(String email);
    List<Note> getNoteCustomerId(Integer customerId);



    void deleteNote(Long id);
}

