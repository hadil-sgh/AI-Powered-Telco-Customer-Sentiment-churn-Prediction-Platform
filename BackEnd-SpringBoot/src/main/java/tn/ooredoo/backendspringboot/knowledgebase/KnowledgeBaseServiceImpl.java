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


}