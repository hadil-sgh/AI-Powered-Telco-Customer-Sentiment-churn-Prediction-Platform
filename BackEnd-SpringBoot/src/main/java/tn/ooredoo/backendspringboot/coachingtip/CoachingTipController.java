package tn.ooredoo.backendspringboot.coachingtip;

import lombok.AllArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}

