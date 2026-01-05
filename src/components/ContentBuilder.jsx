import { useState, useEffect, useRef } from 'react';

/**
 * STEP 2: Content Builder & AI Assistance (ENTERPRISE EDITION)
 * 
 * Fixed 3-Column Layout:
 * - LEFT: Section Navigator (25%)
 * - CENTER: Focused Section Editor (50%)
 * - RIGHT: AI Chat Assistant (25%)
 * 
 * Manages TENDER_SECTION entities with enterprise-grade controls
 * for 50-300 page government tenders.
 * 
 * AI Review Mode is available via the AI Assistant panel.
 * AI provides suggestions only and never auto-applies changes.
 */
export default function ContentBuilder({ tender, sections, setSections, setValidation }) {
  
  // ============================================
  // LOCAL UI STATE
  // ============================================
  
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // AI Chat State
  const [chatMessages, setChatMessages] = useState([
    {
      id: 'welcome',
      role: 'assistant',
      content: 'Hello! I can help you structure and draft tender sections. What would you like to work on?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [pendingProposal, setPendingProposal] = useState(null);
  const [applyModal, setApplyModal] = useState(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  
  // Autosave state
  const [lastSaved, setLastSaved] = useState(null);
  const autosaveTimerRef = useRef(null);
  
  // Drag & drop state
  const [draggedSectionId, setDraggedSectionId] = useState(null);
  
  // ============================================
  // VALIDATION LOGIC
  // ============================================
  
  useEffect(() => {
    const errors = {
      missingMandatorySections: [],
      emptyMandatoryContent: [],
    };
    
    let isValid = true;
    
    if (sections.length === 0) {
      isValid = false;
    }
    
    sections.forEach((section) => {
      if (section.isMandatory) {
        if (!section.content || section.content.trim() === '') {
          errors.emptyMandatoryContent.push(section.title || section.sectionId);
          isValid = false;
        }
      }
    });
    
    const hasInvalidOrder = sections.some(
      (section) => section.orderIndex === undefined || section.orderIndex === null
    );
    if (hasInvalidOrder) {
      isValid = false;
    }
    
    setValidation((prev) => ({
      ...prev,
      step2: {
        isValid,
        errors,
      },
    }));
  }, [sections, setValidation]);
  
  // ============================================
  // SECTION OPERATIONS
  // ============================================
  
  const handleAddSection = (newSectionData) => {
    const newSection = {
      sectionId: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenderId: tender.tenderId || 'DRAFT',
      title: newSectionData.title,
      sectionType: newSectionData.sectionType,
      content: newSectionData.content || '',
      isMandatory: newSectionData.isMandatory,
      orderIndex: sections.length,
    };
    
    console.log('[SECTION AUDIT] Section created', {
      timestamp: new Date().toISOString(),
      sectionId: newSection.sectionId,
      sectionTitle: newSection.title,
      sectionType: newSection.sectionType,
      isMandatory: newSection.isMandatory,
      actionType: 'CREATE_SECTION',
    });
    
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.sectionId);
    setIsAddModalOpen(false);
    triggerAutosave();
  };
  
  const handleUpdateSection = (sectionId, updates) => {
    setSections(
      sections.map((section) =>
        section.sectionId === sectionId
          ? { ...section, ...updates }
          : section
      )
    );
    triggerAutosave();
  };
  
  const handleDeleteSection = (sectionId) => {
    const section = sections.find((s) => s.sectionId === sectionId);
    
    if (section?.isMandatory) {
      alert('Cannot delete mandatory sections');
      return;
    }
    
    console.log('[SECTION AUDIT] Section deleted', {
      timestamp: new Date().toISOString(),
      sectionId,
      sectionTitle: section.title,
      actionType: 'DELETE_SECTION',
    });
    
    const updatedSections = sections
      .filter((s) => s.sectionId !== sectionId)
      .map((s, index) => ({ ...s, orderIndex: index }));
    
    setSections(updatedSections);
    
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
    triggerAutosave();
  };
  
  const handleReorderSections = (fromIndex, toIndex) => {
    const reordered = [...sections];
    const [moved] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, moved);
    
    const updated = reordered.map((section, index) => ({
      ...section,
      orderIndex: index,
    }));
    
    setSections(updated);
    triggerAutosave();
  };
  
  // ============================================
  // AUTOSAVE LOGIC
  // ============================================
  
  const triggerAutosave = () => {
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
    }
    
    autosaveTimerRef.current = setTimeout(() => {
      setLastSaved(new Date());
      console.log('[AUTOSAVE] Sections saved', new Date().toISOString());
    }, 2000);
  };
  
  // ============================================
  // AI CHAT HANDLER
  // ============================================
  
  const handleSendMessage = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString(),
    };
    
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput('');
    setIsAIProcessing(true);
    
    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    const aiResponse = generateAIResponse(chatInput, sections, selectedSectionId);
    
    setChatMessages((prev) => [...prev, aiResponse]);
    
    // If AI generated a proposal, set it
    if (aiResponse.proposal) {
      setPendingProposal(aiResponse.proposal);
    }
    
    setIsAIProcessing(false);
  };
  
  // ============================================
  // AI PROPOSAL HANDLERS
  // ============================================
  
  const handleApplyProposal = (proposal) => {
    if (proposal.type === 'section-structure') {
      // Show apply modal for section structure
      setApplyModal({
        type: 'create-sections',
        sections: proposal.sections,
      });
    } else if (proposal.type === 'section-content') {
      // Show apply modal for content
      setApplyModal({
        type: 'apply-content',
        content: proposal.content,
        sectionId: selectedSectionId,
      });
    } else if (proposal.type === 'new-section') {
      // Show apply modal for new section
      setApplyModal({
        type: 'create-single-section',
        section: proposal.section,
      });
    }
  };
  
  const handleConfirmApply = (mode) => {
    if (!applyModal) return;
    
    if (applyModal.type === 'create-sections') {
      // Create multiple sections
      applyModal.sections.forEach((sectionData) => {
        handleAddSection(sectionData);
      });
      setPendingProposal(null);
    } else if (applyModal.type === 'apply-content') {
      // Apply content to selected section
      const selectedSection = sections.find(s => s.sectionId === applyModal.sectionId);
      if (selectedSection) {
        let newContent = applyModal.content;
        
        if (mode === 'append') {
          newContent = selectedSection.content + '\n\n' + applyModal.content;
        } else if (mode === 'insert') {
          // For simplicity, append to end
          newContent = selectedSection.content + '\n\n' + applyModal.content;
        }
        
        handleUpdateSection(applyModal.sectionId, { content: newContent });
      }
      setPendingProposal(null);
    } else if (applyModal.type === 'create-single-section') {
      handleAddSection(applyModal.section);
      setPendingProposal(null);
    }
    
    setApplyModal(null);
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  const selectedSection = sections.find((s) => s.sectionId === selectedSectionId);
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200">
      <div className="border-b border-slate-200 px-8 py-6 bg-linear-to-r from-slate-50 to-white">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Content Builder & AI Assistance
        </h2>
        <p className="text-sm text-slate-600 mb-2">
          Enterprise workspace for drafting 50-300 page government tenders
        </p>
        <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-md px-3 py-2 inline-block">
          💡 AI Review Mode is available via the AI Assistant panel. AI provides suggestions only and never auto-applies changes.
        </p>
      </div>
      
      {/* FIXED 3-COLUMN LAYOUT */}
      <div className="flex h-150">
        
        {/* LEFT PANEL: Section Navigator (25%) */}
        <SectionNavigator
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onAddSection={() => setIsAddModalOpen(true)}
          onDeleteSection={handleDeleteSection}
          onReorderSections={handleReorderSections}
          draggedSectionId={draggedSectionId}
          setDraggedSectionId={setDraggedSectionId}
        />
        
        {/* CENTER PANEL: Focused Section Editor (50%) */}
        <FocusedSectionEditor
          section={selectedSection}
          onUpdateSection={handleUpdateSection}
          lastSaved={lastSaved}
        />
        
        {/* RIGHT PANEL: AI Chat Assistant (25%) */}
        <AIChatAssistant
          chatMessages={chatMessages}
          chatInput={chatInput}
          setChatInput={setChatInput}
          onSendMessage={handleSendMessage}
          isProcessing={isAIProcessing}
          tenderCategory={tender.category}
          selectedSection={selectedSection}
          sections={sections}
          pendingProposal={pendingProposal}
          onApplyProposal={handleApplyProposal}
          onDiscardProposal={() => setPendingProposal(null)}
        />
        
      </div>
      
      {/* Add Section Modal */}
      {isAddModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddSection}
        />
      )}
      
      {/* Apply Content Modal */}
      {applyModal && (
        <ApplyContentModal
          applyModal={applyModal}
          onConfirm={handleConfirmApply}
          onCancel={() => setApplyModal(null)}
        />
      )}
    </div>
  );
}

