package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type HealthResponse struct {
	Status    string `json:"status"`
	Service   string `json:"service"`
	Timestamp string `json:"timestamp"`
	Version   string `json:"version"`
}

type APIResponse struct {
	Message   string      `json:"message"`
	Service   string      `json:"service"`
	Data      interface{} `json:"data,omitempty"`
	Timestamp string      `json:"timestamp"`
}

func healthHandler(w http.ResponseWriter, r *http.Request) {
	response := HealthResponse{
		Status:    "healthy",
		Service:   "core-engine",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Version:   "1.0.0-demo",
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func homeHandler(w http.ResponseWriter, r *http.Request) {
	response := APIResponse{
		Message:   "SirsiNexus Core Engine - Demo Version",
		Service:   "core-engine",
		Timestamp: time.Now().UTC().Format(time.RFC3339),
		Data: map[string]interface{}{
			"version":   "1.0.0-demo",
			"endpoints": []string{"/health", "/api/users", "/api/catalog", "/api/transactions"},
			"status":    "running",
		},
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func usersHandler(w http.ResponseWriter, r *http.Request) {
	users := []map[string]interface{}{
		{"id": 1, "name": "Alice Johnson", "role": "Administrator", "active": true},
		{"id": 2, "name": "Bob Smith", "role": "Librarian", "active": true},
		{"id": 3, "name": "Carol Davis", "role": "Member", "active": true},
	}
	
	response := APIResponse{
		Message:   "Users retrieved successfully",
		Service:   "core-engine",
		Data:      users,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func catalogHandler(w http.ResponseWriter, r *http.Request) {
	books := []map[string]interface{}{
		{"isbn": "978-0-123456-78-9", "title": "Advanced Library Management", "author": "Dr. Sarah Wilson", "available": 5},
		{"isbn": "978-1-234567-89-0", "title": "Digital Transformation", "author": "Prof. Michael Chen", "available": 3},
		{"isbn": "978-2-345678-90-1", "title": "Modern Cataloging", "author": "Linda Rodriguez", "available": 7},
	}
	
	response := APIResponse{
		Message:   "Catalog retrieved successfully",
		Service:   "core-engine",
		Data:      books,
		Timestamp: time.Now().UTC().Format(time.RFC3339),
	}
	
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func main() {
	http.HandleFunc("/", homeHandler)
	http.HandleFunc("/health", healthHandler)
	http.HandleFunc("/api/users", usersHandler)
	http.HandleFunc("/api/catalog", catalogHandler)
	
	fmt.Println("🚀 SirsiNexus Core Engine starting on port 8080...")
	fmt.Println("📚 Demo mode - Library Management Platform")
	
	log.Fatal(http.ListenAndServe(":8080", nil))
}
