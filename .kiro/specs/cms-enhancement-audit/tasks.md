´0++++++0ntation Plan

- [x] 1. Set up foundation and shared components
  - [x] 1.1 Create DragDropList component with @dnd-kit/core
    - Implement reusable drag-and-drop list component

    - Support drag handles, visual feedback, and reorder callbacks

    - _Requirements: 11.1, 11.2, 11.3_

  - [x] 1.2 Write property test for drag-drop order persistence
    - **Property 4: Drag-Drop Reorder Persistence**
    - **Validates: Requirements 3.4, 11.2, 11.4, 11.5**

  - [x] 1.3 Create InlineEditCell component for DataTable
    - Implement inline editing with Enter to save, Escape to cancel

    - Handle API errors with rollback
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 1.4 Write property tests for inline edit behavior
    - **Property 18: Inline Edit Save on Confirm**
    - **Property 19: Inline Edit Cancel on Escape**

    - **Validates: Requirements 12.2, 12.3**

- [x] 2. Implement BlockContentEditor visual editors
  - [x] 2.1 Create BlockContentEditor wrapper component
    - Route to type-specific editors based on block_type
    - Support visual/JSON toggle mode
    - _Requirements: 2.1, 2.7_

  - [x] 2.2 Create TextBlockEditor with RichTextEditor
    - Implement text/html block editing with RichTextEditor
    - _Requirements: 1.1, 2.1_

  - [x] 2.3 Create CTABlockEditor with structured form
    - Fields: title, description, buttonText, buttonUrl, buttonVariant, backgroundImage
    - Integrate MediaPicker for background image
    - _Requirements: 2.2_

  - [x] 2.4 Create FeatureBlockEditor with icon picker
    - Fields: icon, title, description, link, linkText
    - _Requirements: 2.3_

  - [x] 2.5 Create TestimonialBlockEditor
    - Fields: quote (RichTextEditor), authorName, authorRole, authorAvatar, rating
    - _Requirements: 2.4_

  - [x] 2.6 Create StatsBlockEditor with repeatable items
    - Support adding/removing stat items with value, label, prefix, suffix
    - _Requirements: 2.5_

  - [x] 2.7 Create GalleryBlockEditor with multi-image picker
    - Integrate MediaPicker for multiple image selection
    - Support captions and layout options
    - _Requirements: 2.6_

  - [x] 2.8 Write property test for visual-JSON round trip
    - **Property 2: Visual-JSON Editor Round Trip Consistency**
    - **Validates: Requirements 2.7**

  - [x] 2.9 Write property test for block type editor mapping
    - **Property 3: Block Type Editor Mapping**
    - **Validates: Requirements 2.1-2.6**

  - [x] 2.10 Update content blocks page to use BlockContentEditor
    - Replace JSON textarea with BlockContentEditor component
    - _Requirements: 1.1, 2.1_

- [x] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Enhance Testimonials CMS
  - [x] 4.1 Create TestimonialForm component
    - Full form with RichTextEditor for quote field
    - Fields: name, role, quote, element, avatar, is_published, is_verified, display_order
    - _Requirements: 3.1, 3.2, 1.3_

  - [x] 4.2 Update testimonials admin page with full CRUD
    - Add create dialog with TestimonialForm
    - Add edit functionality
    - Add drag-drop reordering using DragDropList
    - _Requirements: 3.1, 3.3, 3.4_

  - [x] 4.3 Add testimonial filters
    - Filter by element type, publication status, verification status
    - _Requirements: 3.5_

  - [x] 4.4 Write property test for testimonial filters
    - **Property 5: Filter Results Subset**
    - **Validates: Requirements 3.5**

  - [x] 4.5 Create admin API routes for testimonials CRUD
    - POST /api/admin/testimonials - create
    - PATCH /api/admin/testimonials/[id] - update
    - DELETE /api/admin/testimonials/[id] - delete
    - PATCH /api/admin/testimonials/reorder - bulk reorder
    - _Requirements: 3.1, 3.4_

