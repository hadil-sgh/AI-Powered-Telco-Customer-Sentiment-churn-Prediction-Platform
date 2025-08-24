package tn.ooredoo.backendspringboot.knowledgebase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface KnowledgeBaseService {
    
    // CRUD operations
    KnowledgeBaseDTO createKnowledgeBase(KnowledgeBaseCreateDTO createDTO, Long authorId);
    KnowledgeBaseDTO updateKnowledgeBase(Long id, KnowledgeBaseUpdateDTO updateDTO, Long userId);
    void deleteKnowledgeBase(Long id);
    KnowledgeBaseDTO getKnowledgeBaseById(Long id);
    
    // List operations with filtering
    Page<KnowledgeBaseDTO> getAllKnowledgeBases(
        KnowledgeBase.KnowledgeStatus status,
        String category,
        KnowledgeBase.Priority priority,
        String searchTerm,
        Pageable pageable
    );
    
    // Specific operations
    KnowledgeBaseDTO incrementViewCount(Long id);
    KnowledgeBaseDTO updateStatus(Long id, KnowledgeBase.KnowledgeStatus status, Long userId);
    List<String> getAllCategories();
    Page<KnowledgeBaseDTO> getKnowledgeBasesByAuthor(Long authorId, Pageable pageable);
    Page<KnowledgeBaseDTO> getMostViewedKnowledgeBases(Pageable pageable);
}