// ============================================
// LEFT PANEL: SECTION NAVIGATOR
// ============================================

function SectionNavigator({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onDeleteSection,
  onReorderSections,
  draggedSectionId,
  setDraggedSectionId,
}) {
  
  const handleDragStart = (e, sectionId, index) => {
    setDraggedSectionId(sectionId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.currentTarget);
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };
  
  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const draggedIndex = sections.findIndex(s => s.sectionId === draggedSectionId);
    if (draggedIndex !== -1 && draggedIndex !== targetIndex) {
      onReorderSections(draggedIndex, targetIndex);
    }
    setDraggedSectionId(null);
  };
  
  return (
    <div className="w-1/4 border-r border-slate-200 flex flex-col bg-slate-50">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Tender Sections</h3>
        <button
          onClick={onAddSection}
          className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Section
        </button>
      </div>
      
      {/* Scrollable Section List */}
      <div className="flex-1 overflow-y-auto p-3">
        {sections.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="font-medium">No sections yet</p>
            <p className="text-xs mt-1">Click "Add Section" to begin</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section, index) => (
              <SectionNavigatorItem
                key={section.sectionId}
                section={section}
                index={index}
                isSelected={section.sectionId === selectedSectionId}
                isDragged={section.sectionId === draggedSectionId}
                onSelect={() => onSelectSection(section.sectionId)}
                onDelete={() => onDeleteSection(section.sectionId)}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionNavigatorItem({
  section,
  index,
  isSelected,
  isDragged,
  onSelect,
  onDelete,
  onDragStart,
  onDragOver,
  onDrop,
}) {
  
  const getStatusIcon = () => {
    if (!section.content || section.content.trim().length === 0) {
      return <span className="text-red-500" title="Empty">❌</span>;
    } else if (section.content.trim().length < 100) {
      return <span className="text-yellow-500" title="Needs Review">⚠️</span>;
    } else {
      return <span className="text-green-500" title="Complete">✅</span>;
    }
  };
  
  const getTypeBadge = () => {
    const badges = {
      TECHNICAL: { label: 'TECH', color: 'bg-blue-100 text-blue-700' },
      FINANCIAL: { label: 'FIN', color: 'bg-green-100 text-green-700' },
      ELIGIBILITY: { label: 'ELIG', color: 'bg-purple-100 text-purple-700' },
      OTHER: { label: 'OTHER', color: 'bg-gray-100 text-gray-700' },
    };
    const badge = badges[section.sectionType] || badges.OTHER;
    return (
      <span className={`px-2 py-0.5 rounded text-xs font-bold ${badge.color}`}>
        {badge.label}
      </span>
    );
  };
  
  const wordCount = section.content ? section.content.split(/\s+/).filter(w => w.length > 0).length : 0;
  const pageCount = Math.ceil(wordCount / 500); // ~500 words per page
  
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, section.sectionId, index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      className={`
        rounded-lg border-2 transition-all cursor-pointer
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}
        ${isDragged ? 'opacity-50' : ''}
      `}
    >
      <div onClick={onSelect} className="p-3">
        
        {/* Drag Handle + Title */}
        <div className="flex items-start gap-2 mb-2">
          <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0 cursor-grab" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
          </svg>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-900 truncate">
              {section.title || 'Untitled Section'}
            </h4>
          </div>
          {section.isMandatory && (
            <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20" title="Mandatory">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        
        {/* Type Badge + Status */}
        <div className="flex items-center justify-between mb-2">
          {getTypeBadge()}
          <div className="text-lg">
            {getStatusIcon()}
          </div>
        </div>
        
        {/* Word/Page Count */}
        <div className="text-xs text-slate-500">
          {wordCount} words • ~{pageCount} {pageCount === 1 ? 'page' : 'pages'}
        </div>
        
      </div>
      
      {/* Delete Button */}
      {!section.isMandatory && (
        <div className="px-3 pb-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="w-full px-2 py-1 text-xs font-semibold text-red-600 hover:bg-red-50 rounded transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

// ============================================
// CENTER PANEL: FOCUSED SECTION EDITOR
// ============================================

function FocusedSectionEditor({ section, onUpdateSection, lastSaved }) {
  
  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <svg className="w-20 h-20 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-lg font-semibold text-slate-700 mb-1">Select a section to begin drafting</p>
          <p className="text-sm text-slate-500">Choose from the Section Navigator on the left</p>
        </div>
      </div>
    );
  }
  
  const wordCount = section.content ? section.content.split(/\s+/).filter(w => w.length > 0).length : 0;
  
  const getAutosaveStatus = () => {
    if (!lastSaved) return 'Not saved';
    const now = new Date();
    const diff = Math.floor((now - lastSaved) / 1000);
    if (diff < 10) return 'Saved just now';
    if (diff < 60) return `Saved ${diff}s ago`;
    const minutes = Math.floor(diff / 60);
    return `Saved ${minutes}m ago`;
  };
  
  return (
    <div className="flex-1 flex flex-col bg-white">
      
      {/* Section Header */}
      <div className="border-b border-slate-200 px-6 py-4 bg-slate-50">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{section.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-semibold px-2 py-1 bg-blue-100 text-blue-700 rounded">
                {section.sectionType}
              </span>
              {section.isMandatory && (
                <span className="text-xs font-semibold px-2 py-1 bg-red-100 text-red-700 rounded flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  Mandatory
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-semibold text-slate-700">{wordCount} words</div>
            <div className="text-xs text-slate-500">{getAutosaveStatus()}</div>
          </div>
        </div>
      </div>
      
      {/* Plain Text Editor */}
      <div className="flex-1 overflow-y-auto p-6">
        <textarea
          value={section.content}
          onChange={(e) => onUpdateSection(section.sectionId, { content: e.target.value })}
          className="w-full h-full p-4 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed"
          placeholder="Begin drafting your section content here...

This is a plain text editor optimized for large government tender documents.

AI suggestions are available in the right panel."
        />
      </div>
      
      {/* Footer Actions */}
      <div className="border-t border-slate-200 px-6 py-3 bg-slate-50 flex gap-3">
        <button className="px-4 py-2 text-sm font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
          Review with AI
        </button>
        <button className="px-4 py-2 text-sm font-semibold text-green-600 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
          Mark as Reviewed
        </button>
      </div>
      
    </div>
  );
}

// ============================================
// RIGHT PANEL: AI CHAT ASSISTANT
// ============================================

function AIChatAssistant({
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  isProcessing,
  tenderCategory,
  selectedSection,
  sections,
  pendingProposal,
  onApplyProposal,
  onDiscardProposal,
}) {
  
  const chatEndRef = useRef(null);
  
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);
  
  const getContextPlaceholder = () => {
    if (sections.length === 0) {
      return 'Ask for structure, sections, or guidance...';
    } else if (!selectedSection) {
      return 'Ask for guidance or select a section to get drafting help...';
    } else {
      return `Ask to draft, improve, or review "${selectedSection.title}"...`;
    }
  };
  
  return (
    <div className="w-1/4 border-l border-slate-200 flex flex-col bg-white">
      
      {/* Header */}
      <div className="px-4 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <h3 className="text-sm font-bold text-slate-900">AI Assistant</h3>
        </div>
        
        {/* Context Display */}
        <div className="bg-white border border-indigo-200 rounded-lg p-2 text-xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-slate-600 font-semibold">Category:</span>
            <span className="text-slate-900 font-bold capitalize">{tenderCategory || 'Not Set'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-600 font-semibold">Active Section:</span>
            <span className="text-slate-900 font-bold truncate ml-2">
              {selectedSection ? selectedSection.title : 'None'}
            </span>
          </div>
        </div>
        
        {/* Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-amber-900 leading-tight">
            <span className="font-bold">⚠️</span> AI proposals must be explicitly approved. Nothing auto-applies.
          </p>
        </div>
      </div>
      
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatMessages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        
        {/* Pending Proposal */}
        {pendingProposal && (
          <ProposalCard
            proposal={pendingProposal}
            onApply={onApplyProposal}
            onDiscard={onDiscardProposal}
          />
        )}
        
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="animate-spin w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full"></div>
            <span>AI is thinking...</span>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>
      
      {/* Chat Input */}
      <div className="border-t border-slate-200 p-3 bg-slate-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSendMessage()}
            placeholder={getContextPlaceholder()}
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            disabled={isProcessing}
          />
          <button
            onClick={onSendMessage}
            disabled={isProcessing || !chatInput.trim()}
            className="px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </div>
      
    </div>
  );
}

function ChatMessage({ message }) {
  if (message.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="bg-blue-600 text-white px-4 py-2 rounded-lg max-w-[85%] text-sm">
          {message.content}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex justify-start">
      <div className="bg-slate-100 text-slate-900 px-4 py-2 rounded-lg max-w-[85%] text-sm">
        <div className="flex items-center gap-1 mb-1">
          <svg className="w-3 h-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          <span className="text-xs font-bold text-indigo-700">AI</span>
        </div>
        <div className="whitespace-pre-line">{message.content}</div>
      </div>
    </div>
  );
}

function ProposalCard({ proposal, onApply, onDiscard }) {
  return (
    <div className="border-2 border-indigo-300 bg-indigo-50 rounded-lg p-3">
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        <span className="text-xs font-bold text-indigo-700 uppercase">Proposed Content</span>
      </div>
      
      {/* Explanation */}
      {proposal.explanation && (
        <div className="mb-3">
          <div className="text-xs font-bold text-slate-700 mb-1">Explanation:</div>
          <div className="text-xs text-slate-600">{proposal.explanation}</div>
        </div>
      )}
      
      {/* Preview */}
      {proposal.preview && (
        <div className="mb-3">
          <div className="text-xs font-bold text-slate-700 mb-1">Preview:</div>
          <div className="bg-white border border-indigo-200 rounded p-2 text-xs text-slate-700 font-mono max-h-32 overflow-y-auto whitespace-pre-line">
            {proposal.preview}
          </div>
        </div>
      )}
      
      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => onApply(proposal)}
          className="flex-1 px-3 py-2 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Apply to Editor
        </button>
        <button
          onClick={onDiscard}
          className="px-3 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded hover:bg-slate-50 transition-colors"
        >
          Discard
        </button>
      </div>
    </div>
  );
}

// ============================================
// MODALS
// ============================================

function AddSectionModal({ onClose, onAdd }) {
  
  const [formData, setFormData] = useState({
    title: '',
    sectionType: 'TECHNICAL',
    isMandatory: false,
  });
  
  const SECTION_TYPES = [
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'ELIGIBILITY', label: 'Eligibility' },
    { value: 'OTHER', label: 'Other' },
  ];
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Section title is required');
      return;
    }
    
    onAdd(formData);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-900">Add New Section</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Section Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Technical Requirements"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Section Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.sectionType}
              onChange={(e) => setFormData({ ...formData, sectionType: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {SECTION_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-semibold text-slate-700">Mark as Mandatory</span>
            </label>
          </div>
          
        </form>
        
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-colors"
          >
            Add Section
          </button>
        </div>
        
      </div>
    </div>
  );
}

function ApplyContentModal({ applyModal, onConfirm, onCancel }) {
  const [mode, setMode] = useState('replace');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
        
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-indigo-50 to-blue-50">
          <h3 className="text-lg font-bold text-slate-900">Apply AI Content</h3>
          <p className="text-sm text-slate-600 mt-1">Choose how to apply this content</p>
        </div>
        
        <div className="p-6 space-y-4">
          
          {applyModal.type === 'create-sections' && (
            <div>
              <p className="text-sm text-slate-700 mb-3">
                This will create <span className="font-bold">{applyModal.sections.length} sections</span> based on AI suggestions.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded p-3 max-h-40 overflow-y-auto">
                <ul className="text-sm space-y-1">
                  {applyModal.sections.map((sec, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="font-semibold">{idx + 1}.</span> {sec.title}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          
          {applyModal.type === 'apply-content' && (
            <div>
              <p className="text-sm text-slate-700 mb-3">How should this content be applied?</p>
              
              <div className="space-y-2">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="replace"
                    checked={mode === 'replace'}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-slate-900">Replace existing content</div>
                    <div className="text-xs text-slate-600">Overwrites current section content</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="append"
                    checked={mode === 'append'}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-slate-900">Append below existing content</div>
                    <div className="text-xs text-slate-600">Adds to the end of current content</div>
                  </div>
                </label>
                
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input
                    type="radio"
                    name="mode"
                    value="insert"
                    checked={mode === 'insert'}
                    onChange={(e) => setMode(e.target.value)}
                    className="w-4 h-4 text-indigo-600"
                  />
                  <div className="ml-3">
                    <div className="text-sm font-semibold text-slate-900">Insert at cursor</div>
                    <div className="text-xs text-slate-600">Insert where cursor is positioned</div>
                  </div>
                </label>
              </div>
            </div>
          )}
          
          {applyModal.type === 'create-single-section' && (
            <div>
              <p className="text-sm text-slate-700 mb-3">
                This will create a new section: <span className="font-bold">{applyModal.section.title}</span>
              </p>
            </div>
          )}
          
        </div>
        
        <div className="px-6 py-4 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(mode)}
            className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
          >
            Confirm & Apply
          </button>
        </div>
        
      </div>
    </div>
  );
}

// ============================================
// AI RESPONSE GENERATOR (MOCK)
// ============================================

function generateAIResponse(userInput, sections, selectedSectionId) {
  const input = userInput.toLowerCase();
  
  // Case 1: No sections exist - suggest structure
  if (sections.length === 0) {
    if (input.includes('structure') || input.includes('section') || input.includes('start') || input.includes('help')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: 'Based on best practices for government tenders, I recommend the following section structure:',
        timestamp: new Date().toISOString(),
        proposal: {
          type: 'section-structure',
          explanation: 'Standard structure for government tenders with mandatory compliance sections',
          preview: 'Will create 4 sections: Eligibility, Technical, Financial, and Submission Instructions',
          sections: [
            {
              title: 'Eligibility Criteria',
              sectionType: 'ELIGIBILITY',
              isMandatory: true,
              content: '• Minimum experience: 5 years in similar projects\n• Valid business registration and licenses\n• Financial capacity requirements\n• No blacklisting or legal disputes',
            },
            {
              title: 'Technical Requirements',
              sectionType: 'TECHNICAL',
              isMandatory: true,
              content: '• Compliance with ISO standards\n• Technical specifications and deliverables\n• Quality assurance protocols\n• Performance benchmarks',
            },
            {
              title: 'Financial Bid Format',
              sectionType: 'FINANCIAL',
              isMandatory: true,
              content: '• Itemized cost breakdown\n• Payment milestones and terms\n• Tax and regulatory compliance\n• Currency and pricing validity',
            },
            {
              title: 'Submission Instructions',
              sectionType: 'OTHER',
              isMandatory: false,
              content: '• Document format and submission method\n• Deadline and late submission policy\n• Required certifications and signatures\n• Contact information for queries',
            },
          ],
        },
      };
    }
  }
  
  // Case 2: Section selected - provide content suggestions
  if (selectedSectionId) {
    const selectedSection = sections.find(s => s.sectionId === selectedSectionId);
    
    if (input.includes('draft') || input.includes('write') || input.includes('content') || input.includes('help')) {
      let content = '';
      
      if (selectedSection.sectionType === 'TECHNICAL') {
        content = '**Technical Specifications**\n\n• All deliverables must comply with ISO 9001:2015 quality management standards\n• Materials and components must meet local regulatory requirements\n• Performance benchmarks: 99.5% uptime during operational hours\n• Equipment must be CE certified and carry manufacturer warranties\n\n**Quality Assurance**\n\n• Inspection protocols at each project milestone\n• Third-party audit and certification requirements\n• Documentation and traceability standards\n• Corrective action procedures for non-compliance';
      } else if (selectedSection.sectionType === 'FINANCIAL') {
        content = '**Payment Terms**\n\n• Payment Schedule: 30% advance, 60% on delivery, 10% after final acceptance\n• All prices in local currency, inclusive of applicable taxes\n• Payment processing within 30 days of invoice receipt\n• Bank guarantee or performance bond required\n\n**Price Validity**\n\n• Fixed pricing for first 12 months\n• Annual price revision based on Consumer Price Index (CPI)\n• Maximum escalation capped at 5% per annum\n• Force majeure provisions';
      } else if (selectedSection.sectionType === 'ELIGIBILITY') {
        content = '**Mandatory Qualifications**\n\n• Minimum 5 years of experience in similar projects\n• Annual turnover of at least [specify amount]\n• Valid business registration and tax compliance certificates\n• No blacklisting or ongoing legal disputes\n\n**Required Documentation**\n\n• Company profile and organizational structure\n• Past performance certificates (minimum 3 similar projects)\n• Financial statements for last 3 fiscal years\n• Valid professional licenses and certifications';
      } else {
        content = '**General Section Content**\n\n• Define clear objectives and scope\n• List all requirements and specifications\n• Include compliance and governance clauses\n• Specify timelines and deliverables\n• Outline evaluation and acceptance criteria';
      }
      
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Here's a professional draft for "${selectedSection.title}":`,
        timestamp: new Date().toISOString(),
        proposal: {
          type: 'section-content',
          explanation: `Professional draft content for ${selectedSection.sectionType} section following government tender best practices.`,
          content: content,
          preview: content.substring(0, 150) + '...',
        },
      };
    }
    
    if (input.includes('improve') || input.includes('review') || input.includes('better')) {
      return {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `To improve "${selectedSection.title}", consider adding:\n\n• More specific compliance requirements\n• Clear evaluation criteria\n• Penalty clauses for non-compliance\n• Dispute resolution procedures\n\nWould you like me to draft these additions?`,
        timestamp: new Date().toISOString(),
      };
    }
  }
  
  // Case 3: Create new section
  if (input.includes('add section') || input.includes('create section') || input.includes('new section')) {
    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: 'I can help create a new section. Here\'s what I propose:',
      timestamp: new Date().toISOString(),
      proposal: {
        type: 'new-section',
        explanation: 'Proposed new section based on your request',
        preview: 'Project Timeline & Milestones section with standard phases',
        section: {
          title: 'Project Timeline & Milestones',
          sectionType: 'OTHER',
          isMandatory: false,
          content: '• Project kickoff and planning phase: [Duration]\n• Design and approval: [Duration]\n• Implementation and testing: [Duration]\n• Final delivery and handover: [Duration]\n\n**Key Milestones:**\n• Initial design review\n• Prototype approval\n• User acceptance testing\n• Final deployment',
        },
      },
    };
  }
  
  // Default response
  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: 'I can help with:\n\n• Suggesting tender section structure\n• Drafting section content\n• Reviewing and improving existing content\n• Creating new sections\n\nWhat would you like to work on?',
    timestamp: new Date().toISOString(),
  };
}
