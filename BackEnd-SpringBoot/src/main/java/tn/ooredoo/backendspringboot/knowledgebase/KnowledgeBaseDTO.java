package tn.ooredoo.backendspringboot.knowledgebase;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeBaseDTO {
    private Long id;
    private String title;
    private String content;
    private String category;
    private KnowledgeBase.KnowledgeStatus status;
    private KnowledgeBase.Priority priority;
    private Long authorId;
    private String authorName;
    private String authorEmail;
    private Long lastModifiedById;
    private String lastModifiedByName;
    private Integer viewCount;
    private Integer version;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
class KnowledgeBaseCreateDTO {
    private String title;
    private String content;
    private String category;
    private KnowledgeBase.Priority priority;
}

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
class KnowledgeBaseUpdateDTO {
    private String title;
    private String content;
    private String category;
    private KnowledgeBase.KnowledgeStatus status;
    private KnowledgeBase.Priority priority;
}