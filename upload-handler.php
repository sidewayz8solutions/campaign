<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Create uploads directory if it doesn't exist
$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0755, true);
}

$response = ['success' => false, 'message' => '', 'fileName' => ''];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Check if file was uploaded
        if (!isset($_FILES['file']) || $_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            throw new Exception('No file uploaded or upload error occurred');
        }

        $file = $_FILES['file'];
        $fileType = $file['type'];
        $fileSize = $file['size'];
        $fileName = $file['name'];
        $tmpName = $file['tmp_name'];

        // Validate file type
        $allowedVideoTypes = [
            'video/mp4',
            'video/webm',
            'video/quicktime',
            'video/x-msvideo',
            'video/avi'
        ];

        $allowedImageTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/webp',
            'image/gif'
        ];

        $isVideo = in_array($fileType, $allowedVideoTypes);
        $isImage = in_array($fileType, $allowedImageTypes);

        if (!$isVideo && !$isImage) {
            throw new Exception('Invalid file type. Only video and image files are allowed.');
        }

        // Validate file size (50MB for videos, 5MB for images)
        $maxVideoSize = 50 * 1024 * 1024; // 50MB
        $maxImageSize = 5 * 1024 * 1024;  // 5MB

        if ($isVideo && $fileSize > $maxVideoSize) {
            throw new Exception('Video file too large. Maximum size is 50MB.');
        }

        if ($isImage && $fileSize > $maxImageSize) {
            throw new Exception('Image file too large. Maximum size is 5MB.');
        }

        // Generate unique filename
        $fileExtension = pathinfo($fileName, PATHINFO_EXTENSION);
        $uniqueFileName = time() . '_' . uniqid() . '.' . $fileExtension;
        $targetPath = $uploadDir . $uniqueFileName;

        // Move uploaded file
        if (move_uploaded_file($tmpName, $targetPath)) {
            $response['success'] = true;
            $response['message'] = 'File uploaded successfully';
            $response['fileName'] = $uniqueFileName;
            $response['fileType'] = $isVideo ? 'video' : 'image';
            $response['fileSize'] = $fileSize;
        } else {
            throw new Exception('Failed to move uploaded file');
        }

    } catch (Exception $e) {
        $response['message'] = $e->getMessage();
    }
} else {
    $response['message'] = 'Invalid request method';
}

echo json_encode($response);
?>
