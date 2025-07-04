# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.3] - 2025-07-03

### Fixed
- **Form Validation System**: Fixed FormMessage component to properly display react-hook-form validation errors
- **Form State Management**: Added FormProvider wrapper to all form components (CreateProject, EditProject, TaskDialogs)
- **Input Warnings**: Resolved uncontrolled-to-controlled input warnings by adding proper default values
- **DOM Nesting**: Fixed DOM nesting warnings in Dialog components using asChild pattern
- **Select Components**: Resolved empty value props issues in Projects filter Select components
- **React Warnings**: Eliminated React prop spreading warnings by removing form object spreading
- **Test Infrastructure**: Enhanced global test setup with improved fetch mocking and API responses
- **Console Noise**: Added console warning suppression for cleaner test output

### Added
- Comprehensive test setup with `setupTests.ts` for better test reliability
- Proper error handling and display in form validation across all components
- Enhanced form component architecture with proper react-hook-form integration

### Changed
- **Test Results**: Improved from 79.8% to 93.3% test pass rate (97/104 tests passing)
- **Test Failures**: Reduced from 21 failed tests to only 7 failed tests
- Improved test selectors and interaction patterns for better reliability
- Enhanced form validation user experience with proper error messages

## [0.4.2] - 2025-07-03

### Fixed
- Updated body background to match sidebar glass styling for cohesive design
- Body now uses `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(30px) saturate(300%)`
- Resolved webpack module error by clearing corrupted build cache
- Server compatibility with port 3005 when port 3000 is occupied

### Changed
- Unified glass morphism background treatment between body and sidebar components
- Enhanced visual consistency across the application interface

## [0.4.1] - 2025-07-03

### Fixed
- TabsList z-index issues in analytics section covering up elements when selected
- Opaque white overlay hiding tab names in TabsTrigger components
- Glow effect background z-index conflicts with tab elements

### Changed
- Refined TabsTrigger component active state styling
- Replaced broken gradient-primary class with proper Tailwind gradient classes
- Added relative z-index values on tab triggers for proper layering
- Implemented simplified dark background with single background layer
- Updated CSS to avoid JSX complexity and maintain project stability

### Added
- Subtle glass-style foreground card styling
- Proper contrast enhancement without overbearing glow effects
- Professional single background layer system for better design consistency
