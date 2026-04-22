package com.tradingapp.controller;

import com.tradingapp.model.User;
import com.tradingapp.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlists")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<?> getAll(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(watchlistService.getAll(user.getId()));
    }

    @PostMapping
    public ResponseEntity<?> create(@AuthenticationPrincipal User user,
                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(watchlistService.create(user.getId(), body.get("name")));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@AuthenticationPrincipal User user,
                                    @PathVariable String id) {
        watchlistService.delete(user.getId(), id);
        return ResponseEntity.ok(Map.of("message", "Deleted"));
    }

    @PostMapping("/{id}/stocks")
    public ResponseEntity<?> addStock(@AuthenticationPrincipal User user,
                                      @PathVariable String id,
                                      @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(watchlistService.addStock(user.getId(), id, body.get("symbol")));
    }

    @DeleteMapping("/{id}/stocks/{symbol}")
    public ResponseEntity<?> removeStock(@AuthenticationPrincipal User user,
                                         @PathVariable String id,
                                         @PathVariable String symbol) {
        return ResponseEntity.ok(watchlistService.removeStock(user.getId(), id, symbol));
    }
}
