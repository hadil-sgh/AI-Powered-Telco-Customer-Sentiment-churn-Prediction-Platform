package tn.ooredoo.backendspringboot.knowledgebase.service.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.KnowledgeStatus;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBase.Priority;

import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBaseRepository;
import tn.ooredoo.backendspringboot.knowledgebase.KnowledgeBaseService;
import tn.ooredoo.backendspringboot.user.User;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;

    @Override
    public KnowledgeBase createKnowledgeBase(KnowledgeBase knowledgeBase, User author) {
        // Validate title uniqueness
        if (knowledgeBaseRepository.existsByTitle(knowledgeBase.getTitle())) {
            throw new IllegalArgumentException("Knowledge base with title '" + knowledgeBase.getTitle() + "' already exists");
        }

        knowledgeBase.setAuthor(author);
        knowledgeBase.setLastModifiedBy(author);
        knowledgeBase.setVersion(1);
        knowledgeBase.setViewCount(0);

        return knowledgeBaseRepository.save(knowledgeBase);
    }

    @Override
    public KnowledgeBase updateKnowledgeBase(Long id, KnowledgeBase knowledgeBase, User modifier) {
        KnowledgeBase existingKnowledgeBase = knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge base not found with id: " + id));

        // Validate title uniqueness (excluding current record)
        if (knowledgeBaseRepository.existsByTitleAndIdNot(knowledgeBase.getTitle(), id)) {
            throw new IllegalArgumentException("Knowledge base with title '" + knowledgeBase.getTitle() + "' already exists");
        }

        existingKnowledgeBase.setTitle(knowledgeBase.getTitle());
        existingKnowledgeBase.setContent(knowledgeBase.getContent());
        existingKnowledgeBase.setCategory(knowledgeBase.getCategory());
        existingKnowledgeBase.setStatus(knowledgeBase.getStatus());
        existingKnowledgeBase.setPriority(knowledgeBase.getPriority());
        existingKnowledgeBase.setLastModifiedBy(modifier);
        existingKnowledgeBase.setVersion(existingKnowledgeBase.getVersion() + 1);

        return knowledgeBaseRepository.save(existingKnowledgeBase);
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeBase getKnowledgeBaseById(Long id) {
        return knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge base not found with id: " + id));
    }

    @Override
    public KnowledgeBase incrementViewCount(Long id) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge base not found with id: " + id));

        knowledgeBase.incrementViewCount();
        return knowledgeBaseRepository.save(knowledgeBase);
    }

    @Override
    public void deleteKnowledgeBase(Long id) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge base not found with id: " + id));

        knowledgeBaseRepository.delete(knowledgeBase);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getAllKnowledgeBases(Pageable pageable) {
        return knowledgeBaseRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getKnowledgeBasesByStatus(KnowledgeStatus status, Pageable pageable) {
        return knowledgeBaseRepository.findByStatus(status, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getKnowledgeBasesByCategory(String category, Pageable pageable) {
        return knowledgeBaseRepository.findByCategory(category, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getKnowledgeBasesByPriority(Priority priority, Pageable pageable) {
        return knowledgeBaseRepository.findByPriority(priority, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getKnowledgeBasesByAuthor(User author, Pageable pageable) {
        return knowledgeBaseRepository.findByAuthor(author, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> searchByTitle(String title, Pageable pageable) {
        return knowledgeBaseRepository.findByTitleContainingIgnoreCase(title, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> searchByContent(String content, Pageable pageable) {
        return knowledgeBaseRepository.findByContentContainingIgnoreCase(content, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getPublishedByCategory(String category, Pageable pageable) {
        return knowledgeBaseRepository.findByStatusAndCategory(KnowledgeStatus.PUBLISHED, category, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getByStatusAndPriority(KnowledgeStatus status, Priority priority, Pageable pageable) {
        return knowledgeBaseRepository.findByStatusAndPriority(status, priority, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getMostViewedPublished(Pageable pageable) {
        return knowledgeBaseRepository.findByStatusOrderByViewCountDesc(KnowledgeStatus.PUBLISHED, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBase> getLatestPublished(Pageable pageable) {
        return knowledgeBaseRepository.findByStatusOrderByCreatedAtDesc(KnowledgeStatus.PUBLISHED, pageable);
    }

    @Override
    public KnowledgeBase changeStatus(Long id, KnowledgeStatus status, User modifier) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge base not found with id: " + id));

        knowledgeBase.setStatus(status);
        knowledgeBase.setLastModifiedBy(modifier);
        knowledgeBase.setVersion(knowledgeBase.getVersion() + 1);

        return knowledgeBaseRepository.save(knowledgeBase);
    }

    @Override
    public KnowledgeBase changePriority(Long id, Priority priority, User modifier) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Knowledge base not found with id: " + id));

        knowledgeBase.setPriority(priority);
        knowledgeBase.setLastModifiedBy(modifier);
        knowledgeBase.setVersion(knowledgeBase.getVersion() + 1);

        return knowledgeBaseRepository.save(knowledgeBase);
    }

    @Override
    @Transactional(readOnly = true)
    public long countByStatus(KnowledgeStatus status) {
        return knowledgeBaseRepository.countByStatus(status);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return knowledgeBaseRepository.findAllDistinctCategories();
    }

    @Override
    @Transactional(readOnly = true)
    public boolean titleExists(String title) {
        return knowledgeBaseRepository.existsByTitle(title);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean titleExistsForOther(String title, Long id) {
        return knowledgeBaseRepository.existsByTitleAndIdNot(title, id);
    }
}