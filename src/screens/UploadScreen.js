import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { pick, types } from '@react-native-documents/picker';
import { uploadFile, askAboutFile } from '../api/api';
import AppAlert from '../components/AppAlert';

export default function UploadScreen() {
  const [pickedFile, setPickedFile] = useState(null);
  const [uploadedFileId, setUploadedFileId] = useState(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, title: '', message: '', type: 'info' });

  const handlePickFile = async () => {
    try {
      const [result] = await pick({ type: [types.pdf, types.images] });
      setPickedFile({ uri: result.uri, name: result.name, type: result.type });
      setUploadedFileId(null);
      setAnswer('');
    } catch (err) {
      // user cancelled picker - ignore
    }
  };

  const handleUpload = async () => {
    if (!pickedFile) {
      setPopup({
        visible: true, title: 'No File Selected',
        message: 'Please select a PDF or image before uploading.', type: 'info',
      });
      return;
    }
    setLoading(true);
    try {
      const res = await uploadFile(pickedFile);
      setUploadedFileId(res.data.id);
      setPopup({
        visible: true, title: 'Upload Complete',
        message: `${res.data.filename} was uploaded successfully!`, type: 'success',
      });
    } catch (err) {
      setPopup({
        visible: true, title: 'Upload Failed',
        message: err.response?.data?.detail || 'Something went wrong while uploading the file.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAskAboutFile = async () => {
    if (!uploadedFileId || !question.trim()) return;
    setLoading(true);
    try {
      const res = await askAboutFile(uploadedFileId, question);
      setAnswer(res.data.answer);
    } catch (err) {
      setAnswer('Error: ' + (err.response?.data?.detail || 'Unable to get a response from the AI'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
      <Text style={styles.title}>Upload Notes</Text>
      <Text style={styles.subtitle}>Upload a PDF or image and ask questions about it</Text>

      <TouchableOpacity style={styles.pickBtn} onPress={handlePickFile}>
        <Text style={styles.pickBtnText}>
          {pickedFile ? pickedFile.name : 'Select a File (PDF/Image)'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.uploadBtn} onPress={handleUpload} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Uploading...' : 'Upload'}</Text>
      </TouchableOpacity>

      {uploadedFileId && (
        <View style={styles.questionSection}>
          <Text style={styles.subtitle}>Your file has been uploaded. Ask a question:</Text>
          <TextInput
            style={styles.input}
            placeholder="What would you like to know about this file?"
            placeholderTextColor="#9CA3AF"
            value={question}
            onChangeText={setQuestion}
            multiline
          />
          <TouchableOpacity style={styles.uploadBtn} onPress={handleAskAboutFile} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? 'Thinking...' : 'Ask AI'}</Text>
          </TouchableOpacity>

          {answer ? (
            <View style={styles.answerBox}>
              <Text style={styles.answerText}>{answer}</Text>
            </View>
          ) : null}
        </View>
      )}
        </ScrollView>
      </KeyboardAvoidingView>
      <AppAlert
        {...popup}
        onClose={() => setPopup((current) => ({ ...current, visible: false }))}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  flex: { flex: 1 },
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#4A47A3', marginBottom: 4 },
  subtitle: { color: '#666', marginBottom: 16 },
  pickBtn: {
    borderWidth: 1, borderColor: '#4A47A3', borderStyle: 'dashed',
    borderRadius: 10, padding: 20, alignItems: 'center', marginBottom: 12,
  },
  pickBtnText: { color: '#4A47A3', fontWeight: '500' },
  uploadBtn: { backgroundColor: '#4A47A3', padding: 14, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, marginVertical: 12, fontSize: 16, minHeight: 60,
    color: '#111827', backgroundColor: '#fff', textAlignVertical: 'top',
  },
  answerBox: { marginTop: 16, backgroundColor: '#f0f0f0', padding: 14, borderRadius: 8 },
  answerText: { color: '#222', fontSize: 15, lineHeight: 22 },
  questionSection: { marginTop: 24 },
});
