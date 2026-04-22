package com.tradingapp.repository;

import com.tradingapp.model.Watchlist;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface WatchlistRepository extends JpaRepository<Watchlist, String> {
    List<Watchlist> findByUserId(String userId);
}
