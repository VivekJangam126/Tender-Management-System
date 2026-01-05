import { useState } from 'react';
import TenderDetailsForm from '../components/TenderDetailsForm';
import ContentBuilder from '../components/ContentBuilder';
import FinalReviewPanel from '../components/FinalReviewPanel';
import PublishStep from '../components/PublishStep';

/**
 * PART 1: Tender Creation Workflow Shell
 * 
 * This component owns all workflow state and enforces sequential navigation.
 * Child components are presentational and receive props for rendering.
 */
export default function TenderCreationPage() {
  // ============================================
  // CENTRALIZED STATE OWNERSHIP
  // ============================================
  
  // Current active step (1-5)
  const [currentStep, setCurrentStep] = useState(1);
  
  // Tender data object aligned with TENDER database schema
  const [tenderData, setTenderData] = useState({
    // Step 1 fields
    title: '',
    referenceId: '',
    description: '',
    category: '',
    submissionDeadline: '',
    authorityOrganizationId: 'ORG-AUTH-001', // Mock session value
    authorityOrganizationName: 'Government Authority Office', // Mock session value
    
    // System fields (managed by backend in real implementation)
    tenderId: null,
    status: 'DRAFT',
    createdAt: null,
    publishedAt: null,
  });
  
  // Sections array aligned with TENDER_SECTION database schema
  // Each section contains: sectionId, tenderId, title, sectionType, content, isMandatory, orderIndex
  const [sections, setSections] = useState([]);
  
  // AI Suggestions aligned with AI_INSIGHT conceptual schema
  // Each suggestion: suggestionId, linkedEntityType, linkedEntityId (sectionId), insightText, status, generatedAt
  const [aiSuggestions, setAISuggestions] = useState([]);
  
  // Validation state per step
  // Step 1: TenderDetailsForm validation
  // Step 2: ContentBuilder & AI Assistance validation (AI usage is optional)
  // Step 3: FinalReviewPanel validation
  // Step 4: PublishStep (no validation gate)
  const [validation, setValidation] = useState({
    step1: {
      isValid: false,
      errors: {
        title: null,
        description: null,
        category: null,
        submissionDeadline: null,
      },
    },
    step2: {
      isValid: false,
      errors: {
        missingMandatorySections: [],
        emptyMandatoryContent: [],
      },
    },
    step3: {
      isValid: false,
      blockingIssues: [],
      warnings: [],
      passedChecks: [],
      overriddenWarnings: [],
    },
    step4: { isValid: false },
  });
  
  // Modal states (for future use)
  const [modals, setModals] = useState({
    saveDraft: false,
    exitConfirm: false,
  });
  
  // Step definitions (fixed, non-editable)
  const STEPS = [
    { number: 1, label: 'Basic Details', subtitle: 'Basics & metadata' },
    { number: 2, label: 'Content Builder & AI Assistance', subtitle: 'Sections, editing & AI' },
    { number: 3, label: 'Final Review & Validation', subtitle: 'Validation & overrides' },
    { number: 4, label: 'Preview & Publish', subtitle: 'Final confirmation' },
  ];
  
  // ============================================
  // NAVIGATION CONTROL LOGIC
  // ============================================
  
  /**
   * Handles backward navigation
   * Rule: Always allowed, no restrictions
   */
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  /**
   * Handles forward navigation
   * Rule: Only allowed if current step is valid
   * Special rule for STEP 3: Check for blocking issues before allowing STEP 4
   */
  const handleNext = () => {
    const stepKey = `step${currentStep}`;
    
    // Special check: Cannot proceed to STEP 4 if blocking issues exist
    if (currentStep === 3 && validation.step3.blockingIssues.length > 0) {
      return; // Block progression
    }
    
    if (currentStep < 4 && validation[stepKey]?.isValid) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  /**
   * Handles step indicator click
   * Rule: Can only navigate backward to completed steps
   * Cannot jump forward
   */
  const handleStepClick = (stepNumber) => {
    // Only allow navigation to previous steps
    if (stepNumber < currentStep) {
      setCurrentStep(stepNumber);
    }
    // Future steps are disabled - do nothing
  };
  
  /**
   * Mock save draft handler
   * Always enabled, no validation required
   */
  const handleSaveDraft = () => {
    console.log('Save Draft clicked - Mock handler');
    console.log('Current state:', { currentStep, tenderData, sections, aiSuggestions, validation });
    // Future: Implement actual save logic
  };
  
  /**
   * Mock publish handler
   * Updates tender status to PUBLISHED (irreversible)
   * Logs audit entry
   */
  const handlePublish = (publishData) => {
    setTenderData((prev) => ({
      ...prev,
      ...publishData,
    }));
    
    console.log('[TENDER LIFECYCLE] Tender published - workflow locked', {
      timestamp: new Date().toISOString(),
      tenderTitle: tenderData.title,
      status: 'PUBLISHED',
      irreversible: true,
    });
  };
  
  // ============================================
  // BUTTON STATE LOGIC
  // ============================================
  
  const isBackDisabled = currentStep === 1 || tenderData.status === 'PUBLISHED';
  const stepKey = `step${currentStep}`;
  const isNextDisabled = 
    currentStep === 4 || 
    !validation[stepKey]?.isValid ||
    (currentStep === 3 && validation.step3.blockingIssues.length > 0) ||
    tenderData.status === 'PUBLISHED';
  
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-linear-to-r from-slate-900 to-slate-800 border-b border-slate-700 px-8 py-6 shadow-md">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-1">Create New Tender</h1>
          <p className="text-slate-300 text-sm">Complete the workflow to publish your tender for bidding</p>
        </div>
      </header>
      
      {/* Step Indicator */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />
      
      {/* Main Content Area */}
      <main className="flex-1 px-8 py-8 pb-24">
        <div className="max-w-5xl mx-auto">
          <StepContent
            currentStep={currentStep}
            tender={tenderData}
            setTender={setTenderData}
            sections={sections}
            setSections={setSections}
            aiSuggestions={aiSuggestions}
            setAISuggestions={setAISuggestions}
            validation={validation}
            setValidation={setValidation}
            onPublish={handlePublish}
          />
        </div>
      </main>
      
      {/* Footer Action Bar - Always Visible */}
      <FooterActionBar
        currentStep={currentStep}
        isBackDisabled={isBackDisabled}
        isNextDisabled={isNextDisabled}
        onBack={handleBack}
        onNext={handleNext}
        onSaveDraft={handleSaveDraft}
      />
    </div>
  );
}

/**
 * StepIndicator Component
 * Shows all 5 steps with proper visual states
 */
function StepIndicator({ steps, currentStep, onStepClick }) {
  return (
    <div className="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200 px-8 py-5 shadow-sm">
      <div className="max-w-5xl mx-auto">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between gap-3">
            {steps.map((step, index) => {
              const isCurrent = step.number === currentStep;
              const isCompleted = step.number < currentStep;
              const isFuture = step.number > currentStep;
              
              return (
                <li key={step.number} className="flex items-center flex-1 min-w-0">
                  {/* Step Circle and Label */}
                  <div className="flex flex-col items-center flex-1 text-center">
                    <button
                      onClick={() => onStepClick(step.number)}
                      disabled={isFuture}
                      className={`
                        w-11 h-11 rounded-full flex items-center justify-center font-semibold text-sm
                        transition-all duration-200 focus:outline-none focus:ring-4
                        ${isCurrent ? 'bg-blue-600 text-white ring-4 ring-blue-200 shadow-md' : ''}
                        ${isCompleted ? 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-200' : ''}
                        ${isFuture ? 'bg-slate-200 text-slate-500 cursor-not-allowed focus:ring-transparent' : ''}
                      `}
                      aria-current={isCurrent ? 'step' : undefined}
                      aria-label={`${step.label} ${step.subtitle}`}
                    >
                      {step.number}
                    </button>
                    <div className="mt-2 space-y-0.5">
                      <span
                        className={`
                          block text-sm font-semibold leading-tight truncate
                          ${isCurrent ? 'text-blue-700' : ''}
                          ${isCompleted ? 'text-green-700' : ''}
                          ${isFuture ? 'text-slate-500' : ''}
                        `}
                      >
                        {step.label}
                      </span>
                      <span className="block text-xs text-slate-500 leading-tight truncate max-w-40">
                        {step.subtitle}
                      </span>   
                    </div>
                  </div>
                  
                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={`
                        h-1 flex-1 mx-3 mb-10 rounded-full
                        ${isCompleted ? 'bg-green-600' : 'bg-slate-200'}
                      `}
                    />
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
}

/**
 * StepContent Component
 * Renders actual content for current step
 * Step 1: TenderDetailsForm (implemented)
 * Step 2: ContentBuilder & AI Assistance (implemented)
 * Step 3: FinalReviewPanel (implemented)
 * Step 4: PublishStep (implemented)
 */
function StepContent({
  currentStep,
  tender,
  setTender,
  sections,
  setSections,
  aiSuggestions,
  setAISuggestions,
  validation,
  setValidation,
  onPublish,
}) {
  // Step 1: Render TenderDetailsForm
  if (currentStep === 1) {
    return (
      <TenderDetailsForm
        tender={tender}
        setTender={setTender}
        setValidation={setValidation}
      />
    );
  }
  
  // Step 2: Render ContentBuilder with AI Assistance
  if (currentStep === 2) {
    return (
      <ContentBuilder
        tender={tender}
        sections={sections}
        setSections={setSections}
        setValidation={setValidation}
      />
    );
  }
  
  // Step 3: Render FinalReviewPanel
  if (currentStep === 3) {
    return (
      <FinalReviewPanel
        tender={tender}
        sections={sections}
        setValidation={setValidation}
      />
    );
  }
  
  // Step 4: Render PublishStep
  if (currentStep === 4) {
    return (
      <PublishStep
        tender={tender}
        sections={sections}
        onPublish={onPublish}
      />
    );
  }
  
  return null;
}

/**
 * FooterActionBar Component
 * Persistent action bar with Save Draft, Back, and Next buttons
 * Button states are controlled by parent component props
 */
function FooterActionBar({
  currentStep,
  isBackDisabled,
  isNextDisabled,
  onBack,
  onNext,
  onSaveDraft,
}) {
  return (
    <footer className="sticky bottom-0 z-30 bg-white/90 backdrop-blur border-t border-slate-200 px-8 py-4 shadow-lg ">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Save Draft */}
        <button
          onClick={onSaveDraft}
          className="h-11 px-4 text-sm font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-200"
        >
          Save Draft
        </button>
        
        {/* Right: Back and Next */}
        <div className="flex items-center gap-3">
          {/* Back Button */}
          <button
            onClick={onBack}
            disabled={isBackDisabled}
            className={`
              h-11 px-6 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2
              ${
                isBackDisabled
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed focus:ring-transparent'
                  : 'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-blue-200'
              }
            `}
          >
            Back
          </button>
          
          {/* Next Button */}
          <button
            onClick={onNext}
            disabled={isNextDisabled}
            className={`
              h-11 px-6 text-sm font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2
              ${
                isNextDisabled
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed focus:ring-transparent'
                  : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-200 shadow-sm'
              }
            `}
          >
            {currentStep === 4 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </footer>
  );
}
