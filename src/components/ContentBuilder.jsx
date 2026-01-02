import { useState, useEffect } from 'react';

/**
 * STEP 2: Tender Content Builder
 * 
 * Manages TENDER_SECTION entities:
 * - sectionId (string)
 * - tenderId (string)
 * - title (string)
 * - sectionType (TECHNICAL | FINANCIAL | ELIGIBILITY | OTHER)
 * - content (string)
 * - isMandatory (boolean)
 * - orderIndex (number)
 * 
 * This component does NOT control navigation or implement AI logic.
 * It only manages sections array and validation state.
 */
export default function ContentBuilder({ tender, sections, setSections, setValidation }) {
  
  // ============================================
  // LOCAL UI STATE (NOT WORKFLOW STATE)
  // ============================================
  
  const [selectedSectionId, setSelectedSectionId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAIPanelOpen, setIsAIPanelOpen] = useState(true);
  
  // AI Suggestions State (SEPARATE from real sections)
  const [aiSuggestions, setAISuggestions] = useState({
    suggestedSections: [], // AI-suggested sections (not added to real sections yet)
    suggestedContentBySection: {}, // AI-suggested content drafts per section
  });
  
  // ============================================
  // VALIDATION LOGIC
  // ============================================
  
  /**
   * Validates sections and updates parent validation state
   * Runs after every section change
   */
  useEffect(() => {
    const errors = {
      missingMandatorySections: [],
      emptyMandatoryContent: [],
    };
    
    let isValid = true;
    
    // Rule 1: At least one section must exist
    if (sections.length === 0) {
      isValid = false;
    }
    
    // Rule 2: All mandatory sections must have non-empty content
    sections.forEach((section) => {
      if (section.isMandatory) {
        if (!section.content || section.content.trim() === '') {
          errors.emptyMandatoryContent.push(section.title || section.sectionId);
          isValid = false;
        }
      }
    });
    
    // Rule 3: All sections must have valid orderIndex
    const hasInvalidOrder = sections.some(
      (section) => section.orderIndex === undefined || section.orderIndex === null
    );
    if (hasInvalidOrder) {
      isValid = false;
    }
    
    // Update parent validation state
    setValidation((prev) => ({
      ...prev,
      step2: {
        isValid,
        errors,
      },
    }));
  }, [sections, setValidation]);
  
  // ============================================
  // AI GUIDANCE OPERATIONS (MOCK ONLY)
  // ============================================
  
  /**
   * Generates mock AI section suggestions
   * GOVERNANCE: This does NOT auto-create sections
   */
  const handleGenerateAISectionSuggestions = () => {
    console.log('[AI AUDIT] Section suggestions requested', {
      timestamp: new Date().toISOString(),
      tenderId: tender.tenderId || 'DRAFT',
      authorityAction: 'REQUEST_AI_SECTION_SUGGESTIONS',
    });
    
    // Mock AI suggestions based on tender category
    const mockSuggestions = [
      {
        id: 'ai-suggest-1',
        title: 'Eligibility Criteria',
        sectionType: 'ELIGIBILITY',
        isMandatory: true,
        rationale: 'Essential for defining bidder qualifications and compliance requirements',
      },
      {
        id: 'ai-suggest-2',
        title: 'Technical Specifications',
        sectionType: 'TECHNICAL',
        isMandatory: true,
        rationale: 'Detailed technical requirements and standards for deliverables',
      },
      {
        id: 'ai-suggest-3',
        title: 'Commercial Terms & Conditions',
        sectionType: 'FINANCIAL',
        isMandatory: true,
        rationale: 'Payment terms, pricing structure, and financial obligations',
      },
      {
        id: 'ai-suggest-4',
        title: 'Scope of Work',
        sectionType: 'OTHER',
        isMandatory: false,
        rationale: 'Comprehensive description of work to be performed',
      },
      {
        id: 'ai-suggest-5',
        title: 'Evaluation Methodology',
        sectionType: 'OTHER',
        isMandatory: false,
        rationale: 'Transparent criteria for bid evaluation and selection',
      },
    ];
    
    setAISuggestions((prev) => ({
      ...prev,
      suggestedSections: mockSuggestions,
    }));
  };
  
  /**
   * Generates mock AI content suggestions for selected section
   * GOVERNANCE: This does NOT auto-fill the editor
   */
  const handleGenerateAIContentSuggestions = (section) => {
    console.log('[AI AUDIT] Content draft requested', {
      timestamp: new Date().toISOString(),
      sectionId: section.sectionId,
      sectionTitle: section.title,
      sectionType: section.sectionType,
      authorityAction: 'REQUEST_AI_CONTENT_DRAFT',
    });
    
    // Mock content suggestions based on section type
    const contentDrafts = {
      TECHNICAL: [
        {
          id: 'content-draft-1',
          label: 'Technical Standards',
          content: '• Compliance with ISO 9001:2015 quality standards\n• All materials must meet industry-grade specifications\n• Equipment must be CE certified and locally approved',
        },
        {
          id: 'content-draft-2',
          label: 'Performance Requirements',
          content: '• Minimum uptime: 99.5% during operational hours\n• Response time for support requests: < 4 hours\n• System must support concurrent users as specified',
        },
      ],
      FINANCIAL: [
        {
          id: 'content-draft-3',
          label: 'Payment Terms',
          content: '• Payment Schedule: 30% advance, 60% on delivery, 10% after acceptance\n• All prices in local currency, inclusive of taxes\n• Payment within 30 days of invoice receipt',
        },
        {
          id: 'content-draft-4',
          label: 'Price Escalation',
          content: '• Fixed pricing for first 12 months\n• Annual price revision based on Consumer Price Index\n• Maximum escalation capped at 5% per annum',
        },
      ],
      ELIGIBILITY: [
        {
          id: 'content-draft-5',
          label: 'Bidder Qualifications',
          content: '• Minimum 5 years experience in similar projects\n• Annual turnover of at least [specify amount]\n• Valid business registration and tax compliance certificates',
        },
        {
          id: 'content-draft-6',
          label: 'Required Documentation',
          content: '• Company profile and organizational structure\n• Past performance certificates (minimum 3 projects)\n• Financial statements for last 3 fiscal years\n• Valid insurance coverage documentation',
        },
      ],
      OTHER: [
        {
          id: 'content-draft-7',
          label: 'Standard Clauses',
          content: '• Project timelines and milestones\n• Quality assurance and inspection protocols\n• Dispute resolution and arbitration procedures\n• Intellectual property rights and confidentiality',
        },
      ],
    };
    
    const drafts = contentDrafts[section.sectionType] || contentDrafts.OTHER;
    
    setAISuggestions((prev) => ({
      ...prev,
      suggestedContentBySection: {
        ...prev.suggestedContentBySection,
        [section.sectionId]: drafts,
      },
    }));
  };
  
  /**
   * Approves AI-suggested section and adds it to real sections
   * GOVERNANCE: Requires explicit authority approval
   */
  const handleApproveAISection = (aiSuggestion, editFirst = false) => {
    console.log('[AI AUDIT] Section suggestion accepted', {
      timestamp: new Date().toISOString(),
      suggestionId: aiSuggestion.id,
      title: aiSuggestion.title,
      sectionType: aiSuggestion.sectionType,
      authorityAction: editFirst ? 'EDIT_AND_ADD' : 'ADD_SECTION',
      requiresEdit: editFirst,
    });
    
    if (editFirst) {
      // Open modal with pre-filled data
      setIsAddModalOpen(true);
      // Note: In production, you'd pass aiSuggestion data to modal
    } else {
      // Directly add to sections
      handleAddSection({
        title: aiSuggestion.title,
        sectionType: aiSuggestion.sectionType,
        isMandatory: aiSuggestion.isMandatory,
      });
    }
    
    // Remove from AI suggestions
    setAISuggestions((prev) => ({
      ...prev,
      suggestedSections: prev.suggestedSections.filter((s) => s.id !== aiSuggestion.id),
    }));
  };
  
  /**
   * Dismisses AI-suggested section
   */
  const handleDismissAISuggestion = (suggestionId) => {
    console.log('[AI AUDIT] Section suggestion dismissed', {
      timestamp: new Date().toISOString(),
      suggestionId,
      authorityAction: 'DISMISS_AI_SUGGESTION',
    });
    
    setAISuggestions((prev) => ({
      ...prev,
      suggestedSections: prev.suggestedSections.filter((s) => s.id !== suggestionId),
    }));
  };
  
  /**
   * Inserts AI-suggested content into section editor
   * GOVERNANCE: Requires explicit authority action
   */
  const handleInsertAIContent = (section, contentDraft) => {
    console.log('[AI AUDIT] Content draft inserted', {
      timestamp: new Date().toISOString(),
      sectionId: section.sectionId,
      draftId: contentDraft.id,
      authorityAction: 'INSERT_AI_CONTENT',
    });
    
    // Append to existing content (not replace)
    const separator = section.content.trim() ? '\n\n' : '';
    handleUpdateSection(section.sectionId, {
      content: section.content + separator + contentDraft.content,
    });
  };
  
  /**
   * Copies AI content to clipboard
   */
  const handleCopyAIContent = async (contentDraft) => {
    try {
      await navigator.clipboard.writeText(contentDraft.content);
      console.log('[AI AUDIT] Content draft copied to clipboard', {
        timestamp: new Date().toISOString(),
        draftId: contentDraft.id,
      });
      alert('Content copied to clipboard');
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  // ============================================
  // SECTION CRUD OPERATIONS
  // ============================================
  
  /**
   * Adds a new section to the sections array
   */
  const handleAddSection = (newSectionData) => {
    const newSection = {
      sectionId: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tenderId: tender.tenderId || 'DRAFT',
      title: newSectionData.title,
      sectionType: newSectionData.sectionType,
      content: '',
      isMandatory: newSectionData.isMandatory,
      orderIndex: sections.length, // Add to end
    };
    
    setSections([...sections, newSection]);
    setSelectedSectionId(newSection.sectionId);
    setIsAddModalOpen(false);
  };
  
  /**
   * Updates an existing section
   */
  const handleUpdateSection = (sectionId, updates) => {
    setSections(
      sections.map((section) =>
        section.sectionId === sectionId
          ? { ...section, ...updates }
          : section
      )
    );
  };
  
  /**
   * Deletes a section (only non-mandatory)
   */
  const handleDeleteSection = (sectionId) => {
    const section = sections.find((s) => s.sectionId === sectionId);
    
    // Prevent deletion of mandatory sections
    if (section?.isMandatory) {
      alert('Cannot delete mandatory sections');
      return;
    }
    
    // Remove section and reindex
    const updatedSections = sections
      .filter((s) => s.sectionId !== sectionId)
      .map((s, index) => ({ ...s, orderIndex: index }));
    
    setSections(updatedSections);
    
    // Clear selection if deleted section was selected
    if (selectedSectionId === sectionId) {
      setSelectedSectionId(null);
    }
  };
  
  /**
   * Reorders sections by moving a section up or down
   */
  const handleReorderSection = (sectionId, direction) => {
    const currentIndex = sections.findIndex((s) => s.sectionId === sectionId);
    
    if (currentIndex === -1) return;
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Boundary check
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    // Swap sections
    const reordered = [...sections];
    [reordered[currentIndex], reordered[newIndex]] = [reordered[newIndex], reordered[currentIndex]];
    
    // Update orderIndex for all sections
    const updated = reordered.map((section, index) => ({
      ...section,
      orderIndex: index,
    }));
    
    setSections(updated);
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="bg-white rounded-xl shadow-md border border-slate-200">
      <div className="border-b border-slate-200 px-8 py-6 bg-linear-to-r from-slate-50 to-white">
        <h2 className="text-2xl font-bold text-slate-900 mb-1">
          Tender Content Builder
        </h2>
        <p className="text-sm text-slate-600">
          Define the structure and content of your tender sections
        </p>
      </div>
      
      {/* Three-Panel Layout */}
      <div className="flex h-150">
        
        {/* Left Panel: Section List */}
        <SectionListPanel
          sections={sections}
          selectedSectionId={selectedSectionId}
          onSelectSection={setSelectedSectionId}
          onAddSection={() => setIsAddModalOpen(true)}
          onReorderSection={handleReorderSection}
          onDeleteSection={handleDeleteSection}
        />
        
        {/* Middle Panel: Section Editor */}
        <SectionEditor
          section={sections.find((s) => s.sectionId === selectedSectionId)}
          onUpdateSection={handleUpdateSection}
        />
        
        {/* Right Panel: AI Guidance (Collapsible) */}
        {isAIPanelOpen && (
          <AIContentGuidancePanel
            isOpen={isAIPanelOpen}
            onToggle={() => setIsAIPanelOpen(!isAIPanelOpen)}
            selectedSection={sections.find((s) => s.sectionId === selectedSectionId)}
            aiSuggestions={aiSuggestions}
            onGenerateSectionSuggestions={handleGenerateAISectionSuggestions}
            onGenerateContentSuggestions={handleGenerateAIContentSuggestions}
            onApproveSection={handleApproveAISection}
            onDismissSuggestion={handleDismissAISuggestion}
            onInsertContent={handleInsertAIContent}
            onCopyContent={handleCopyAIContent}
          />
        )}
        
        {/* AI Panel Toggle Button (when closed) */}
        {!isAIPanelOpen && (
          <button
            onClick={() => setIsAIPanelOpen(true)}
            className="w-12 border-l border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-center transition-colors"
            title="Show AI Guidance"
          >
            <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
        
      </div>
      
      {/* Add Section Modal */}
      {isAddModalOpen && (
        <AddSectionModal
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddSection}
        />
      )}
    </div>
  );
}

/**
 * SectionListPanel Component
 * Displays list of sections with add/reorder/delete actions
 */
function SectionListPanel({
  sections,
  selectedSectionId,
  onSelectSection,
  onAddSection,
  onReorderSection,
  onDeleteSection,
}) {
  return (
    <div className="w-80 border-r border-slate-200 flex flex-col bg-slate-50">
      
      {/* Add Section Button */}
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={onAddSection}
          className="w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          + Add Section
        </button>
      </div>
      
      {/* Section List */}
      <div className="flex-1 overflow-y-auto p-3">
        {sections.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            No sections yet. Click "Add Section" to get started.
          </div>
        ) : (
          <div className="space-y-2">
            {sections.map((section, index) => (
              <SectionListItem
                key={section.sectionId}
                section={section}
                isSelected={section.sectionId === selectedSectionId}
                isFirst={index === 0}
                isLast={index === sections.length - 1}
                onSelect={() => onSelectSection(section.sectionId)}
                onMoveUp={() => onReorderSection(section.sectionId, 'up')}
                onMoveDown={() => onReorderSection(section.sectionId, 'down')}
                onDelete={() => onDeleteSection(section.sectionId)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * SectionListItem Component
 * Individual section item in the list with reorder/delete controls
 */
function SectionListItem({
  section,
  isSelected,
  isFirst,
  isLast,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDelete,
}) {
  return (
    <div
      className={`
        mb-0 rounded-lg border-2 transition-all
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'}
      `}
    >
      {/* Section Info */}
      <div
        onClick={onSelect}
        className="p-3 cursor-pointer"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-900 truncate">
                {section.title || 'Untitled Section'}
              </h4>
              {section.isMandatory && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700">
                  Required
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {section.sectionType}
            </p>
          </div>
        </div>
      </div>
      
      {/* Action Buttons */}
      <div className="px-3 pb-2 flex items-center gap-1">
        {/* Move Up */}
        <button
          onClick={onMoveUp}
          disabled={isFirst}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move up"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </button>
        
        {/* Move Down */}
        <button
          onClick={onMoveDown}
          disabled={isLast}
          className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title="Move down"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {/* Delete */}
        <button
          onClick={onDelete}
          disabled={section.isMandatory}
          className="ml-auto p-1 text-red-400 hover:text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
          title={section.isMandatory ? 'Cannot delete mandatory section' : 'Delete section'}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/**
 * SectionEditor Component
 * Right panel for editing selected section properties
 */
function SectionEditor({ section, onUpdateSection }) {
  
  if (!section) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-400">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm font-medium">Select a section to edit</p>
        </div>
      </div>
    );
  }
  
  const SECTION_TYPES = [
    { value: 'TECHNICAL', label: 'Technical' },
    { value: 'FINANCIAL', label: 'Financial' },
    { value: 'ELIGIBILITY', label: 'Eligibility' },
    { value: 'OTHER', label: 'Other' },
  ];
  
  const handleFieldChange = (field, value) => {
    onUpdateSection(section.sectionId, { [field]: value });
  };
  
  return (
    <div className="flex-1 overflow-y-auto p-6">
      <div className="max-w-3xl">
        
        {/* Section Title */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Section Title
            <span className="text-red-500 ml-1">*</span>
          </label>
          <input
            type="text"
            value={section.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter section title"
          />
        </div>
        
        {/* Section Type */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Section Type
            <span className="text-red-500 ml-1">*</span>
          </label>
          <select
            value={section.sectionType}
            onChange={(e) => handleFieldChange('sectionType', e.target.value)}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {SECTION_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        {/* Mandatory Toggle */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={section.isMandatory}
              onChange={(e) => handleFieldChange('isMandatory', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
            />
            <span className="ml-2 text-sm font-semibold text-slate-700">
              Mark as Mandatory
            </span>
          </label>
          <p className="mt-1 text-xs text-slate-500">
            Mandatory sections cannot be deleted and must have content to proceed
          </p>
        </div>
        
        {/* Content */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Content
            {section.isMandatory && <span className="text-red-500 ml-1">*</span>}
          </label>
          <textarea
            value={section.content}
            onChange={(e) => handleFieldChange('content', e.target.value)}
            rows={12}
            className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
            placeholder="Enter section content..."
          />
          {section.isMandatory && (!section.content || section.content.trim() === '') && (
            <p className="mt-1 text-sm text-red-600 font-medium">
              Mandatory sections must have content
            </p>
          )}
        </div>
        
      </div>
    </div>
  );
}

/**
 * AddSectionModal Component
 * Modal dialog for creating a new section
 */
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
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-linear-to-r from-slate-50 to-white">
          <h3 className="text-lg font-bold text-slate-900">
            Add New Section
          </h3>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Section Title
              <span className="text-red-500 ml-1">*</span>
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
          
          {/* Section Type */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              Section Type
              <span className="text-red-500 ml-1">*</span>
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
          
          {/* Mandatory */}
          <div>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.isMandatory}
                onChange={(e) => setFormData({ ...formData, isMandatory: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-semibold text-slate-700">
                Mark as Mandatory
              </span>
            </label>
          </div>
          
        </form>
        
        {/* Footer */}
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

/**
 * AIContentGuidancePanel Component
 * Right-side collapsible panel for AI suggestions
 * GOVERNANCE: Purely advisory, no auto-actions
 */
function AIContentGuidancePanel({
  isOpen,
  onToggle,
  selectedSection,
  aiSuggestions,
  onGenerateSectionSuggestions,
  onGenerateContentSuggestions,
  onApproveSection,
  onDismissSuggestion,
  onInsertContent,
  onCopyContent,
}) {
  return (
    <div className="w-96 border-l border-slate-200 flex flex-col bg-white">
      
      {/* Panel Header */}
      <div className="px-4 py-4 border-b border-slate-200 bg-linear-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-sm font-bold text-slate-900">AI Suggestions</h3>
            <span className="text-xs font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
              Optional
            </span>
          </div>
          <button
            onClick={onToggle}
            className="p-1 hover:bg-slate-100 rounded"
            title="Hide AI panel"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-2 mt-2">
          <p className="text-xs text-amber-900 leading-relaxed">
            <span className="font-bold">⚠️ Important:</span> AI suggestions are drafts only. You must review and approve all sections and content.
          </p>
        </div>
      </div>
      
      {/* Panel Content */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Section Suggestions Tab */}
        <div className="border-b border-slate-200">
          <div className="px-4 py-3 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                Section Structure Suggestions
              </h4>
              {aiSuggestions.suggestedSections.length === 0 && (
                <button
                  onClick={onGenerateSectionSuggestions}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Generate
                </button>
              )}
            </div>
          </div>
          
          <div className="px-4 py-3 space-y-3">
            {aiSuggestions.suggestedSections.length === 0 ? (
              <div className="text-center py-4">
                <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <p className="text-xs text-slate-500">
                  Click Generate to get AI section suggestions
                </p>
              </div>
            ) : (
              <AISectionSuggestionList
                suggestions={aiSuggestions.suggestedSections}
                onApprove={onApproveSection}
                onDismiss={onDismissSuggestion}
              />
            )}
          </div>
        </div>
        
        {/* Content Suggestions Tab */}
        {selectedSection && (
          <div>
            <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
                  Content Drafts for: {selectedSection.title}
                </h4>
                {(!aiSuggestions.suggestedContentBySection[selectedSection.sectionId] || 
                  aiSuggestions.suggestedContentBySection[selectedSection.sectionId].length === 0) && (
                  <button
                    onClick={() => onGenerateContentSuggestions(selectedSection)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate
                  </button>
                )}
              </div>
            </div>
            
            <div className="px-4 py-3 space-y-3">
              {(!aiSuggestions.suggestedContentBySection[selectedSection.sectionId] || 
                aiSuggestions.suggestedContentBySection[selectedSection.sectionId].length === 0) ? (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-xs text-slate-500">
                    Click Generate to get content suggestions
                  </p>
                </div>
              ) : (
                aiSuggestions.suggestedContentBySection[selectedSection.sectionId].map((draft) => (
                  <AIContentDraftCard
                    key={draft.id}
                    draft={draft}
                    section={selectedSection}
                    onInsert={onInsertContent}
                    onCopy={onCopyContent}
                  />
                ))
              )}
            </div>
          </div>
        )}
        
        {!selectedSection && (
          <div className="px-4 py-8 text-center text-slate-400">
            <svg className="w-12 h-12 mx-auto mb-2 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-xs">
              Select a section to get content suggestions
            </p>
          </div>
        )}
        
      </div>
    </div>
  );
}

/**
 * AISectionSuggestionList Component
 * List of AI-suggested sections
 */
function AISectionSuggestionList({ suggestions, onApprove, onDismiss }) {
  return (
    <div className="space-y-3">
      {suggestions.map((suggestion) => (
        <AISectionSuggestionCard
          key={suggestion.id}
          suggestion={suggestion}
          onApprove={onApprove}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
}

/**
 * AISectionSuggestionCard Component
 * Individual AI section suggestion with approval controls
 */
function AISectionSuggestionCard({ suggestion, onApprove, onDismiss }) {
  return (
    <div className="border border-blue-200 bg-blue-50 rounded-lg p-3">
      {/* AI Label */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-xs font-bold text-blue-700 uppercase">AI-Generated Draft</span>
      </div>
      
      {/* Suggestion Details */}
      <h5 className="text-sm font-bold text-slate-900 mb-1">{suggestion.title}</h5>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-semibold px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
          {suggestion.sectionType}
        </span>
        {suggestion.isMandatory && (
          <span className="text-xs font-semibold px-2 py-0.5 bg-red-100 text-red-700 rounded">
            Mandatory
          </span>
        )}
      </div>
      <p className="text-xs text-slate-600 mb-3 leading-relaxed">
        {suggestion.rationale}
      </p>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onApprove(suggestion, false)}
          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Add Section
        </button>
        <button
          onClick={() => onApprove(suggestion, true)}
          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-white text-blue-600 border border-blue-300 rounded hover:bg-blue-50 transition-colors"
        >
          Edit & Add
        </button>
        <button
          onClick={() => onDismiss(suggestion.id)}
          className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
          title="Dismiss suggestion"
        >
          ×
        </button>
      </div>
    </div>
  );
}

/**
 * AIContentDraftCard Component
 * Individual AI content suggestion with insert/copy controls
 */
function AIContentDraftCard({ draft, section, onInsert, onCopy }) {
  return (
    <div className="border border-indigo-200 bg-indigo-50 rounded-lg p-3">
      {/* AI Label */}
      <div className="flex items-center gap-2 mb-2">
        <svg className="w-4 h-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
        <span className="text-xs font-bold text-indigo-700 uppercase">AI-Generated Draft</span>
      </div>
      
      {/* Draft Label */}
      <h6 className="text-xs font-bold text-slate-900 mb-2">{draft.label}</h6>
      
      {/* Draft Content Preview */}
      <div className="bg-white border border-indigo-200 rounded p-2 mb-3">
        <pre className="text-xs text-slate-700 whitespace-pre-wrap font-mono leading-relaxed">
          {draft.content}
        </pre>
      </div>
      
      {/* Action Buttons */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onInsert(section, draft)}
          className="flex-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
        >
          Insert into Editor
        </button>
        <button
          onClick={() => onCopy(draft)}
          className="px-3 py-1.5 text-xs font-semibold bg-white text-indigo-600 border border-indigo-300 rounded hover:bg-indigo-50 transition-colors"
          title="Copy to clipboard"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
