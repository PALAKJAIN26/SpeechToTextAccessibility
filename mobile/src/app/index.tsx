import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from 'expo-speech-recognition';
import {
  FontSizeLevel,
  ThemeMode,
  TtsRate,
  useAccessibility,
} from '@/context/accessibility-context';

export default function HomeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [continuousMode, setContinuousMode] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');


  const {
    fontSizeLevel,
    setFontSizeLevel,
    fontScale,
    themeMode,
    setThemeMode,
    activeTheme,
    ttsRate,
    setTtsRate,
    isSpeaking,
    speakText,
    stopSpeech,
  } = useAccessibility();

  useSpeechRecognitionEvent('result', (event) => {
    const result = event.results[0]?.transcript ?? '';

    if (event.isFinal) {
      setTranscript((current) => {
        const separator = current && !current.endsWith(' ') ? ' ' : '';
        return `${current}${separator}${result}`.trim();
      });
      setInterimTranscript('');
    } else {
      setInterimTranscript(result);
    }
  });

  useSpeechRecognitionEvent('start', () => {
    setIsListening(true);
  });

  useSpeechRecognitionEvent('end', () => {
    setIsListening(false);
    setInterimTranscript('');
  });

  useSpeechRecognitionEvent('error', (event) => {
    setIsListening(false);
    setInterimTranscript('');
    Alert.alert(
      'Speech Recognition Error',
      event.message ?? event.error ?? 'Speech recognition encountered an issue.',
    );
  });

  const startListening = async () => {
    try {
      const permission =
        await ExpoSpeechRecognitionModule.requestPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          'Microphone Permission Required',
          'Please allow microphone and speech recognition permissions in settings to dictate text.',
        );
        return;
      }

      setInterimTranscript('');
      ExpoSpeechRecognitionModule.start({
        lang: selectedLanguage,
        interimResults: true,
        continuous: continuousMode,
      });
    } catch (error) {
      console.error('Unable to start speech recognition:', error);
      Alert.alert(
        'Unable to Start',
        'Speech recognition could not be initialized. Please try again.',
      );
    }
  };

  const stopListening = () => {
    ExpoSpeechRecognitionModule.stop();
  };

  const clearTranscript = () => {
    stopSpeech();
    setTranscript('');
    setInterimTranscript('');
  };

  const shareTranscript = async () => {
    if (!transcript) return;
    await Share.share({ message: transcript });
  };

  const copyTranscriptToClipboard = async () => {
    if (!transcript) return;

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(transcript);
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 2000);
    } else {
      await Share.share({ message: transcript });
    }
  };

  const fullText = [transcript, interimTranscript].filter(Boolean).join(' ');
  const displayedText = fullText || 'Your spoken words will appear here in real-time.';

  const scaleFont = (size: number) => Math.round(size * fontScale);

  const fontLevels: { label: string; value: FontSizeLevel }[] = [
    { label: 'S', value: 'small' },
    { label: 'M', value: 'medium' },
    { label: 'L', value: 'large' },
    { label: 'XL', value: 'xlarge' },
  ];

  const themeModes: { label: string; value: ThemeMode }[] = [
    { label: 'Auto', value: 'system' },
    { label: 'Light', value: 'light' },
    { label: 'Dark', value: 'dark' },
    { label: 'HC Dark', value: 'highContrastDark' },
    { label: 'HC Light', value: 'highContrastLight' },
  ];

  const ttsRates: TtsRate[] = [0.75, 1.0, 1.25, 1.5];

  const languages: { label: string; code: string; flag: string }[] = [
    { label: 'Hindi', code: 'hi-IN', flag: '🇮🇳' },
    { label: 'English (IN)', code: 'en-IN', flag: '🇮🇳' },
    { label: 'English (US)', code: 'en-US', flag: '🇺🇸' },
    { label: 'Spanish', code: 'es-ES', flag: '🇪🇸' },
    { label: 'French', code: 'fr-FR', flag: '🇫🇷' },
    { label: 'German', code: 'de-DE', flag: '🇩🇪' },
    { label: 'Japanese', code: 'ja-JP', flag: '🇯🇵' },
  ];


  return (
    <ScrollView
      style={[styles.scrollContainer, { backgroundColor: activeTheme.background }]}
      contentContainerStyle={styles.container}
    >
      {/* Header with Title & Quick Settings Toggle */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text
            style={[
              styles.title,
              { color: activeTheme.text, fontSize: scaleFont(28) },
            ]}
          >
            Speech-to-Text
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: activeTheme.textSecondary, fontSize: scaleFont(16) },
            ]}
          >
            Accessibility Suite
          </Text>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={showSettings ? 'Hide accessibility settings' : 'Show accessibility settings'}
          style={[
            styles.settingsIconButton,
            {
              backgroundColor: showSettings
                ? activeTheme.primary
                : activeTheme.backgroundElement,
              borderColor: activeTheme.border,
            },
          ]}
          onPress={() => setShowSettings((prev) => !prev)}
        >
          <Text
            style={[
              styles.settingsIconText,
              {
                color: showSettings
                  ? activeTheme.primaryText
                  : activeTheme.text,
                fontSize: scaleFont(16),
              },
            ]}
          >
            ⚙️ Controls
          </Text>
        </Pressable>
      </View>

      {/* Accessibility Control Drawer */}
      {showSettings && (
        <View
          style={[
            styles.settingsPanel,
            {
              backgroundColor: activeTheme.card,
              borderColor: activeTheme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.sectionTitle,
              { color: activeTheme.text, fontSize: scaleFont(16) },
            ]}
          >
            Accessibility Settings
          </Text>

          {/* Font Size Selector */}
          <Text
            style={[
              styles.settingLabel,
              { color: activeTheme.textSecondary, fontSize: scaleFont(14) },
            ]}
          >
            Font Size:
          </Text>
          <View style={styles.chipGroup}>
            {fontLevels.map((item) => {
              const isSelected = fontSizeLevel === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Set font size to ${item.value}`}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: isSelected
                        ? activeTheme.primary
                        : activeTheme.backgroundElement,
                      borderColor: activeTheme.border,
                    },
                  ]}
                  onPress={() => setFontSizeLevel(item.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? activeTheme.primaryText
                          : activeTheme.text,
                        fontSize: scaleFont(14),
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Theme Selector */}
          <Text
            style={[
              styles.settingLabel,
              { color: activeTheme.textSecondary, fontSize: scaleFont(14) },
            ]}
          >
            Color Theme & High Contrast:
          </Text>
          <View style={styles.chipGroup}>
            {themeModes.map((item) => {
              const isSelected = themeMode === item.value;
              return (
                <Pressable
                  key={item.value}
                  accessibilityRole="button"
                  accessibilityLabel={`Set theme to ${item.label}`}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: isSelected
                        ? activeTheme.primary
                        : activeTheme.backgroundElement,
                      borderColor: activeTheme.border,
                    },
                  ]}
                  onPress={() => setThemeMode(item.value)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? activeTheme.primaryText
                          : activeTheme.text,
                        fontSize: scaleFont(13),
                      },
                    ]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Speech Rate & Mode Options */}
          <Text
            style={[
              styles.settingLabel,
              { color: activeTheme.textSecondary, fontSize: scaleFont(14) },
            ]}
          >
            Text-to-Speech Reading Speed:
          </Text>
          <View style={styles.chipGroup}>
            {ttsRates.map((rate) => {
              const isSelected = ttsRate === rate;
              return (
                <Pressable
                  key={rate}
                  accessibilityRole="button"
                  accessibilityLabel={`Set reading speed to ${rate}x`}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: isSelected
                        ? activeTheme.primary
                        : activeTheme.backgroundElement,
                      borderColor: activeTheme.border,
                    },
                  ]}
                  onPress={() => setTtsRate(rate)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? activeTheme.primaryText
                          : activeTheme.text,
                        fontSize: scaleFont(13),
                      },
                    ]}
                  >
                    {rate}x
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Spoken Language Selector */}
          <Text
            style={[
              styles.settingLabel,
              { color: activeTheme.textSecondary, fontSize: scaleFont(14) },
            ]}
          >
            Spoken Recognition Language:
          </Text>
          <View style={styles.chipGroup}>
            {languages.map((lang) => {
              const isSelected = selectedLanguage === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  accessibilityRole="button"
                  accessibilityLabel={`Set speech recognition language to ${lang.label}`}
                  style={[
                    styles.chipButton,
                    {
                      backgroundColor: isSelected
                        ? activeTheme.primary
                        : activeTheme.backgroundElement,
                      borderColor: activeTheme.border,
                    },
                  ]}
                  onPress={() => setSelectedLanguage(lang.code)}
                >
                  <Text
                    style={[
                      styles.chipText,
                      {
                        color: isSelected
                          ? activeTheme.primaryText
                          : activeTheme.text,
                        fontSize: scaleFont(13),
                      },
                    ]}
                  >
                    {lang.flag} {lang.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Continuous Dictation Mode */}

          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: continuousMode }}
            accessibilityLabel="Continuous dictation mode"
            style={styles.checkboxRow}
            onPress={() => setContinuousMode((prev) => !prev)}
          >
            <View
              style={[
                styles.checkbox,
                {
                  borderColor: activeTheme.primary,
                  backgroundColor: continuousMode
                    ? activeTheme.primary
                    : 'transparent',
                },
              ]}
            >
              {continuousMode && (
                <Text style={{ color: activeTheme.primaryText, fontWeight: 'bold' }}>
                  ✓
                </Text>
              )}
            </View>
            <Text
              style={[
                styles.checkboxLabel,
                { color: activeTheme.text, fontSize: scaleFont(14) },
              ]}
            >
              Continuous Dictation Mode
            </Text>
          </Pressable>
        </View>
      )}

      {/* Visual Microphone Indicator & Status */}
      <View style={styles.micSection}>
        <View
          style={[
            styles.micRing,
            isListening && styles.micRingListening,
            { borderColor: isListening ? '#ef4444' : activeTheme.border },
          ]}
        >
          <Text
            accessible
            accessibilityLabel={isListening ? 'Microphone active and listening' : 'Microphone inactive'}
            accessibilityLiveRegion="assertive"
            style={[styles.microphoneIcon, { fontSize: scaleFont(48) }]}
          >
            {isListening ? '🔴' : '🎤'}
          </Text>
        </View>

        <Text
          accessibilityLiveRegion="polite"
          style={[
            styles.statusText,
            {
              color: isListening ? '#ef4444' : activeTheme.textSecondary,
              fontSize: scaleFont(16),
            },
          ]}
        >
          {isListening
            ? 'Listening... Speak into your microphone.'
            : 'Tap button below to start dictating speech.'}
        </Text>
      </View>

      {/* Main Start / Stop Dictation Button */}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={isListening ? 'Stop listening' : 'Start listening'}
        accessibilityHint={
          isListening
            ? 'Stops speech recognition'
            : 'Starts speech recognition using your microphone'
        }
        accessibilityState={{ busy: isListening }}
        style={[
          styles.mainButton,
          {
            backgroundColor: isListening ? '#dc2626' : activeTheme.primary,
            borderColor: activeTheme.border,
          },
        ]}
        onPress={isListening ? stopListening : startListening}
      >
        <Text
          style={[
            styles.mainButtonText,
            {
              color: isListening ? '#ffffff' : activeTheme.primaryText,
              fontSize: scaleFont(20),
            },
          ]}
        >
          {isListening ? '⏹ Stop Dictating' : '🎙️ Start Dictating'}
        </Text>
      </Pressable>

      {/* Transcript Text Display Box */}
      <View
        accessible
        accessibilityLabel="Transcribed speech"
        style={[
          styles.textBox,
          {
            backgroundColor: activeTheme.card,
            borderColor: activeTheme.border,
          },
        ]}
      >
        <ScrollView contentContainerStyle={styles.textBoxContent}>
          <Text
            accessibilityLiveRegion="polite"
            style={[
              styles.resultText,
              {
                color: fullText ? activeTheme.text : activeTheme.textSecondary,
                fontSize: scaleFont(18),
                lineHeight: scaleFont(28),
              },
            ]}
          >
            {displayedText}
          </Text>
        </ScrollView>
      </View>

      {/* Text-to-Speech (TTS) & Action Controls */}
      <View style={styles.actionsContainer}>
        {/* Read Aloud Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={isSpeaking ? 'Stop reading transcript aloud' : 'Read transcript aloud'}
          accessibilityState={{ disabled: !fullText }}
          disabled={!fullText}
          onPress={isSpeaking ? stopSpeech : () => speakText(fullText, selectedLanguage)}
          style={[
            styles.actionButton,
            {
              backgroundColor: isSpeaking
                ? '#f59e0b'
                : activeTheme.backgroundElement,
              borderColor: activeTheme.border,
            },
            !fullText && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: isSpeaking ? '#000000' : activeTheme.text,
                fontSize: scaleFont(15),
              },
            ]}
          >
            {isSpeaking ? '⏸️ Stop Audio' : '🔊 Read Aloud'}
          </Text>
        </Pressable>

        {/* Copy Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Copy transcript to clipboard"
          accessibilityState={{ disabled: !transcript }}
          disabled={!transcript}
          onPress={copyTranscriptToClipboard}
          style={[
            styles.actionButton,
            {
              backgroundColor: copiedNotification
                ? '#10b981'
                : activeTheme.backgroundElement,
              borderColor: activeTheme.border,
            },
            !transcript && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: copiedNotification
                  ? '#ffffff'
                  : activeTheme.text,
                fontSize: scaleFont(15),
              },
            ]}
          >
            {copiedNotification ? '✓ Copied' : '📋 Copy'}
          </Text>
        </Pressable>

        {/* Share Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Share transcript"
          accessibilityState={{ disabled: !transcript }}
          disabled={!transcript}
          onPress={shareTranscript}
          style={[
            styles.actionButton,
            {
              backgroundColor: activeTheme.backgroundElement,
              borderColor: activeTheme.border,
            },
            !transcript && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: activeTheme.text,
                fontSize: scaleFont(15),
              },
            ]}
          >
            📤 Share
          </Text>
        </Pressable>

        {/* Clear Button */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Clear transcript text"
          accessibilityState={{ disabled: !transcript && !interimTranscript }}
          disabled={!transcript && !interimTranscript}
          onPress={clearTranscript}
          style={[
            styles.actionButton,
            {
              backgroundColor: activeTheme.backgroundElement,
              borderColor: activeTheme.border,
            },
            !transcript && !interimTranscript && styles.disabledButton,
          ]}
        >
          <Text
            style={[
              styles.actionButtonText,
              {
                color: activeTheme.text,
                fontSize: scaleFont(15),
              },
            ]}
          >
            🗑️ Clear
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
  },
  container: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 40,
  },
  header: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    marginTop: 10,
  },
  headerTitleGroup: {
    flex: 1,
  },
  title: {
    fontWeight: 'bold',
  },
  subtitle: {
    marginTop: 2,
  },
  settingsIconButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
  },
  settingsIconText: {
    fontWeight: '600',
  },
  settingsPanel: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  settingLabel: {
    fontWeight: '600',
    marginTop: 10,
    marginBottom: 6,
  },
  chipGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chipButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontWeight: '600',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 10,
    minHeight: 44,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontWeight: '500',
  },
  micSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  micRing: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  micRingListening: {
    borderWidth: 4,
  },
  microphoneIcon: {
    textAlign: 'center',
  },
  statusText: {
    textAlign: 'center',
    fontWeight: '500',
    maxWidth: 280,
  },
  mainButton: {
    width: '100%',
    maxWidth: 340,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    borderWidth: 2,
    marginVertical: 16,
    minHeight: 56,
  },
  mainButtonText: {
    fontWeight: 'bold',
  },
  textBox: {
    width: '100%',
    minHeight: 140,
    maxHeight: 240,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    marginVertical: 12,
  },
  textBoxContent: {
    flexGrow: 1,
  },
  resultText: {
    fontWeight: '400',
  },
  actionsContainer: {
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  actionButtonText: {
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.45,
  },
});
