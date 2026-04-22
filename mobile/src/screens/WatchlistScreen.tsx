import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Modal, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useWatchlistStore } from '../store/watchlistStore';

export default function WatchlistScreen({ navigation }: any) {
  const { watchlists, fetchWatchlists, createWatchlist, deleteWatchlist, removeStock, isLoading } = useWatchlistStore();
  const [createModal, setCreateModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) { Alert.alert('Error', 'Enter a watchlist name'); return; }
    await createWatchlist(newName.trim());
    setNewName('');
    setCreateModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    Alert.alert('Delete Watchlist', `Delete "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteWatchlist(id) },
    ]);
  };

  if (isLoading) return <ActivityIndicator color="#00D4AA" size="large" style={{ flex: 1, backgroundColor: '#0D1117' }} />;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Watchlists</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setCreateModal(true)}>
          <Ionicons name="add" size={24} color="#0D1117" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {watchlists.length === 0 ? (
          <Text style={styles.empty}>No watchlists yet. Tap + to create one.</Text>
        ) : (
          watchlists.map((w) => (
            <View key={w.id} style={styles.watchlistCard}>
              <TouchableOpacity
                style={styles.watchlistHeader}
                onPress={() => setExpandedId(expandedId === w.id ? null : w.id)}>
                <View>
                  <Text style={styles.watchlistName}>{w.name}</Text>
                  <Text style={styles.watchlistCount}>{w.symbols.length} stocks</Text>
                </View>
                <View style={styles.actions}>
                  <TouchableOpacity onPress={() => navigation.navigate('AddStock', { watchlistId: w.id })}
                    style={styles.iconBtn}>
                    <Ionicons name="add-circle-outline" size={22} color="#00D4AA" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(w.id, w.name)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={20} color="#FF4757" />
                  </TouchableOpacity>
                  <Ionicons
                    name={expandedId === w.id ? 'chevron-up' : 'chevron-down'}
                    size={20} color="#888"
                  />
                </View>
              </TouchableOpacity>

              {expandedId === w.id && (
                <View style={styles.stockList}>
                  {w.symbols.length === 0 ? (
                    <Text style={styles.empty}>No stocks added yet.</Text>
                  ) : (
                    w.symbols.map((sym) => (
                      <View key={sym} style={styles.stockRow}>
                        <TouchableOpacity
                          style={{ flex: 1 }}
                          onPress={() => navigation.navigate('StockDetail', { symbol: sym })}>
                          <Text style={styles.stockSymbol}>{sym}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => removeStock(w.id, sym)}>
                          <Ionicons name="close-circle-outline" size={20} color="#888" />
                        </TouchableOpacity>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Modal */}
      <Modal visible={createModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>New Watchlist</Text>
            <TextInput
              style={styles.input} placeholder="Watchlist name" placeholderTextColor="#888"
              value={newName} onChangeText={setNewName} autoFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setCreateModal(false)}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.createBtn} onPress={handleCreate}>
                <Text style={styles.createText}>Create</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0D1117', padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  addBtn: { backgroundColor: '#00D4AA', borderRadius: 20, width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  empty: { color: '#888', textAlign: 'center', paddingVertical: 20, fontSize: 14 },
  watchlistCard: {
    backgroundColor: '#161B22', borderRadius: 12, marginBottom: 12,
    borderWidth: 1, borderColor: '#30363D', overflow: 'hidden',
  },
  watchlistHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16 },
  watchlistName: { color: '#fff', fontSize: 17, fontWeight: '600' },
  watchlistCount: { color: '#888', fontSize: 12, marginTop: 2 },
  actions: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  iconBtn: { padding: 4 },
  stockList: { borderTopWidth: 1, borderTopColor: '#30363D', padding: 12 },
  stockRow: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 10,
    borderBottomWidth: 1, borderBottomColor: '#30363D',
  },
  stockSymbol: { color: '#fff', fontSize: 15, fontWeight: '500' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'flex-end' },
  modal: {
    backgroundColor: '#161B22', borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 24, borderWidth: 1, borderColor: '#30363D',
  },
  modalTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  input: {
    backgroundColor: '#0D1117', color: '#fff', borderRadius: 10,
    padding: 14, fontSize: 16, borderWidth: 1, borderColor: '#30363D', marginBottom: 16,
  },
  modalActions: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#30363D', borderRadius: 10, padding: 14, alignItems: 'center' },
  cancelText: { color: '#fff', fontWeight: '600' },
  createBtn: { flex: 1, backgroundColor: '#00D4AA', borderRadius: 10, padding: 14, alignItems: 'center' },
  createText: { color: '#0D1117', fontWeight: 'bold' },
});
