"use client";

import { useState, type ReactNode } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Bold, Italic, Underline as UnderlineIcon, Link as LinkIcon } from "lucide-react";
import { looksLikeHtml, plainTextToHtml } from "@/lib/sanitize-description";

export function RichTextField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string;
}) {
  const initialContent =
    defaultValue && !looksLikeHtml(defaultValue) ? plainTextToHtml(defaultValue) : (defaultValue ?? "");
  const [html, setHtml] = useState(initialContent);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        blockquote: false,
        bulletList: false,
        code: false,
        codeBlock: false,
        heading: false,
        horizontalRule: false,
        listItem: false,
        listKeymap: false,
        orderedList: false,
        strike: false,
        link: {
          openOnClick: false,
          autolink: false,
          HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
        },
      }),
    ],
    content: initialContent,
    immediatelyRender: false,
    onUpdate: ({ editor }) => setHtml(editor.getHTML()),
    editorProps: {
      attributes: {
        class:
          "min-h-32 px-3.5 py-2.5 text-sm outline-none [&_a]:text-accent [&_a]:underline",
      },
    },
  });

  const setLink = () => {
    if (!editor) return;
    const previousUrl = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Link URL", previousUrl ?? "https://");
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-muted">{label}</label>
      <div className="border border-line focus-within:border-accent">
        <div className="flex gap-1 border-b border-line bg-paper-muted p-1.5">
          <ToolbarButton
            label="Félkövér"
            active={editor?.isActive("bold") ?? false}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            <Bold className="size-4" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            label="Dőlt"
            active={editor?.isActive("italic") ?? false}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            <Italic className="size-4" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            label="Aláhúzott"
            active={editor?.isActive("underline") ?? false}
            disabled={!editor}
            onClick={() => editor?.chain().focus().toggleUnderline().run()}
          >
            <UnderlineIcon className="size-4" strokeWidth={2} />
          </ToolbarButton>
          <ToolbarButton
            label="Link beszúrása/szerkesztése"
            active={editor?.isActive("link") ?? false}
            disabled={!editor}
            onClick={setLink}
          >
            <LinkIcon className="size-4" strokeWidth={2} />
          </ToolbarButton>
        </div>
        {editor ? (
          <EditorContent editor={editor} />
        ) : (
          <div className="min-h-32 px-3.5 py-2.5 text-sm text-muted">Betöltés…</div>
        )}
      </div>
      <input type="hidden" name={name} value={html} readOnly />
    </div>
  );
}

function ToolbarButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className={`flex size-8 items-center justify-center transition-colors disabled:opacity-40 ${
        active ? "bg-ink text-white" : "text-ink hover:bg-white"
      }`}
    >
      {children}
    </button>
  );
}
