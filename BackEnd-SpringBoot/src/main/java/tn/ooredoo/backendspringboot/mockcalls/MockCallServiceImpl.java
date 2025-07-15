package tn.ooredoo.backendspringboot.mockcalls;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MockCallServiceImpl implements MockCallService {
    private final MockCallRepository mockCallRepository;


    @Override
    public List<MockCall> getMockCalls() {
        return mockCallRepository.findAll();
    }

    @Override
    public MockCall getMockCallById(Long id) {
        return mockCallRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Mock call not found with id: " + id));
    }
}
