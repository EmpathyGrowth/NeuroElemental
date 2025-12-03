# Requirements Document

## Introduction

This specification addresses the comprehensive enhancement of the NeuroElemental platform's Content Management System (CMS), focusing on improving content editing experiences, standardizing WYSIWYG editor usage, enhancing admin panel usability, and ensuring consistent CRUD operations across all content types. The goal is to create a unified, user-friendly CMS that empowers non-technical administrators to manage all platform content effectively.

### Current State Analysis

**Dashboard Types Identified:**

- Admin Dashboard (full platform management)
- Instructor Dashboard (course creation and student management)
- Business Dashboard (organization management, B2B features)
- Student Dashboard (learning progress, achievements)
- User Dashboard (profile, settings, notifications)

**CMS Modules Currently Implemented:**

- Site Content (landing page sections with visual/JSON editing)
- FAQs (with RichTextEditor ✓)
- Announcements (with RichTextEditor ✓)
- Blog (with RichTextEditor ✓)
- Courses/Events (with RichTextEditor ✓)
- Email Templates (raw HTML only ✗)
- Content Blocks (JSON only ✗)
- Navigation (basic CRUD)
- Media Library (upload/delete)
- Theme Settings (color/typography customization)
- SEO Settings (per-page metadata)
- URL Redirects (basic CRUD)
- Contact Forms (basic builder, no drag-drop)
- Testimonials (list view only, incomplete CRUD)

**Standardized UI Patterns Found:**

- DataTable component with search, filters, pagination, bulk actions, export
- AdminPageShell/AdminPageHeader for consistent layout
- Dialog-based forms for simple content types
- Full-page editors for complex content (Blog, Courses)
- StatsCard/StatsCardGrid for dashboard metrics

**Gaps Identified:**

1. Content Blocks use JSON textarea instead of visual editors
2. Email Templates lack visual editing
3. Testimonials missing create/edit forms
4. No drag-and-drop for form builder or content reordering
5. No revision history system
6. Navigation lacks drag-drop reordering
7. Inconsistent modal dialog sizes (max-w-lg to max-w-4xl)

## Glossary

- **CMS**: Content Management System - the administrative interface for managing platform content
- **WYSIWYG**: What You See Is What You Get - a rich text editor that displays content as it will appear when published
- **Content Block**: A reusable piece of content that can be embedded across multiple pages
- **CRUD**: Create, Read, Update, Delete - the four basic operations for data management
- **Admin Panel**: The dashboard interface used by administrators to manage platform content
- **Rich Text Editor**: The TipTap-based editor component (`RichTextEditor`) used for formatted content
- **Content Type**: A category of content with specific fields and behaviors (e.g., Blog, FAQ, Course)
- **Modal Dialog**: A popup window used for creating or editing content inline
- **DataTable**: The standardized table component with search, filters, pagination, and bulk actions
- **AdminPageShell**: The layout wrapper component for admin pages providing consistent structure
- **B2B Dashboard**: Business-to-business features including organization management, API keys, SSO, and team management

## Requirements

### Requirement 1: WYSIWYG Editor Standardization

**User Story:** As a content administrator, I want consistent rich text editing across all content types, so that I can create formatted content without learning different interfaces.

#### Acceptance Criteria

1. WHEN an administrator edits content block text fields THEN the system SHALL display the RichTextEditor component instead of plain textarea or JSON input
2. WHEN an administrator edits email template HTML content THEN the system SHALL provide a visual editor option alongside the raw HTML editor
3. WHEN an administrator edits testimonial quotes THEN the system SHALL allow rich text formatting for emphasis and styling
4. WHEN an administrator edits course lesson content THEN the system SHALL provide the RichTextEditor for text-based lessons
5. WHEN the RichTextEditor saves content THEN the system SHALL sanitize HTML output using DOMPurify before storage

### Requirement 2: Content Block Visual Editor

**User Story:** As a content administrator, I want to edit content blocks visually, so that I can manage reusable content without writing JSON manually.

#### Acceptance Criteria

