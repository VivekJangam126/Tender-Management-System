import { useEffect } from 'react';

/**
 * STEP 1: Basic Tender Details Form
 * 
 * Maps to TENDER database schema:
 * - title (string, REQUIRED)
 * - referenceId (string, OPTIONAL)
 * - description (string, REQUIRED)
 * - category (string, REQUIRED)
 * - submissionDeadline (date, REQUIRED, must be future)
 * - authorityOrganizationId (READ-ONLY from session)
 * 
 * This component does NOT control navigation.
 * It only updates tender data and validation state.
 */
export default function TenderDetailsForm({ tender, setTender, setValidation }) {
  
  // ============================================
  // VALIDATION LOGIC
  // ============================================
  
  /**
   * Validates all required fields and returns validation state
   * Runs after every field change
   */
  useEffect(() => {
    const errors = {
      title: null,
      description: null,
      category: null,
      submissionDeadline: null,
    };
    
    let isValid = true;
    
    // Validate Title (REQUIRED)
    if (!tender.title || tender.title.trim() === '') {
      errors.title = 'Tender title is required';
      isValid = false;
    }
    
    // Validate Description (REQUIRED)
    if (!tender.description || tender.description.trim() === '') {
      errors.description = 'Description is required';
      isValid = false;
    }
    
    // Validate Category (REQUIRED)
    if (!tender.category || tender.category === '') {
      errors.category = 'Category selection is required';
      isValid = false;
    }
    
    // Validate Submission Deadline (REQUIRED, must be future date)
    if (!tender.submissionDeadline || tender.submissionDeadline === '') {
      errors.submissionDeadline = 'Submission deadline is required';
      isValid = false;
    } else {
      // Check if date is in the future
      const selectedDate = new Date(tender.submissionDeadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset time to compare dates only
      
      if (selectedDate < today) {
        errors.submissionDeadline = 'Submission deadline must be a future date';
        isValid = false;
      }
    }
    
    // Update parent validation state
    setValidation((prev) => ({
      ...prev,
      step1: {
        isValid,
        errors,
      },
    }));
  }, [tender, setValidation]);
  
  // ============================================
  // FIELD CHANGE HANDLERS
  // ============================================
  
  /**
   * Generic handler for text inputs
   * Maps to: title, referenceId, description
   */
  const handleFieldChange = (field, value) => {
    setTender((prev) => ({
      ...prev,
      [field]: value,
    }));
  };
  
  // ============================================
  // CATEGORY OPTIONS
  // ============================================
  
  // Mock category options aligned with government tender domains
  const CATEGORY_OPTIONS = [
    { value: '', label: 'Select a category' },
    { value: 'infrastructure', label: 'Infrastructure & Construction' },
    { value: 'healthcare', label: 'Healthcare & Medical Equipment' },
    { value: 'education', label: 'Education & Training' },
    { value: 'it', label: 'Information Technology' },
    { value: 'agriculture', label: 'Agriculture & Rural Development' },
    { value: 'transport', label: 'Transport & Logistics' },
    { value: 'energy', label: 'Energy & Power' },
    { value: 'environment', label: 'Environment & Sanitation' },
    { value: 'security', label: 'Security & Defense' },
    { value: 'other', label: 'Other' },
  ];
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="w-full max-w-5xl mx-auto py-6 px-4">
      <div className="card">
        {/* Header Section */}
        <div className="px-6 md:px-8 py-6 border-b border-gray-200">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">
            Basic Tender Details
          </h2>
          <p className="text-sm text-gray-600">
            Define the core information about your tender
          </p>
        </div>
        
        {/* Form Section */}
        <div className="px-6 md:px-8 py-6">
          <form className="space-y-6">
          
          {/* Tender Title - REQUIRED */}
          <FormField
            label="Tender Title"
            required
            error={getFieldError('title', tender.title)}
          >
            <input
              type="text"
              value={tender.title || ''}
              onChange={(e) => handleFieldChange('title', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
              placeholder="Enter the tender title"
            />
          </FormField>
          
          {/* Reference ID - OPTIONAL */}
          <FormField
            label="Reference ID"
            required={false}
            helpText="Optional unique identifier for tracking"
          >
            <input
              type="text"
              value={tender.referenceId || ''}
              onChange={(e) => handleFieldChange('referenceId', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-900 placeholder-gray-400 transition-all duration-200"
              placeholder="e.g., TND-2026-001"
            />
          </FormField>
          
          {/* Short Description - REQUIRED */}
          <FormField
            label="Short Description"
            required
            error={getFieldError('description', tender.description)}
          >
            <textarea
              value={tender.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-900 placeholder-gray-400 resize-none transition-all duration-200"
              placeholder="Provide a brief overview of the tender requirements"
            />
          </FormField>
          
          {/* Category / Domain - REQUIRED */}
          <FormField
            label="Category / Domain"
            required
            error={getFieldError('category', tender.category)}
          >
            <select
              value={tender.category || ''}
              onChange={(e) => handleFieldChange('category', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-900 transition-all duration-200 cursor-pointer"
            >
              {CATEGORY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </FormField>
          
          {/* Submission Deadline - REQUIRED */}
          <FormField
            label="Submission Deadline"
            required
            error={getFieldError('submissionDeadline', tender.submissionDeadline)}
          >
            <input
              type="date"
              value={tender.submissionDeadline || ''}
              onChange={(e) => handleFieldChange('submissionDeadline', e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 bg-white text-gray-900 transition-all duration-200 cursor-pointer"
              placeholder="dd-mm-yyyy"
            />
          </FormField>
          
          {/* Authority Organization - READ-ONLY */}
          <FormField
            label="Authority Organization"
            required={false}
            helpText="This is determined by your logged-in session"
          >
            <input
              type="text"
              value={tender.authorityOrganizationName || 'Loading...'}
              disabled
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-gray-600 cursor-not-allowed font-medium"
            />
          </FormField>
          
          </form>
        </div>
      </div>
    </div>
  );
  
  /**
   * Helper: Get field error only if field has been touched
   * Prevents showing errors on pristine fields
   */
  function getFieldError(fieldName, fieldValue) {
    // Show error only if user has interacted with the field
    // A field is considered "touched" if it has any value or was previously filled
    const isTouched = fieldValue !== undefined && fieldValue !== null;
    
    if (!isTouched) return null;
    
    // Return the error from validation
    // This will be populated by useEffect validation logic
    return null; // Errors are shown via validation object in parent
  }
}

/**
 * Reusable FormField Wrapper Component
 * Handles label, required indicator, error display, and help text
 */
function FormField({ label, required, error, helpText, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </label>
      
      <div className="mb-2">
        {children}
      </div>
      
      {/* Error Message */}
      {error && (
        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1.5">
          <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {/* Help Text */}
      {helpText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">
          {helpText}
        </p>
      )}
    </div>
  );
}
