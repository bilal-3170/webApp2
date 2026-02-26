/**
 * Image Text Extractor - Client-side JavaScript
 * Handles file upload, drag-and-drop, API communication, and UI updates
 */

// ===========================
// DOM Elements
// ===========================
const dropZone = document.getElementById('dropZone');
const imageInput = document.getElementById('imageInput');
const previewSection = document.getElementById('previewSection');
const imagePreview = document.getElementById('imagePreview');
const fileName = document.getElementById('fileName');
const removeBtn = document.getElementById('removeBtn');
const extractBtn = document.getElementById('extractBtn');
const btnText = document.getElementById('btnText');
const loader = document.getElementById('loader');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const resultsSection = document.getElementById('resultsSection');
const resultsContent = document.getElementById('resultsContent');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');

// ===========================
// State Management
// ===========================
let selectedFile = null;

// ===========================
// Event Listeners
// ===========================

// File input change event
imageInput.addEventListener('change', handleFileSelect);

// Drag and drop events
dropZone.addEventListener('dragover', handleDragOver);
dropZone.addEventListener('dragleave', handleDragLeave);
dropZone.addEventListener('drop', handleDrop);

// Remove button
removeBtn.addEventListener('click', resetUpload);

// Extract button
extractBtn.addEventListener('click', extractTextFromImage);

// Copy button
copyBtn.addEventListener('click', copyToClipboard);

// ===========================
// File Handling Functions
// ===========================

/**
 * Handle file selection from file input
 */
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

/**
 * Handle drag over event
 */
function handleDragOver(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('drag-over');
}

/**
 * Handle drop event for drag and drop
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    dropZone.classList.remove('drag-over');

    const files = event.dataTransfer.files;
    if (files.length > 0) {
        processFile(files[0]);
    }
}

/**
 * Process and validate the selected file
 */
function processFile(file) {
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
        showError('Invalid file type. Please upload a JPG, JPEG, or PNG image.');
        return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
        showError('File size too large. Maximum size is 10MB.');
        return;
    }

    selectedFile = file;
    displayPreview(file);
    hideError();
}

/**
 * Display image preview
 */
function displayPreview(file) {
    const reader = new FileReader();
    
    reader.onload = function(e) {
        imagePreview.src = e.target.result;
        fileName.textContent = file.name;
        
        // Hide upload area and show preview
        dropZone.style.display = 'none';
        previewSection.style.display = 'block';
        resultsSection.style.display = 'none';
        extractBtn.disabled = false;
    };
    
    reader.readAsDataURL(file);
}

/**
 * Reset upload and return to initial state
 */
function resetUpload() {
    selectedFile = null;
    imageInput.value = '';
    imagePreview.src = '';
    fileName.textContent = '';
    
    // Show upload area and hide other sections
    dropZone.style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    extractBtn.disabled = true;
    hideError();
}

// ===========================
// API Communication
// ===========================

/**
 * Extract text from image using Gemini API
 */
async function extractTextFromImage() {
    if (!selectedFile) {
        showError('Please select an image first.');
        return;
    }

    // Show loading state
    btnText.style.display = 'none';
    loader.style.display = 'inline-block';
    extractBtn.disabled = true;
    hideError();

    try {
        // Create FormData to send the image
        const formData = new FormData();
        formData.append('image', selectedFile);

        // Send POST request to backend
        const response = await fetch('/api/extract-text', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        // Hide loading
        btnText.style.display = 'inline';
        loader.style.display = 'none';
        extractBtn.disabled = false;

        if (data.success) {
            // Display extracted text
            resultsContent.textContent = data.text;
            resultsSection.style.display = 'block';
            previewSection.style.display = 'none';
            
            // Show success toast
            showToast('✅ Text extracted successfully!');
        } else {
            // Show error message
            showError(data.error || 'Failed to extract text from image.');
        }

    } catch (error) {
        console.error('Error:', error);
        btnText.style.display = 'inline';
        loader.style.display = 'none';
        extractBtn.disabled = false;
        showError('Network error. Please check your connection and try again.');
    }
}

// ===========================
// UI Helper Functions
// ===========================

/**
 * Show error message
 */
function showError(message) {
    errorText.textContent = message;
    errorMessage.style.display = 'flex';
}

/**
 * Hide error message
 */
function hideError() {
    errorMessage.style.display = 'none';
}

/**
 * Show toast notification
 */
function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

/**
 * Copy extracted text to clipboard
 */
async function copyToClipboard() {
    const text = resultsContent.textContent;
    
    try {
        await navigator.clipboard.writeText(text);
        showToast('📋 Copied to clipboard!');
    } catch (error) {
        console.error('Failed to copy:', error);
        
        // Fallback method for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            showToast('📋 Copied to clipboard!');
        } catch (err) {
            showToast('❌ Failed to copy to clipboard');
        }
        
        document.body.removeChild(textArea);
    }
}

// ===========================
// Prevent default drag behavior on whole document
// ===========================
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    document.body.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
    });
});
