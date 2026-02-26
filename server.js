// server.js - Backend server for Gemini Image Text Extraction
// This server handles image uploads and communicates with Google's Gemini API

const express = require('express');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.static('public')); // Serve static files from 'public' folder

// Configure multer for file upload handling
// Files are stored in memory as buffers for direct API processing
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (req, file, cb) => {
        // Accept only image files
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPG, JPEG, and PNG are allowed.'));
        }
    }
});

// Initialize Gemini API
// Make sure to set GEMINI_API_KEY in your .env file
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * POST /api/extract-text
 * Endpoint to extract text from uploaded image using Gemini API
 */
app.post('/api/extract-text', upload.single('image'), async (req, res) => {
    try {
        // Validate that an image was uploaded
        if (!req.file) {
            return res.status(400).json({ 
                success: false, 
                error: 'No image file uploaded' 
            });
        }

        // Validate API key is configured
        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                success: false, 
                error: 'API key not configured. Please set GEMINI_API_KEY in .env file' 
            });
        }

        console.log(`Processing image: ${req.file.originalname} (${req.file.size} bytes)`);

        // Get the Gemini model with vision capabilities
        // Using gemini-2.0-flash-exp (newer experimental model)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

        // Convert image buffer to base64
        const imageBase64 = req.file.buffer.toString('base64');

        // Prepare the image part for Gemini API
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: req.file.mimetype
            }
        };

        // Create prompt for text extraction
        const prompt = "Extract all readable text from this image. Preserve formatting as much as possible. If there's no text in the image, simply state 'No text found in the image.'";

        // Send request to Gemini API
        console.log('Sending request to Gemini API...');
        const result = await model.generateContent([prompt, imagePart]);
        const response = await result.response;
        const extractedText = response.text();

        console.log('Text extraction successful');

        // Send successful response with extracted text
        res.json({
            success: true,
            text: extractedText,
            filename: req.file.originalname
        });

    } catch (error) {
        console.error('Error processing image:', error);

        // Handle specific error types
        let errorMessage = 'An error occurred while processing the image';
        let statusCode = 500;

        if (error.message.includes('API key')) {
            errorMessage = 'Invalid API key. Please check your Gemini API key configuration.';
            statusCode = 401;
        } else if (error.message.includes('quota')) {
            errorMessage = 'API quota exceeded. Please try again later.';
            statusCode = 429;
        } else if (error.message.includes('Invalid file type')) {
            errorMessage = error.message;
            statusCode = 400;
        }

        res.status(statusCode).json({
            success: false,
            error: errorMessage,
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Test endpoint to check API key and available models
app.get('/api/test-key', async (req, res) => {
    try {
        console.log('Testing API key with gemini-2.0-flash-exp...');
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
        const result = await model.generateContent('Hello');
        const response = await result.response;
        res.json({
            success: true,
            message: 'API key is working!',
            testResponse: response.text()
        });
    } catch (error) {
        console.error('API key test failed:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Server is running',
        apiKeyConfigured: !!process.env.GEMINI_API_KEY
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📝 API Key configured: ${process.env.GEMINI_API_KEY ? 'Yes ✓' : 'No ✗'}`);
    if (!process.env.GEMINI_API_KEY) {
        console.log('⚠️  WARNING: GEMINI_API_KEY not found in .env file');
    }
});
