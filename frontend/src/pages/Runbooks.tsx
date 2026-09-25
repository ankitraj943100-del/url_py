import React, { useEffect, useState } from 'react';
import { BookOpen, FileText, Database, ShieldCheck, ChevronRight } from 'lucide-react';
import { api } from '../services/api';
import { KnowledgeDocument } from '../types';

export const Runbooks: React.FC = () => {
  const [docs, setDocs] = useState<KnowledgeDocument[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<KnowledgeDocument | null>(null);

  useEffect(() => {
    api.getKnowledgeDocuments().then(data => {
      setDocs(data);
      if (data.length > 0) setSelectedDoc(data[0]);
    }).catch(err => {
      console.error(err);
    });
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight">SRE Knowledge Base & Runbooks (RAG)</h2>
          <p className="text-xs text-slate-400 font-mono mt-0.5">PostgreSQL + pgvector vector store indexing operational documentation</p>
        </div>
        <span className="px-3 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs font-mono">
          pgvector HNSW Index: Active
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document List (1 col) */}
        <div className="bg-[#111820] border border-[#202833] rounded-xl p-4 space-y-2 text-xs">
          <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider p-2">Indexed Documents</h3>
          <div className="space-y-1">
            {docs.map((doc) => (
              <button
                key={doc.id}
                onClick={() => setSelectedDoc(doc)}
                className={`w-full p-3 rounded-lg text-left transition-all flex items-center justify-between ${
                  selectedDoc?.id === doc.id
                    ? 'bg-blue-600/20 border border-blue-500/40 text-blue-400 font-semibold'
                    : 'bg-[#0B0F14] border border-[#202833] text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{doc.title}</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Document Content Viewer (2 cols) */}
        {selectedDoc && (
          <div className="lg:col-span-2 bg-[#111820] border border-[#202833] rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#202833] pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedDoc.title}</h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Type: <span className="text-blue-400 font-bold uppercase">{selectedDoc.document_type}</span>
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Indexed in pgvector
              </span>
            </div>

            <div className="p-4 bg-[#0B0F14] rounded-lg border border-[#202833] text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto">
              {selectedDoc.content}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
