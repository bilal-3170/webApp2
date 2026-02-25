# 📸 Image Text Extractor

A modern web application that extracts text from uploaded images using **Google's Gemini AI**. Features a clean, responsive UI with drag-and-drop support, real-time processing, and secure API handling.

![Built with Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![Google Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=flat&logo=google&logoColor=white)

---

## ✨ Features

✅ **Image Upload** - Support for JPG, JPEG, and PNG formats (up to 10MB)  
✅ **Drag & Drop** - Easy file upload with visual feedback  
✅ **AI-Powered OCR** - Utilizes Google's Gemini 1.5 Flash model for accurate text extraction  
✅ **Real-time Processing** - Live loading indicators during API calls  
✅ **Copy to Clipboard** - One-click copy functionality for extracted text  
✅ **Error Handling** - Comprehensive error messages for better user experience  
✅ **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices  
✅ **Secure API Handling** - API keys stored server-side, never exposed to frontend  

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Step 1: Get Your Gemini API Key](#step-1-get-your-gemini-api-key)
3. [Step 2: Installation](#step-2-installation)
4. [Step 3: Configuration](#step-3-configuration)
5. [Step 4: Run Locally](#step-4-run-locally)
6. [Project Structure](#project-structure)
7. [How It Works](#how-it-works)
8. [Deployment](#deployment)
9. [Troubleshooting](#troubleshooting)
10. [Contributing](#contributing)

---

## 🔧 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- A **Google Account** to access Google AI Studio

---

## 🔑 Step 1: Get Your Gemini API Key

Follow these steps to obtain your free Gemini API key:

### 1. Go to Google AI Studio

Visit: [https://aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey)

### 2. Sign In

Sign in with your Google account.

### 3. Create API Key

1. Click on **"Create API Key"** button
2. Select an existing Google Cloud project or create a new one
3. Your API key will be generated instantly

### 4. Copy Your API Key

Click on the copy icon to copy your API key to clipboard. It will look something like:

```
AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX
```

⚠️ **Important**: Keep your API key secure and never commit it to version control!

### 5. Enable Gemini API (Usually Auto-enabled)

The Gemini API is typically enabled automatically when you create an API key. If you encounter issues:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to **APIs & Services** > **Library**
4. Search for "Generative Language API"
5. Click **Enable**

### 6. API Quotas & Limits

- **Free Tier**: 60 requests per minute
- **Rate Limits**: Check [Google AI Pricing](https://ai.google.dev/pricing) for details
- **Usage**: Monitor your usage in Google Cloud Console

---

## 💻 Step 2: Installation

### 1. Clone or Download This Project

If you received this as a ZIP file, extract it. Otherwise:

```bash
git clone <your-repo-url>
cd webApp
```

### 2. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages:
- `express` - Web server framework
- `@google/generative-ai` - Google's Generative AI SDK
- `multer` - File upload handling
- `dotenv` - Environment variable management
- `cors` - Cross-origin resource sharing

---

## ⚙️ Step 3: Configuration

### 1. Create Environment File

Create a `.env` file in the root directory:

```bash
# Windows PowerShell
Copy-Item .env.example .env

# Windows CMD
copy .env.example .env

# Mac/Linux
cp .env.example .env
```

### 2. Add Your API Key

Open the `.env` file in a text editor and replace the placeholder with your actual Gemini API key:

```env
# Google Gemini API Key
GEMINI_API_KEY=AIzaSyXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxX

# Server Configuration
PORT=3000

# Node Environment
NODE_ENV=development
```

### 3. Save the File

Save and close the `.env` file.

---

## 🚀 Step 4: Run Locally

### 1. Start the Server

Run the following command:

```bash
npm start
```

For development with auto-restart on file changes:

```bash
npm run dev
```

### 2. Open in Browser

Once the server starts, you'll see:

```
🚀 Server is running on http://localhost:3000
📝 Image Text Extraction API is ready
```

Open your browser and navigate to: **http://localhost:3000**

### 3. Test the Application

1. Upload an image by clicking "Browse Files" or drag & drop
2. Click "Extract Text"
3. Wait for the AI to process (usually 2-5 seconds)
4. View extracted text
5. Click "Copy to Clipboard" to copy the text

---

## 📁 Project Structure

```
webApp/
│
├── public/                  # Frontend files (served statically)
│   ├── index.html          # Main HTML file
│   ├── style.css           # Styles and responsive design
│   └── script.js           # Client-side JavaScript
│
├── server.js               # Express server & API endpoints
├── package.json            # Node.js dependencies
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment file
├── .gitignore              # Git ignore rules
└── README.md               # This file
```

---

## 🔍 How It Works

### Frontend Flow

1. **User uploads image** → File is validated (type & size)
2. **Image preview shown** → User clicks "Extract Text"
3. **FormData created** → Image sent to `/api/extract-text` endpoint
4. **Loading indicator** → Displayed while waiting for response
5. **Results displayed** → Extracted text shown with copy functionality

### Backend Flow

1. **Multer middleware** → Receives and validates uploaded image
2. **File to Base64** → Image buffer converted to base64 string
3. **Gemini API call** → Image + prompt sent to Gemini 1.5 Flash model
4. **Text extraction** → AI extracts all readable text from image
5. **JSON response** → Extracted text returned to frontend

### API Integration Details

```javascript
// How Gemini API is called in server.js:

// 1. Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// 2. Get the vision-capable model
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

// 3. Prepare image data
const imagePart = {
    inlineData: {
        data: base64Image,
        mimeType: file.mimetype
    }
};

// 4. Define extraction prompt
const prompt = "Extract all readable text from this image...";

// 5. Send request
const result = await model.generateContent([prompt, imagePart]);
const extractedText = result.response.text();
```

---

## 🌐 Deployment

### Deploy to Render (Free Tier)

1. **Create Account**: Sign up at [Render](https://render.com/)

2. **New Web Service**:
   - Connect your GitHub repository
   - Select "webApp" folder if needed

3. **Configuration**:
   ```
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables**:
   - Add `GEMINI_API_KEY` in Render dashboard
   - Set `NODE_ENV` to `production`

5. **Deploy**: Click "Create Web Service"

### Deploy to Railway

1. **Create Account**: Sign up at [Railway](https://railway.app/)

2. **New Project**:
   - Select "Deploy from GitHub repo"
   - Choose your repository

3. **Add Variables**:
   - Go to Variables tab
   - Add `GEMINI_API_KEY`

4. **Deploy**: Railway auto-deploys on push

### Deploy to Vercel (Serverless)

For serverless deployment, you'll need to modify the structure slightly to use Vercel's serverless functions. Check [Vercel Node.js guide](https://vercel.com/docs/functions/serverless-functions/runtimes/node-js).

---

## 🐛 Troubleshooting

### Issue: "API key not configured"

**Solution**: 
- Ensure `.env` file exists in root directory
- Verify `GEMINI_API_KEY` is set correctly
- Restart the server after changing `.env`

### Issue: "Invalid API key"

**Solution**:
- Check your API key is copied correctly (no extra spaces)
- Verify the API key is active in Google AI Studio
- Ensure Generative Language API is enabled

### Issue: "File size too large"

**Solution**:
- Maximum file size is 10MB
- Compress your image before uploading
- Use JPG instead of PNG for smaller size

### Issue: Port 3000 already in use

**Solution**:
- Change `PORT` in `.env` to another port (e.g., 3001)
- Or kill the process using port 3000:

```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Issue: "Network error"

**Solution**:
- Check your internet connection
- Verify the server is running
- Check browser console for detailed errors

---

## 📝 API Endpoints

### `POST /api/extract-text`

Extract text from an uploaded image.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Response:**
```json
{
  "success": true,
  "text": "Extracted text content...",
  "filename": "example.jpg"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### `GET /api/health`

Check server status and API key configuration.

**Response:**
```json
{
  "status": "ok",
  "message": "Image Text Extraction API is running",
  "timestamp": "2026-02-25T10:30:00.000Z"
}
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore` by default
2. **Use environment variables** - Store sensitive data in `.env`
3. **Validate file uploads** - Server validates file type and size
4. **Rate limiting** - Consider adding rate limiting for production
5. **HTTPS in production** - Always use HTTPS for deployed apps

---

## 🤝 Contributing

Contributions are welcome! Here are some ideas:

- [ ] Add support for PDF files
- [ ] Implement batch processing
- [ ] Add language detection
- [ ] Export to different formats (TXT, DOCX, PDF)
- [ ] Add user authentication
- [ ] Implement file history

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **Google Gemini AI** - For the powerful vision capabilities
- **Express.js** - For the robust web framework
- **Multer** - For handling multipart/form-data

---

## 📧 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review [Google AI Documentation](https://ai.google.dev/docs)
3. Open an issue on GitHub

---

**Built with ❤️ using Google Gemini AI**

Happy coding! 🚀
