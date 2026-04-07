
import React, { useState } from 'react';
import type { EmailTemplate } from '@/types/emailGenerator';

interface ExportModalProps {
  email: EmailTemplate;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ email, onClose }) => {
  const [exportFormat, setExportFormat] = useState<'text' | 'html'>('text');
  const [copied, setCopied] = useState(false);

  const generateHTML = () => {
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${email.subject}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f8f9fa;
        }
        .email-container {
            background-color: white;
            border-radius: 12px;
            padding: 32px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .subject {
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 24px;
            color: #1a1a1a;
        }
        .content {
            white-space: pre-line;
            margin-bottom: 24px;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 16px;
            font-size: 14px;
            color: #6b7280;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="subject">${email.subject}</div>
        <div class="content">${email.content}</div>
        <div class="footer">
            Generated with Lifecycle Email Generator
        </div>
    </div>
</body>
</html>`;
  };

  const getExportContent = () => {
    return exportFormat === 'html' ? generateHTML() : email.content;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(getExportContent());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const content = getExportContent();
    const blob = new Blob([content], { type: exportFormat === 'html' ? 'text/html' : 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${email.subject.toLowerCase().replace(/\s+/g, '-')}.${exportFormat === 'html' ? 'html' : 'txt'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-serif font-bold text-slate-900">Export Your Email</h2>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-slate-700 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            {/* Export Options */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Export Format</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="text"
                      checked={exportFormat === 'text'}
                      onChange={(e) => setExportFormat(e.target.value as 'text')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">Plain Text</div>
                      <div className="text-sm text-slate-500">Clean text format for any email platform</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="format"
                      value="html"
                      checked={exportFormat === 'html'}
                      onChange={(e) => setExportFormat(e.target.value as 'html')}
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium">HTML</div>
                      <div className="text-sm text-slate-500">Styled HTML with professional formatting</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleCopy}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {copied ? (
                    <>
                      <span className="mr-2">✓</span>
                      Copied!
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📋</span>
                      Copy to Clipboard
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleDownload}
                  className="w-full bg-indigo-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center"
                >
                  <span className="mr-2">⬇️</span>
                  Download File
                </button>
              </div>

              <div className="bg-yellow-50 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">💡 Next Steps</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Paste into your email marketing platform</li>
                  <li>• Test with a small audience first</li>
                  <li>• Track open rates and engagement</li>
                  <li>• A/B test different versions</li>
                </ul>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900">Preview</h3>
              <div className="bg-slate-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                <div className="text-sm font-mono text-slate-700 whitespace-pre-wrap">
                  {getExportContent()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
