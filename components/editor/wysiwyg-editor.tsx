'use client';

/**
 * WYSIWYG Editor Component
 * A rich text editor for blog posts and content creation
 */

interface WYSIWYGEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export function WYSIWYGEditor({ content, onChange, placeholder }: WYSIWYGEditorProps) {
  return (
    <div className="min-h-[300px] border rounded-md p-4">
      <textarea
        className="w-full h-full min-h-[280px] resize-none border-0 focus:outline-none"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Start writing...'}
      />
    </div>
  );
}
