package tn.ooredoo.backendspringboot.knowledgebase;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tn.ooredoo.backendspringboot.user.User;
import tn.ooredoo.backendspringboot.user.UserRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class KnowledgeBaseServiceImpl implements KnowledgeBaseService {

    private final KnowledgeBaseRepository knowledgeBaseRepository;
    private final UserRepository userRepository;

    @Override
    public KnowledgeBaseDTO createKnowledgeBase(KnowledgeBaseCreateDTO createDTO, Long authorId) {
        User author = userRepository.findById(authorId)
            .orElseThrow(() -> new RuntimeException("Author not found"));

        KnowledgeBase knowledgeBase = KnowledgeBase.builder()
            .title(createDTO.getTitle())
            .content(createDTO.getContent())
            .category(createDTO.getCategory())
            .priority(createDTO.getPriority())
            .status(KnowledgeBase.KnowledgeStatus.DRAFT)
            .author(author)
            .viewCount(0)
            .version(1)
            .build();

        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return mapToDTO(saved);
    }

    @Override
    public KnowledgeBaseDTO updateKnowledgeBase(Long id, KnowledgeBaseUpdateDTO updateDTO, Long userId) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Knowledge base not found"));

        User modifier = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        knowledgeBase.setTitle(updateDTO.getTitle());
        knowledgeBase.setContent(updateDTO.getContent());
        knowledgeBase.setCategory(updateDTO.getCategory());
        knowledgeBase.setStatus(updateDTO.getStatus());
        knowledgeBase.setPriority(updateDTO.getPriority());
        knowledgeBase.setLastModifiedBy(modifier);
        knowledgeBase.setVersion(knowledgeBase.getVersion() + 1);

        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return mapToDTO(saved);
    }

    @Override
    public void deleteKnowledgeBase(Long id) {
        if (!knowledgeBaseRepository.existsById(id)) {
            throw new RuntimeException("Knowledge base not found");
        }
        knowledgeBaseRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public KnowledgeBaseDTO getKnowledgeBaseById(Long id) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Knowledge base not found"));
        return mapToDTO(knowledgeBase);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBaseDTO> getAllKnowledgeBases(
            KnowledgeBase.KnowledgeStatus status,
            String category,
            KnowledgeBase.Priority priority,
            String searchTerm,
            Pageable pageable) {

        Page<KnowledgeBase> knowledgeBases;

        // If search term is provided, use search
        if (searchTerm != null && !searchTerm.trim().isEmpty()) {
            knowledgeBases = knowledgeBaseRepository.searchByTitleOrContent(searchTerm, pageable);
        } else {
            // Apply filters
            if (status != null && category != null && priority != null) {
                knowledgeBases = knowledgeBaseRepository.findByStatusAndCategoryAndPriority(status, category, priority, pageable);
            } else if (status != null && category != null) {
                knowledgeBases = knowledgeBaseRepository.findByStatusAndCategory(status, category, pageable);
            } else if (status != null && priority != null) {
                knowledgeBases = knowledgeBaseRepository.findByStatusAndPriority(status, priority, pageable);
            } else if (category != null && priority != null) {
                knowledgeBases = knowledgeBaseRepository.findByCategoryAndPriority(category, priority, pageable);
            } else if (status != null) {
                knowledgeBases = knowledgeBaseRepository.findByStatus(status, pageable);
            } else if (category != null) {
                knowledgeBases = knowledgeBaseRepository.findByCategory(category, pageable);
            } else if (priority != null) {
                knowledgeBases = knowledgeBaseRepository.findByPriority(priority, pageable);
            } else {
                knowledgeBases = knowledgeBaseRepository.findAll(pageable);
            }
        }

        return knowledgeBases.map(this::mapToDTO);
    }

    @Override
    public KnowledgeBaseDTO incrementViewCount(Long id) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Knowledge base not found"));
        
        knowledgeBase.incrementViewCount();
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return mapToDTO(saved);
    }

    @Override
    public KnowledgeBaseDTO updateStatus(Long id, KnowledgeBase.KnowledgeStatus status, Long userId) {
        KnowledgeBase knowledgeBase = knowledgeBaseRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Knowledge base not found"));

        User modifier = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));

        knowledgeBase.setStatus(status);
        knowledgeBase.setLastModifiedBy(modifier);
        
        KnowledgeBase saved = knowledgeBaseRepository.save(knowledgeBase);
        return mapToDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllCategories() {
        return knowledgeBaseRepository.findAllDistinctCategories();
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBaseDTO> getKnowledgeBasesByAuthor(Long authorId, Pageable pageable) {
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseRepository.findByAuthorId(authorId, pageable);
        return knowledgeBases.map(this::mapToDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<KnowledgeBaseDTO> getMostViewedKnowledgeBases(Pageable pageable) {
        Page<KnowledgeBase> knowledgeBases = knowledgeBaseRepository
            .findByStatusOrderByViewCountDesc(KnowledgeBase.KnowledgeStatus.PUBLISHED, pageable);
        return knowledgeBases.map(this::mapToDTO);
    }

    private KnowledgeBaseDTO mapToDTO(KnowledgeBase knowledgeBase) {
        return KnowledgeBaseDTO.builder()
            .id(knowledgeBase.getId())
            .title(knowledgeBase.getTitle())
            .content(knowledgeBase.getContent())
            .category(knowledgeBase.getCategory())
            .status(knowledgeBase.getStatus())
            .priority(knowledgeBase.getPriority())
            .authorId(knowledgeBase.getAuthor().getId())
            .authorName(knowledgeBase.getAuthor().getFirstname() + " " + knowledgeBase.getAuthor().getLastname())
            .authorEmail(knowledgeBase.getAuthor().getEmail())
            .lastModifiedById(knowledgeBase.getLastModifiedBy() != null ? knowledgeBase.getLastModifiedBy().getId() : null)
            .lastModifiedByName(knowledgeBase.getLastModifiedBy() != null ? 
                knowledgeBase.getLastModifiedBy().getFirstname() + " " + knowledgeBase.getLastModifiedBy().getLastname() : null)
            .viewCount(knowledgeBase.getViewCount())
            .version(knowledgeBase.getVersion())
            .createdAt(knowledgeBase.getCreatedAt())
            .updatedAt(knowledgeBase.getUpdatedAt())
            .build();
    }
}