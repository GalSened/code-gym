"use client";

import { useState } from "react";
import {
  ChevronRight,
  ChevronDown,
  Folder,
  FolderOpen,
  FileCode,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FileNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children?: FileNode[];
  extension?: string;
  language?: string;
}

interface FileTreeProps {
  nodes: FileNode[];
  selectedPath: string | null;
  onSelect: (path: string) => void;
  className?: string;
}

interface FileTreeNodeProps {
  node: FileNode;
  depth: number;
  selectedPath: string | null;
  onSelect: (path: string) => void;
  expandedPaths: Set<string>;
  onToggle: (path: string) => void;
}

const fileIconColors: Record<string, string> = {
  ts: "text-blue-500",
  tsx: "text-blue-500",
  js: "text-yellow-500",
  jsx: "text-yellow-500",
  py: "text-green-500",
  rs: "text-orange-500",
  go: "text-cyan-500",
  java: "text-red-500",
  rb: "text-red-400",
  php: "text-purple-500",
  json: "text-yellow-600",
  md: "text-gray-500",
  css: "text-pink-500",
  html: "text-orange-400",
  scss: "text-pink-400",
  vue: "text-green-400",
  svelte: "text-orange-500",
};

function FileTreeNodeComponent({
  node,
  depth,
  selectedPath,
  onSelect,
  expandedPaths,
  onToggle,
}: FileTreeNodeProps) {
  const isExpanded = expandedPaths.has(node.path);
  const isSelected = selectedPath === node.path;
  const isDirectory = node.type === "directory";
  const extension = node.extension || node.name.split(".").pop() || "";
  const iconColor = fileIconColors[extension] || "text-gray-400";

  return (
    <div>
      <button
        onClick={() => {
          if (isDirectory) {
            onToggle(node.path);
          } else {
            onSelect(node.path);
          }
        }}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors text-left",
          isSelected &&
            "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {isDirectory ? (
          <>
            {isExpanded ? (
              <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 text-gray-400 shrink-0" />
            )}
            {isExpanded ? (
              <FolderOpen className="h-4 w-4 text-yellow-500 shrink-0" />
            ) : (
              <Folder className="h-4 w-4 text-yellow-500 shrink-0" />
            )}
          </>
        ) : (
          <>
            <span className="w-4" />
            <FileCode className={cn("h-4 w-4 shrink-0", iconColor)} />
          </>
        )}
        <span className="truncate">{node.name}</span>
      </button>

      {isDirectory && isExpanded && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeNodeComponent
              key={child.path}
              node={child}
              depth={depth + 1}
              selectedPath={selectedPath}
              onSelect={onSelect}
              expandedPaths={expandedPaths}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileTree({
  nodes,
  selectedPath,
  onSelect,
  className,
}: FileTreeProps) {
  // Auto-expand first level directories on mount
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(() => {
    const firstLevel = new Set<string>();
    nodes.forEach((node) => {
      if (node.type === "directory") {
        firstLevel.add(node.path);
      }
    });
    return firstLevel;
  });

  const handleToggle = (path: string) => {
    setExpandedPaths((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  return (
    <div className={cn("py-2", className)}>
      {nodes.map((node) => (
        <FileTreeNodeComponent
          key={node.path}
          node={node}
          depth={0}
          selectedPath={selectedPath}
          onSelect={onSelect}
          expandedPaths={expandedPaths}
          onToggle={handleToggle}
        />
      ))}
    </div>
  );
}
