# Frank Scurlock Campaign Video Management System

## Overview
This system allows you to manage campaign videos from multiple sources:
- **YouTube videos** - Embed videos from your YouTube channel
- **Vimeo videos** - Embed videos from your Vimeo account  
- **Local videos** - Upload and host video files directly

## Files Created
1. **admin-videos.html** - Admin interface for managing videos
2. **video-manager.js** - JavaScript library handling video data
3. **videos.html** - Updated public video page (now dynamic)

## How to Use

### 1. Admin Interface
- Open `admin-videos.html` in your browser
- Use the form to add new videos:
  - Select video type (YouTube, Vimeo, or Local)
  - Fill in title, description, and category
  - Add video ID (for YouTube/Vimeo) or upload file (for local)
  - Click "Add Video"

### 2. Video Categories
- **Featured Videos** - Main campaign content
- **Short Videos** - Quick updates and introductions
- **Interviews** - Media interviews and Q&As
- **Events** - Campaign events and rallies

### 3. Adding Videos

#### YouTube Videos
1. Get the video ID from the YouTube URL
   - Example: `https://www.youtube.com/watch?v=dQw4w9WgXcQ`
   - Video ID: `dQw4w9WgXcQ`
2. Enter this ID in the YouTube Video ID field

#### Vimeo Videos
1. Get the video ID from the Vimeo URL
   - Example: `https://vimeo.com/123456789`
   - Video ID: `123456789`
2. Enter this ID in the Vimeo Video ID field

#### Local Videos
1. Click "Local Upload" option
2. Drag and drop or select your video file
3. Optionally add a thumbnail image
4. **Note**: For local videos to work, you need server-side upload handling

## Technical Setup

### For Local Video Uploads (Requires Server)
To enable local video uploads, you'll need:

1. **Create uploads directory**:
   ```
   mkdir uploads
   chmod 755 uploads
   ```

2. **Server-side upload handler** (example in PHP):
   ```php
   <?php
   if ($_FILES['videoFile']['error'] === UPLOAD_ERR_OK) {
       $uploadDir = 'uploads/';
       $fileName = time() . '_' . $_FILES['videoFile']['name'];
       move_uploaded_file($_FILES['videoFile']['tmp_name'], $uploadDir . $fileName);
       echo json_encode(['success' => true, 'fileName' => $fileName]);
   }
   ?>
   ```

3. **Update video-manager.js** to use real upload endpoint:
   ```javascript
   async uploadFile(file, type = 'video') {
       const formData = new FormData();
       formData.append('videoFile', file);
       
       const response = await fetch('upload.php', {
           method: 'POST',
           body: formData
       });
       
       return await response.json();
   }
   ```

### For Static Hosting (GitHub Pages, Netlify, etc.)
If you're using static hosting:
1. Use only YouTube and Vimeo videos
2. For local videos, upload them to a service like:
   - YouTube (then use as YouTube videos)
   - Vimeo (then use as Vimeo videos)
   - Cloud storage with direct links

## Data Storage
- Videos are stored in browser localStorage
- Data persists between sessions
- Use the export/import functions for backup

### Export/Import Videos
```javascript
// Export videos to JSON file
videoManager.exportVideos();

// Import videos from JSON
const jsonData = '...'; // Your JSON data
videoManager.importVideos(jsonData);
```

## Customization

### Adding New Categories
Edit the category dropdown in `admin-videos.html`:
```html
<option value="new-category">New Category</option>
```

### Styling
- Modify CSS in `videos.html` for public page styling
- Modify CSS in `admin-videos.html` for admin interface styling

### Video Layout
- Videos are displayed in a responsive grid
- Each video shows: thumbnail, title, description, platform badge
- Customize the `generateVideoHTML()` method in `video-manager.js`

## Security Considerations
1. **Admin Access**: Protect `admin-videos.html` with authentication
2. **File Uploads**: Validate file types and sizes server-side
3. **XSS Protection**: Sanitize user input for titles/descriptions
4. **File Storage**: Store uploads outside web root when possible

## Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript ES6+ features used
- LocalStorage required for data persistence

## Troubleshooting

### Videos Not Showing
1. Check browser console for errors
2. Verify video IDs are correct
3. Ensure `video-manager.js` is loaded

### Local Videos Not Playing
1. Check file format (MP4 recommended)
2. Verify upload directory permissions
3. Check server-side upload handling

### Data Loss
1. Use export function regularly for backups
2. Consider server-side database for production use

## Production Recommendations
1. Replace localStorage with database storage
2. Implement proper user authentication
3. Add server-side video processing
4. Use CDN for video delivery
5. Add video analytics tracking

## Support
For technical issues or customization requests, refer to the campaign's technical team.
