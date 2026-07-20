import React, { useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors, fonts, radius, spacing } from '../lib/theme';

interface RichTextEditorProps {
  initialContent: string;
  onChange: (content: string) => void;
}

function asHtml(content: string) {
  if (/<\/?[a-z][\s\S]*>/i.test(content)) return content;
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}

function editorDocument(content: string) {
  return `<!doctype html>
  <html><head><meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    * { box-sizing: border-box; }
    html, body { margin: 0; min-height: 100%; background: #00000E; color: #dce6d4; }
    body { padding: 20px 24px; font-family: sans-serif; font-size: 17px; line-height: 1.65; outline: none; }
    h1 { font-size: 28px; line-height: 1.2; margin: 0 0 12px; }
    h2 { font-size: 22px; line-height: 1.3; margin: 0 0 10px; }
  </style></head>
  <body contenteditable="true">${asHtml(content)}</body>
  <script>
    const sendContent = () => window.ReactNativeWebView.postMessage(document.body.innerHTML);
    document.addEventListener('input', sendContent);
    document.addEventListener('blur', sendContent, true);
  </script></html>`;
}

function ToolbarButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable style={styles.toolbarButton} onPress={onPress}>
      <Text style={styles.toolbarLabel}>{label}</Text>
    </Pressable>
  );
}

export function RichTextEditor({ initialContent, onChange }: RichTextEditorProps) {
  const editorRef = useRef<WebView>(null);
  const source = useRef({ html: editorDocument(initialContent) }).current;

  const runCommand = (command: string, value?: string) => {
    const commandScript = `document.execCommand(${JSON.stringify(command)}, false, ${JSON.stringify(value ?? null)}); document.body.focus(); true;`;
    editorRef.current?.injectJavaScript(commandScript);
  };

  return (
    <View style={styles.container}>
      <View style={styles.toolbar}>
        <ToolbarButton label="H1" onPress={() => runCommand('formatBlock', 'h1')} />
        <ToolbarButton label="H2" onPress={() => runCommand('formatBlock', 'h2')} />
        <ToolbarButton label="B" onPress={() => runCommand('bold')} />
        <ToolbarButton label="U" onPress={() => runCommand('underline')} />
      </View>
      <WebView
        ref={editorRef}
        originWhitelist={['*']}
        source={source}
        onMessage={(event) => onChange(event.nativeEvent.data)}
        style={styles.editor}
        containerStyle={styles.editorContainer}
        keyboardDisplayRequiresUserAction={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  toolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  toolbarButton: {
    minWidth: 38,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
  },
  toolbarLabel: {
    color: colors.text,
    fontFamily: fonts.bold,
    fontSize: 13,
    fontWeight: '700',
  },
  editor: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  editorContainer: {
    flex: 1,
  },
});
