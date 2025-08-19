package tn.ooredoo.backendspringboot.knowledgebase;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.KnowledgeStatus;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.Priority;
import tn.ooredoo.backendspringboot.user.User;

import java.util.List;

public interface KnowledgeBaseService {

    KnowledgeBase createKnowledgeBase(KnowledgeBase knowledgeBase, User author);

    KnowledgeBase updateKnowledgeBase(Long id, KnowledgeBase knowledgeBase, User modifier);

    KnowledgeBase getKnowledgeBaseById(Long id);

    KnowledgeBase incrementViewCount(Long id);

    void deleteKnowledgeBase(Long id);

    Page<KnowledgeBase> getAllKnowledgeBases(Pageable pageable);

    Page<KnowledgeBase> getKnowledgeBasesByStatus(KnowledgeStatus status, Pageable pageable);

    Page<KnowledgeBase> getKnowledgeBasesByCategory(String category, Pageable pageable);

    Page<KnowledgeBase> getKnowledgeBasesByPriority(Priority priority, Pageable pageable);

    Page<KnowledgeBase> getKnowledgeBasesByAuthor(User author, Pageable pageable);

    Page<KnowledgeBase> searchByTitle(String title, Pageable pageable);

    Page<KnowledgeBase> searchByContent(String content, Pageable pageable);

    Page<KnowledgeBase> getPublishedByCategory(String category, Pageable pageable);

    Page<KnowledgeBase> getByStatusAndPriority(KnowledgeStatus status, Priority priority, Pageable pageable);

    Page<KnowledgeBase> getMostViewedPublished(Pageable pageable);

    Page<KnowledgeBase> getLatestPublished(Pageable pageable);

    KnowledgeBase changeStatus(Long id, KnowledgeStatus status, User modifier);

    KnowledgeBase changePriority(Long id, Priority priority, User modifier);

    long countByStatus(KnowledgeStatus status);

    List<String> getAllCategories();

    boolean titleExists(String title);

    boolean titleExistsForOther(String title, Long id);
}