1. WHEN an administrator creates a content block of type "text" or "html" THEN the system SHALL display a RichTextEditor for the content field
2. WHEN an administrator creates a content block of type "cta" THEN the system SHALL display a structured form with fields for title, description, button text, and button URL
3. WHEN an administrator creates a content block of type "feature" THEN the system SHALL display a structured form with fields for icon, title, description, and optional link
4. WHEN an administrator creates a content block of type "testimonial" THEN the system SHALL display a structured form with fields for quote, author name, author role, and avatar
5. WHEN an administrator creates a content block of type "stats" THEN the system SHALL display a repeatable form for adding multiple stat items with value and label fields
6. WHEN an administrator creates a content block of type "gallery" THEN the system SHALL display a media picker for selecting multiple images with caption fields
7. WHEN an administrator switches between visual and JSON editing modes THEN the system SHALL preserve content integrity during the transition

### Requirement 3: Testimonials CMS Enhancement

**User Story:** As a marketing administrator, I want to manage testimonials through the CMS, so that I can add, edit, and feature customer success stories without developer assistance.

#### Acceptance Criteria

1. WHEN an administrator accesses the testimonials page THEN the system SHALL display a complete CRUD interface with create, edit, and delete capabilities
2. WHEN an administrator creates a testimonial THEN the system SHALL provide fields for name, role, quote (with RichTextEditor), element type, avatar upload, verification status, and display order
3. WHEN an administrator sets a testimonial as verified THEN the system SHALL display a verification badge on the public-facing testimonial
4. WHEN an administrator reorders testimonials THEN the system SHALL support drag-and-drop reordering with automatic display_order updates
5. WHEN an administrator filters testimonials THEN the system SHALL support filtering by element type, publication status, and verification status

### Requirement 4: Email Template Visual Editor

**User Story:** As a marketing administrator, I want to edit email templates visually, so that I can customize email communications without writing HTML code.

#### Acceptance Criteria

1. WHEN an administrator edits an email template THEN the system SHALL provide a split view with visual editor and HTML preview
2. WHEN an administrator uses the visual editor THEN the system SHALL support inserting template variables via a dropdown menu showing available variables
3. WHEN an administrator previews an email template THEN the system SHALL render the template with sample data for all variables
4. WHEN an administrator saves an email template THEN the system SHALL automatically generate a plain text version from the HTML content
5. WHEN an administrator tests an email template THEN the system SHALL provide a "Send Test Email" button that sends to a specified address

### Requirement 5: Unified Admin Dashboard Experience

**User Story:** As a platform administrator, I want a consistent admin interface across all content types, so that I can efficiently manage the platform without context-switching between different UI patterns.

#### Acceptance Criteria

1. WHEN an administrator views any content list THEN the system SHALL display a DataTable with consistent columns for status, created date, and actions
2. WHEN an administrator creates or edits content THEN the system SHALL use modal dialogs for simple content types and full-page editors for complex content types
3. WHEN an administrator performs bulk actions THEN the system SHALL support multi-select with bulk delete, publish, and unpublish operations
4. WHEN an administrator searches content THEN the system SHALL provide real-time search filtering across all visible columns
5. WHEN an administrator exports content THEN the system SHALL support CSV and JSON export formats for all content types

### Requirement 6: Course Content Editor Enhancement

**User Story:** As an instructor, I want a streamlined course content editor, so that I can create and organize course materials efficiently.

#### Acceptance Criteria

1. WHEN an instructor edits a lesson THEN the system SHALL provide the RichTextEditor for text content with media embedding support
2. WHEN an instructor adds a video lesson THEN the system SHALL support URL input for external videos and direct upload for hosted videos
3. WHEN an instructor reorders modules or lessons THEN the system SHALL support drag-and-drop reordering with visual feedback
4. WHEN an instructor previews a lesson THEN the system SHALL display the lesson as students will see it
5. WHEN an instructor duplicates a lesson or module THEN the system SHALL create a copy with "(Copy)" appended to the title

### Requirement 7: Media Library Integration

**User Story:** As a content administrator, I want integrated media management, so that I can easily insert images and files into any content type.

#### Acceptance Criteria

1. WHEN an administrator uses the RichTextEditor THEN the system SHALL provide a media picker button that opens the media library
2. WHEN an administrator selects media from the library THEN the system SHALL insert the media at the cursor position with appropriate HTML
3. WHEN an administrator uploads new media THEN the system SHALL support drag-and-drop upload directly into the editor
4. WHEN an administrator browses the media library THEN the system SHALL display thumbnails with file name, size, and upload date
5. WHEN an administrator searches the media library THEN the system SHALL filter by file name, type, and upload date range

### Requirement 8: Content Revision History

**User Story:** As a content administrator, I want to track content changes, so that I can review edit history and restore previous versions if needed.

#### Acceptance Criteria

