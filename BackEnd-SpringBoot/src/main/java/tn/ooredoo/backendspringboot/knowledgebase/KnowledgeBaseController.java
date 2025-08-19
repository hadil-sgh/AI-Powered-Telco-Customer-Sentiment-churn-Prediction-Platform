package tn.ooredoo.backendspringboot.knowledgebase;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.KnowledgeStatus;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.Priority;
import tn.ooredoo.backendspringboot.user.User;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/knowledge-base")
@RequiredArgsConstructor
public class KnowledgeBaseController {

    private final KnowledgeBaseService knowledgeBaseService;

    @PostMapping
    public ResponseEntity<KnowledgeBase> createKnowledgeBase(
            @Valid @RequestBody KnowledgeBase knowledgeBase,
            @AuthenticationPrincipal User author) {
        KnowledgeBase created = knowledgeBaseService.createKnowledgeBase(knowledgeBase, author);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<KnowledgeBase> updateKnowledgeBase(
            @PathVariable Long id,
            @Valid @RequestBody KnowledgeBase knowledgeBase,
            @AuthenticationPrincipal User modifier) {
        KnowledgeBase updated = knowledgeBaseService.updateKnowledgeBase(id, knowledgeBase, modifier);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/{id}")
    public ResponseEntity<KnowledgeBase> getKnowledgeBaseById(@PathVariable Long id) {
        KnowledgeBase knowledgeBase = knowledgeBaseService.getKnowledgeBaseById(id);
        return ResponseEntity.ok(knowledgeBase);
    }

    @PatchMapping("/{id}/view")
    public ResponseEntity<KnowledgeBase> incrementViewCount(@PathVariable Long id) {
        KnowledgeBase knowledgeBase = knowledgeBaseService.incrementViewCount(id);
        return ResponseEntity.ok(knowledgeBase);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteKnowledgeBase(@PathVariable Long id) {
        knowledgeBaseService.deleteKnowledgeBase(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<Page<KnowledgeBase>> getAllKnowledgeBases(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {

        Sort sort = direction.equalsIgnoreCase("asc") ?
                Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getAllKnowledgeBases(pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<Page<KnowledgeBase>> getKnowledgeBasesByStatus(
            @PathVariable KnowledgeStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getKnowledgeBasesByStatus(status, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/category/{category}")
    public ResponseEntity<Page<KnowledgeBase>> getKnowledgeBasesByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getKnowledgeBasesByCategory(category, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/priority/{priority}")
    public ResponseEntity<Page<KnowledgeBase>> getKnowledgeBasesByPriority(
            @PathVariable Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getKnowledgeBasesByPriority(priority, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/author/{authorId}")
    public ResponseEntity<Page<KnowledgeBase>> getKnowledgeBasesByAuthor(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        // You might need to modify this to accept author ID as parameter
        // For now, it uses the authenticated user
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/search/title")
    public ResponseEntity<Page<KnowledgeBase>> searchByTitle(
            @RequestParam String title,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.searchByTitle(title, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/search/content")
    public ResponseEntity<Page<KnowledgeBase>> searchByContent(
            @RequestParam String content,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.searchByContent(content, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/published/category/{category}")
    public ResponseEntity<Page<KnowledgeBase>> getPublishedByCategory(
            @PathVariable String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getPublishedByCategory(category, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/status/{status}/priority/{priority}")
    public ResponseEntity<Page<KnowledgeBase>> getByStatusAndPriority(
            @PathVariable KnowledgeStatus status,
            @PathVariable Priority priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getByStatusAndPriority(status, priority, pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/published/most-viewed")
    public ResponseEntity<Page<KnowledgeBase>> getMostViewedPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getMostViewedPublished(pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @GetMapping("/published/latest")
    public ResponseEntity<Page<KnowledgeBase>> getLatestPublished(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseService.getLatestPublished(pageable);
        return ResponseEntity.ok(knowledgeBases);
    }

    @PatchMapping("/{id}/status/{status}")
    public ResponseEntity<KnowledgeBase> changeStatus(
            @PathVariable Long id,
            @PathVariable KnowledgeStatus status,
            @AuthenticationPrincipal User modifier) {

        KnowledgeBase knowledgeBase = knowledgeBaseService.changeStatus(id, status, modifier);
        return ResponseEntity.ok(knowledgeBase);
    }

    @PatchMapping("/{id}/priority/{priority}")
    public ResponseEntity<KnowledgeBase> changePriority(
            @PathVariable Long id,
            @PathVariable Priority priority,
            @AuthenticationPrincipal User modifier) {

        KnowledgeBase knowledgeBase = knowledgeBaseService.changePriority(id, priority, modifier);
        return ResponseEntity.ok(knowledgeBase);
    }

    @GetMapping("/stats/count-by-status")
    public ResponseEntity<Map<KnowledgeStatus, Long>> getCountByStatus() {
        Map<KnowledgeStatus, Long> stats = new HashMap<>();
        for (KnowledgeStatus status : KnowledgeStatus.values()) {
            stats.put(status, knowledgeBaseService.countByStatus(status));
        }
        return ResponseEntity.ok(stats);
    }

    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = knowledgeBaseService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @GetMapping("/check-title")
    public ResponseEntity<Map<String, Boolean>> checkTitleExists(
            @RequestParam String title,
            @RequestParam(required = false) Long excludeId) {

        boolean exists;
        if (excludeId != null) {
            exists = knowledgeBaseService.titleExistsForOther(title, excludeId);
        } else {
            exists = knowledgeBaseService.titleExists(title);
        }

        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }
}