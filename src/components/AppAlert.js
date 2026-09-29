import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const variants = {
  success: { icon: '✓', color: '#15803D', background: '#DCFCE7' },
  error: { icon: '!', color: '#DC2626', background: '#FEE2E2' },
  info: { icon: 'i', color: '#4A47A3', background: '#EDE9FE' },
};

export default function AppAlert({ visible, title, message, type = 'info', onClose }) {
  const variant = variants[type] || variants.info;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <View style={[styles.iconCircle, { backgroundColor: variant.background }]}>
            <Text style={[styles.icon, { color: variant.color }]}>{variant.icon}</Text>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: variant.color }]}
            onPress={onClose}
            accessibilityRole="button"
          >
            <Text style={styles.buttonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    padding: 24, backgroundColor: 'rgba(17, 24, 39, 0.55)',
  },
  card: {
    width: '100%', maxWidth: 360, alignItems: 'center', backgroundColor: '#fff',
    borderRadius: 20, paddingHorizontal: 24, paddingTop: 26, paddingBottom: 20,
    elevation: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2, shadowRadius: 16,
  },
  iconCircle: {
    width: 58, height: 58, borderRadius: 29, justifyContent: 'center',
    alignItems: 'center', marginBottom: 16,
  },
  icon: { fontSize: 30, lineHeight: 34, fontWeight: '800' },
  title: { color: '#111827', fontSize: 21, fontWeight: '700', textAlign: 'center' },
  message: {
    color: '#6B7280', fontSize: 15, lineHeight: 22, textAlign: 'center',
    marginTop: 9, marginBottom: 22,
  },
  button: { width: '100%', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
