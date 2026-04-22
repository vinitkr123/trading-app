package com.tradingapp.controller;

import com.tradingapp.dto.OrderRequest;
import com.tradingapp.model.User;
import com.tradingapp.service.PortfolioService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final PortfolioService portfolioService;

    @PostMapping
    public ResponseEntity<?> placeOrder(@AuthenticationPrincipal User user,
                                        @RequestBody OrderRequest request) {
        return ResponseEntity.ok(portfolioService.placeOrder(user.getId(), request));
    }
}
