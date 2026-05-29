import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { ArrowLeft, Globe, Users, Lock, Bell, Eye, Tag, Wifi, Check } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { PrivacySettings, DEFAULT_PRIVACY_SETTINGS } from "../types";

interface PrivacySettingsScreenProps {
  onBack: () => void;
  settings: PrivacySettings;
  onUpdateSettings: (settings: PrivacySettings) => void;
}

export default function PrivacySettingsScreen({ onBack, settings, onUpdateSettings }: PrivacySettingsScreenProps) {
  const { theme, darkMode } = useTheme();

  const updateSetting = <K extends keyof PrivacySettings>(key: K, value: PrivacySettings[K]) => {
    onUpdateSettings({ ...settings, [key]: value });
  };

  const renderOption = (
    label: string,
    description: string,
    key: keyof PrivacySettings,
    options: { value: string; label: string; icon: any }[]
  ) => (
    <View style={[styles.settingSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Text style={[styles.settingLabel, { color: theme.text }]}>{label}</Text>
      <Text style={[styles.settingDescription, { color: theme.subText }]}>{description}</Text>
      <View style={styles.optionsRow}>
        {options.map((opt) => {
          const isSelected = settings[key] === opt.value;
          const Icon = opt.icon;
          return (
            <TouchableOpacity
              key={opt.value}
              onPress={() => updateSetting(key, opt.value as any)}
              style={[
                styles.optionChip,
                { backgroundColor: theme.itemBg, borderColor: theme.border },
                isSelected && { backgroundColor: theme.primary, borderColor: theme.primary }
              ]}
            >
              <Icon size={14} color={isSelected ? "#fff" : theme.subText} />
              <Text style={[styles.optionText, { color: isSelected ? "#fff" : theme.subText }]}>{opt.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <View style={[styles.header, { backgroundColor: theme.headerBg, borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ArrowLeft size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Privacy Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {renderOption("Birthday Visibility", "Who can see your birthday and receive notifications", "birthdayVisibility", [
          { value: "friends", label: "Friends", icon: Users },
          { value: "public", label: "Everyone", icon: Globe },
          { value: "only_me", label: "Only Me", icon: Lock },
        ])}

        {renderOption("Post Visibility", "Who can see your celebration posts", "postVisibility", [
          { value: "friends", label: "Friends", icon: Users },
          { value: "public", label: "Everyone", icon: Globe },
          { value: "only_me", label: "Only Me", icon: Lock },
        ])}

        {renderOption("Story Visibility", "Who can view your celebration stories", "storyVisibility", [
          { value: "friends", label: "Friends", icon: Users },
          { value: "close_friends", label: "Close Friends", icon: Users },
          { value: "only_me", label: "Only Me", icon: Lock },
        ])}

        {renderOption("Who Can Wish You", "Control who can send birthday wishes", "allowWishesFrom", [
          { value: "friends", label: "Friends", icon: Users },
          { value: "everyone", label: "Everyone", icon: Globe },
          { value: "no_one", label: "No One", icon: Lock },
        ])}

        {renderOption("Tagging", "Who can tag you in posts", "allowTagging", [
          { value: "friends", label: "Friends", icon: Users },
          { value: "everyone", label: "Everyone", icon: Globe },
          { value: "no_one", label: "No One", icon: Lock },
        ])}

        <View style={[styles.toggleSection, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <Bell size={18} color={theme.primary} />
              <View>
                <Text style={[styles.toggleLabel, { color: theme.text }]}>Birthday Reminders</Text>
                <Text style={[styles.toggleDesc, { color: theme.subText }]}>Send reminders to friends</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => updateSetting("showBirthdayReminders", !settings.showBirthdayReminders)}
              style={[styles.toggleSwitch, settings.showBirthdayReminders && styles.toggleSwitchActive, { backgroundColor: settings.showBirthdayReminders ? theme.primary : theme.border }]}
            >
              <View style={[styles.toggleDot, settings.showBirthdayReminders && styles.toggleDotActive]} />
            </TouchableOpacity>
          </View>

          <View style={[styles.toggleRow, { borderTopColor: theme.border }]}>
            <View style={styles.toggleLeft}>
              <Wifi size={18} color={theme.primary} />
              <View>
                <Text style={[styles.toggleLabel, { color: theme.text }]}>Show Online Status</Text>
                <Text style={[styles.toggleDesc, { color: theme.subText }]}>Let friends see when you're active</Text>
              </View>
            </View>
            <TouchableOpacity 
              onPress={() => updateSetting("showOnlineStatus", !settings.showOnlineStatus)}
              style={[styles.toggleSwitch, settings.showOnlineStatus && styles.toggleSwitchActive, { backgroundColor: settings.showOnlineStatus ? theme.primary : theme.border }]}
            >
              <View style={[styles.toggleDot, settings.showOnlineStatus && styles.toggleDotActive]} />
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { height: 64, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, borderBottomWidth: 1 },
  backBtn: { padding: 8, borderRadius: 20 },
  headerTitle: { fontSize: 18, fontWeight: '900' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  settingSection: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 12 },
  settingLabel: { fontSize: 16, fontWeight: '900' },
  settingDescription: { fontSize: 12, lineHeight: 18 },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionChip: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  optionText: { fontSize: 12, fontWeight: '700' },
  toggleSection: { padding: 16, borderRadius: 20, borderWidth: 1, gap: 16 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 16, borderTopWidth: 1 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  toggleLabel: { fontSize: 14, fontWeight: '700' },
  toggleDesc: { fontSize: 10, marginTop: 2 },
  toggleSwitch: { width: 44, height: 24, padding: 2, borderRadius: 12 },
  toggleSwitchActive: { backgroundColor: '#4f46e5' },
  toggleDot: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleDotActive: { alignSelf: 'flex-end' },
});
