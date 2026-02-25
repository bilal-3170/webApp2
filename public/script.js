/**
 * Image Text Extractor - Client-side JavaScript
 * Handles file upload, drag-and-drop, API communication, and UI updates
 */

// ===========================
// DOM Elements
// ===========================
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewSection = document.getElementById('previewSection');
const imagePreview = document.getElementById('imagePreview');
const filenameElement = document.getElementById('filename');
const removeBtn = document.getElementById('removeBtn');
const extractBtn = document.getElementById('extractBtn');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const errorText = document.getElementById('errorText');
const resultsSection = document.getElementById('resultsSection');
const extractedText = document.getElementById('extractedText');
const copyBtn = document.getElementById('copyBtn');
const newImageBtn = document.getElementById('newImageBtn');
const toast = document.getElementById('toast');

// ===========================
// State Management
// ===========================
let selectedFile = null;

// ===========================
// Event Listeners
// ===========================

// File input change event
fileInput.addEventListener('change', handleFileSelect);

// Upload area click to trigger file input
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// Drag and drop events
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);

// Remove button
removeBtn.addEventListener('click', resetUpload);

// Extract button
extractBtn.addEventListener('click', extractTextFromImage);

// Copy button
copyBtn.addEventListener('click', copyToClipboard);

// New image button
newImageBtn.addEventListener('click', resetUpload);

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
    uploadArea.classList.add('drag-over');
}

/**
 * Handle drag leave event
 */
function handleDragLeave(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('drag-over');
}

/**
 * Handle drop event for drag and drop
 */
function handleDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    uploadArea.classList.remove('drag-over');

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
        filenameElement.textContent = file.name;
        
        // Hide upload area and show preview
        uploadArea.style.display = 'none';
        previewSection.style.display = 'block';
        resultsSection.style.display = 'none';
    };
    
    reader.readAsDataURL(file);
}

/**
 * Reset upload and return to initial state
 */
function resetUpload() {
    selectedFile = null;
    fileInput.value = '';
    imagePreview.src = '';
    filenameElement.textContent = '';
    
    // Show upload area and hide other sections
    uploadArea.style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
    loading.style.display = 'none';
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
    loading.style.display = 'block';
    previewSection.style.display = 'none';
    resultsSection.style.display = 'none';
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
        loading.style.display = 'none';

        if (data.success) {
            // Display extracted text
            extractedText.textContent = data.text;
            resultsSection.style.display = 'block';
            
            // Show success toast
            showToast('✅ Text extracted successfully!');
        } else {
            // Show error message
            showError(data.error || 'Failed to extract text from image.');
            previewSection.style.display = 'block';
        }

    } catch (error) {
        console.error('Error:', error);
        loading.style.display = 'none';
        showError('Network error. Please check your connection and try again.');
        previewSection.style.display = 'block';
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
    const text = extractedText.textContent;
    
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
