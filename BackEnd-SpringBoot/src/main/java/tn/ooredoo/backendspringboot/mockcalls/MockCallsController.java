package tn.ooredoo.backendspringboot.mockcalls;


import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/mockCalls")
@RequiredArgsConstructor
@Tag(name = "Mock Calls Management")

public class MockCallsController {
    private final MockCallService mockCallsService;

    @GetMapping("/getAll")
    public List<MockCall> getMockCalls() {
        return mockCallsService.getMockCalls();
    }

    @GetMapping("/getById")
    public MockCall getMockCallsByAgentId(Long agentId) {
        return mockCallsService.getMockCallById(agentId);
    }


}
