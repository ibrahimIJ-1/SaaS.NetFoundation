"use client";

import dynamic from "next/dynamic";
import "react-quill-new/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill-new"), {
  ssr: false,
  loading: () => <div className="h-40 w-full bg-slate-50 animate-pulse rounded-xl" />,
});

interface RichEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function RichEditor({ value, onChange, placeholder }: RichEditorProps) {
  const modules = {
    toolbar: [
      [{ header: [1, 2, false] }],
      ["bold", "italic", "underline", "strike", "blockquote"],
      [{ list: "ordered" }, { list: "bullet" }],
      ["link", "image"],
      [{ color: [] }, { background: [] }],
      ["clean"],
    ],
  };


  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "blockquote",
    "list",
    "link",
    "image",
    "color",
    "background",
  ];



  return (
    <div className="rich-editor-container border rounded-xl overflow-hidden bg-white">
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className="text-right h-auto"
        style={{ direction: 'rtl' }}
      />
      <style jsx global>{`
        .rich-editor-container .ql-editor {
          min-height: 150px;
          text-align: right;
          font-family: inherit;
          font-size: 14px;
          color: #000000;
          background-color: #ffffff;
        }

        .rich-editor-container .ql-toolbar {
          border-top: none;
          border-left: none;
          border-right: none;
          border-bottom: 1px solid #e2e8f0;
          background-color: #f8fafc;
        }
        .rich-editor-container .ql-container {
          border: none;
        }
      `}</style>
    </div>
  );
}
