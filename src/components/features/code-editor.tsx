"use client";

import * as React from "react";
import Editor, { OnMount, OnChange } from "@monaco-editor/react";
import type { editor } from "monaco-editor";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui";

export interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language: string;
  theme?: "vs-dark" | "light" | "hc-black";
  readOnly?: boolean;
  height?: string | number;
  className?: string;
  minimap?: boolean;
  lineNumbers?: boolean;
  fontSize?: number;
}

// Language ID mapping for Monaco
const languageMap: Record<string, string> = {
  javascript: "javascript",
  typescript: "typescript",
  python: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  go: "go",
  rust: "rust",
  ruby: "ruby",
  php: "php",
  csharp: "csharp",
  swift: "swift",
  kotlin: "kotlin",
};

// Default starter code by language
export const starterCodeTemplates: Record<string, string> = {
  javascript: `function solution(input) {
  // Your code here

}`,
  typescript: `function solution(input: any): any {
  // Your code here

}`,
  python: `def solution(input):
    # Your code here
    pass`,
  java: `class Solution {
    public static Object solution(Object input) {
        // Your code here
        return null;
    }
}`,
  cpp: `#include <iostream>
#include <vector>
using namespace std;

class Solution {
public:
    // Your code here
};`,
  go: `package main

func solution(input interface{}) interface{} {
    // Your code here
    return nil
}`,
  rust: `fn solution(input: &str) -> String {
    // Your code here
    String::new()
}`,
};

export function CodeEditor({
  value,
  onChange,
  language,
  theme = "vs-dark",
  readOnly = false,
  height = "400px",
  className,
  minimap = false,
  lineNumbers = true,
  fontSize = 14,
}: CodeEditorProps) {
  const editorRef = React.useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount: OnMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleEditorChange: OnChange = (value) => {
    onChange(value || "");
  };

  const monacoLanguage = languageMap[language] || "javascript";

  return (
    <div className={cn("rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700", className)}>
      <Editor
        height={height}
        language={monacoLanguage}
        theme={theme}
        value={value}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        loading={
          <div className="flex items-center justify-center h-full bg-gray-900">
            <Spinner size="lg" />
          </div>
        }
        options={{
          readOnly,
          minimap: { enabled: minimap },
          lineNumbers: lineNumbers ? "on" : "off",
          fontSize,
          fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
          fontLigatures: true,
          tabSize: 2,
          insertSpaces: true,
          automaticLayout: true,
          scrollBeyondLastLine: false,
          wordWrap: "on",
          formatOnPaste: true,
          formatOnType: true,
          suggestOnTriggerCharacters: true,
          quickSuggestions: true,
          folding: true,
          bracketPairColorization: { enabled: true },
          padding: { top: 16, bottom: 16 },
          scrollbar: {
            vertical: "auto",
            horizontal: "auto",
            verticalScrollbarSize: 10,
            horizontalScrollbarSize: 10,
          },
        }}
      />
    </div>
  );
}
