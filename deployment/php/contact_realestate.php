<?php
// contact_realestate.php
header('Content-Type: application/json; charset=utf-8');
$data = $_POST;
$honeypot = trim($data['website'] ?? '');
if ($honeypot !== '') {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'Spam detected']);
    exit;
}
$name = trim($data['name'] ?? '');
$phone = trim($data['phone'] ?? '');
$email = trim($data['email'] ?? '');
$message = trim($data['message'] ?? '');
if ($name === '' || $phone === '') {
    http_response_code(400);
    echo json_encode(['status'=>'error','message'=>'Missing required fields']);
    exit;
}
$to = 'jamavisapvt@gmail.com';
$subject = 'JK Balaji - Real Estate Enquiry';
$body = "Name: $name\nPhone: $phone\nEmail: $email\nMessage: $message\nSource: jkbalaji.in\n";
$headers = "From: no-reply@jkbalaji.in\r\nReply-To: $email\r\n";
$ok = @mail($to, $subject, $body, $headers);
if ($ok) {
    echo json_encode(['status'=>'ok','message'=>'Sent']);
} else {
    http_response_code(500);
    echo json_encode(['status'=>'error','message'=>'Could not send email']);
}
?>

