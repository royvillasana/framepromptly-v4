/**
 * Collaborators Cursors Component
 *
 * Displays real-time cursors and selections of other users in Figma style
 */

import { useRef, useEffect } from 'react';
import { useReactFlow } from '@xyflow/react';
import type { CollaboratorInfo } from '@/hooks/use-yjs-collaboration';

interface CollaboratorsCursorsProps {
  collaborators: CollaboratorInfo[];
}

export function CollaboratorsCursors({ collaborators }: CollaboratorsCursorsProps) {
  const { project } = useReactFlow();

  return (
    <div className="absolute inset-0 pointer-events-none z-50">
      {collaborators.map((collaborator) => {
        if (!collaborator.cursor) return null;

        // Transform cursor position based on React Flow viewport
        const { x, y } = project({
          x: collaborator.cursor.x,
          y: collaborator.cursor.y,
        });

        return (
          <div
            key={collaborator.userId}
            className="absolute transition-transform duration-100 ease-out"
            style={{
              left: `${x}px`,
              top: `${y}px`,
              transform: 'translate(-2px, -2px)',
            }}
          >
            {/* Cursor SVG */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
            >
              <path
                d="M5.65376 12.3673L10.6914 7.24729C11.0436 6.89057 11.6428 6.90271 11.9793 7.27441C12.2771 7.60317 12.2957 8.10152 12.0235 8.45241L8.56464 12.6876C8.34704 12.9682 8.36141 13.3697 8.59701 13.6334L15.3029 21.0549C15.5428 21.3237 15.9538 21.3487 16.2243 21.1093L21.4035 16.5041C21.6699 16.2681 21.7138 15.8653 21.5059 15.5767L10.954 2.14738C10.6772 1.76853 10.1097 1.72951 9.77754 2.06173L1.45819 10.3811C1.1338 10.7055 1.12787 11.2274 1.44546 11.5591L5.11804 15.454C5.39298 15.7423 5.84272 15.7659 6.14581 15.5055L9.67693 12.4468C10.0142 12.1587 10.5185 12.1847 10.8263 12.5023L12.4522 14.1899C12.8012 14.5501 12.7775 15.1204 12.3992 15.4508L7.22219 20.0449C6.82742 20.3898 6.23891 20.3646 5.87376 19.9851L0.558674 14.3739C-0.195956 13.5811 -0.185953 12.3325 0.583051 11.553L5.65376 12.3673Z"
                fill={collaborator.color}
              />
            </svg>

            {/* Collaborator name badge */}
            <div
              className="absolute left-5 top-4 px-2 py-1 rounded text-white text-xs font-medium whitespace-nowrap shadow-lg"
              style={{
                backgroundColor: collaborator.color,
              }}
            >
              {collaborator.userName}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * Collaborators List Component
 *
 * Shows avatars of all active collaborators
 */

interface CollaboratorsListProps {
  collaborators: CollaboratorInfo[];
  className?: string;
}

export function CollaboratorsList({ collaborators, className = '' }: CollaboratorsListProps) {
  if (collaborators.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="text-sm text-gray-600 mr-2">
        {collaborators.length} {collaborators.length === 1 ? 'collaborator' : 'collaborators'}:
      </span>
      <div className="flex -space-x-2">
        {collaborators.slice(0, 5).map((collaborator) => (
          <div
            key={collaborator.userId}
            className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center text-white text-xs font-semibold"
            style={{
              backgroundColor: collaborator.color,
            }}
            title={collaborator.userName}
          >
            {collaborator.userName.charAt(0).toUpperCase()}
          </div>
        ))}
        {collaborators.length > 5 && (
          <div className="relative w-8 h-8 rounded-full border-2 border-white shadow-sm flex items-center justify-center bg-gray-400 text-white text-xs font-semibold">
            +{collaborators.length - 5}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Selection Indicators Component
 *
 * Shows which nodes are selected by other users
 */

interface SelectionIndicatorsProps {
  collaborators: CollaboratorInfo[];
}

export function SelectionIndicators({ collaborators }: SelectionIndicatorsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Add selection overlays to nodes
    collaborators.forEach((collaborator) => {
      if (!collaborator.selection || collaborator.selection.length === 0) return;

      collaborator.selection.forEach((nodeId) => {
        const nodeElement = document.querySelector(`[data-id="${nodeId}"]`);
        if (!nodeElement) return;

        // Check if overlay already exists
        let overlay = nodeElement.querySelector('.collaborator-selection-overlay');

        if (!overlay) {
          overlay = document.createElement('div');
          overlay.className = 'collaborator-selection-overlay';
          nodeElement.appendChild(overlay);
        }

        // Style the overlay
        const overlayEl = overlay as HTMLElement;
        overlayEl.style.position = 'absolute';
        overlayEl.style.inset = '-2px';
        overlayEl.style.border = `2px solid ${collaborator.color}`;
        overlayEl.style.borderRadius = '8px';
        overlayEl.style.pointerEvents = 'none';
        overlayEl.style.zIndex = '10';

        // Add user badge
        let badge = overlayEl.querySelector('.collaborator-badge');
        if (!badge) {
          badge = document.createElement('div');
          badge.className = 'collaborator-badge';
          overlayEl.appendChild(badge);
        }

        const badgeEl = badge as HTMLElement;
        badgeEl.textContent = collaborator.userName;
        badgeEl.style.position = 'absolute';
        badgeEl.style.top = '-24px';
        badgeEl.style.left = '0';
        badgeEl.style.backgroundColor = collaborator.color;
        badgeEl.style.color = 'white';
        badgeEl.style.padding = '2px 8px';
        badgeEl.style.borderRadius = '4px';
        badgeEl.style.fontSize = '11px';
        badgeEl.style.fontWeight = '600';
        badgeEl.style.whiteSpace = 'nowrap';
      });
    });

    // Cleanup function
    return () => {
      document.querySelectorAll('.collaborator-selection-overlay').forEach(el => {
        el.remove();
      });
    };
  }, [collaborators]);

  return <div ref={containerRef} className="absolute inset-0 pointer-events-none" />;
}
