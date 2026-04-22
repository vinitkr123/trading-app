package com.tradingapp.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class OrderRequest {
    private String symbol;
    private String type;       // BUY or SELL
    private String orderType;  // MARKET or LIMIT
    private Integer quantity;
    private BigDecimal price;  // required for LIMIT orders
}
