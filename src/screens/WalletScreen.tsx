// SIMPLIFIED USER-ONLY WALLET SCREEN - No admin visible
import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, ActivityIndicator, Platform, Alert } from "react-native";
import { ArrowLeft, Wallet, ArrowUpRight, History, Smartphone, ChevronRight, Gift, X } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import { Transaction } from "../types";
import { useTheme } from "../context/ThemeContext";

interface WalletScreenProps {
  onBack: () => void;
  balance: number;
  transactions: Transaction[];
  setBalance: (balance: number | ((prev: number) => number)) => void;
  setTransactions: (transactions: Transaction[] | ((prev: Transaction[]) => Transaction[])) => void;
  userPhoneNumber?: string;
}

const MIN_WITHDRAWAL = 10;
const MAX_WITHDRAWAL = 10000;

export default function WalletScreen({ 
  onBack, 
  balance: currentBalance, 
  transactions, 
  setBalance: setCurrentBalance, 
  setTransactions,
  userPhoneNumber = ""
}: WalletScreenProps) {
  const { theme, darkMode } = useTheme();
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(userPhoneNumber);
  const [selectedNetwork, setSelectedNetwork] = useState("MTN");
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");

  const networks = [
    { id: "MTN", name: "MTN", color: "#fbbf24" },
    { id: "Telecel", name: "Telecel", color: "#dc2626" },
    { id: "AirtelTigo", name: "AirtelTigo", color: "#2563eb" },
  ];

  const validateWithdrawal = (amount: number): string => {
    if (isNaN(amount) || amount <= 0) return "Please enter a valid amount";
    if (amount < MIN_WITHDRAWAL) return `Minimum withdrawal amount is ₵${MIN_WITHDRAWAL}`;
    if (amount > MAX_WITHDRAWAL) return `Maximum withdrawal amount is ₵${MAX_WITHDRAWAL}`;
    if (amount > currentBalance) return `Insufficient balance. Available: ₵${currentBalance}`;
    if (!phoneNumber || phoneNumber.length < 10) return "Please enter a valid phone number";
    return "";
  };

  const handleWithdraw = () => {
    const amount = parseFloat(withdrawAmount);
    const errorMsg = validateWithdrawal(amount);
    
    if (errorMsg) {
      setError(errorMsg);
      return;
    }
    
    setError("");
    setLoading(true);
    
    setTimeout(() => {
      setLoading(false);
      const newBalance = currentBalance - amount;
      setCurrentBalance(newBalance);
      
      const newTransaction: Transaction = {
        id: "t" + Date.now(),
        type: "withdrawal",
        amount: amount,
        date: "Just now",
        status: "completed",
        network: selectedNetwork,
        phoneNumber: phoneNumber,
      };
      setTransactions(prev => [newTransaction, ...prev]);
      
      Alert.alert(
        "Withdrawal Initiated",
        `₵${amount.toFixed(2)} will be sent to your ${selectedNetwork} Mobile Money account (${phoneNumber}) within 15-30 minutes.`
      );
      
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setIsWithdrawing(false);
        setWithdrawAmount("");
        setError("");
      }, 3000);
    }, 2000);
  };

  const formatDate = (dateStr: string) => {
    if (dateStr === "Just now") return dateStr;
    return dateStr;
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={20} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>My Wallet</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Balance Card */}
        <View style={[styles.balanceCard, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
          <View style={styles.balanceHeader}>
            <Wallet size={14} color="#fff" opacity={0.8} />
            <Text style={styles.balanceLabel}>Available Balance</Text>
          </View>
          <Text style={styles.balanceValue}>₵ {currentBalance.toLocaleString()}/-</Text>
          
          <View style={styles.actionRow}>
            <TouchableOpacity 
              style={[styles.actionBtnPrimary, { backgroundColor: '#fff' }]}
              onPress={() => setIsWithdrawing(true)}
            >
              <ArrowUpRight size={18} color={theme.primary} />
              <Text style={[styles.actionBtnText, { color: theme.primary }]}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Simple Info Card */}
        <View style={[styles.simpleInfoCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <Text style={[styles.simpleInfoText, { color: theme.subText }]}>
            💡 Withdrawals are processed within 15-30 minutes to your registered mobile money account.
          </Text>
        </View>

        {/* History */}
        <View style={styles.historySection}>
          <View style={styles.sectionHeader}>
            <View style={styles.headerLeft}>
              <History size={18} color={theme.primary} />
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Transaction History</Text>
            </View>
          </View>

          <View style={styles.transactionList}>
            {transactions.length === 0 ? (
              <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Wallet size={48} color={theme.subText} strokeWidth={1.5} />
                <Text style={[styles.emptyTitle, { color: theme.text }]}>No Transactions</Text>
                <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Your withdrawal history will appear here</Text>
              </View>
            ) : (
              transactions.map((tx) => (
                <View key={tx.id} style={[styles.transactionCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={styles.txLeft}>
                    <View style={[
                      styles.txIconBg, 
                      { backgroundColor: tx.type === 'withdrawal' 
                          ? (darkMode ? theme.secondary + '20' : '#fff7ed') 
                          : (darkMode ? theme.primary + '20' : '#f0fdf4')
                      }
                    ]}>
                      {tx.type === 'withdrawal' ? <ArrowUpRight size={20} color={darkMode ? theme.secondary : "#ea580c"} /> : <Gift size={20} color={darkMode ? theme.primary : "#16a34a"} />}
                    </View>
                    <View>
                      <Text style={[styles.txTitle, { color: theme.text }]}>
                        {tx.type === 'withdrawal' ? `Withdrawal to ${tx.network || selectedNetwork}` : (tx.type === 'gift_received' ? `Gift from ${tx.senderName || 'User'}` : 'Wallet Transaction')}
                      </Text>
                      <Text style={[styles.txDate, { color: theme.subText }]}>{formatDate(tx.date)}</Text>
                      {tx.phoneNumber && (
                        <Text style={[styles.txPhone, { color: theme.subText }]}>
                          Sent to: {tx.phoneNumber}
                        </Text>
                      )}
                    </View>
                  </View>
                  <View style={styles.txRight}>
                    <Text style={[
                      styles.txAmount, 
                      { 
                        color: tx.type === 'withdrawal' 
                            ? (darkMode ? theme.secondary : '#ea580c')
                            : (darkMode ? theme.primary : '#16a34a')
                      }
                    ]}>
                      {tx.type === 'withdrawal' ? '-' : '+'} ₵{tx.amount.toLocaleString()}
                    </Text>
                    <Text style={[styles.txStatus, { color: theme.subText }]}>{tx.status || 'Completed'}</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal visible={isWithdrawing} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Withdraw to Mobile Money</Text>
              <TouchableOpacity onPress={() => { setIsWithdrawing(false); setWithdrawAmount(""); setError(""); }}>
                <X size={24} color={theme.subText} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <View style={[styles.inputContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>Amount to Withdraw</Text>
                <View style={styles.amountWrap}>
                  <TextInput 
                    style={[styles.amountInput, { color: theme.text }]}
                    placeholder="0.00"
                    placeholderTextColor={theme.subText}
                    keyboardType="numeric"
                    value={withdrawAmount}
                    onChangeText={(t) => {
                      setWithdrawAmount(t);
                      setError("");
                    }}
                  />
                  <Text style={[styles.currencyCode, { color: theme.subText }]}>GHS</Text>
                </View>
                <View style={styles.quickAmounts}>
                  {[50, 100, 200, 500].map(amt => (
                    <TouchableOpacity 
                      key={amt} 
                      onPress={() => {
                        setWithdrawAmount(amt.toString());
                        setError("");
                      }}
                      style={[styles.quickAmtBtn, { backgroundColor: theme.itemBg, borderColor: theme.border }]}
                    >
                      <Text style={[styles.quickAmtText, { color: theme.text }]}>₵{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                {error ? (
                  <Text style={styles.errorText}>{error}</Text>
                ) : withdrawAmount && !isNaN(parseFloat(withdrawAmount)) && (
                  <Text style={styles.infoText}>
                    Min: ₵{MIN_WITHDRAWAL} | Max: ₵{MAX_WITHDRAWAL}
                  </Text>
                )}
              </View>

              <View style={styles.networkSection}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>Select Network</Text>
                <View style={styles.networkGrid}>
                  {networks.map((net) => (
                    <TouchableOpacity
                      key={net.id}
                      onPress={() => setSelectedNetwork(net.id)}
                      style={[
                        styles.networkBtn, 
                        { backgroundColor: theme.card, borderColor: theme.border },
                        selectedNetwork === net.id && { borderColor: theme.primary, backgroundColor: darkMode ? theme.primary + '10' : theme.primary + '05' }
                      ]}
                    >
                      <View style={[styles.netIcon, { backgroundColor: net.color }]}>
                        <Text style={styles.netLabelShort}>{net.id.substring(0, 2).toUpperCase()}</Text>
                      </View>
                      <Text style={[
                          styles.netLabel, 
                          { color: theme.subText },
                          selectedNetwork === net.id && { color: theme.primary }
                      ]}>{net.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={[styles.accountCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.accountLeft}>
                  <View style={[styles.accIconBg, { backgroundColor: networks.find(n => n.id === selectedNetwork)?.color }]}>
                    <Smartphone size={18} color="#fff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.accLabel, { color: theme.subText }]}>{selectedNetwork} Account</Text>
                    <TextInput 
                      style={[styles.accValue, { color: theme.text, padding: 0 }]}
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      placeholder="Enter phone number"
                      placeholderTextColor={theme.subText}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
                <ChevronRight size={20} color={theme.subText} />
              </View>

              <View style={[styles.infoBox, { backgroundColor: darkMode ? theme.itemBg : theme.secondary + '10' }]}>
                <Text style={[styles.infoText, { color: darkMode ? theme.secondary : '#3b82f6' }]}>
                  💡 Withdrawals to mobile money wallets typically take 15-30 minutes to process.
                </Text>
                <Text style={[styles.infoTextSmall, { color: darkMode ? theme.secondary : '#3b82f6', marginTop: 8 }]}>
                  📱 Funds will be sent to the mobile money number you provide.
                </Text>
              </View>

              <TouchableOpacity 
                style={[
                  styles.mainActionBtn, 
                  { backgroundColor: theme.primary, shadowColor: theme.primary },
                  loading && { backgroundColor: theme.itemBg, shadowOpacity: 0 }
                ]}
                disabled={loading}
                onPress={handleWithdraw}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.mainActionBtnText}>Confirm Withdrawal</Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Success Modal */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={[styles.successOverlay, { backgroundColor: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }]}>
          <MotiView 
            from={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.successCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={[styles.successIconWrapper, { backgroundColor: darkMode ? theme.primary + '20' : '#f0fdf4' }]}>
              <ArrowUpRight size={40} color={darkMode ? theme.primary : "#16a34a"} />
            </View>
            <Text style={[styles.successTitle, { color: theme.text }]}>Withdrawal Initiated!</Text>
            <Text style={[styles.successDesc, { color: theme.subText }]}>
              Your withdrawal request is being processed. You will receive the funds within 15-30 minutes.
            </Text>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  header: { height: 64, backgroundColor: '#fff', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 16, fontWeight: '900', color: '#1e293b', textTransform: 'uppercase', letterSpacing: 1 },
  scrollContent: { padding: 24, paddingBottom: 40 },
  balanceCard: { backgroundColor: '#4f46e5', borderRadius: 40, padding: 32, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  balanceHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  balanceLabel: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 },
  balanceValue: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 4 },
  actionRow: { flexDirection: 'row', gap: 16, marginTop: 40 },
  actionBtnPrimary: { flex: 1, height: 52, backgroundColor: '#fff', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 4 } },
  actionBtnText: { color: '#fff', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  simpleInfoCard: { marginTop: 20, padding: 16, borderRadius: 20, borderWidth: 1 },
  simpleInfoText: { fontSize: 12, lineHeight: 18 },
  historySection: { marginTop: 24 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 8, marginBottom: 16 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  sectionTitle: { fontSize: 14, fontWeight: '900', color: '#1e293b' },
  transactionList: { gap: 12 },
  transactionCard: { backgroundColor: '#fff', borderRadius: 20, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9' },
  txLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  txIconBg: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  txTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  txDate: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  txPhone: { fontSize: 9, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: 14, fontWeight: '900' },
  txStatus: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', marginTop: 2 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '85%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
  modalScroll: { padding: 24 },
  inputContainer: { backgroundColor: '#f8fafc', borderRadius: 24, padding: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  inputLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  amountWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountInput: { fontSize: 32, fontWeight: '900', color: '#1e293b', flex: 1, padding: 0 },
  currencyCode: { fontSize: 18, fontWeight: '900', color: '#cbd5e1', marginLeft: 12 },
  quickAmounts: { flexDirection: 'row', gap: 8, marginTop: 16 },
  quickAmtBtn: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  quickAmtText: { fontSize: 10, fontWeight: '700', color: '#64748b' },
  errorText: { color: '#ef4444', fontSize: 12, fontWeight: '600', marginTop: 12 },
  infoText: { color: '#94a3b8', fontSize: 10, fontWeight: '600', marginTop: 12 },
  networkSection: { marginTop: 24 },
  networkGrid: { flexDirection: 'row', gap: 12, marginTop: 8 },
  networkBtn: { flex: 1, height: 80, backgroundColor: '#fff', borderRadius: 24, borderWidth: 2, borderColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center', gap: 8 },
  netIcon: { width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  netLabelShort: { fontSize: 8, fontWeight: '900', color: '#fff', textTransform: 'uppercase' },
  netLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  accountCard: { marginTop: 24, backgroundColor: '#f8fafc', borderRadius: 24, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9' },
  accountLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  accIconBg: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } },
  accLabel: { fontSize: 10, fontWeight: '800', color: '#94a3b8', textTransform: 'uppercase' },
  accValue: { fontSize: 14, fontWeight: '700', color: '#1e293b', marginTop: 2 },
  infoBox: { marginTop: 24, padding: 16, borderRadius: 16 },
  infoTextSmall: { fontSize: 11, fontWeight: '500' },
  mainActionBtn: { height: 56, backgroundColor: '#4f46e5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 32, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 4, marginBottom: 40 },
  mainActionBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 2 },
  successOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', padding: 24 },
  successCard: { backgroundColor: '#fff', borderRadius: 40, padding: 40, width: '100%', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowOffset: { width: 0, height: 20 }, shadowRadius: 40, elevation: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  successIconWrapper: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, fontWeight: '900', color: '#1e293b', marginBottom: 8 },
  successDesc: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 20, fontWeight: '600' },
  emptyContainer: { paddingVertical: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 24, borderWidth: 1, borderStyle: 'dashed' },
  emptyTitle: { fontSize: 18, fontWeight: '800', marginTop: 16 },
  emptySubtitle: { fontSize: 14, textAlign: 'center', marginTop: 8, paddingHorizontal: 40, lineHeight: 20 },
});
