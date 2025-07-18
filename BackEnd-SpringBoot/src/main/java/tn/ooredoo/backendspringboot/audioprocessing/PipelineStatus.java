package tn.ooredoo.backendspringboot.audioprocessing;

import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PipelineStatus {
    private String status;
    private boolean isConnected;
    private int activeConnections;
    private String lastActivity;
    private boolean componentsReady;
    private boolean audioCaptureActive;
}
