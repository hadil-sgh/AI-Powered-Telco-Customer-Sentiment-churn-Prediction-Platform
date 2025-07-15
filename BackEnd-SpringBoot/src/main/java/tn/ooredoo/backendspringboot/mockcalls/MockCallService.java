package tn.ooredoo.backendspringboot.mockcalls;

import java.util.List;

public interface MockCallService {
    List<MockCall> getMockCalls();
    MockCall getMockCallById(Long id);
}
