import React, { useState } from 'react';
import Layout from '../../../components/Layout';
import MDEditor from '@uiw/react-md-editor';

const initialMarkdown = `
# GLOBAL FLEET PORTFOLIO

Welcome to the bp I&E Global Fleet Portfolio Wiki

These pages contain information and best practice guidance on:
- the [PROCESS](https://dev.azure.com/...)
- [PRODUCTS and DISCIPLINES](https://dev.azure.com/...)
- Portfolio structure and [PEOPLE](https://dev.azure.com/...)
`;

function WikiPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [markdown, setMarkdown] = useState(initialMarkdown);
  const [draft, setDraft] = useState(markdown);

  const handleEdit = () => {
    setDraft(markdown);
    setIsEditing(true);
  };

  const handleSave = () => {
    setMarkdown(draft);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: 24 }}>
      <style>{`
        .wmde-markdown ul, .wmde-markdown ol {
          list-style: initial !important;
          margin-left: 2em !important;
        }
      `}</style>
      {!isEditing ? (
        <>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={handleEdit}>Edit</button>
          </div>
          <div style={{ background: '#fff', padding: 24, borderRadius: 8 }}>
            <MDEditor.Markdown source={markdown} style={{ background: 'none' }} />
          </div>
        </>
      ) : (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <button onClick={handleSave} style={{ marginRight: 8 }}>
                Save
              </button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
          <MDEditor value={draft} onChange={setDraft} height={500} preview="live" />
        </div>
      )}
    </div>
  );
}

export default Layout(WikiPage);
