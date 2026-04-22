package com.tradingapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String symbol;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderType type;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderCategory orderType;

    @Column(nullable = false)
    private Integer quantity;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    private BigDecimal executedPrice;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    private LocalDateTime executedAt;

    public enum OrderType { BUY, SELL }
    public enum OrderCategory { MARKET, LIMIT }
    public enum OrderStatus { PENDING, EXECUTED, CANCELLED }
}