- [x] 5. Implement Email Template Visual Editor
  - [x] 5.1 Create EmailTemplateEditor component
    - Split view with visual editor and HTML preview
    - Variable insertion dropdown
    - _Requirements: 4.1, 4.2_

  - [x] 5.2 Create VariableInserter component
    - Dropdown showing available template variables
    - Insert at cursor position in editor
    - _Requirements: 4.2_

  - [x] 5.3 Implement template preview with sample data
    - Render template with variable substitution
    - _Requirements: 4.3_

  - [x] 5.4 Write property test for variable substitution
    - **Property 6: Email Template Variable Substitution**
    - **Validates: Requirements 4.3**

  - [x] 5.5 Implement auto-generate plain text from HTML
    - Strip HTML tags, preserve links as URLs
    - _Requirements: 4.4_
  - [x] 5.6 Write property test for HTML to plain text conversion
    - **Property 7: HTML to Plain Text Conversion**
    - **Validates: Requirements 4.4**

  - [x] 5.7 Add "Send Test Email" functionality
    - API endpoint and UI button
    - _Requirements: 4.5_

  - [x] 5.8 Update email templates page to use EmailTemplateEditor
    - Replace raw HTML textarea with visual editor
    - _Requirements: 4.1_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Implement Content Revision System
  - [x] 7.1 Create content_revisions database migration
    - Create table with entity_type, entity_id, content_snapshot, changed_fields, created_by
    - Add indexes for efficient lookups
    - _Requirements: 8.1_

  - [x] 7.2 Create revision service functions
    - createRevision(entityType, entityId, content, userId)
    - getRevisions(entityType, entityId, limit)
    - restoreRevision(revisionId)
    - archiveOldRevisions(entityType, entityId)
    - _Requirements: 8.1, 8.4, 8.5_

  - [x] 7.3 Write property test for revision creation
    - **Property 12: Revision Creation on Save**
    - **Validates: Requirements 8.1**

  - [x] 7.4 Write property test for revision restore
    - **Property 13: Revision Restore Creates New Revision**
    - **Validates: Requirements 8.4**

  - [x] 7.5 Write property test for revision limit
    - **Property 14: Revision Limit Enforcement**
    - **Validates: Requirements 8.5**

  - [x] 7.6 Create ContentRevisionHistory component
    - Display revision list with date, author, change summary
    - Diff view for comparing revisions
    - Restore button with confirmation
    - _Requirements: 8.2, 8.3, 8.4_

  - [x] 7.7 Create revision API routes
    - GET /api/admin/revisions?entityType=&entityId= - list revisions
    - POST /api/admin/revisions/restore/[id] - restore revision
    - _Requirements: 8.2, 8.4_

  - [x] 7.8 Integrate revision tracking into blog post saves
    - Call createRevision on blog post update
    - Add revision history panel to blog edit page
    - _Requirements: 8.1_

  - [x] 7.9 Integrate revision tracking into FAQ saves
    - Call createRevision on FAQ update
    - _Requirements: 8.1_

- [x] 8. Enhance SEO Management

- [ ] 8. Enhance SEO Management
  - [x] 8.1 Create SEOFieldsSection component
    - Fields: meta_title, meta_description, social_image
    - Character count with warning for description > 160
    - _Requirements: 10.1, 10.5_

  - [x] 8.2 Write property test for meta description warning
    - **Property 17: Meta Description Length Warning**
    - **Validates: Requirements 10.5**

  - [x] 8.3 Implement SEO auto-generation
    - Auto-generate from title and excerpt when fields empty
    - _Requirements: 10.2_

  - [x] 8.4 Write property test for SEO auto-generation
    - **Property 16: SEO Auto-Generation**
    - **Validates: Requirements 10.2**

  - [x] 8.5 Create SEO preview component
    - Show Google search result preview
    - Show social share preview (Open Graph)
    - _Requirements: 10.3_

  - [x] 8.6 Add SEOFieldsSection to blog post editor
    - _Requirements: 10.1_

  - [x] 8.7 Add SEOFieldsSection to course editor
    - _Requirements: 10.1_

  - [x] 8.8 Add SEOFieldsSection to event editor
    - _Requirements: 10.1_

