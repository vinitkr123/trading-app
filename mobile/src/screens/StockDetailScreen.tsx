import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { stocksAPI } from '../services/api';
import { usePortfolioStore } from '../store/portfolioStore';
import { useWatchlistStore } from '../store/watchlistStore';
import { StockQuote, ChartDataPoint } from '../types';

const INTERVALS = ['1D', '1W', '1M', '3M', '1Y'];
const { width } = Dimensions.get('window');

export default function StockDetailScreen({ route, navigation }: any) {
  const { symbol } = route.params;
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [interval, setInterval] = useState('1D');
  const [orderModal, setOrderModal] = useState(false);
  const [orderType, setOrderType] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState('');
  const [loading, setLoading] = useState(true);

  const { placeOrder, fetchPortfolio } = usePortfolioStore();
  const { watchlists, addStock, removeStock } = useWatchlistStore();

  useEffect(() => {
    loadData();
  }, [symbol, interval]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [quoteRes, chartRes] = await Promise.all([
        stocksAPI.quote(symbol),
        stocksAPI.chart(symbol, interval),
      ]);
      setQuote(quoteRes.data);
      setChartData(chartRes.data);
    } finally {
      setLoading(false);
    }
  };

  const handleOrder = async () => {
    if (!quantity || parseInt(quantity) <= 0) {
      Alert.alert('Error', 'Enter a valid quantity');
      return;
    }
    try {
      await placeOrder({ symbol, type: orderType, orderType: 'MARKET', quantity: parseInt(quantity) });
      await fetchPortfolio();
      setOrderModal(false);
      setQuantity('');
      Alert.alert('Success', `${orderType} order placed for ${quantity} shares of ${symbol}`);
    } catch (e: any) {
      Alert.alert('Order Failed', e.response?.data?.message || 'Insufficient funds or shares');
    }
  };

  const isWatchlisted = watchlists.some((w) => w.symbols.includes(symbol));
  const priceColor = quote && quote.change >= 0 ? '#00D4AA' : '#FF4757';

  const chartLabels = chartData.length > 0
    ? chartData.filter((_, i) => i % Math.ceil(chartData.length / 5) === 0).map((d) => d.timestamp.slice(5, 10))
    : [];
  const chartValues = chartData.map((d) => d.close);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {loading ? (
        <ActivityIndicator color="#00D4AA" size="large" style={{ marginTop: 60 }} />
      ) : (
        <>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.symbol}>{symbol}</Text>
              <Text style={styles.price}>${quote?.price.toFixed(2)}</Text>
              <Text style={[styles.change, { color: priceColor }]}>
                {quote && quote.change >= 0 ? '+' : ''}{quote?.change.toFixed(2)} ({quote?.changePercent.toFixed(2)}%)
              </Text>
            </View>
          </View>

          {/* Chart */}
          {chartValues.length > 1 && (
            <View style={styles.chartContainer}>
              <View style={styles.intervalRow}>
                {INTERVALS.map((i) => (
                  <TouchableOpacity key={i} style={[styles.intervalBtn, interval === i && styles.intervalActive]}
                    onPress={() => setInterval(i)}>
                    <Text style={[styles.intervalText, interval === i && styles.intervalTextActive]}>{i}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <LineChart
                data={{ labels: chartLabels, datasets: [{ data: chartValues }] }}
                width={width - 32}
                height={200}
                chartConfig={{
                  backgroundColor: '#161B22', backgroundGradientFrom: '#161B22',
                  backgroundGradientTo: '#161B22', decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 212, 170, ${opacity})`,
                  labelColor: () => '#888', propsForDots: { r: '0' },
                }}
                bezier
                style={{ borderRadius: 12 }}
              />
            </View>
          )}

          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              ['Open', `$${quote?.open.toFixed(2)}`],
              ['High', `$${quote?.high.toFixed(2)}`],
              ['Low', `$${quote?.low.toFixed(2)}`],
              ['Prev Close', `$${quote?.previousClose.toFixed(2)}`],
              ['Volume', quote?.volume.toLocaleString() ?? '-'],
            ].map(([label, val]) => (
              <View key={label} style={styles.statItem}>
                <Text style={styles.statLabel}>{label}</Text>
                <Text style={styles.statValue}>{val}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            <TouchableOpacity style={styles.buyBtn} onPress={() => { setOrderType('BUY'); setOrderModal(true); }}>
              <Text style={styles.btnText}>Buy</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.sellBtn} onPress={() => { setOrderType('SELL'); setOrderModal(true); }}>
              <Text style={styles.btnText}>Sell</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Order Modal */}
      <Modal visible={orderModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>{orderType} {symbol}</Text>
            <Text style={styles.modalPrice}>Market Price: ${quote?.price.toFixed(2)}</Text>
            <TextInput
              style={styles.input} placeholder="Quantity" placeholderTextColor="#888"
              value={quantity} onChangeText={setQuantity} keyboardType="numeric"
            />
            {quantity && quote && (
              <Text style={styles.totalText}>
                Estimated: ${(parseInt(quantity || '0') * quote.price).toFixed(2)}
              </Text>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setOrderModal(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmBtn, { backgroundColor: orderType === 'BUY' ? '#00D4AA' : '#FF4757' }]}
                onPress={handleOrder}>
                <Text style={[styles.btnText, { color: '#0D1117' }]}>Confirm {orderType}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 16 },
  header: { marginBottom: 20 },
  symbol: { color: '#888', fontSize: 14, marginBottom: 4 },
  price: { color: '#fff', fontSize: 36, fontWeight: 'bold' },
  change: { fontSize: 16, fontWeight: '600', marginTop: 4 },
  chartContainer: { marginBottom: 20 },
  intervalRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  intervalBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: '#161B22' },
  intervalActive: { backgroundColor: '#00D4AA' },
  intervalText: { color: '#888', fontSize: 13 },
  intervalTextActive: { color: '#0D1117', fontWeight: 'bold' },
  statsGrid: {
    backgroundColor: '#161B22', borderRadius: 12, padding: 16,
    flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20,
    borderWidth: 1, borderColor: '#30363D',
  },
  statItem: { width: '50%', marginBottom: 12 },
  statLabel: { color: '#888', fontSize: 12 },
  statValue: { color: '#fff', fontSize: 15, fontWeight: '600', marginTop: 2 },
  actions: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  buyBtn: { flex: 1, backgroundColor: '#00D4AA', borderRadius: 10, padding: 16, alignItems: 'center' },
  sellBtn: { flex: 1, backgroundColor: '#FF4757', borderRadius: 10, padding: 16, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#161B22', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#30363D',
  },
  modalTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  modalPrice: { color: '#888', fontSize: 14, marginBottom: 20 },
  input: {
    backgroundColor: '#0D1117', color: '#fff', borderRadius: 10,
    padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#30363D', marginBottom: 8,
  },
  totalText: { color: '#888', fontSize: 13, marginBottom: 20 },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#30363D', borderRadius: 10, padding: 16, alignItems: 'center' },
  confirmBtn: { flex: 1, borderRadius: 10, padding: 16, alignItems: 'center' },
});
