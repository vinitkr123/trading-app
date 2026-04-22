package com.tradingapp.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "watchlists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Watchlist {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @ElementCollection
    @CollectionTable(name = "watchlist_symbols", joinColumns = @JoinColumn(name = "watchlist_id"))
    @Column(name = "symbol")
    @Builder.Default
    private List<String> symbols = new ArrayList<>();
}
