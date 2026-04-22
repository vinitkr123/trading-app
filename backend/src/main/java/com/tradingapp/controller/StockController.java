package com.tradingapp.controller;

import com.tradingapp.service.StockService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    @GetMapping("/search")
    public ResponseEntity<?> search(@RequestParam String q) {
        return ResponseEntity.ok(stockService.search(q));
    }

    @GetMapping("/{symbol}/quote")
    public ResponseEntity<?> quote(@PathVariable String symbol) {
        return ResponseEntity.ok(stockService.getQuote(symbol));
    }

    @GetMapping("/{symbol}/chart")
    public ResponseEntity<?> chart(@PathVariable String symbol,
                                   @RequestParam(defaultValue = "1D") String interval) {
        return ResponseEntity.ok(stockService.getChart(symbol, interval));
    }

    @GetMapping("/movers")
    public ResponseEntity<?> movers() {
        return ResponseEntity.ok(stockService.getTopMovers());
    }
}
