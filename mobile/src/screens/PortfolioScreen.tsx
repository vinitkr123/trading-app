import React, { useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { usePortfolioStore } from '../store/portfolioStore';

export default function PortfolioScreen({ navigation }: any) {
  const { portfolio, orders, fetchPortfolio, fetchOrders, isLoading } = usePortfolioStore();

  useEffect(() => {
    fetchPortfolio();
    fetchOrders();
  }, []);

  if (isLoading) return <ActivityIndicator color="#00D4AA" size="large" style={{ flex: 1, backgroundColor: '#0D1117' }} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Summary */}
      {portfolio && (
        <View style={styles.summaryCard}>
          <Text style={styles.sectionTitle}>Portfolio Summary</Text>
          <View style={styles.row}>
            <StatBox label="Total Value" value={`$${portfolio.totalValue.toFixed(2)}`} />
            <StatBox label="Cash" value={`$${portfolio.cashBalance.toFixed(2)}`} />
          </View>
          <View style={styles.row}>
            <StatBox label="Invested" value={`$${portfolio.investedValue.toFixed(2)}`} />
            <StatBox
              label="Total P&L"
              value={`${portfolio.totalPnl >= 0 ? '+' : ''}$${portfolio.totalPnl.toFixed(2)}`}
              valueColor={portfolio.totalPnl >= 0 ? '#00D4AA' : '#FF4757'}
            />
          </View>
        </View>
      )}

      {/* Holdings */}
      <Text style={styles.sectionTitle}>Holdings</Text>
      {portfolio?.holdings.length === 0 ? (
        <Text style={styles.empty}>No holdings yet. Start trading!</Text>
      ) : (
        portfolio?.holdings.map((h) => (
          <TouchableOpacity key={h.id} style={styles.holdingRow}
            onPress={() => navigation.navigate('StockDetail', { symbol: h.symbol })}>
            <View style={{ flex: 1 }}>
              <Text style={styles.symbol}>{h.symbol}</Text>
              <Text style={styles.holdingMeta}>{h.quantity} shares @ ${h.averageCost.toFixed(2)}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.price}>${h.totalValue.toFixed(2)}</Text>
              <Text style={[styles.pnl, { color: h.pnl >= 0 ? '#00D4AA' : '#FF4757' }]}>
                {h.pnl >= 0 ? '+' : ''}${h.pnl.toFixed(2)} ({h.pnlPercent.toFixed(2)}%)
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}

      {/* Recent Orders */}
      <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Recent Orders</Text>
      {orders.length === 0 ? (
        <Text style={styles.empty}>No orders yet.</Text>
      ) : (
        orders.slice(0, 10).map((o) => (
          <View key={o.id} style={styles.orderRow}>
            <View style={[styles.badge, { backgroundColor: o.type === 'BUY' ? '#00D4AA22' : '#FF475722' }]}>
              <Text style={[styles.badgeText, { color: o.type === 'BUY' ? '#00D4AA' : '#FF4757' }]}>{o.type}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.symbol}>{o.symbol}</Text>
              <Text style={styles.holdingMeta}>{o.quantity} shares · {o.status}</Text>
            </View>
            {o.executedPrice && <Text style={styles.price}>${o.executedPrice.toFixed(2)}</Text>}
          </View>
        ))
      )}
    </ScrollView>
  );
}

function StatBox({ label, value, valueColor = '#fff' }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.statBox}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 16 },
  summaryCard: {
    backgroundColor: '#161B22', borderRadius: 16, padding: 16, marginBottom: 24,
    borderWidth: 1, borderColor: '#30363D',
  },
  row: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox: { flex: 1, backgroundColor: '#0D1117', borderRadius: 10, padding: 12 },
  statLabel: { color: '#888', fontSize: 12, marginBottom: 4 },
  statValue: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  sectionTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginBottom: 12 },
  empty: { color: '#888', fontSize: 14, textAlign: 'center', paddingVertical: 20 },
  holdingRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B22',
    borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#30363D',
  },
  symbol: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  holdingMeta: { color: '#888', fontSize: 12, marginTop: 2 },
  price: { color: '#fff', fontSize: 16, fontWeight: '600' },
  pnl: { fontSize: 13, marginTop: 2 },
  orderRow: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#161B22',
    borderRadius: 10, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#30363D',
  },
  badge: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  badgeText: { fontWeight: 'bold', fontSize: 12 },
});
