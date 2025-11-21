## Hi there 👋

Welcome to my portfolio projects. Two full-stack apps demonstrating API integration, mapping UX, and CRUD systems. Built with vanilla JS + PHP micro-services + SQL, focused on clean UI and practical architecture.

📘 README — Gazetteer
Overview

Gazetteer is an interactive world-exploration tool that allows users to view geolocation data, country information, weather, news, and points of interest. It integrates multiple APIs through PHP micro-endpoints and presents the results on a dynamic Leaflet map.

Features

Interactive global map using Leaflet with marker clustering and custom POI icons

Forward & reverse geocoding via OpenCage

Places search using Google Places (landmarks, airports, universities, parks, etc.)

Country metadata including population, languages, borders, currency, and flags

Current and forecast weather from WeatherAPI (or equivalent)

Local news feed filtered by country

User geolocation via browser Geolocation API

Bootstrap UI for modals, information panels, and utility controls

No build process — runs on vanilla JavaScript, PHP micro-services, and static assets

Tech Stack

Languages: JavaScript (ES2015+), HTML5, CSS3
UI: Bootstrap, jQuery
Mapping: Leaflet, leaflet.markercluster, Leaflet.EasyButton
Basemaps: Esri ArcGIS (World Street Map, World Imagery)
Icons: Font Awesome
APIs (via PHP proxies): OpenCage, Google Places, Weather API, REST Countries, News API, Currency API
Backend: PHP micro-endpoints
Assets: Custom PNG markers

How It Works

All third-party API requests are routed through lightweight PHP proxy endpoints (geocode.php, news_proxy.php, etc.) to ensure security and prevent exposing API keys. The client-side app fetches structured JSON responses and renders the results on the map and UI components.

Project Goals

Provide an accessible, map-driven interface for exploring any location on Earth with contextual data, news, weather, and points of interest.


------------------------------------------


📘 README — Company Directory
Overview

Company Directory is a full-stack CRUD management system for maintaining personnel, department, and location records. It provides a responsive, Bootstrap-based interface paired with PHP endpoints and a SQL database.

Features

Full CRUD support for Personnel, Departments, and Locations

Bootstrap modals for create/edit operations

Debounced search across all fields

Dynamic table rendering using vanilla JavaScript + DOM APIs

jQuery AJAX for all data operations

In-memory state for filters and UI behavior

Event delegation for efficient UI interactions

Tech Stack

Languages: JavaScript (ES2015+), HTML5, CSS3
UI: Bootstrap (modals, tabs), jQuery
Icons: Font Awesome
Backend: PHP endpoints under /libs/php/
Database: SQL (personnel, departments, locations tables)

Backend API

Read:

getAll.php, listDepartments.php, listLocationsJSON.php,

getPersonnelByID.php, getDepartmentByID.php, getLocation.php, searchAll.php

Write:

savePersonnel.php, saveDepartment.php, saveLocation.php

Delete:

deletePersonnel.php, deleteDepartmentByID.php, deleteLocation.php

How It Works

The frontend uses Bootstrap components and jQuery events to drive all UI interactions. CRUD actions submit serialized form data via AJAX to PHP endpoints, which interact with the SQL database and return JSON responses. The results are rendered using dynamic DOM building without any frontend frameworks.

Project Goals

Provide a clean, efficient admin-style interface for managing company data using a lightweight vanilla JS + PHP stack.

------------------------

These projects were designed as part of the ITCareerSwitch Full Stack Coding Engineer course.