1. WHEN an administrator saves content changes THEN the system SHALL create a revision record with timestamp, user, and content snapshot
2. WHEN an administrator views content history THEN the system SHALL display a list of revisions with date, author, and change summary
3. WHEN an administrator compares revisions THEN the system SHALL display a diff view highlighting changes between versions
4. WHEN an administrator restores a revision THEN the system SHALL replace current content with the selected revision and create a new revision record
5. WHEN the revision history exceeds 50 entries THEN the system SHALL archive older revisions while keeping the most recent 50 accessible

### Requirement 9: Form Builder Enhancement

**User Story:** As a marketing administrator, I want to create custom forms, so that I can collect specific information from users without developer assistance.

#### Acceptance Criteria

1. WHEN an administrator creates a form THEN the system SHALL provide a drag-and-drop form builder with field types including text, email, textarea, select, checkbox, and radio
2. WHEN an administrator configures a form field THEN the system SHALL support setting label, placeholder, required status, and validation rules
3. WHEN an administrator views form submissions THEN the system SHALL display submissions in a sortable, filterable table with export capability
4. WHEN an administrator configures form notifications THEN the system SHALL support email notifications to specified addresses on submission
5. WHEN an administrator embeds a form THEN the system SHALL provide an embed code or shortcode for use in content blocks

### Requirement 10: SEO and Metadata Management

**User Story:** As a marketing administrator, I want to manage SEO metadata for all content, so that I can optimize the platform for search engines.

#### Acceptance Criteria

1. WHEN an administrator edits any publishable content THEN the system SHALL display an SEO section with fields for meta title, meta description, and social image
2. WHEN an administrator leaves SEO fields empty THEN the system SHALL auto-generate metadata from content title and excerpt
3. WHEN an administrator previews SEO settings THEN the system SHALL display a preview of how the content will appear in search results and social shares
4. WHEN an administrator configures global SEO settings THEN the system SHALL support default meta tags, site verification codes, and structured data templates
5. WHEN the meta description exceeds 160 characters THEN the system SHALL display a warning indicator

### Requirement 11: Drag-and-Drop Content Ordering

**User Story:** As a content administrator, I want to reorder content items by dragging and dropping, so that I can quickly organize content without manually editing order numbers.

#### Acceptance Criteria

1. WHEN an administrator views navigation menu items THEN the system SHALL display drag handles for reordering items within a menu
2. WHEN an administrator drags a menu item to a new position THEN the system SHALL update display_order values for all affected items
3. WHEN an administrator views course modules or lessons THEN the system SHALL support drag-and-drop reordering with visual feedback
4. WHEN an administrator reorders FAQ items THEN the system SHALL persist the new order immediately via API
5. WHEN an administrator reorders testimonials THEN the system SHALL update display_order and reflect changes on the public site

### Requirement 12: Inline Content Editing

**User Story:** As a content administrator, I want to edit simple content inline without opening dialogs, so that I can make quick changes efficiently.

#### Acceptance Criteria

1. WHEN an administrator clicks on a text field in a data table THEN the system SHALL enable inline editing for that field
2. WHEN an administrator edits inline and presses Enter or clicks away THEN the system SHALL save the change automatically
3. WHEN an administrator edits inline and presses Escape THEN the system SHALL cancel the edit and restore the original value
4. WHEN inline editing fails THEN the system SHALL display an error toast and restore the original value
5. WHEN an administrator hovers over an editable field THEN the system SHALL display a subtle edit indicator

### Requirement 13: Dashboard Widget Customization

**User Story:** As a platform administrator, I want to customize my dashboard layout, so that I can prioritize the metrics and actions most relevant to my workflow.

#### Acceptance Criteria

1. WHEN an administrator accesses the admin overview THEN the system SHALL display configurable widget cards for key metrics
2. WHEN an administrator clicks "Customize Dashboard" THEN the system SHALL display a widget selection interface
3. WHEN an administrator drags widgets THEN the system SHALL allow repositioning within the dashboard grid
4. WHEN an administrator hides a widget THEN the system SHALL persist the preference and exclude it from the dashboard
5. WHEN an administrator resets dashboard layout THEN the system SHALL restore the default widget configuration

### Requirement 14: Bulk Content Operations

**User Story:** As a content administrator, I want to perform bulk operations on multiple content items, so that I can efficiently manage large amounts of content.

#### Acceptance Criteria

