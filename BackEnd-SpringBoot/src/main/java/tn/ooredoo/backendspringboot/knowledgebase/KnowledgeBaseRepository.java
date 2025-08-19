package tn.ooredoo.backendspringboot.knowledgebase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.KnowledgeStatus;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.Priority;
import tn.ooredoo.backendspringboot.user.User;

import java.util.List;

@Repository
public interface KnowledgeBaseRepository extends JpaRepository<KnowledgeBase, Long> {

    // Find all by status with pagination
    Page<KnowledgeBase> findByStatus(KnowledgeStatus status, Pageable pageable);

    // Find all by category with pagination
    Page<KnowledgeBase> findByCategory(String category, Pageable pageable);

    // Find all by priority with pagination
    Page<KnowledgeBase> findByPriority(Priority priority, Pageable pageable);

    // Find all by author with pagination
    Page<KnowledgeBase> findByAuthor(User author, Pageable pageable);

    // Find by title containing (case-insensitive search)
    Page<KnowledgeBase> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    // Find by content containing (case-insensitive search)
    Page<KnowledgeBase> findByContentContainingIgnoreCase(String content, Pageable pageable);

    // Find published articles by category
    Page<KnowledgeBase> findByStatusAndCategory(KnowledgeStatus status, String category, Pageable pageable);

    // Find by status and priority
    Page<KnowledgeBase> findByStatusAndPriority(KnowledgeStatus status, Priority priority, Pageable pageable);

    // Find most viewed articles
    Page<KnowledgeBase> findByStatusOrderByViewCountDesc(KnowledgeStatus status, Pageable pageable);

    // Find latest articles
    Page<KnowledgeBase> findByStatusOrderByCreatedAtDesc(KnowledgeStatus status, Pageable pageable);

    // Check if title exists (for validation)
    boolean existsByTitle(String title);

    // Check if title exists excluding current id (for update validation)
    boolean existsByTitleAndIdNot(String title, Long id);

    // Count articles by status
    long countByStatus(KnowledgeStatus status);

    // Find all categories distinct
    @Query("SELECT DISTINCT k.category FROM KnowledgeBase k WHERE k.category IS NOT NULL")
    List<String> findAllDistinctCategories();
}