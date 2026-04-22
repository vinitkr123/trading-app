package com.tradingapp.service;

import com.tradingapp.model.*;
import com.tradingapp.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistRepository watchlistRepository;
    private final UserRepository userRepository;

    public List<Watchlist> getAll(String userId) {
        return watchlistRepository.findByUserId(userId);
    }

    public Watchlist create(String userId, String name) {
        User user = userRepository.findById(userId).orElseThrow();
        return watchlistRepository.save(Watchlist.builder().user(user).name(name).build());
    }

    public void delete(String userId, String watchlistId) {
        Watchlist w = watchlistRepository.findById(watchlistId).orElseThrow();
        if (!w.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        watchlistRepository.delete(w);
    }

    @Transactional
    public Watchlist addStock(String userId, String watchlistId, String symbol) {
        Watchlist w = watchlistRepository.findById(watchlistId).orElseThrow();
        if (!w.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        if (!w.getSymbols().contains(symbol)) w.getSymbols().add(symbol.toUpperCase());
        return watchlistRepository.save(w);
    }

    @Transactional
    public Watchlist removeStock(String userId, String watchlistId, String symbol) {
        Watchlist w = watchlistRepository.findById(watchlistId).orElseThrow();
        if (!w.getUser().getId().equals(userId)) throw new RuntimeException("Unauthorized");
        w.getSymbols().remove(symbol.toUpperCase());
        return watchlistRepository.save(w);
    }
}
