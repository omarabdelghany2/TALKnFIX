import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Code,
  Code2,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: "prose prose-sm max-w-none p-4 min-h-[150px] focus:outline-none",
        "data-placeholder": placeholder || "Write something...",
      },
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <div className="flex flex-wrap gap-1 p-2 border-b border-input bg-secondary">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={editor.isActive("bold") ? "bg-accent" : ""}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={editor.isActive("italic") ? "bg-accent" : ""}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={editor.isActive("code") ? "bg-accent" : ""}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={editor.isActive("codeBlock") ? "bg-accent" : ""}
          title="Code Block (for multi-line code)"
        >
          <Code2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={editor.isActive("bulletList") ? "bg-accent" : ""}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={editor.isActive("orderedList") ? "bg-accent" : ""}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={editor.isActive("blockquote") ? "bg-accent" : ""}
          title="Quote"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="flex-1" />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>
      <EditorContent editor={editor} />

      {/* Inline styles for ChatGPT-style code blocks in editor */}
      <style>{`
        .ProseMirror pre {
          background: #1e1e1e !important;
          color: #d4d4d4 !important;
          font-family: 'Courier New', Courier, monospace;
          padding: 1rem;
          border-radius: 0.5rem;
          margin: 1rem 0;
          overflow-x: auto;
        }

        .ProseMirror pre code {
          background: none !important;
          color: inherit !important;
          font-size: 0.9rem;
          padding: 0;
        }

        .ProseMirror code:not(pre code) {
          background: rgba(255, 229, 100, 0.2);
          color: inherit;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', Courier, monospace;
          font-size: 0.9em;
        }

        .ProseMirror p {
          margin: 0.5rem 0;
        }

        .ProseMirror strong {
          font-weight: bold;
        }

        .ProseMirror em {
          font-style: italic;
        }

        .ProseMirror blockquote {
          border-left: 3px solid #ccc;
          padding-left: 1rem;
          margin-left: 0;
          font-style: italic;
          color: #666;
        }

        .ProseMirror ul,
        .ProseMirror ol {
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }

        .ProseMirror li {
          margin: 0.25rem 0;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
