package tn.ooredoo.backendspringboot.coachingtip;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/coaching-tips")
@AllArgsConstructor
public class CoachingTipController {

    private final CoachingTipService coachingTipService;

    @PostMapping("/create")
    public ResponseEntity<CoachingTip> createCoachingTip(@RequestBody CoachingTip coachingTip) {
        return ResponseEntity.ok(coachingTipService.createCoachingTip(coachingTip));
    }

    @GetMapping("/getOne/{id}")
    public ResponseEntity<CoachingTip> getCoachingTipById(@PathVariable Long id) {
        return coachingTipService.getCoachingTipById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<CoachingTip> getAllCoachingTips() {
        return coachingTipService.getAllCoachingTips();
    }

    @PutMapping("/update")
    public ResponseEntity<CoachingTip> updateCoachingTip(@RequestBody CoachingTip coachingTip) {
        return ResponseEntity.ok(coachingTipService.updateCoachingTip(coachingTip));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteCoachingTip(@PathVariable Long id) {
        coachingTipService.deleteCoachingTip(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/assign")
    public ResponseEntity<CoachingTip> assignTip(
            @RequestBody CoachingTip tip,
            @RequestParam Long userId,
            @RequestParam Long managerId) {
        return ResponseEntity.ok(coachingTipService.assignCoachingTipToUser(tip, userId, managerId));
    }

    @PostMapping("/create-and-assign")
    public ResponseEntity<CoachingTip> createAndAssignTip(
            @RequestParam String title,
            @RequestParam String message,
            @RequestParam TipType type,
            @RequestParam Long userId,
            @RequestParam Long managerId) {
        return ResponseEntity.ok(
                coachingTipService.createAndAssignCoachingTip(title, message, type, userId, managerId)
        );
    }

    @PutMapping("/{tipId}/acknowledge")
    public ResponseEntity<CoachingTip> acknowledge(@PathVariable Long tipId) {
        return ResponseEntity.ok(coachingTipService.acknowledgeCoachingTip(tipId));
    }

    @PutMapping("/{tipId}/helpful")
    public ResponseEntity<CoachingTip> markHelpful(
            @PathVariable Long tipId,
            @RequestParam boolean helpful) {
        return ResponseEntity.ok(coachingTipService.markTipAsHelpful(tipId, helpful));
    }

    @PutMapping("/{tipId}/shown")
    public ResponseEntity<CoachingTip> markShown(@PathVariable Long tipId) {
        return ResponseEntity.ok(coachingTipService.markTipAsShown(tipId));
    }

    @GetMapping("/user/{userId}/unacknowledged")
    public ResponseEntity<List<CoachingTip>> getUnacknowledged(@PathVariable Long userId) {
        return ResponseEntity.ok(coachingTipService.getUnacknowledgedTipsByUserId(userId));
    }

    @GetMapping("/user/{userId}/recent")
    public ResponseEntity<List<CoachingTip>> getRecentTips(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(coachingTipService.getRecentTipsByUserId(userId, days));
    }

    @GetMapping("/getTipsByUserId/{userId}")
    public List<CoachingTip> getTipsByUserId(@PathVariable Long userId) {
        return coachingTipService.getCoachingTipsByUserId(userId);
    }
    @GetMapping("/getTipsByUserEmail/{email}")
    public ResponseEntity<List<CoachingTip>> getTipsByUserEmail(@PathVariable String email) {
        return ResponseEntity.ok(coachingTipService.getCoachingTipsByUserEmail(email));
    }

    @GetMapping("/user/email/{email}/unacknowledged")
    public ResponseEntity<List<CoachingTip>> getUnacknowledgedByEmail(@PathVariable String email) {
        return ResponseEntity.ok(coachingTipService.getUnacknowledgedTipsByUserEmail(email));
    }

    @GetMapping("/user/email/{email}/recent")
    public ResponseEntity<List<CoachingTip>> getRecentByEmail(
            @PathVariable String email,
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(coachingTipService.getRecentTipsByUserEmail(email, days));
    }

    @GetMapping("/user/{email}/ack-and-helpful-today")
    public Map<String, List<CoachingTip>> getAckAndHelpfulTipsToday(@PathVariable String email) {
        return coachingTipService.getAcknowledgedAndHelpfulTipsTodayByUserEmail(email);
    }


}
