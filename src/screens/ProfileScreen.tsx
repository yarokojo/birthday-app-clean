import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet, ScrollView, TextInput, Modal, Share, Alert, Platform, useWindowDimensions, Clipboard } from "react-native";
import { Settings, Grid, Heart, Package, Edit3, Camera, MapPin, Calendar, Activity, Check, X, Globe, Link as LinkIcon, Instagram, Twitter, Share2, Plus, Users, ArrowLeft, CreditCard, Smartphone, ChevronRight, Lock, Bell, Moon, Shield, Eye, Trash2, Search, User } from "lucide-react-native";
import { MotiView, AnimatePresence } from "moti";
import { BlurView } from "expo-blur";
import { useTheme } from "../context/ThemeContext";
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from "@react-native-async-storage/async-storage";

type SettingsView = "main" | "personal" | "security" | "changePassword" | "devices" | "logs" | "addPayment" | "linked" | "blocked";

export default function ProfileScreen({ 
  onNavigate, 
  userProfileImage, 
  onUpdateProfileImage,
  searchQuery = "",
  profile,
  setProfile,
  accountData,
  setAccountData,
  activities,
  setActivities,
  onLogout
}: { 
  onNavigate: (screen: string, id?: string) => void;
  userProfileImage: string;
  onUpdateProfileImage: (image: string) => void;
  searchQuery?: string;
  profile: any;
  setProfile: (p: any) => void;
  accountData: any;
  setAccountData: (a: any) => void;
  activities: any[];
  setActivities: (a: any) => void;
  onLogout: () => void;
}) {
  const { darkMode, toggleDarkMode, theme, setPrimaryColor, primaryColor } = useTheme();
  const { width } = useWindowDimensions();
  const postCols = width > 1024 ? 5 : (width > 768 ? 4 : 3);
  const postWidth = (100 / postCols) - 1;

  const [activeTab, setActiveTab] = useState("posts");
  const [activityFilter, setActivityFilter] = useState("All");
  const [internalSearch, setInternalSearch] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<SettingsView>("main");

  const [passwordForm, setPasswordForm] = useState({
    current: "",
    new: "",
    confirm: ""
  });

  const [paymentForm, setPaymentForm] = useState({
    cardNumber: "",
    expiry: "",
    cvv: "",
    name: ""
  });

  // Save profile changes to AsyncStorage
  const saveProfileToStorage = async (updatedProfile: any) => {
    try {
      await AsyncStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      console.log("Profile saved to storage");
    } catch (error) {
      console.error("Failed to save profile:", error);
    }
  };

  const saveAccountDataToStorage = async (updatedAccountData: any) => {
    try {
      await AsyncStorage.setItem("accountData", JSON.stringify(updatedAccountData));
      console.log("Account data saved to storage");
    } catch (error) {
      console.error("Failed to save account data:", error);
    }
  };

  const saveProfileImageToStorage = async (imageUri: string) => {
    try {
      await AsyncStorage.setItem("userProfileImage", imageUri);
      console.log("Profile image saved to storage");
    } catch (error) {
      console.error("Failed to save profile image:", error);
    }
  };

  const handleProfileUpdate = (updatedProfile: any) => {
    setProfile(updatedProfile);
    saveProfileToStorage(updatedProfile);
  };

  const handleAccountDataUpdate = (updatedData: any) => {
    setAccountData(updatedData);
    saveAccountDataToStorage(updatedData);
  };

  const handleProfileImageUpdate = (imageUri: string) => {
    onUpdateProfileImage(imageUri);
    saveProfileImageToStorage(imageUri);
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permission required", "Media library permission is needed to update your profile picture.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        handleProfileImageUpdate(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to update profile picture.");
    }
  };

  const tabs = [
    { id: "posts", label: "Posts", Icon: Grid },
    { id: "activity", label: "Activity", Icon: Activity },
    { id: "wishes", label: "Wishes", Icon: Heart },
    { id: "gifts", label: "Gifts", Icon: Package },
  ];

  const effectiveSearch = internalSearch || searchQuery;

  const filteredActivities = activities.filter(a => {
    const matchesFilter = activityFilter === "All" || a.type === activityFilter.toLowerCase();
    const matchesSearch = !effectiveSearch || 
      a.text.toLowerCase().includes(effectiveSearch.toLowerCase()) || 
      a.type.toLowerCase().includes(effectiveSearch.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleShare = async () => {
    const shareMessage = `Check out ${profile.name}'s profile on Celebration App!\nhttps://celebration.app/alex_johnson`;
    
    try {
      const result = await Share.share({
        message: shareMessage,
        url: 'https://celebration.app/alex_johnson',
      });

      if (result.action === Share.sharedAction) {
        // Success
      }
    } catch (error: any) {
      const errorMessage = error?.message || '';
      const isCanceled = errorMessage.includes('canceled') || errorMessage.includes('Canceled') || error?.name === 'AbortError';
      
      if (isCanceled) {
        return; 
      }

      try {
        Clipboard.setString(shareMessage);
        Alert.alert("Copied", "Profile link copied to clipboard!");
      } catch (clipboardError) {
        console.error('Share and Clipboard fallback both failed:', clipboardError);
      }
    }
  };

  const renderSettingsContent = () => {
    switch (settingsView) {
      case "personal":
        return (
          <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} style={[styles.settingsSubView, { backgroundColor: theme.bg }]}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subText }]}>EMAIL ADDRESS</Text>
              <TextInput 
                value={accountData.email} 
                style={[styles.settingInput, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]} 
                onChangeText={(t) => handleAccountDataUpdate({ ...accountData, email: t })} 
                placeholderTextColor={theme.subText}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subText }]}>PHONE NUMBER</Text>
              <TextInput 
                value={accountData.phone} 
                style={[styles.settingInput, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]} 
                onChangeText={(t) => handleAccountDataUpdate({ ...accountData, phone: t })} 
                keyboardType="phone-pad" 
                placeholderTextColor={theme.subText}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subText }]}>LOCATION</Text>
              <TextInput 
                value={profile.location} 
                style={[styles.settingInput, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]} 
                onChangeText={(t) => handleProfileUpdate({ ...profile, location: t })} 
                placeholderTextColor={theme.subText}
              />
            </View>
            <TouchableOpacity style={styles.saveBtn} onPress={() => setSettingsView("main")}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </MotiView>
        );
      case "security":
        return (
          <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} style={[styles.settingsSubView, { backgroundColor: theme.bg }]}>
            <View style={styles.securityHealthCard}>
              <View style={styles.healthInfo}>
                <Text style={styles.healthTitle}>Account Security</Text>
                <Text style={styles.healthStatus}>Status: <Text style={{ color: '#10b981' }}>Secure</Text></Text>
              </View>
              <View style={styles.scoreContainer}>
                <Text style={styles.scoreText}>{accountData.securityScore}%</Text>
              </View>
            </View>

            <Text style={[styles.sectionHeader, { color: theme.subText }]}>PROTECTION</Text>
            <View style={[styles.settingToggleItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
              <View>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Two-Factor Auth</Text>
                <Text style={[styles.toggleDesc, { color: theme.subText }]}>Secure your account with 2FA</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleAccountDataUpdate({ ...accountData, twoFactor: !accountData.twoFactor })}
                style={[styles.toggleSwitch, accountData.twoFactor && styles.toggleSwitchActive, { backgroundColor: accountData.twoFactor ? '#6366f1' : theme.border }]}
              >
                <View style={[styles.toggleDot, accountData.twoFactor && styles.toggleDotActive]} />
              </TouchableOpacity>
            </View>

            <View style={[styles.settingToggleItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
              <View>
                <Text style={[styles.toggleTitle, { color: theme.text }]}>Login Alerts</Text>
                <Text style={[styles.toggleDesc, { color: theme.subText }]}>Notify me of new login attempts</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => handleAccountDataUpdate({ ...accountData, loginAlerts: !accountData.loginAlerts })}
                style={[styles.toggleSwitch, accountData.loginAlerts && styles.toggleSwitchActive, { backgroundColor: accountData.loginAlerts ? '#6366f1' : theme.border }]}
              >
                <View style={[styles.toggleDot, accountData.loginAlerts && styles.toggleDotActive]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 12, color: theme.subText }]}>ACTIONS</Text>
            <TouchableOpacity style={[styles.standardOption, { backgroundColor: theme.card, borderBottomColor: theme.border }]} onPress={() => setSettingsView("changePassword")}>
              <View style={styles.optionLeft}>
                <Lock size={16} color={theme.subText} />
                <Text style={[styles.standardOptionText, { color: theme.text }]}>Change Password</Text>
              </View>
              <ChevronRight size={18} color={theme.border} />
            </TouchableOpacity>
          </MotiView>
        );
      case "changePassword":
        return (
          <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} style={[styles.settingsSubView, { backgroundColor: theme.bg }]}>
            <Text style={[styles.infoBoxText, { color: theme.subText }]}>Your new password must be at least 8 characters long and include a mix of letters and numbers.</Text>
            
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subText }]}>CURRENT PASSWORD</Text>
              <TextInput 
                value={passwordForm.current} 
                secureTextEntry
                style={[styles.settingInput, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]} 
                onChangeText={(t) => setPasswordForm(p => ({ ...p, current: t }))} 
                placeholder="••••••••"
                placeholderTextColor={theme.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subText }]}>NEW PASSWORD</Text>
              <TextInput 
                value={passwordForm.new} 
                secureTextEntry
                style={[styles.settingInput, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]} 
                onChangeText={(t) => setPasswordForm(p => ({ ...p, new: t }))} 
                placeholder="Minimum 8 characters"
                placeholderTextColor={theme.subText}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subText }]}>CONFIRM NEW PASSWORD</Text>
              <TextInput 
                value={passwordForm.confirm} 
                secureTextEntry
                style={[styles.settingInput, { backgroundColor: theme.itemBg, color: theme.text, borderColor: theme.border }]} 
                onChangeText={(t) => setPasswordForm(p => ({ ...p, confirm: t }))} 
                placeholder="Confirm your password"
                placeholderTextColor={theme.subText}
              />
            </View>

            <TouchableOpacity style={styles.saveBtn} onPress={() => {
              Alert.alert("Success", "Your password has been changed successfully.");
              setSettingsView("security");
            }}>
              <Text style={styles.saveBtnText}>Update Password</Text>
            </TouchableOpacity>
          </MotiView>
        );
      case "linked":
        return (
          <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} style={[styles.settingsSubView, { backgroundColor: theme.bg }]}>
            <Text style={[styles.infoBoxText, { color: theme.subText }]}>Connect social accounts to sync activity across platforms.</Text>
            {[
              { id: 'insta', name: "Instagram", icon: Instagram, color: "#ec4899", connected: true, handle: "@alex_johnson" },
              { id: 'twit', name: "Twitter", icon: Twitter, color: "#06b6d4", connected: false },
              { id: 'goog', name: "Google", icon: Globe, color: "#ef4444", connected: true, handle: "alex.j@gmail.com" },
            ].map((app, i) => (
              <View key={i} style={[styles.socialItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                <View style={styles.socialLeft}>
                  <View style={[styles.socialIconBg, { backgroundColor: app.color + '10' }]}>
                    <app.icon size={18} color={app.color} />
                  </View>
                  <View>
                    <Text style={[styles.socialName, { color: theme.text }]}>{app.name}</Text>
                    {app.handle && <Text style={[styles.socialHandle, { color: theme.subText }]}>{app.handle}</Text>}
                  </View>
                </View>
                <TouchableOpacity 
                  style={[styles.socialBtn, app.connected && styles.socialBtnConnected]}
                  onPress={() => {
                    if (app.connected) {
                      Alert.alert("Disconnect Account", `Disconnect ${app.name}?`, [
                        { text: "Cancel", style: "cancel" },
                        { text: "Disconnect", style: "destructive", onPress: () => Alert.alert("Success", `${app.name} disconnected.`) }
                      ]);
                    } else {
                      Alert.alert("Connect Account", `Sign in to ${app.name} to link your account.`);
                    }
                  }}
                >
                  <Text style={[styles.socialBtnText, app.connected && styles.socialBtnTextConnected]}>
                    {app.connected ? "Disconnect" : "Connect"}
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
          </MotiView>
        );
      case "blocked":
        return (
          <MotiView from={{ opacity: 0, translateX: 50 }} animate={{ opacity: 1, translateX: 0 }} style={[styles.settingsSubView, { backgroundColor: theme.bg }]}>
            <View style={styles.emptyContainer}>
              <Shield size={48} color={theme.border} strokeWidth={1} />
              <Text style={[styles.emptyText, { color: theme.subText }]}>No blocked accounts</Text>
            </View>
          </MotiView>
        );
      default:
        return (
          <MotiView from={{ opacity: 0 }} animate={{ opacity: 1 }} style={[styles.settingsMainView, { backgroundColor: theme.bg }]}>
            <Text style={[styles.sectionHeader, { color: theme.subText }]}>ACCOUNT</Text>
            <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]} onPress={() => setSettingsView("personal")}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBg, { backgroundColor: theme.itemBg }]}><Users size={16} color="#6366f1" /></View>
                <Text style={[styles.optionText, { color: theme.text }]}>Personal Information</Text>
              </View>
              <ChevronRight size={16} color={theme.border} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]} onPress={() => setSettingsView("security")}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBg, { backgroundColor: theme.itemBg }]}><Lock size={16} color="#6366f1" /></View>
                <Text style={[styles.optionText, { color: theme.text }]}>Security & Login</Text>
              </View>
              <ChevronRight size={16} color={theme.border} />
            </TouchableOpacity>
            <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]} onPress={() => setSettingsView("linked")}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBg, { backgroundColor: theme.itemBg }]}><LinkIcon size={16} color="#6366f1" /></View>
                <Text style={[styles.optionText, { color: theme.text }]}>Linked Accounts</Text>
              </View>
              <ChevronRight size={16} color={theme.border} />
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { marginTop: 24, color: theme.subText }]}>PRIVACY & SAFETY</Text>
            <View style={[styles.settingToggleItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBg, { backgroundColor: theme.itemBg }]}><Eye size={16} color={theme.primary} /></View>
                <Text style={[styles.optionText, { color: theme.text }]}>Private Account</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.8}
                onPress={() => {}}
                style={[styles.toggleSwitch, { backgroundColor: theme.border }]}
              >
                <View style={[styles.toggleDot]} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity style={[styles.optionItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]} onPress={() => setSettingsView("blocked")}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBg, { backgroundColor: theme.itemBg }]}><Shield size={16} color="#ef4444" /></View>
                <Text style={[styles.optionText, { color: theme.text }]}>Blocked Accounts</Text>
              </View>
              <ChevronRight size={16} color={theme.border} />
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { marginTop: 24, color: theme.subText }]}>PREFERENCES</Text>
            
            <View style={[styles.settingToggleItem, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
              <View style={styles.optionLeft}>
                <View style={[styles.optionIconBg, { backgroundColor: theme.itemBg }]}><Moon size={16} color={theme.primary} /></View>
                <Text style={[styles.optionText, { color: theme.text }]}>Dark Mode</Text>
              </View>
              <TouchableOpacity 
                activeOpacity={0.8} 
                onPress={() => toggleDarkMode()} 
                style={[styles.toggleSwitch, darkMode && styles.toggleSwitchActive, { backgroundColor: darkMode ? theme.primary : theme.border }]}
              >
                <View style={[styles.toggleDot, darkMode && styles.toggleDotActive]} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.sectionHeader, { marginTop: 24, color: theme.subText }]}>THEME COLOR</Text>
            <View style={[styles.colorPickerRow, { backgroundColor: theme.card, borderBottomColor: theme.border, paddingVertical: 16 }]}>
              {["#6366f1", "#ec4899", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#06b6d4"].map((color) => (
                <TouchableOpacity 
                  key={color}
                  onPress={() => setPrimaryColor(color)}
                  style={[
                    styles.colorOption, 
                    { backgroundColor: color },
                    primaryColor === color && { borderWidth: 3, borderColor: theme.text }
                  ]}
                />
              ))}
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={onLogout}>
              <Text style={styles.logoutBtnText}>Log Out</Text>
            </TouchableOpacity>

            <Text style={[styles.sectionHeader, { marginTop: 24, color: theme.subText, textAlign: 'center' }]}>LEGAL</Text>
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20, marginTop: 12, marginBottom: 30 }}>
              <TouchableOpacity onPress={() => { setIsSettingsOpen(false); onNavigate('privacy_policy'); }}>
                <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Privacy Policy</Text>
              </TouchableOpacity>
              <View style={{ width: 1, height: 14, backgroundColor: theme.border, alignSelf: 'center' }} />
              <TouchableOpacity onPress={() => { setIsSettingsOpen(false); onNavigate('terms'); }}>
                <Text style={{ color: theme.primary, fontSize: 13, fontWeight: '600' }}>Terms of Service</Text>
              </TouchableOpacity>
            </View>
          </MotiView>
        );
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      {/* Custom Profile Header with Back Button */}
      <View style={[styles.customHeader, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => onNavigate('home')} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
        <TouchableOpacity style={styles.settingsIconBtn} onPress={() => setIsSettingsOpen(true)}>
          <Settings size={22} color={theme.text} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner */}
        <View style={styles.banner}>
          <Image 
            source={{ uri: "https://images.unsplash.com/photo-1513151233558-d860c53bd81d?w=800&fit=crop" }} 
            style={styles.bannerImage} 
          />
        </View>

        {/* Profile Info Card */}
        <View style={[styles.profileCard, { backgroundColor: theme.card, shadowColor: darkMode ? '#000' : theme.primary }]}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: userProfileImage }} style={styles.avatar} />
              <TouchableOpacity style={styles.avatarEditBtn} onPress={pickImage}>
                <Camera size={14} color="#fff" />
              </TouchableOpacity>
            </View>

            {isEditing ? (
              <View style={styles.editForm}>
                <TextInput 
                  value={profile.name} 
                  onChangeText={(t) => setProfile({ ...profile, name: t })}
                  style={[styles.nameInput, { color: theme.text, backgroundColor: theme.itemBg }]}
                />
                <TextInput 
                  value={profile.bio} 
                  onChangeText={(t) => setProfile({ ...profile, bio: t })}
                  multiline
                  style={[styles.bioInput, { color: theme.text, backgroundColor: theme.itemBg }]}
                />
                <View style={styles.editActions}>
                  <TouchableOpacity style={styles.saveAction} onPress={() => {
                    handleProfileUpdate(profile);
                    setIsEditing(false);
                  }}>
                    <Text style={styles.saveActionText}>SAVE</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.cancelAction} onPress={() => setIsEditing(false)}>
                    <X size={16} color={theme.subText} />
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View style={styles.profileMeta}>
                <View style={styles.nameRow}>
                  <Text style={[styles.profileName, { color: theme.text }]}>{profile.name}</Text>
                  <View style={styles.verifiedBadge}>
                    <Text style={styles.verifiedText}>PRO</Text>
                  </View>
                </View>
                <Text style={[styles.profileUsername, { color: theme.subText }]}>{profile.username}</Text>
                <Text style={[styles.profileBio, { color: theme.text }]}>{profile.bio}</Text>
                
                <View style={styles.attributes}>
                  <View style={styles.attrItem}>
                    <MapPin size={12} color="#818cf8" />
                    <Text style={[styles.attrText, { color: theme.subText }]}>{profile.location}</Text>
                  </View>
                  <View style={styles.attrItem}>
                    <Globe size={12} color="#f472b6" />
                    <Text style={[styles.attrText, { color: theme.subText }]}>{profile.website}</Text>
                  </View>
                  {profile.birthday && (
                    <View style={styles.attrItem}>
                      <Calendar size={12} color="#10b981" />
                      <Text style={[styles.attrText, { color: theme.subText }]}>{profile.birthday}</Text>
                    </View>
                  )}
                </View>

                <View style={styles.profileActions}>
                  <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)}>
                    <Edit3 size={16} color="#fff" />
                    <Text style={styles.editBtnText}>Edit Profile</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.shareBtn, { backgroundColor: theme.itemBg }]} onPress={handleShare}>
                    <Share2 size={16} color={theme.text} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Stats */}
          <View style={[styles.statsRow, { borderTopColor: theme.border }]}>
            <TouchableOpacity style={styles.statItem} onPress={() => onNavigate('wallet')}>
              <Text style={[styles.statValue, { color: theme.text }]}>₵320</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>BALANCE</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>1.2K</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>FOLLOWING</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: theme.text }]}>8.4K</Text>
              <Text style={[styles.statLabel, { color: theme.subText }]}>FOLLOWERS</Text>
            </View>
          </View>
        </View>

        {/* Tabs */}
        <View style={[styles.tabsContainer, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScroll}>
            {tabs.map((tab) => (
              <TouchableOpacity 
                key={tab.id}
                onPress={() => setActiveTab(tab.id)}
                style={[
                  styles.tabItem, 
                  activeTab === tab.id && styles.tabItemActive,
                  { backgroundColor: activeTab === tab.id ? '#6366f1' : 'transparent' }
                ]}
              >
                <tab.Icon size={16} color={activeTab === tab.id ? "#fff" : theme.subText} />
                <Text style={[
                  styles.tabLabel, 
                  activeTab === tab.id && styles.tabLabelActive,
                  { color: activeTab === tab.id ? "#fff" : theme.subText }
                ]}>
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tab Content */}
        <View style={styles.tabContent}>
          {activeTab === "posts" && (
            <View style={styles.postsGrid}>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
                <TouchableOpacity key={i} style={[styles.gridItem, { width: `${postWidth}%`, backgroundColor: theme.card }]}>
                  <Image 
                    source={{ uri: `https://picsum.photos/seed/${i + 130}/300/300` }} 
                    style={styles.gridImage} 
                  />
                  <View style={styles.gridOverlay}>
                    <Heart size={12} color="#fff" fill="#fff" />
                    <Text style={styles.overlayText}>{Math.floor(Math.random() * 100)}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {activeTab === "activity" && (
            <View style={styles.activityList}>
              <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border, marginBottom: 16 }]}>
                <Search size={18} color={theme.subText} />
                <TextInput 
                  placeholder="Search activities..." 
                  style={[styles.searchInput, { color: theme.text }]}
                  placeholderTextColor={theme.subText}
                  value={internalSearch}
                  onChangeText={setInternalSearch}
                />
              </View>
              <View style={styles.filterRow}>
                {["All", "Social", "Gift", "Wallet"].map(f => (
                  <TouchableOpacity 
                    key={f} 
                    onPress={() => setActivityFilter(f)} 
                    style={[
                      styles.filterChip, 
                      activityFilter === f && styles.filterChipActive,
                      { backgroundColor: theme.card, borderColor: theme.border }
                    ]}
                  >
                    <Text style={[
                      styles.filterText, 
                      activityFilter === f && styles.filterTextActive,
                      { color: activityFilter === f ? "#fff" : theme.subText }
                    ]}>
                      {f}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              {filteredActivities.length === 0 ? (
                <View style={styles.emptyTab}>
                  <Text style={[styles.emptyTabText, { color: theme.subText }]}>No matching activities found</Text>
                </View>
              ) : (
                filteredActivities.map(act => {
                  const IconComponent = () => {
                    switch (act.iconName) {
                      case 'Package': return <Package size={18} color={act.color} />;
                      case 'Globe': return <Globe size={18} color={act.color} />;
                      case 'Grid': return <Grid size={18} color={act.color} />;
                      case 'Users': return <Users size={18} color={act.color} />;
                      case 'Heart': return <Heart size={18} color={act.color} />;
                      default: return <Activity size={18} color={act.color} />;
                    }
                  };
                  return (
                    <View key={act.id} style={[styles.activityCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                      <View style={[styles.activityIcon, { backgroundColor: act.bg }]}>
                        <IconComponent />
                      </View>
                      <View style={styles.activityInfo}>
                        <Text style={[styles.activityText, { color: theme.text }]}>{act.text}</Text>
                        <View style={styles.activityMeta}>
                          <Text style={[styles.activityTime, { color: theme.subText }]}>{act.time}</Text>
                          <View style={[styles.metaDot, { backgroundColor: theme.border }]} />
                          <Text style={[styles.activityType, { color: act.color }]}>{act.type.toUpperCase()}</Text>
                        </View>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          )}

          {activeTab === "wishes" && (
            <View style={styles.activityList}>
              <Text style={[styles.tabContentTitle, { color: theme.text }]}>Birthday Wishes Sent</Text>
              {activities.filter(a => a.text.toLowerCase().includes('wish')).length === 0 ? (
                <View style={styles.emptyTab}>
                  <Heart size={40} color={theme.border} />
                  <Text style={[styles.emptyTabText, { color: theme.subText }]}>No wishes sent yet</Text>
                </View>
              ) : (
                activities.filter(a => a.text.toLowerCase().includes('wish')).map(act => (
                  <View key={act.id} style={[styles.activityCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <View style={[styles.activityIcon, { backgroundColor: act.bg }]}>
                      <Heart size={18} color={act.color} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityText, { color: theme.text }]}>{act.text}</Text>
                      <Text style={[styles.activityTime, { color: theme.subText }]}>{act.time}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}

          {activeTab === "gifts" && (
            <View style={styles.activityList}>
              <Text style={[styles.tabContentTitle, { color: theme.text }]}>Sent & Received Gifts</Text>
              {activities.filter(a => a.type === 'gift').length === 0 ? (
                <View style={styles.emptyTab}>
                  <Package size={40} color={theme.border} />
                  <Text style={[styles.emptyTabText, { color: theme.subText }]}>No gifts recorded yet</Text>
                </View>
              ) : (
                activities.filter(a => a.type === 'gift').map(act => (
                  <View key={act.id} style={[styles.activityCard, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
                    <View style={[styles.activityIcon, { backgroundColor: act.bg }]}>
                      <Package size={18} color={act.color} />
                    </View>
                    <View style={styles.activityInfo}>
                      <Text style={[styles.activityText, { color: theme.text }]}>{act.text}</Text>
                      <Text style={[styles.activityTime, { color: theme.subText }]}>{act.time}</Text>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Settings Modal */}
      <Modal visible={isSettingsOpen} animationType="slide" transparent>
        <View style={[styles.modalOverlay, { backgroundColor: darkMode ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)' }]}>
          <View style={[styles.modalContent, { backgroundColor: theme.bg }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <View style={styles.modalTitleRow}>
                {settingsView !== "main" && (
                  <TouchableOpacity style={styles.backBtn} onPress={() => setSettingsView("main")}>
                    <ArrowLeft size={20} color={theme.text} />
                  </TouchableOpacity>
                )}
                <View>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>
                    {settingsView === "main" ? "Settings" : 
                     settingsView === "personal" ? "Account Info" : 
                     settingsView === "security" ? "Security" :
                     settingsView === "changePassword" ? "Change Password" :
                     settingsView === "linked" ? "Connected Apps" : "Blocked Users"}
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: theme.subText }]}>
                    {settingsView === "main" ? "Configure your app preferences" : 
                     settingsView === "changePassword" ? "Keep your account secure" :
                     "Update your details"}
                  </Text>
                </View>
              </View>
              <TouchableOpacity onPress={() => { setIsSettingsOpen(false); setSettingsView("main"); }} style={styles.closeBtn}>
                <X size={20} color="#ef4444" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalScroll}>
              {renderSettingsContent()}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  customHeader: {
    height: 64,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  settingsIconBtn: { padding: 8, borderRadius: 20 },
  scrollContent: { paddingBottom: 40 },
  banner: { height: 180, width: '100%', backgroundColor: '#4f46e5' },
  bannerImage: { width: '100%', height: '100%', opacity: 0.8 },
  profileCard: { backgroundColor: '#fff', marginTop: -40, marginHorizontal: 16, borderRadius: 32, padding: 24, shadowColor: '#4f46e5', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  profileHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 80, height: 80, borderRadius: 30, borderWidth: 3, borderColor: '#fff' },
  avatarEditBtn: { position: 'absolute', bottom: -4, right: -4, backgroundColor: '#4f46e5', padding: 6, borderRadius: 12, borderWidth: 2, borderColor: '#fff' },
  profileMeta: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  profileName: { fontSize: 20, fontWeight: '900', color: '#1e293b' },
  verifiedBadge: { backgroundColor: '#eef2ff', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  verifiedText: { fontSize: 8, fontWeight: '900', color: '#4f46e5' },
  profileUsername: { fontSize: 12, color: '#94a3b8', fontWeight: '700', marginTop: 2 },
  profileBio: { fontSize: 12, color: '#475569', lineHeight: 18, marginTop: 8 },
  attributes: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  attrItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  attrText: { fontSize: 10, fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: 0.5 },
  profileActions: { flexDirection: 'row', gap: 12, marginTop: 20 },
  editBtn: { flex: 1, height: 44, backgroundColor: '#4f46e5', borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  editBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase' },
  shareBtn: { width: 44, height: 44, backgroundColor: '#f1f5f9', borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 24, paddingTop: 24, borderTopWidth: 1, borderTopColor: '#f1f5f9' },
  statItem: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  statLabel: { fontSize: 8, fontWeight: '900', color: '#94a3b8', marginTop: 4, letterSpacing: 1 },
  tabsContainer: { marginTop: 24, paddingHorizontal: 16 },
  tabsScroll: { gap: 12 },
  tabItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9' },
  tabItemActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  tabLabel: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  tabLabelActive: { color: '#fff' },
  tabContent: { marginTop: 20, paddingHorizontal: 16 },
  postsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  gridItem: { aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#e2e8f0' },
  gridImage: { width: '100%', height: '100%' },
  gridOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 4, opacity: 0.8 },
  overlayText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  activityList: { gap: 12 },
  filterRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#f1f5f9' },
  filterChipActive: { backgroundColor: '#4f46e5', borderColor: '#4f46e5' },
  filterText: { fontSize: 9, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase' },
  filterTextActive: { color: '#fff' },
  activityCard: { backgroundColor: '#fff', padding: 12, borderRadius: 20, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  activityIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  activityInfo: { flex: 1 },
  activityText: { fontSize: 13, fontWeight: '700', color: '#1e293b' },
  activityMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
  activityTime: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  activityType: { fontSize: 9, fontWeight: '900', letterSpacing: 0.5 },
  tabContentTitle: { fontSize: 14, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16, marginLeft: 4 },
  metaDot: { width: 3, height: 3, borderRadius: 2, backgroundColor: '#e2e8f0' },
  emptyTab: { padding: 40, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderRadius: 24, borderStyle: 'dashed', borderWidth: 1, borderColor: '#e2e8f0' },
  emptyTabText: { color: '#94a3b8', fontWeight: '700', fontStyle: 'italic' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 40, borderTopRightRadius: 40, height: '90%' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 24, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  modalTitle: { fontSize: 18, fontWeight: '900', color: '#1e293b' },
  modalSubtitle: { fontSize: 10, fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginTop: 2 },
  closeBtn: { width: 40, height: 40, borderRadius: 12, backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' },
  modalScroll: { padding: 24 },
  sectionHeader: { fontSize: 10, fontWeight: '900', color: '#6366f1', letterSpacing: 2, marginBottom: 12, marginLeft: 4 },
  optionItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 20, marginBottom: 8 },
  optionLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  optionIconBg: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 } },
  optionText: { fontSize: 14, fontWeight: '700', color: '#334155' },
  settingToggleItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#f8fafc', borderRadius: 20, marginBottom: 8 },
  toggleSwitch: { width: 44, height: 24, padding: 2, borderRadius: 12, backgroundColor: '#e2e8f0' },
  toggleSwitchActive: { backgroundColor: '#4f46e5' },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleDotActive: { alignSelf: 'flex-end' },
  logoutBtn: { marginTop: 32, height: 52, backgroundColor: '#fef2f2', borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#fee2e2' },
  logoutBtnText: { color: '#ef4444', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  settingsSubView: { gap: 16 },
  inputGroup: { gap: 8 },
  inputLabel: { fontSize: 9, fontWeight: '900', color: '#94a3b8', marginLeft: 8, letterSpacing: 1 },
  settingInput: { height: 52, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, fontSize: 14, fontWeight: '700', color: '#1e293b', borderWidth: 1, borderColor: '#e2e8f0' },
  saveBtn: { height: 52, backgroundColor: '#4f46e5', borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  saveBtnText: { color: '#fff', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1 },
  colorPickerRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, marginBottom: 20 },
  colorOption: { width: 32, height: 32, borderRadius: 16 },
  toggleTitle: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  toggleDesc: { fontSize: 10, color: '#94a3b8', fontWeight: '600', marginTop: 2 },
  standardOption: { height: 52, backgroundColor: '#f8fafc', borderRadius: 16, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: '#f1f5f9' },
  standardOptionText: { fontSize: 14, fontWeight: '700', color: '#1e293b' },
  addMethodBtn: { height: 52, borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#c7d2fe', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#f5f7ff' },
  addMethodText: { color: '#4f46e5', fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.5 },
  infoBoxText: { fontSize: 12, color: '#64748b', lineHeight: 18, paddingHorizontal: 8, marginBottom: 8 },
  socialItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, backgroundColor: '#f8fafc', borderRadius: 20, borderWidth: 1, borderColor: '#f1f5f9' },
  socialLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  socialIconBg: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  socialName: { fontSize: 14, fontWeight: '800', color: '#1e293b' },
  socialHandle: { fontSize: 10, color: '#94a3b8', fontWeight: '600' },
  socialBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: '#4f46e5' },
  socialBtnConnected: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e2e8f0' },
  socialBtnText: { color: '#fff', fontSize: 9, fontWeight: '900', textTransform: 'uppercase' },
  socialBtnTextConnected: { color: '#94a3b8' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', padding: 60, gap: 12 },
  emptyText: { color: '#94a3b8', fontSize: 13, fontWeight: '600' },
  settingsMainView: { flex: 1 },
  editForm: { flex: 1, gap: 12 },
  nameInput: { fontSize: 18, fontWeight: '900', color: '#1e293b', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0' },
  bioInput: { fontSize: 12, color: '#475569', backgroundColor: '#f8fafc', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', minHeight: 60, textAlignVertical: 'top' },
  editActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  saveAction: { backgroundColor: '#4f46e5', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12 },
  saveActionText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  cancelAction: { width: 36, height: 36, borderRadius: 12, backgroundColor: '#f1f5f9', alignItems: 'center', justifyContent: 'center' },
  securityHealthCard: { backgroundColor: '#4f46e5', padding: 20, borderRadius: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  healthInfo: { flex: 1 },
  healthTitle: { fontSize: 16, fontWeight: '900', color: '#fff' },
  healthStatus: { fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: '700', marginTop: 4 },
  scoreContainer: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: '#10b981' },
  scoreText: { fontSize: 16, fontWeight: '900', color: '#fff' },
  badgeCount: { paddingHorizontal: 8, height: 20, borderRadius: 10, backgroundColor: '#6366f1', alignItems: 'center', justifyContent: 'center' },
  badgeText: { fontSize: 10, fontWeight: '900', color: '#fff' },
  searchBar: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, height: 44, borderRadius: 12, borderWidth: 1, gap: 8 },
  searchInput: { flex: 1, fontSize: 14, fontWeight: '600' },
});
