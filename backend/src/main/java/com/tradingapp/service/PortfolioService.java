package com.tradingapp.service;

import com.tradingapp.dto.OrderRequest;
import com.tradingapp.model.*;
import com.tradingapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PortfolioService {

    private final UserRepository userRepository;
    private final HoldingRepository holdingRepository;
    private final OrderRepository orderRepository;
    private final StockService stockService;

    public Map<String, Object> getPortfolio(String userId) {
        User user = userRepository.findById(userId).orElseThrow();
        List<Holding> holdings = holdingRepository.findByUserId(userId);

        BigDecimal investedValue = BigDecimal.ZERO;
        BigDecimal currentValue = BigDecimal.ZERO;
        List<Map<String, Object>> holdingDtos = new ArrayList<>();

        for (Holding h : holdings) {
            Map<String, Object> quote = stockService.getQuote(h.getSymbol());
            double currentPrice = (double) quote.get("price");
            BigDecimal price = BigDecimal.valueOf(currentPrice);
            BigDecimal totalCost = h.getAverageCost().multiply(BigDecimal.valueOf(h.getQuantity()));
            BigDecimal totalVal = price.multiply(BigDecimal.valueOf(h.getQuantity()));
            BigDecimal pnl = totalVal.subtract(totalCost);
            BigDecimal pnlPct = totalCost.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO
                : pnl.divide(totalCost, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

            investedValue = investedValue.add(totalCost);
            currentValue = currentValue.add(totalVal);

            holdingDtos.add(Map.of(
                "id", h.getId(), "symbol", h.getSymbol(), "name", h.getName(),
                "quantity", h.getQuantity(), "averageCost", h.getAverageCost(),
                "currentPrice", currentPrice, "totalValue", totalVal,
                "totalCost", totalCost, "pnl", pnl, "pnlPercent", pnlPct
            ));
        }

        BigDecimal totalPortfolioValue = currentValue.add(user.getCashBalance());
        BigDecimal totalPnl = currentValue.subtract(investedValue);
        BigDecimal totalPnlPct = investedValue.compareTo(BigDecimal.ZERO) == 0 ? BigDecimal.ZERO
            : totalPnl.divide(investedValue, 4, RoundingMode.HALF_UP).multiply(BigDecimal.valueOf(100));

        return Map.of(
            "totalValue", totalPortfolioValue,
            "cashBalance", user.getCashBalance(),
            "investedValue", investedValue,
            "totalPnl", totalPnl,
            "totalPnlPercent", totalPnlPct,
            "holdings", holdingDtos
        );
    }

    @Transactional
    public Map<String, Object> placeOrder(String userId, OrderRequest request) {
        User user = userRepository.findById(userId).orElseThrow();
        Map<String, Object> quote = stockService.getQuote(request.getSymbol());
        BigDecimal marketPrice = BigDecimal.valueOf((double) quote.get("price"));
        BigDecimal executionPrice = request.getOrderType().equals("LIMIT") && request.getPrice() != null
            ? request.getPrice() : marketPrice;
        BigDecimal totalCost = executionPrice.multiply(BigDecimal.valueOf(request.getQuantity()));

        if (request.getType().equals("BUY")) {
            if (user.getCashBalance().compareTo(totalCost) < 0) {
                throw new RuntimeException("Insufficient cash balance");
            }
            user.setCashBalance(user.getCashBalance().subtract(totalCost));
            Optional<Holding> existing = holdingRepository.findByUserIdAndSymbol(userId, request.getSymbol());
            if (existing.isPresent()) {
                Holding h = existing.get();
                int newQty = h.getQuantity() + request.getQuantity();
                BigDecimal newAvg = h.getAverageCost().multiply(BigDecimal.valueOf(h.getQuantity()))
                    .add(totalCost).divide(BigDecimal.valueOf(newQty), 4, RoundingMode.HALF_UP);
                h.setQuantity(newQty);
                h.setAverageCost(newAvg);
                holdingRepository.save(h);
            } else {
                holdingRepository.save(Holding.builder()
                    .user(user).symbol(request.getSymbol())
                    .name(quote.getOrDefault("name", request.getSymbol()).toString())
                    .quantity(request.getQuantity()).averageCost(executionPrice).build());
            }
        } else {
            Holding holding = holdingRepository.findByUserIdAndSymbol(userId, request.getSymbol())
                .orElseThrow(() -> new RuntimeException("No holdings for " + request.getSymbol()));
            if (holding.getQuantity() < request.getQuantity()) {
                throw new RuntimeException("Insufficient shares");
            }
            user.setCashBalance(user.getCashBalance().add(totalCost));
            if (holding.getQuantity().equals(request.getQuantity())) {
                holdingRepository.delete(holding);
            } else {
                holding.setQuantity(holding.getQuantity() - request.getQuantity());
                holdingRepository.save(holding);
            }
        }

        userRepository.save(user);

        Order order = orderRepository.save(Order.builder()
            .user(user).symbol(request.getSymbol())
            .type(Order.OrderType.valueOf(request.getType()))
            .orderType(Order.OrderCategory.valueOf(request.getOrderType()))
            .quantity(request.getQuantity()).price(request.getPrice())
            .status(Order.OrderStatus.EXECUTED).executedPrice(executionPrice)
            .createdAt(LocalDateTime.now()).executedAt(LocalDateTime.now()).build());

        return Map.of("orderId", order.getId(), "status", "EXECUTED", "executedPrice", executionPrice);
    }

    public List<Map<String, Object>> getOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(o -> {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("id", o.getId());
            map.put("symbol", o.getSymbol());
            map.put("type", o.getType());
            map.put("orderType", o.getOrderType());
            map.put("quantity", o.getQuantity());
            map.put("status", o.getStatus());
            map.put("executedPrice", o.getExecutedPrice());
            map.put("createdAt", o.getCreatedAt());
            return map;
        }).toList();
    }
}
