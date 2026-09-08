import React from 'react';
import { ConceptGraphNode } from '../types';
import { Network, ArrowRight, CheckCircle, Sparkles } from 'lucide-react';

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

  const getNodeLabel = (id: string) => {
    const found = nodes.find(n => n.node_id === id);
    return found ? found.label : id;
  };

  return (
    <div className="rounded-2xl border border-slate-800/90 bg-[#0f1523]/80 p-5 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-brand-400" />
          <h4 className="text-sm font-semibold text-white">
            Concept Dependency Graph
          </h4>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          {nodes.length} concepts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {nodes.map((node) => {
          const isSelected = selectedConceptId === node.node_id;
          const hasDependencies = node.dependencies && node.dependencies.length > 0;

          return (
            <div
              key={node.node_id}
              onClick={() => onSelectConcept && onSelectConcept(node.node_id)}
              className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                isSelected
                  ? 'bg-brand-500/10 border-brand-500'
                  : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasDependencies ? 'bg-brand-400' : 'bg-emerald-400'}`} />
                  <span className="text-xs font-medium text-slate-200">{node.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500">{node.node_id}</span>
              </div>

              {hasDependencies ? (
                <div className="pt-2 border-t border-slate-800/60 text-[11px]">
                  <span className="text-[10px] text-slate-500 block mb-1">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1">
                    {node.dependencies.map(depId => (
                      <span
                        key={depId}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]"
                      >
                        <ArrowRight className="h-2.5 w-2.5 text-slate-500" />
                        {getNodeLabel(depId)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-800/60 flex items-center gap-1.5 text-[10px] text-emerald-400/80">
                  <CheckCircle className="h-3 w-3" />
                  <span>Foundational Principle</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