1. WHEN an administrator selects multiple items in any content list THEN the system SHALL display a bulk actions toolbar
2. WHEN an administrator selects "Bulk Publish" THEN the system SHALL publish all selected items and display a success count
3. WHEN an administrator selects "Bulk Unpublish" THEN the system SHALL unpublish all selected items and display a success count
4. WHEN an administrator selects "Bulk Delete" THEN the system SHALL display a confirmation dialog with the count of items to be deleted
5. WHEN an administrator selects "Bulk Export" THEN the system SHALL export selected items in the chosen format (CSV or JSON)

### Requirement 15: Content Scheduling

**User Story:** As a marketing administrator, I want to schedule content publication, so that I can prepare content in advance and have it go live at optimal times.

#### Acceptance Criteria

1. WHEN an administrator creates or edits publishable content THEN the system SHALL display a "Schedule Publication" option
2. WHEN an administrator sets a future publication date THEN the system SHALL mark the content as "Scheduled" with the target date visible
3. WHEN the scheduled time arrives THEN the system SHALL automatically publish the content without manual intervention
4. WHEN an administrator views scheduled content THEN the system SHALL display a countdown or scheduled date indicator
5. WHEN an administrator cancels a scheduled publication THEN the system SHALL return the content to draft status

### Requirement 16: Content Duplication

**User Story:** As a content administrator, I want to duplicate existing content, so that I can quickly create variations without starting from scratch.

#### Acceptance Criteria

1. WHEN an administrator views any content item THEN the system SHALL display a "Duplicate" action in the row actions menu
2. WHEN an administrator duplicates content THEN the system SHALL create a copy with "(Copy)" appended to the title
3. WHEN an administrator duplicates content THEN the system SHALL set the copy to draft status regardless of the original's status
4. WHEN an administrator duplicates a course THEN the system SHALL include all modules and lessons in the copy
5. WHEN an administrator duplicates an email template THEN the system SHALL generate a unique slug for the copy

### Requirement 17: Advanced Search and Filtering

**User Story:** As a content administrator, I want advanced search capabilities, so that I can quickly find specific content across all content types.

#### Acceptance Criteria

1. WHEN an administrator uses the global search THEN the system SHALL search across all content types (blogs, courses, events, FAQs, etc.)
2. WHEN an administrator filters by date range THEN the system SHALL display content created or modified within that range
3. WHEN an administrator filters by author THEN the system SHALL display content created by the selected user
4. WHEN an administrator saves a filter combination THEN the system SHALL persist it as a saved search for quick access
5. WHEN an administrator clears all filters THEN the system SHALL reset to the default unfiltered view

### Requirement 18: Content Analytics Integration

**User Story:** As a content administrator, I want to see content performance metrics, so that I can make data-driven decisions about content strategy.

#### Acceptance Criteria

1. WHEN an administrator views a blog post THEN the system SHALL display view count, read time, and engagement metrics
2. WHEN an administrator views a course THEN the system SHALL display enrollment count, completion rate, and average rating
3. WHEN an administrator views the content dashboard THEN the system SHALL display top-performing content by views and engagement
4. WHEN an administrator exports analytics THEN the system SHALL include performance metrics in the export
5. WHEN content has no analytics data THEN the system SHALL display placeholder text indicating data collection is pending

### Requirement 19: Multi-Language Content Support

**User Story:** As a content administrator, I want to manage content in multiple languages, so that I can serve an international audience.

#### Acceptance Criteria

1. WHEN an administrator creates content THEN the system SHALL allow specifying the content language
2. WHEN an administrator views content with translations THEN the system SHALL display a language switcher showing available translations
3. WHEN an administrator creates a translation THEN the system SHALL link it to the original content as a language variant
4. WHEN a user visits the site THEN the system SHALL display content in their preferred language if available
5. WHEN a translation is missing THEN the system SHALL fall back to the default language content

### Requirement 20: Accessibility Compliance

**User Story:** As a platform administrator, I want the CMS to enforce accessibility standards, so that all published content is accessible to users with disabilities.

#### Acceptance Criteria

1. WHEN an administrator uploads an image THEN the system SHALL require alt text before allowing the upload to complete
2. WHEN an administrator uses the RichTextEditor THEN the system SHALL provide heading level suggestions for proper document structure
3. WHEN an administrator previews content THEN the system SHALL display an accessibility score with improvement suggestions
4. WHEN content fails accessibility checks THEN the system SHALL display warnings but allow publication with acknowledgment
5. WHEN an administrator views the accessibility report THEN the system SHALL list all content items with accessibility issues
