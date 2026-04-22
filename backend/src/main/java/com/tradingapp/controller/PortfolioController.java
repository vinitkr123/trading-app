package com.tradingapp.controller;

import com.tradingapp.model.User;
import com.tradingapp.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/portfolio")
@RequiredArgsConstructor
public class PortfolioController {

    private final PortfolioService portfolioService;

    @GetMapping
    public ResponseEntity<?> getPortfolio(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getPortfolio(user.getId()));
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@AuthenticationPrincipal User user) {
        return ResponseEntity.ok(portfolioService.getOrders(user.getId()));
    }
}
