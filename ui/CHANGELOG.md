# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
