<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Create uploads directory if it doesn't exist
$uploadDir = 'uploads/';
if (!file_exists($uploadDir)) {
    if (!mkdir($uploadDir, 0755, true)) {
        $response = ['success' => false, 'message' => 'Failed to create uploads directory', 'fileName' => ''];
        echo json_encode($response);
        exit;
    }
}

$response = ['success' => false, 'message' => '', 'fileName' => '', 'debug' => []];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Add debug information
        $response['debug']['post_max_size'] = ini_get('post_max_size');
        $response['debug']['upload_max_filesize'] = ini_get('upload_max_filesize');
        $response['debug']['files_received'] = isset($_FILES['file']);
        $response['debug']['files_keys'] = array_keys($_FILES);
        $response['debug']['request_method'] = $_SERVER['REQUEST_METHOD'];
        $response['debug']['content_length'] = $_SERVER['CONTENT_LENGTH'] ?? 'not set';

        // Check if file was uploaded
        if (!isset($_FILES['file'])) {
            throw new Exception('No file received. Check if form enctype is multipart/form-data');
        }

        if ($_FILES['file']['error'] !== UPLOAD_ERR_OK) {
            $errorMessages = [
                UPLOAD_ERR_INI_SIZE => 'File exceeds upload_max_filesize directive',
                UPLOAD_ERR_FORM_SIZE => 'File exceeds MAX_FILE_SIZE directive',
                UPLOAD_ERR_PARTIAL => 'File was only partially uploaded',
                UPLOAD_ERR_NO_FILE => 'No file was uploaded',
                UPLOAD_ERR_NO_TMP_DIR => 'Missing temporary folder',
                UPLOAD_ERR_CANT_WRITE => 'Failed to write file to disk',
                UPLOAD_ERR_EXTENSION => 'File upload stopped by extension'
            ];
            $errorCode = $_FILES['file']['error'];
            $errorMessage = isset($errorMessages[$errorCode]) ? $errorMessages[$errorCode] : 'Unknown upload error';
            throw new Exception($errorMessage . " (Error code: $errorCode)");
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
