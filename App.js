import { useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  StatusBar,
  ToastAndroid,
  Linking,
} from 'react-native';

const ALIASES = {
  u: 'com.ubercab.driver',
  l: 'com.lyft.android.driver',
  m: 'com.google.android.apps.maps',
  g: 'com.google.android.apps.googleassistant',
};

const FRICTION_PREFIX = 'make your life hell and open ';
const FRICTION_SUFFIX = ' and waste your time you will never grow up';

function launchApp(packageName) {
  const url = `intent://#Intent;package=${packageName};scheme=package;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`;
  Linking.openURL(url).catch(() => {
    ToastAndroid.show(`App not installed: ${packageName}`, ToastAndroid.SHORT);
  });
}

export default function App() {
  const [input, setInput] = useState('');
  const [log, setLog] = useState(['> CLI Launcher ready.', '> Type a command.']);
  const inputRef = useRef(null);

  function addLog(msg) {
    setLog(prev => [...prev.slice(-6), msg]);
  }

  function handleSubmit() {
    const cmd = input.trim();
    if (!cmd) return;

    addLog(`> ${cmd}`);
    setInput('');

    // Fast-track aliases
    if (ALIASES[cmd]) {
      addLog(`launching ${cmd}...`);
      launchApp(ALIASES[cmd]);
      return;
    }

    // Friction protocol
    if (cmd.startsWith(FRICTION_PREFIX)) {
      const middle = cmd.slice(FRICTION_PREFIX.length);
      if (middle.endsWith(FRICTION_SUFFIX)) {
        const appName = middle.slice(0, middle.length - FRICTION_SUFFIX.length).trim();
        addLog(`opening ${appName}...`);
        // Try to launch by partial name match via intent
        const url = `intent://#Intent;action=android.intent.action.MAIN;category=android.intent.category.LAUNCHER;end`;
        Linking.openURL(url).catch(() => {
          ToastAndroid.show(`Could not open ${appName}`, ToastAndroid.SHORT);
        });
        return;
      }
    }

    addLog('ERR: unknown command');
    addLog('hint: u/l/m/g or friction protocol');
  }

  return (
    <View style={styles.container} onTouchEnd={() => inputRef.current?.focus()}>
      <StatusBar hidden />
      <View style={styles.logContainer}>
        {log.map((line, i) => (
          <Text key={i} style={styles.logText}>{line}</Text>
        ))}
      </View>
      <View style={styles.inputRow}>
        <Text style={styles.prompt}>$ </Text>
        <TextInput
          ref={inputRef}
          style={styles.input}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSubmit}
          autoFocus
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          cursorColor="#00ff00"
          selectionColor="#00ff0055"
          keyboardAppearance="dark"
          placeholderTextColor="#333"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    padding: 12,
  },
  logContainer: {
    justifyContent: 'center',
    marginBottom: 16,
  },
  logText: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 13,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#1a1a1a',
    paddingTop: 8,
  },
  prompt: {
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 16,
  },
  input: {
    flex: 1,
    color: '#00ff00',
    fontFamily: 'monospace',
    fontSize: 16,
    padding: 0,
  },
});
