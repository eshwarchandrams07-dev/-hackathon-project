import React from 'react';
import { ConceptGraphNode } from '../types';
import { Network, ArrowRight, CheckCircle, Sparkles, BookCheck } from 'lucide-react';

interface ConceptGraphProps {
  nodes: ConceptGraphNode[];
  onSelectConcept?: (nodeId: string) => void;
  selectedConceptId?: string | null;
}

export const ConceptGraph: React.FC<ConceptGraphProps> = ({
  nodes,
  onSelectConcept,
  selectedConceptId,
}) => {
  if (!nodes || nodes.length === 0) {
    return null;
  }

  // Find node by id helper
  const getNodeLabel = (id: string) => {
    const found = nodes.find(n => n.node_id === id);
    return found ? found.label : id;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-md">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-accent-violet/10 text-accent-violet border border-accent-violet/20">
            <Network className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white flex items-center gap-1.5">
              Knowledge Dependency Graph
              <Sparkles className="h-3.5 w-3.5 text-accent-cyan" />
            </h4>
            <p className="text-[11px] text-slate-400">
              Prerequisite relationships automatically extracted from document context
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
          {nodes.length} Concepts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
        {nodes.map((node) => {
          const isSelected = selectedConceptId === node.node_id;
          const hasDependencies = node.dependencies && node.dependencies.length > 0;

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectConcept && onSelectConcept(node.node_id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-brand-600/15 border-brand-500 shadow-md shadow-brand-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${hasDependencies ? 'bg-accent-cyan' : 'bg-emerald-400'}`} />
                  <span className="text-xs font-semibold text-slate-100">{node.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{node.node_id}</span>
              </div>

              {hasDependencies ? (
                <div className="mt-2 pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1 mb-1.5">
                    <BookCheck className="h-3 w-3 text-accent-cyan" />
                    <span>Prerequisites:</span>
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {node.dependencies.map(depId => (
                      <span
                        key={depId}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60 text-[10px] font-medium"
                      >
                        <ArrowRight className="h-2.5 w-2.5 text-slate-400" />
                        {getNodeLabel(depId)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[11px] text-emerald-400/90">
                  <CheckCircle className="h-3 w-3" />
                  <span>Foundational Concept (No prerequisites)</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
