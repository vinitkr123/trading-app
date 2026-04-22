package com.tradingapp.service;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class StockService {

    @Value("${app.alphavantage.api-key}")
    private String apiKey;

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://www.alphavantage.co/query";

    public Map<String, Object> getQuote(String symbol) {
        String url = String.format("%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s", BASE_URL, symbol, apiKey);
        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            Map<?, ?> quote = (Map<?, ?>) response.get("Global Quote");
            if (quote == null || quote.isEmpty()) return mockQuote(symbol);

            double price = Double.parseDouble(quote.get("05. price").toString());
            double prevClose = Double.parseDouble(quote.get("08. previous close").toString());
            double change = Double.parseDouble(quote.get("09. change").toString());
            double changePercent = Double.parseDouble(quote.get("10. change percent").toString().replace("%", ""));

            return Map.of(
                "symbol", symbol,
                "price", price,
                "open", Double.parseDouble(quote.get("02. open").toString()),
                "high", Double.parseDouble(quote.get("03. high").toString()),
                "low", Double.parseDouble(quote.get("04. low").toString()),
                "volume", Long.parseLong(quote.get("06. volume").toString()),
                "previousClose", prevClose,
                "change", change,
                "changePercent", changePercent,
                "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
            );
        } catch (Exception e) {
            return mockQuote(symbol);
        }
    }

    public List<Map<String, Object>> search(String query) {
        String url = String.format("%s?function=SYMBOL_SEARCH&keywords=%s&apikey=%s", BASE_URL, query, apiKey);
        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            List<?> matches = (List<?>) response.get("bestMatches");
            if (matches == null) return List.of();

            List<Map<String, Object>> results = new ArrayList<>();
            for (Object match : matches) {
                Map<?, ?> m = (Map<?, ?>) match;
                String sym = m.get("1. symbol").toString();
                Map<String, Object> quote = getQuote(sym);
                results.add(Map.of(
                    "symbol", sym,
                    "name", m.get("2. name").toString(),
                    "price", quote.get("price"),
                    "change", quote.get("change"),
                    "changePercent", quote.get("changePercent")
                ));
                if (results.size() >= 5) break;
            }
            return results;
        } catch (Exception e) {
            return List.of();
        }
    }

    public List<Map<String, Object>> getChart(String symbol, String interval) {
        String function = switch (interval) {
            case "1D" -> "TIME_SERIES_INTRADAY";
            case "1W", "1M" -> "TIME_SERIES_DAILY";
            default -> "TIME_SERIES_WEEKLY";
        };

        String url = function.equals("TIME_SERIES_INTRADAY")
            ? String.format("%s?function=%s&symbol=%s&interval=60min&apikey=%s", BASE_URL, function, symbol, apiKey)
            : String.format("%s?function=%s&symbol=%s&apikey=%s", BASE_URL, function, symbol, apiKey);

        try {
            Map<?, ?> response = restTemplate.getForObject(url, Map.class);
            Map<?, ?> seriesKey = null;
            for (Object key : response.keySet()) {
                if (key.toString().contains("Time Series")) {
                    seriesKey = (Map<?, ?>) response.get(key);
                    break;
                }
            }
            if (seriesKey == null) return mockChart(symbol);

            List<Map<String, Object>> chart = new ArrayList<>();
            int limit = switch (interval) {
                case "1D" -> 8;
                case "1W" -> 7;
                case "1M" -> 30;
                case "3M" -> 90;
                default -> 52;
            };

            List<String> keys = new ArrayList<>(seriesKey.keySet().stream().map(Object::toString).toList());
            Collections.sort(keys);
            int from = Math.max(0, keys.size() - limit);
            for (String ts : keys.subList(from, keys.size())) {
                Map<?, ?> bar = (Map<?, ?>) seriesKey.get(ts);
                chart.add(Map.of(
                    "timestamp", ts,
                    "open", Double.parseDouble(bar.get("1. open").toString()),
                    "high", Double.parseDouble(bar.get("2. high").toString()),
                    "low", Double.parseDouble(bar.get("3. low").toString()),
                    "close", Double.parseDouble(bar.get("4. close").toString()),
                    "volume", Long.parseLong(bar.get("5. volume").toString())
                ));
            }
            return chart;
        } catch (Exception e) {
            return mockChart(symbol);
        }
    }

    public List<Map<String, Object>> getTopMovers() {
        String[] symbols = {"AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "NVDA", "META"};
        List<Map<String, Object>> movers = new ArrayList<>();
        for (String sym : symbols) {
            Map<String, Object> quote = getQuote(sym);
            movers.add(Map.of(
                "symbol", sym,
                "name", getCompanyName(sym),
                "price", quote.get("price"),
                "change", quote.get("change"),
                "changePercent", quote.get("changePercent")
            ));
        }
        movers.sort(Comparator.comparingDouble(m -> Math.abs((double) m.get("changePercent"))));
        Collections.reverse(movers);
        return movers;
    }

    // Fallback mock data when API limit is hit (free tier: 25 calls/day)
    private Map<String, Object> mockQuote(String symbol) {
        Random r = new Random(symbol.hashCode());
        double price = 100 + r.nextDouble() * 400;
        double change = (r.nextDouble() - 0.48) * 10;
        return Map.of(
            "symbol", symbol, "price", round(price), "open", round(price - 2),
            "high", round(price + 5), "low", round(price - 5),
            "volume", 1000000L + r.nextLong(50000000),
            "previousClose", round(price - change), "change", round(change),
            "changePercent", round(change / price * 100),
            "timestamp", LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        );
    }

    private List<Map<String, Object>> mockChart(String symbol) {
        Random r = new Random(symbol.hashCode());
        List<Map<String, Object>> chart = new ArrayList<>();
        double price = 100 + r.nextDouble() * 300;
        for (int i = 30; i >= 0; i--) {
            price += (r.nextDouble() - 0.48) * 5;
            chart.add(Map.of(
                "timestamp", LocalDateTime.now().minusDays(i).format(DateTimeFormatter.ISO_LOCAL_DATE),
                "open", round(price - 1), "high", round(price + 3),
                "low", round(price - 3), "close", round(price), "volume", 1000000L
            ));
        }
        return chart;
    }

    private double round(double val) {
        return BigDecimal.valueOf(val).setScale(2, RoundingMode.HALF_UP).doubleValue();
    }

    private String getCompanyName(String symbol) {
        return Map.of(
            "AAPL", "Apple Inc.", "MSFT", "Microsoft Corp.", "GOOGL", "Alphabet Inc.",
            "AMZN", "Amazon.com Inc.", "TSLA", "Tesla Inc.", "NVDA", "NVIDIA Corp.", "META", "Meta Platforms"
        ).getOrDefault(symbol, symbol);
    }
}
