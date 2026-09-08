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
    <div className="rounded-2xl border border-[#7B7F8A]/25 bg-[#201e21]/90 p-5 backdrop-blur-sm shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#7B7F8A]/20">
        <div className="flex items-center gap-2">
          <Network className="h-4 w-4 text-[#6B7C98]" />
          <h4 className="text-sm font-semibold text-[#E9E6E7]">
            Concept Dependency Graph
          </h4>
        </div>
        <span className="text-[11px] font-mono text-[#7B7F8A]">
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
                  ? 'bg-[#6B7C98]/15 border-[#6B7C98]'
                  : 'bg-[#171618]/60 border-[#7B7F8A]/20 hover:border-[#6B7C98]/40 hover:bg-[#28262a]'
              }`}
            >
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`h-1.5 w-1.5 rounded-full ${hasDependencies ? 'bg-[#6B7C98]' : 'bg-[#AB978C]'}`} />
                  <span className="text-xs font-medium text-[#E9E6E7]">{node.label}</span>
                </div>
                <span className="text-[10px] font-mono text-[#7B7F8A]">{node.node_id}</span>
              </div>

              {hasDependencies ? (
                <div className="pt-2 border-t border-[#7B7F8A]/20 text-[11px]">
                  <span className="text-[10px] text-[#7B7F8A] block mb-1">Prerequisites:</span>
                  <div className="flex flex-wrap gap-1">
                    {node.dependencies.map(depId => (
                      <span
                        key={depId}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#5E5653]/40 text-[#E9E6E7] border border-[#7B7F8A]/30 text-[10px]"
                      >
                        <ArrowRight className="h-2.5 w-2.5 text-[#7B7F8A]" />
                        {getNodeLabel(depId)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="pt-2 border-t border-[#7B7F8A]/20 flex items-center gap-1.5 text-[10px] text-[#AB978C]">
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