- [x] 9. Checkpoint - Ensure all tests pass

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 10. Implement Bulk Operations
  - [x] 10.1 Enhance DataTable with bulk action toolbar
    - Show toolbar when items selected
    - Display selected count
    - _Requirements: 14.1_

  - [x] 10.2 Write property test for bulk action visibility
    - **Property 20: Bulk Action Selection Visibility**
    - **Validates: Requirements 14.1**

  - [x] 10.3 Implement bulk publish/unpublish operations
    - API endpoint for bulk status update
    - Success count reporting
    - _Requirements: 14.2, 14.3_

  - [x] 10.4 Write property test for bulk operation completeness
    - **Property 21: Bulk Operation Completeness**
    - **Validates: Requirements 14.2, 14.3, 14.4**

  - [x] 10.5 Implement bulk delete with confirmation
    - Confirmation dialog showing count
    - _Requirements: 14.4_

  - [x] 10.6 Implement bulk export
    - Export selected items to CSV or JSON
    - _Requirements: 14.5_

  - [x] 10.7 Write property test for export format validity
    - **Property 10: Export Format Validity**
    - **Validates: Requirements 5.5**

- [x] 11. Implement Content Duplication
  - [x] 11.1 Create duplicateContent service function
    - Copy content with "(Copy)" suffix
    - Set status to draft
    - Generate unique slug
    - _Requirements: 16.2, 16.3, 16.5_

  - [x] 11.2 Write property test for duplication naming
    - **Property 22: Content Duplication Naming**
    - **Validates: Requirements 16.2, 16.3**

  - [x] 11.3 Write property test for duplicate slug uniqueness
    - **Property 24: Duplicate Slug Uniqueness**
    - **Validates: Requirements 16.5**

  - [x] 11.4 Implement course duplication with nested content
    - Duplicate modules and lessons
    - Preserve order and relationships
    - _Requirements: 16.4_

  - [x] 11.5 Write property test for course duplication completeness
    - **Property 23: Course Duplication Completeness**
    - **Validates: Requirements 16.4**

  - [x] 11.6 Add duplicate action to blog posts
    - Row action in DataTable
    - _Requirements: 16.1_

  - [x] 11.7 Add duplicate action to courses
    - _Requirements: 16.1_

  - [x] 11.8 Add duplicate action to email templates
    - _Requirements: 16.1_

-

- [x] 12. Enhance HTML Sanitization
  - [x] 12.1 Create sanitizeHtml utility function
    - Use DOMPurify with safe configuration
    - Preserve formatting, remove XSS vectors
    - _Requirements: 1.5_

  - [x] 12.2 Write property test for HTML sanitization
    - **Property 1: HTML Sanitization Preserves Safe Content**
    - **Validates: Requirements 1.5**

  - [x] 12.3 Integrate sanitization into RichTextEditor onChange
    - Sanitize before passing to parent
    - _Requirements: 1.5_

- [x] 13. Enhance Media Library Integration
  - [x] 13.1 Add media picker button to RichTextEditor toolbar
    - Open MediaPicker dialog
    - _Requirements: 7.1_

  - [x] 13.2 Implement media insertion at cursor
    - Generate appropriate HTML for image/video
    - _Requirements: 7.2_

  - [x] 13.3 Write property test for media insertion HTML
    - **Property 11: Media Insertion HTML Correctness**
    - **Validates: Requirements 7.2**

  - [x] 13.4 Add drag-drop upload to RichTextEditor
    - Handle file drop, upload, and insert
    - _Requirements: 7.3_

  - [x] 13.5 Enhance media library search
    - Filter by name, type, date range
    - _Requirements: 7.5_

- [x] 14. Implement Accessibility Features
  - [x] 14.1 Add alt text requirement to image upload
    - Validate non-empty alt text before upload
    - _Requirements: 20.1_

  - [x] 14.2 Write property test for alt text requirement
    - **Property 25: Image Upload Alt Text Requirement**
    - **Validates: Requirements 20.1**

  - [x] 14.3 Add heading level suggestions to RichTextEditor
    - Suggest proper heading hierarchy
    - _Requirements: 20.2_

- [x] 15. Update Navigation Management
  - [x] 15.1 Add drag-drop reordering to navigation items
    - Use DragDropList component
    - Persist order via API
    - _Requirements: 11.1, 11.2_

  - [x] 15.2 Add drag-drop reordering to FAQ items
    - _Requirements: 11.4_

- [x] 16. Enhance Course Content Editor
  - [x] 16.1 Add drag-drop reordering to modules
    - _Requirements: 6.3, 11.3_

  - [x] 16.2 Add drag-drop reordering to lessons within modules
    - _Requirements: 6.3, 11.3_

  - [x] 16.3 Add lesson preview mode
    - Show lesson as students see it
    - _Requirements: 6.4_

  - [x] 16.4 Add lesson/module duplication
    - _Requirements: 6.5_

- [x] 17. Final Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.
