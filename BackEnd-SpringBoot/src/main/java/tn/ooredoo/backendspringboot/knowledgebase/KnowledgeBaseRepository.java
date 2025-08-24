package tn.ooredoo.backendspringboot.knowledgebase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {

    // Find by status
    Page<KnowledgeBase> findByStatus(KnowledgeBase.KnowledgeStatus status, Pageable pageable);

    // Find by category
    Page<KnowledgeBase> findByCategory(String category, Pageable pageable);

    // Find by priority
    Page<KnowledgeBase> findByPriority(KnowledgeBase.Priority priority, Pageable pageable);

    // Find by status and category
    Page<KnowledgeBase> findByStatusAndCategory(
        KnowledgeBase.KnowledgeStatus status, 
        String category, 
        Pageable pageable
    );

    // Find by status and priority
    Page<KnowledgeBase> findByStatusAndPriority(
        KnowledgeBase.KnowledgeStatus status, 
        KnowledgeBase.Priority priority, 
        Pageable pageable
    );

    // Find by category and priority
    Page<KnowledgeBase> findByCategoryAndPriority(
        String category, 
        KnowledgeBase.Priority priority, 
        Pageable pageable
    );

    // Find by all filters
    Page<KnowledgeBase> findByStatusAndCategoryAndPriority(
        KnowledgeBase.KnowledgeStatus status, 
        String category, 
        KnowledgeBase.Priority priority, 
        Pageable pageable
    );

    // Search by title or content
    @Query("SELECT kb FROM KnowledgeBase kb WHERE " +
           "LOWER(kb.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(kb.content) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<KnowledgeBase> searchByTitleOrContent(@Param("searchTerm") String searchTerm, Pageable pageable);

    // Get all distinct categories
    @Query("SELECT DISTINCT kb.category FROM KnowledgeBase kb WHERE kb.category IS NOT NULL ORDER BY kb.category")
    List<String> findAllDistinctCategories();

    // Find by author
    Page<KnowledgeBase> findByAuthorId(Long authorId, Pageable pageable);

    // Get most viewed entries
    Page<KnowledgeBase> findByStatusOrderByViewCountDesc(KnowledgeBase.KnowledgeStatus status, Pageable pageable);
}