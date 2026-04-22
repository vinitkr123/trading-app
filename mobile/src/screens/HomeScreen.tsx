import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { usePortfolioStore } from '../store/portfolioStore';
import { stocksAPI } from '../services/api';
import { Stock } from '../types';

export default function HomeScreen({ navigation }: any) {
  const { portfolio, fetchPortfolio } = usePortfolioStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Stock[]>([]);
  const [movers, setMovers] = useState<Stock[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    fetchPortfolio();
    stocksAPI.topMovers().then(({ data }) => setMovers(data)).catch(() => {});
  }, []);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (text.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const { data } = await stocksAPI.search(text);
      setResults(data);
    } finally {
      setSearching(false);
    }
  };

  const pnlColor = portfolio && portfolio.totalPnl >= 0 ? '#00D4AA' : '#FF4757';

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Portfolio Summary */}
      {portfolio && (
        <View style={styles.portfolioCard}>
          <Text style={styles.label}>Portfolio Value</Text>
          <Text style={styles.value}>${portfolio.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</Text>
          <Text style={[styles.pnl, { color: pnlColor }]}>
            {portfolio.totalPnl >= 0 ? '+' : ''}${portfolio.totalPnl.toFixed(2)} ({portfolio.totalPnlPercent.toFixed(2)}%)
          </Text>
          <View style={styles.row}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Cash</Text>
              <Text style={styles.statValue}>${portfolio.cashBalance.toFixed(2)}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>Invested</Text>
              <Text style={styles.statValue}>${portfolio.investedValue.toFixed(2)}</Text>
            </View>
          </View>
        </View>
      )}

      {/* Search */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search stocks (AAPL, TSLA...)"
          placeholderTextColor="#888"
          value={query}
          onChangeText={handleSearch}
        />
        {searching && <ActivityIndicator color="#00D4AA" style={{ marginLeft: 8 }} />}
      </View>

      {/* Search Results */}
      {results.length > 0 && (
        <View style={styles.section}>
          {results.map((s) => (
            <TouchableOpacity key={s.symbol} style={styles.stockRow}
              onPress={() => navigation.navigate('StockDetail', { symbol: s.symbol })}>
              <View>
                <Text style={styles.symbol}>{s.symbol}</Text>
                <Text style={styles.name}>{s.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>${s.price.toFixed(2)}</Text>
                <Text style={[styles.change, { color: s.change >= 0 ? '#00D4AA' : '#FF4757' }]}>
                  {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Top Movers */}
      {movers.length > 0 && query.length < 2 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Movers</Text>
          {movers.map((s) => (
            <TouchableOpacity key={s.symbol} style={styles.stockRow}
              onPress={() => navigation.navigate('StockDetail', { symbol: s.symbol })}>
              <View>
                <Text style={styles.symbol}>{s.symbol}</Text>
                <Text style={styles.name}>{s.name}</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.price}>${s.price.toFixed(2)}</Text>
                <Text style={[styles.change, { color: s.change >= 0 ? '#00D4AA' : '#FF4757' }]}>
                  {s.change >= 0 ? '+' : ''}{s.changePercent.toFixed(2)}%
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 16 },
  portfolioCard: {
    backgroundColor: '#161B22', borderRadius: 16, padding: 20, marginBottom: 16,
    borderWidth: 1, borderColor: '#30363D',
  },
  label: { color: '#888', fontSize: 13, marginBottom: 4 },
  value: { color: '#fff', fontSize: 32, fontWeight: 'bold', marginBottom: 4 },
  pnl: { fontSize: 16, fontWeight: '600', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1 },
  statLabel: { color: '#888', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 16, fontWeight: '600' },
  searchBox: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#161B22', borderRadius: 10, marginBottom: 16,
    borderWidth: 1, borderColor: '#30363D', paddingHorizontal: 12,
  },
  searchInput: { flex: 1, color: '#fff', fontSize: 16, paddingVertical: 12 },
  section: { marginBottom: 16 },
  sectionTitle: { color: '#888', fontSize: 13, fontWeight: '600', marginBottom: 12, textTransform: 'uppercase' },
  stockRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#161B22', borderRadius: 10, padding: 14, marginBottom: 8,
    borderWidth: 1, borderColor: '#30363D',
  },
  symbol: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  name: { color: '#888', fontSize: 12, marginTop: 2 },
  price: { color: '#fff', fontSize: 16, fontWeight: '600' },
  change: { fontSize: 13, marginTop: 2 },
});
