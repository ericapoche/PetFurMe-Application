<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set headers
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Try multiple possible paths to find the database.php file
$possible_paths = [
    __DIR__ . '/../../config/database.php',
    __DIR__ . '/../config/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/config/database.php',
    $_SERVER['DOCUMENT_ROOT'] . '/PetFurMe-Application/api/config/database.php'
];

$database_path = null;
foreach ($possible_paths as $path) {
    error_log("Checking path: " . $path);
    if (file_exists($path)) {
        $database_path = $path;
        error_log("Found database.php at: " . $path);
        break;
    }
}

if (!$database_path) {
    error_log("Could not find database.php in any of the checked paths");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database configuration file not found'
    ]);
    exit;
}

// Include database connection
require_once $database_path;

try {
    $data = json_decode(file_get_contents("php://input"), true);
    error_log("Received email verification data: " . json_encode($data));
    
    if (!isset($data['email'])) {
        throw new Exception('Email is required');
    }

    $email = filter_var($data['email'], FILTER_SANITIZE_EMAIL);
    error_log("Checking if email exists: " . $email);
    
    // Create database connection
    $database = new Database();
    $conn = $database->connect();
    error_log("Database connection established");
    
    // Check if email exists in users table
    $query = "SELECT id FROM users WHERE email = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $email);
    $stmt->execute();
    $result = $stmt->get_result();
    
    $exists = $result->num_rows > 0;
    error_log("Email exists check result: " . ($exists ? "true" : "false"));
    
    // Return appropriate response
    echo json_encode([
        'success' => true,
        'exists' => $exists
    ]);
    
    // Close statement and connection
    $stmt->close();
    $conn->close();
    
} catch (Exception $e) {
    // Log the error
    error_log("Error verifying email: " . $e->getMessage());
    error_log("Stack trace: " . $e->getTraceAsString());
    
    // Return error response
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?> 