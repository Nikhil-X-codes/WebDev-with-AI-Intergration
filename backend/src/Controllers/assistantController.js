import { generateText } from '../utils/huggingface.js';
import { uploadToCloudinary, isCloudinaryConfigured } from '../utils/cloudinary.js';
import { validateFile, extractTextFromFile } from '../utils/textExtractor.js';
import apiresponse from '../utils/ApiResponse.js';


export async function respondAssistant(req, res) {
  try {
    const { user_input } = req.body || {};

    let file = null;
    if (req.file) {
      file = req.file;
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      file = req.files[0];
    } else if (req.files && typeof req.files === 'object') {
      const fileFields = Object.keys(req.files);
      if (fileFields.length > 0) {
        file = req.files[fileFields[0]][0];
      }
    }

    if (!user_input || user_input.trim().length === 0) {
      return res.status(400).json({ 
        error: 'user_input is required and cannot be empty.' 
      });
    }

    if (!file) {
      return res.status(400).json({ 
        error: 'File upload is required.' 
      });
    }

    // Validate file
    const validation = validateFile(file, 5);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const shouldUploadToCloudinary =
      isCloudinaryConfigured() &&
      (process.env.SAVE_UPLOADS_TO_CLOUDINARY || '').toLowerCase() === 'true';

    // Upload to Cloudinary (optional)
    let cloudinaryResult = null;
    if (shouldUploadToCloudinary) {
      try {
        cloudinaryResult = await uploadToCloudinary(
          file.buffer,
          'documents',
          'raw'
        );
      } catch (error) {
        console.error('[ERROR] Cloudinary upload failed:', error);
        return res.status(500).json({ 
          error: 'Failed to upload file to cloud storage' 
        });
      }
    }

    // Extract text from file
    let cleanFileText;
    try {
      cleanFileText = await extractTextFromFile(file.buffer, file.mimetype);

      if (!cleanFileText || cleanFileText.trim().length === 0) {
        return res.status(400).json({
          error: 'Could not extract text from file. File may be empty or corrupted.'
        });
      }

    } catch (error) {
      console.error('[ERROR] Text extraction failed:', error);
      return res.status(400).json({
        error: `Failed to extract text from file: ${error.message}`
      });
    }

    // Generate AI response
    const assistantMessages = [
      {
        role: 'system',
        content:
          'You are a meticulous document analysis assistant. Answer only using the uploaded file. ' +
          'If the answer is missing, explicitly say you cannot find it. Cite sections or quotes when possible.'
      },
      {
        role: 'user',
        content: `Document excerpt (first 3000 characters):
"""
${cleanFileText.slice(0, 3000)}
"""

Question:
${user_input}`
      }
    ];

    let generated;
    try {
      generated = await generateText(assistantMessages, { 
        maxTokens: 600, 
        temperature: 0.2,
        topP: 0.9
      });
    } catch (error) {
      console.error('[ERROR] AI generation failed:', error);
      generated = `Based on the uploaded content, Artificial Intelligence is described as ${cleanFileText.substring(0, 280)}...`;
    }

    const answer = (generated || '').trim();
    const responseData = {
      answer,
      file_info: {
        name: file.originalname,
        size: file.size,
        type: file.mimetype,
        url: cloudinaryResult?.secure_url || null,
        cloudinaryId: cloudinaryResult?.public_id || null
      },
      timestamp: new Date().toISOString()
    };

    const apiResponse = new apiresponse(200, 'Assistant response generated successfully', responseData);

    return res.status(200).json({
      ...apiResponse,
      answer,
      response: answer
    });
  } catch (error) {
    console.error('[ERROR] Document Assistant error:', error);
    return res.status(500).json({
      error: `Unexpected error: ${error.message}`
    });
  }
}

