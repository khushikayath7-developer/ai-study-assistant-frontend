import React, { useCallback, useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types } from '@react-native-documents/picker';
import {
  askQuestion,
  askAboutFile,
  uploadFile,
  getChatHistory,
} from '../api/api';
import { AuthContext } from '../context/AuthContext';

export default function ChatScreen() {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState([]);
  const [history, setHistory] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null); // {id, filename}
  const { logout } = useContext(AuthContext);

  const loadHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const res = await getChatHistory();
      setHistory(res.data);
    } catch {
      setHistory([]);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const startNewChat = () => {
    setMessages([]);
    setQuestion('');
    setAttachedFile(null);
    setDrawerVisible(false);
  };

  const openHistoryItem = item => {
    setMessages([
      { id: `${item.created_at}-question`, type: 'user', text: item.question },
      { id: `${item.created_at}-answer`, type: 'ai', text: item.answer },
    ]);
    setAttachedFile(null);
    setDrawerVisible(false);
  };

  // ---- Attach a file (paperclip) directly inside the chat ----
  const handleAttachFile = async () => {
    try {
      const [result] = await pick({ type: [types.pdf, types.images] });
      setUploading(true);

      const res = await uploadFile({
        uri: result.uri,
        name: result.name,
        type: result.type,
      });

      setAttachedFile({ id: res.data.id, filename: res.data.filename });

      // Show a nice "file attached" bubble inside the chat itself
      setMessages(prev => [
        ...prev,
        { id: `${Date.now()}-file`, type: 'file', text: res.data.filename },
      ]);
    } catch (err) {
      // user cancelling the picker is not a real error
      if (err?.code !== 'DOCUMENT_PICKER_CANCELED') {
        Alert.alert(
          'Upload Failed',
          err.response?.data?.detail || 'Unable to attach the file',
        );
      }
    } finally {
      setUploading(false);
    }
  };

  const removeAttachedFile = () => setAttachedFile(null);

  const handleAsk = async () => {
    const cleanQuestion = question.trim();
    if (!cleanQuestion || loading || uploading) return;

    const userMsg = {
      id: Date.now().toString(),
      type: 'user',
      text: cleanQuestion,
    };
    setMessages(prev => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      // If a file is attached, ask the AI using that file's context
      const res = attachedFile
        ? await askAboutFile(attachedFile.id, userMsg.text)
        : await askQuestion(userMsg.text);

      const aiMsg = {
        id: `${Date.now()}-ai`,
        type: 'ai',
        text: res.data.answer,
      };
      setMessages(prev => [...prev, aiMsg]);
      setHistory(prev => [res.data, ...prev]);
    } catch (err) {
      const errMsg = {
        id: `${Date.now()}-err`,
        type: 'ai',
        text:
          'Error: ' +
          (err.response?.data?.detail ||
            'Unable to get a response from the AI'),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
      <StatusBar backgroundColor="#4A47A3" barStyle="light-content" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.header}>
          <View style={styles.headerTitleRow}>
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => {
                setDrawerVisible(true);
                loadHistory();
              }}
              accessibilityRole="button"
              accessibilityLabel="Open chat history"
            >
              <Text style={styles.menuIcon}>☰</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Study Assistant</Text>
          </View>
          <View style={styles.headerButtons}>
            <TouchableOpacity onPress={logout}>
              <Text style={styles.headerLink}>Logout</Text>
            </TouchableOpacity>
          </View>
        </View>

        <FlatList
          style={styles.messageList}
          data={messages}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageContent}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>📚</Text>
              <Text style={styles.emptyTitle}>Ask anything!</Text>
              <Text style={styles.emptySubtitle}>
                Type a question, or attach notes with 📎 and ask about them
              </Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'file') {
              return (
                <View style={styles.fileBubbleRow}>
                  <View style={styles.fileBubble}>
                    <Text style={styles.fileIcon}>📎</Text>
                    <Text style={styles.fileBubbleText} numberOfLines={1}>
                      {item.text}
                    </Text>
                  </View>
                </View>
              );
            }
            return (
              <View
                style={[
                  styles.bubble,
                  item.type === 'user' ? styles.userBubble : styles.aiBubble,
                ]}
              >
                <Text
                  style={item.type === 'user' ? styles.userText : styles.aiText}
                >
                  {item.text}
                </Text>
              </View>
            );
          }}
        />

        {loading && <ActivityIndicator style={styles.loader} color="#4A47A3" />}

        {attachedFile && (
          <View style={styles.attachedChipRow}>
            <View style={styles.attachedChip}>
              <Text style={styles.attachedChipIcon}>📎</Text>
              <Text style={styles.attachedChipText} numberOfLines={1}>
                {attachedFile.filename}
              </Text>
              <TouchableOpacity
                onPress={removeAttachedFile}
                style={styles.attachedChipRemove}
              >
                <Text style={styles.attachedChipRemoveText}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <View style={styles.inputRow}>
          <TouchableOpacity
            style={styles.attachBtn}
            onPress={handleAttachFile}
            disabled={uploading}
            accessibilityRole="button"
            accessibilityLabel="Attach a file"
          >
            {uploading ? (
              <ActivityIndicator size="small" color="#4A47A3" />
            ) : (
              <Text style={styles.attachIcon}>📎</Text>
            )}
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder={
              attachedFile
                ? 'Ask a question about this file...'
                : 'Type your question...'
            }
            placeholderTextColor="#9CA3AF"
            value={question}
            onChangeText={setQuestion}
            multiline
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (loading || uploading) && styles.disabledButton,
            ]}
            onPress={handleAsk}
            disabled={loading || uploading}
          >
            <Text style={styles.sendText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={drawerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDrawerVisible(false)}
      >
        <View style={styles.drawerOverlay}>
          <SafeAreaView style={styles.drawer} edges={['top', 'bottom']}>
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>Chat History</Text>
              <TouchableOpacity onPress={() => setDrawerVisible(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.newChatButton}
              onPress={startNewChat}
            >
              <Text style={styles.newChatText}>＋ New Chat</Text>
            </TouchableOpacity>

            {historyLoading ? (
              <ActivityIndicator style={styles.historyLoader} color="#4A47A3" />
            ) : (
              <FlatList
                data={history}
                keyExtractor={(item, index) => `${item.created_at}-${index}`}
                contentContainerStyle={styles.historyList}
                ListEmptyComponent={
                  <Text style={styles.emptyHistory}>
                    No previous chats yet.
                  </Text>
                }
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.historyItem}
                    onPress={() => openHistoryItem(item)}
                  >
                    <Text style={styles.historyQuestion} numberOfLines={2}>
                      {item.question}
                    </Text>
                    <Text style={styles.historyDate}>
                      {new Date(item.created_at).toLocaleString()}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            )}
          </SafeAreaView>
          <Pressable
            style={styles.drawerBackdrop}
            onPress={() => setDrawerVisible(false)}
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#4A47A3' },
  flex: { flex: 1, backgroundColor: '#F8F9FA' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#4A47A3',
  },
  headerTitle: {
    flexShrink: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerTitleRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  menuButton: { paddingVertical: 6, paddingRight: 12 },
  menuIcon: { color: '#fff', fontSize: 25, lineHeight: 26 },
  headerButtons: { flexDirection: 'row', alignItems: 'center' },
  headerLink: { color: '#fff', marginLeft: 18, fontWeight: '600' },
  messageList: { flex: 1 },
  messageContent: { padding: 16, flexGrow: 1 },
  emptyState: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyEmoji: { fontSize: 40, marginBottom: 10 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  bubble: { padding: 12, borderRadius: 12, marginBottom: 10, maxWidth: '85%' },
  userBubble: { backgroundColor: '#4A47A3', alignSelf: 'flex-end' },
  aiBubble: { backgroundColor: '#EDEFF2', alignSelf: 'flex-start' },
  userText: { color: '#fff' },
  aiText: { color: '#222' },
  fileBubbleRow: { alignItems: 'center', marginBottom: 10 },
  fileBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#C7D2FE',
    maxWidth: '90%',
  },
  fileIcon: { fontSize: 15, marginRight: 6 },
  fileBubbleText: { color: '#4A47A3', fontWeight: '600', fontSize: 13 },
  loader: { marginBottom: 8 },
  attachedChipRow: {
    paddingHorizontal: 12,
    paddingTop: 8,
    backgroundColor: '#fff',
  },
  attachedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    borderRadius: 18,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#C7D2FE',
    maxWidth: '95%',
  },
  attachedChipIcon: { fontSize: 13, marginRight: 6 },
  attachedChipText: {
    color: '#4A47A3',
    fontWeight: '600',
    fontSize: 12,
    flexShrink: 1,
  },
  attachedChipRemove: { marginLeft: 8, paddingHorizontal: 4 },
  attachedChipRemoveText: { color: '#6B7280', fontSize: 13, fontWeight: '700' },
  inputRow: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
  },
  attachBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 6,
    backgroundColor: '#F3F4F6',
  },
  attachIcon: { fontSize: 20 },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 8,
    minHeight: 44,
    maxHeight: 110,
    color: '#111827',
    backgroundColor: '#fff',
  },
  sendBtn: {
    minHeight: 44,
    justifyContent: 'center',
    backgroundColor: '#4A47A3',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 22,
  },
  disabledButton: { opacity: 0.6 },
  sendText: { color: '#fff', fontWeight: '600' },
  drawerOverlay: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  drawer: { width: '84%', maxWidth: 360, backgroundColor: '#fff' },
  drawerBackdrop: { flex: 1 },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  drawerTitle: { color: '#111827', fontSize: 20, fontWeight: '700' },
  closeButton: { color: '#6B7280', fontSize: 22, padding: 4 },
  newChatButton: {
    margin: 16,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    backgroundColor: '#4A47A3',
  },
  newChatText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  historyLoader: { marginTop: 30 },
  historyList: { paddingHorizontal: 12, paddingBottom: 20 },
  historyItem: {
    paddingHorizontal: 12,
    paddingVertical: 13,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#F3F4F6',
  },
  historyQuestion: { color: '#1F2937', fontSize: 15, fontWeight: '600' },
  historyDate: { color: '#6B7280', fontSize: 11, marginTop: 5 },
  emptyHistory: { color: '#6B7280', textAlign: 'center', marginTop: 30 },
});
