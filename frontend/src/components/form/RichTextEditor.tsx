import { useRef, useMemo, type FC } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string; 
  /** Editor height in px (default 200) */
  height?: number;
}

const RichTextEditor: FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = "",
  height = 200,
}) => {
  const quillRef = useRef<ReactQuill>(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link"],
        ["blockquote"],
        ["clean"],
      ],
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "list",
      "align",
      "link",
      "blockquote",
    ],
    []
  );

  return (
    <div
      className="rich-text-editor"
      style={{ ["--quill-height" as string]: `${height}px` }}
    >
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
      />

      {/* Scoped styles for Quill inside Tailwind */}
      <style>{`
        .rich-text-editor .ql-toolbar.ql-snow {
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          border-color: var(--color-gray-300, #d1d5db);
          background: var(--color-gray-50, #f9fafb);
        }
        .dark .rich-text-editor .ql-toolbar.ql-snow {
          border-color: var(--color-gray-700, #374151);
          background: var(--color-gray-900, #111827);
        }
        .rich-text-editor .ql-container.ql-snow {
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          border-color: var(--color-gray-300, #d1d5db);
          font-size: 0.875rem;
          min-height: var(--quill-height, 200px);
        }
        .dark .rich-text-editor .ql-container.ql-snow {
          border-color: var(--color-gray-700, #374151);
          background: var(--color-gray-900, #111827);
          color: rgba(255,255,255,0.9);
        }
        .rich-text-editor .ql-editor {
          min-height: var(--quill-height, 200px);
        }
        .rich-text-editor .ql-editor.ql-blank::before {
          font-style: normal;
          color: var(--color-gray-400, #9ca3af);
        }
        .dark .rich-text-editor .ql-snow .ql-stroke {
          stroke: rgba(255,255,255,0.6);
        }
        .dark .rich-text-editor .ql-snow .ql-fill,
        .dark .rich-text-editor .ql-snow .ql-stroke.ql-fill {
          fill: rgba(255,255,255,0.6);
        }
        .dark .rich-text-editor .ql-snow .ql-picker-label {
          color: rgba(255,255,255,0.7);
        }
        .dark .rich-text-editor .ql-snow .ql-picker-options {
          background: #1f2937;
          border-color: #374151;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
