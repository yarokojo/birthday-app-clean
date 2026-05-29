import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image, Platform, Alert, TextInput, Modal } from "react-native";
import { ArrowLeft, Users, Target, Clock, Cake, DollarSign, Plus, X, Bell } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import { GroupGift } from "../types";
import { useTheme } from "../context/ThemeContext";

interface GroupGiftScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, id?: string, mode?: 'post' | 'video', url?: string, title?: string) => void;
  pools: GroupGift[];
  setPools: (pools: GroupGift[] | ((prev: GroupGift[]) => GroupGift[])) => void;
  unreadCount?: number;
}

export default function GroupGiftScreen({ onBack, onNavigate, pools, setPools, unreadCount = 0 }: GroupGiftScreenProps) {
  const { theme, darkMode } = useTheme();
  const [selectedGiftId, setSelectedGiftId] = useState<string | null>(null);
  const [contribution, setContribution] = useState("10");
  const [showCreatePool, setShowCreatePool] = useState(false);
  const [newPool, setNewPool] = useState({
    celebrantName: "",
    giftName: "",
    targetAmount: "",
    deadline: "",
    imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop"
  });

  const selectedGift = pools.find(p => p.id === selectedGiftId) || null;

  const handleContribute = () => {
    if (!selectedGift) return;
    
    const amount = parseFloat(contribution);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid contribution amount.");
      return;
    }
    
    const updatedPools = pools.map(pool => {
      if (pool.id === selectedGift.id) {
        const newAmount = pool.currentAmount + amount;
        const isNowComplete = newAmount >= pool.targetAmount;
        
        if (isNowComplete && pool.currentAmount < pool.targetAmount) {
          setTimeout(() => {
            Alert.alert(
              "🎯 Target Reached!", 
              `Congratulations! The target for ${pool.giftName} has been met.\n\nAutomated actions:\n1. Contributors notified\n2. ₵${newAmount} sent to ${pool.celebrantName}'s wallet`
            );
          }, 500);
        }
        
        return {
          ...pool,
          currentAmount: newAmount,
          contributorsCount: pool.contributorsCount + 1
        };
      }
      return pool;
    });

    setPools(updatedPools);
    Alert.alert("Success", `Contributed ₵${contribution} successfully!`);
    setSelectedGiftId(null);
  };

  const handleCreatePool = () => {
    // Validate inputs
    if (!newPool.celebrantName.trim()) {
      Alert.alert("Missing Info", "Please enter the celebrant's name.");
      return;
    }
    if (!newPool.giftName.trim()) {
      Alert.alert("Missing Info", "Please enter the gift name.");
      return;
    }
    const targetAmount = parseFloat(newPool.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid target amount.");
      return;
    }
    if (!newPool.deadline.trim()) {
      Alert.alert("Missing Info", "Please enter a deadline.");
      return;
    }

    // Create new pool
    const newPoolData: GroupGift = {
      id: Date.now().toString(),
      celebrantName: newPool.celebrantName,
      giftName: newPool.giftName,
      targetAmount: targetAmount,
      currentAmount: 0,
      contributorsCount: 0,
      deadline: newPool.deadline,
      imageUrl: newPool.imageUrl
    };

    setPools([newPoolData, ...pools]);
    setShowCreatePool(false);
    setNewPool({
      celebrantName: "",
      giftName: "",
      targetAmount: "",
      deadline: "",
      imageUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&h=300&fit=crop"
    });
    Alert.alert("Success", `Group gift pool for ${newPool.celebrantName} has been created!`);
  };

  const handleNotifications = () => {
    if (onNavigate) {
      onNavigate('notifications');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Custom Header with Back Button and Notification Bell */}
      <View style={[styles.customHeader, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={selectedGift ? () => setSelectedGiftId(null) : onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          {selectedGift ? "Group Contribution" : "Group Gifts"}
        </Text>
        <View style={styles.headerRight}>
          <TouchableOpacity onPress={handleNotifications} style={styles.notificationBtn}>
            <Bell size={20} color={theme.subText} />
            {unreadCount > 0 && (
              <View style={[styles.notificationDot, { backgroundColor: theme.primary }]}>
                <Text style={styles.notificationCount}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {!selectedGift ? (
          <View style={styles.mainView}>
            <View style={[styles.promoCard, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
              <View style={styles.promoContent}>
                <Text style={styles.promoTitle}>Buy a Cake Together!</Text>
                <Text style={styles.promoDesc}>
                  Contribute small amounts with friends to get a premium gift for your favorite celebrants.
                </Text>
                <TouchableOpacity 
                  style={[styles.newPoolBtn, { backgroundColor: 'rgba(255,255,255,0.2)' }]}
                  onPress={() => setShowCreatePool(true)}
                >
                  <Plus size={16} color="#fff" />
                  <Text style={styles.newPoolText}>Start New Pool</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.promoIconBg}>
                <Cake size={80} color="#fff" opacity={0.1} />
              </View>
            </View>

            <View style={styles.giftList}>
              {pools.length === 0 ? (
                <View style={[styles.emptyContainer, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <Users size={48} color={theme.subText} strokeWidth={1.5} />
                  <Text style={[styles.emptyTitle, { color: theme.text }]}>No Group Gifts</Text>
                  <Text style={[styles.emptySubtitle, { color: theme.subText }]}>Start a new pool to collect gifts together!</Text>
                  <TouchableOpacity 
                    style={[styles.startPoolBtn, { backgroundColor: theme.primary }]}
                    onPress={() => setShowCreatePool(true)}
                  >
                    <Plus size={16} color="#fff" />
                    <Text style={styles.startPoolBtnText}>Start a Pool</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                pools.map((gift) => {
                  const progress = Math.min((gift.currentAmount / gift.targetAmount) * 100, 100);
                  const isComplete = gift.currentAmount >= gift.targetAmount;
                  return (
                    <TouchableOpacity
                      key={gift.id}
                      onPress={() => setSelectedGiftId(gift.id)}
                      style={[styles.giftCard, { backgroundColor: theme.card, borderColor: theme.border }]}
                    >
                      <View style={styles.giftLayout}>
                        <Image source={{ uri: gift.imageUrl }} style={[styles.giftThumb, { backgroundColor: theme.itemBg }]} />
                        <View style={styles.giftInfo}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Text style={[styles.giftName, { color: theme.text }]} numberOfLines={1}>{gift.giftName}</Text>
                            {isComplete && (
                              <View style={{ backgroundColor: '#22c55e', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ color: '#fff', fontSize: 8, fontWeight: '900' }}>COMPLETE</Text>
                              </View>
                            )}
                          </View>
                          <Text style={[styles.celebrantName, { color: theme.subText }]}>For {gift.celebrantName}</Text>
                          
                          <View style={styles.giftMeta}>
                            <View style={styles.metaItem}>
                              <DollarSign size={12} color={isComplete ? '#22c55e' : theme.accent} />
                              <Text style={[styles.metaValue, { color: theme.text }]}>₵{gift.currentAmount} / ₵{gift.targetAmount}</Text>
                            </View>
                            <View style={styles.metaItem}>
                              <Clock size={12} color={theme.subText} />
                              <Text style={[styles.deadlineText, { color: theme.subText }]}>{isComplete ? 'Goal Met' : gift.deadline}</Text>
                            </View>
                          </View>

                          <View style={[styles.progressBarBg, { backgroundColor: theme.itemBg }]}>
                            <MotiView 
                              from={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              style={[styles.progressBarFill, { backgroundColor: isComplete ? '#22c55e' : theme.primary }]}
                            />
                          </View>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
          </View>
        ) : (
          <MotiView 
            from={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={[styles.detailCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
            <View style={styles.detailHeader}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: selectedGift.imageUrl }} style={[styles.detailImage, { borderColor: theme.card }]} />
                <View style={[styles.detailIconBadge, { backgroundColor: theme.primary, borderColor: theme.card }]}>
                  <DollarSign size={24} color="#fff" />
                </View>
              </View>
              
              <View style={styles.detailTitles}>
                <Text style={[styles.detailGiftName, { color: theme.text }]}>{selectedGift.giftName}</Text>
                <Text style={[styles.detailCelebrant, { color: theme.primary }]}>For {selectedGift.celebrantName}</Text>
              </View>

              <View style={styles.statsGrid}>
                <View style={[styles.statBox, { backgroundColor: theme.itemBg }]}>
                  <Target size={20} color={theme.primary} />
                  <Text style={styles.statLabel}>Target</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>₵{selectedGift.targetAmount}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: darkMode ? theme.itemBg : '#f0fdf4' }]}>
                  <DollarSign size={20} color={theme.accent} />
                  <Text style={[styles.statLabel, { color: theme.subText }]}>Raised</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>₵{selectedGift.currentAmount}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: darkMode ? theme.itemBg : '#eff6ff' }]}>
                  <Users size={20} color={theme.secondary} />
                  <Text style={[styles.statLabel, { color: theme.subText }]}>Givers</Text>
                  <Text style={[styles.statValue, { color: theme.text }]}>{selectedGift.contributorsCount}</Text>
                </View>
              </View>

              <View style={styles.contributionSection}>
                <Text style={[styles.contributeHeader, { color: theme.text }]}>Select Contribution</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.contributeScroll}>
                  {["5", "10", "20", "50", "100"].map((amt) => (
                    <TouchableOpacity
                      key={amt}
                      onPress={() => setContribution(amt)}
                      style={[
                        styles.amtBtn,
                        { backgroundColor: theme.itemBg, borderColor: theme.border },
                        contribution === amt && [styles.amtBtnActive, { backgroundColor: theme.primary, borderColor: theme.primary, shadowColor: theme.primary }]
                      ]}
                    >
                      <Text style={[
                        styles.amtText,
                        { color: theme.subText },
                        contribution === amt && styles.amtTextActive
                      ]}>₵{amt}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                
                <TouchableOpacity 
                  onPress={handleContribute}
                  style={[styles.joinBtn, { backgroundColor: theme.primary, shadowColor: theme.primary }]}
                >
                  <Text style={styles.joinBtnText}>Join Contribution</Text>
                </TouchableOpacity>
              </View>
            </View>
          </MotiView>
        )}
      </ScrollView>

      {/* Create Pool Modal */}
      <Modal visible={showCreatePool} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <MotiView 
            from={{ translateY: 300 }}
            animate={{ translateY: 0 }}
            style={[styles.modalContent, { backgroundColor: theme.bg }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Start a Group Gift</Text>
              <TouchableOpacity onPress={() => setShowCreatePool(false)} style={[styles.closeBtn, { backgroundColor: theme.itemBg }]}>
                <X size={20} color={theme.subText} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>CELEBRANT NAME</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g., Sarah Johnson"
                  placeholderTextColor={theme.subText}
                  value={newPool.celebrantName}
                  onChangeText={(text) => setNewPool({ ...newPool, celebrantName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>GIFT NAME</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g., Luxury Watch"
                  placeholderTextColor={theme.subText}
                  value={newPool.giftName}
                  onChangeText={(text) => setNewPool({ ...newPool, giftName: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>TARGET AMOUNT (₵)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g., 500"
                  placeholderTextColor={theme.subText}
                  keyboardType="numeric"
                  value={newPool.targetAmount}
                  onChangeText={(text) => setNewPool({ ...newPool, targetAmount: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>DEADLINE</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]}
                  placeholder="e.g., Dec 25, 2024"
                  placeholderTextColor={theme.subText}
                  value={newPool.deadline}
                  onChangeText={(text) => setNewPool({ ...newPool, deadline: text })}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: theme.subText }]}>IMAGE URL (Optional)</Text>
                <TextInput
                  style={[styles.input, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]}
                  placeholder="https://..."
                  placeholderTextColor={theme.subText}
                  value={newPool.imageUrl}
                  onChangeText={(text) => setNewPool({ ...newPool, imageUrl: text })}
                />
              </View>

              <TouchableOpacity 
                style={[styles.createBtn, { backgroundColor: theme.primary }]}
                onPress={handleCreatePool}
              >
                <Text style={styles.createBtnText}>Create Group Gift</Text>
              </TouchableOpacity>
            </ScrollView>
          </MotiView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  customHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: {
    padding: 8,
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  notificationBtn: {
    padding: 8,
    borderRadius: 20,
    position: 'relative',
  },
  notificationDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  notificationCount: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '900',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  mainView: {
    gap: 24,
  },
  promoCard: {
    backgroundColor: '#4f46e5',
    borderRadius: 32,
    padding: 24,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 4,
  },
  promoContent: {
    zIndex: 10,
    gap: 8,
  },
  promoTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#fff',
  },
  promoDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    lineHeight: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  newPoolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  newPoolText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  promoIconBg: {
    position: 'absolute',
    bottom: -20,
    right: -10,
  },
  giftList: {
    gap: 12,
  },
  giftCard: {
    backgroundColor: '#fff',
    borderRadius: 28,
    padding: 16,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  giftLayout: {
    flexDirection: 'row',
    gap: 16,
  },
  giftThumb: {
    width: 96,
    height: 96,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
  },
  giftInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  giftName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#1e293b',
  },
  celebrantName: {
    fontSize: 10,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2,
    marginBottom: 12,
  },
  giftMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '800',
    color: '#334155',
  },
  deadlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94a3b8',
  },
  progressBarBg: {
    height: 6,
    backgroundColor: '#f1f5f9',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f46e5',
    borderRadius: 3,
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 40,
    padding: 32,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 20 },
    shadowRadius: 40,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  detailHeader: {
    alignItems: 'center',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 24,
  },
  detailImage: {
    width: 200,
    height: 200,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
  },
  detailIconBadge: {
    position: 'absolute',
    bottom: -12,
    right: -12,
    backgroundColor: '#4f46e5',
    width: 56,
    height: 56,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
  },
  detailTitles: {
    alignItems: 'center',
    gap: 4,
    marginBottom: 32,
  },
  detailGiftName: {
    fontSize: 24,
    fontWeight: '900',
    color: '#1e293b',
  },
  detailCelebrant: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4f46e5',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    marginBottom: 40,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#f8fafc',
    padding: 16,
    paddingVertical: 20,
    borderRadius: 24,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#94a3b8',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1e293b',
  },
  contributionSection: {
    width: '100%',
  },
  contributeHeader: {
    fontSize: 12,
    fontWeight: '900',
    color: '#1e293b',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 4,
  },
  contributeScroll: {
    gap: 12,
    paddingHorizontal: 4,
    paddingVertical: 10,
  },
  amtBtn: {
    width: 80,
    height: 64,
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  amtBtnActive: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
    shadowColor: '#4f46e5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 16,
    elevation: 8,
    transform: [{ scale: 1.05 }],
  },
  amtText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#64748b',
  },
  amtTextActive: {
    color: '#fff',
  },
  joinBtn: {
    height: 64,
    backgroundColor: '#4f46e5',
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  joinBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 24,
    borderWidth: 1,
    borderStyle: 'dashed',
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 40,
  },
  startPoolBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
  },
  startPoolBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: '600',
    borderWidth: 1,
  },
  createBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 32,
  },
  createBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
});
