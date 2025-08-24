package tn.ooredoo.backendspringboot.knowledgebase;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/knowledge")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Page<KnowledgeBaseDTO>> getAllKnowledgeBases(
            @RequestParam(required = false) KnowledgeBase.KnowledgeStatus status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) KnowledgeBase.Priority priority,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") 
            ? Sort.Direction.DESC 
            : Sort.Direction.ASC;
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<KnowledgeBaseDTO> knowledgeBases = knowledgeBaseService.getAllKnowledgeBases(
            status, category, priority, search, pageable);
        
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeBaseDTO> getKnowledgeBaseById(@PathVariable Long id) {
        KnowledgeBaseDTO knowledgeBase = knowledgeBaseService.incrementViewCount(id);
        return ResponseEntity.ok(knowledgeBase);
    }

    @PostMapping
    public ResponseEntity<KnowledgeBaseDTO> createKnowledgeBase(
            @RequestBody KnowledgeBaseCreateDTO createDTO,
            Authentication authentication) {
        
        Long authorId = extractUserIdFromAuthentication(authentication);
        KnowledgeBaseDTO created = knowledgeBaseService.createKnowledgeBase(createDTO, authorId);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeBaseDTO> updateKnowledgeBase(
            @PathVariable Long id,
            @RequestBody KnowledgeBaseUpdateDTO updateDTO,
            Authentication authentication) {
        
        Long userId = extractUserIdFromAuthentication(authentication);
        KnowledgeBaseDTO updated = knowledgeBaseService.updateKnowledgeBase(id, updateDTO, userId);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKnowledgeBase(@PathVariable Long id) {
        knowledgeBaseService.deleteKnowledgeBase(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<KnowledgeBaseDTO> updateStatus(
            @PathVariable Long id,
            @RequestParam KnowledgeBase.KnowledgeStatus status,
            Authentication authentication) {
        
        Long userId = extractUserIdFromAuthentication(authentication);
        KnowledgeBaseDTO updated = knowledgeBaseService.updateStatus(id, status, userId);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = knowledgeBaseService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Page<KnowledgeBaseDTO>> getKnowledgeBasesByAuthor(
            @PathVariable Long authorId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<KnowledgeBaseDTO> knowledgeBases = knowledgeBaseService.getKnowledgeBasesByAuthor(authorId, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/most-viewed")
    public ResponseEntity<Page<KnowledgeBaseDTO>> getMostViewedKnowledgeBases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeBaseDTO> knowledgeBases = knowledgeBaseService.getMostViewedKnowledgeBases(pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    private Long extractUserIdFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return user.getId();
    }
}