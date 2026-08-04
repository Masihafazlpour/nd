<?php

declare(strict_types=1);

$lockFile = __DIR__ . '/app/installed.lock';
$alreadyInstalled = is_file($lockFile) && is_file(__DIR__ . '/config.php');
$error = '';
$success = '';

function h(string $v): string { return htmlspecialchars($v, ENT_QUOTES, 'UTF-8'); }

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !$alreadyInstalled) {
    $dbHost = trim((string) ($_POST['db_host'] ?? '127.0.0.1'));
    $dbPort = (int) ($_POST['db_port'] ?? 3306);
    $dbName = trim((string) ($_POST['db_name'] ?? 'student_forms'));
    $dbUser = trim((string) ($_POST['db_user'] ?? ''));
    $dbPass = (string) ($_POST['db_pass'] ?? '');
    $adminUser = trim((string) ($_POST['admin_user'] ?? 'admin'));
    $adminPass = (string) ($_POST['admin_pass'] ?? '');
    $adminPass2 = (string) ($_POST['admin_pass2'] ?? '');

    if ($dbHost === '' || $dbName === '' || $dbUser === '' || $adminUser === '' || strlen($adminPass) < 8) {
        $error = 'تمام فیلدهای الزامی را تکمیل کنید. رمز مدیر باید حداقل ۸ کاراکتر باشد.';
    } elseif ($adminPass !== $adminPass2) {
        $error = 'تکرار رمز مدیر یکسان نیست.';
    } elseif (!preg_match('/^[A-Za-z0-9_]+$/', $dbName)) {
        $error = 'نام دیتابیس فقط باید شامل حروف انگلیسی، عدد و زیرخط باشد.';
    } else {
        try {
            $server = new PDO("mysql:host={$dbHost};port={$dbPort};charset=utf8mb4", $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
            $server->exec("CREATE DATABASE IF NOT EXISTS `{$dbName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
            $pdo = new PDO("mysql:host={$dbHost};port={$dbPort};dbname={$dbName};charset=utf8mb4", $dbUser, $dbPass, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);

            $schema = file_get_contents(__DIR__ . '/schema.sql');
            $schema = preg_replace('/^\s*--.*$/m', '', (string) $schema);
            $statements = array_filter(array_map('trim', preg_split('/;\s*(?:\r?\n|$)/', $schema)));
            foreach ($statements as $statement) {
                if ($statement !== '') $pdo->exec($statement);
            }

            $now = date('Y-m-d H:i:s');
            $hash = password_hash($adminPass, PASSWORD_DEFAULT);
            $stmt = $pdo->prepare('SELECT id FROM admins WHERE username = ? LIMIT 1');
            $stmt->execute([$adminUser]);
            if (!$stmt->fetchColumn()) {
                $stmt = $pdo->prepare('INSERT INTO admins (username, password_hash, created_at, updated_at) VALUES (?, ?, ?, ?)');
                $stmt->execute([$adminUser, $hash, $now, $now]);
            }

            $seed = json_decode(file_get_contents(__DIR__ . '/seed.json'), true);
            $stmt = $pdo->query('SELECT id FROM forms ORDER BY id LIMIT 1');
            $formId = $stmt->fetchColumn();
            if (!$formId) {
                $stmt = $pdo->prepare('INSERT INTO forms (slug, title, description, draft_json, draft_version, auto_next, device_name, slogan, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $stmt->execute([
                    'student-registration',
                    $seed['title'] ?? 'فرم اطلاعات دانش‌آموزان',
                    $seed['description'] ?? '',
                    json_encode(['questions' => $seed['questions'] ?? []], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    1,
                    !empty($seed['autoNext']) ? 1 : 0,
                    $seed['deviceName'] ?? '',
                    $seed['slogan'] ?? '',
                    $now,
                    $now,
                ]);
            }

            $config = "<?php\nreturn " . var_export([
                'db' => [
                    'host' => $dbHost,
                    'port' => $dbPort,
                    'name' => $dbName,
                    'user' => $dbUser,
                    'pass' => $dbPass,
                    'charset' => 'utf8mb4',
                ],
                'app' => [
                    'name' => 'سامانه فرم‌ساز دانش‌آموزی',
                    'session_name' => 'student_form_admin',
                    'timezone' => 'Asia/Tehran',
                    'max_response_bytes' => 524288,
                ],
            ], true) . ";\n";
            if (file_put_contents(__DIR__ . '/config.php', $config, LOCK_EX) === false) {
                throw new RuntimeException('نوشتن config.php ممکن نشد. دسترسی نوشتن پوشه را بررسی کنید.');
            }
            file_put_contents($lockFile, date('c'), LOCK_EX);
            $alreadyInstalled = true;
            $success = 'نصب با موفقیت انجام شد. اکنون install.php را حذف کنید و وارد پنل مدیریت شوید.';
        } catch (Throwable $e) {
            $error = 'نصب انجام نشد: ' . $e->getMessage();
        }
    }
}
?>
<!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>نصب سامانه فرم‌ساز</title>
<style>
body{margin:0;font-family:Tahoma,Arial,sans-serif;background:#0b1020;color:#e5e7eb;min-height:100vh;display:grid;place-items:center;padding:20px;box-sizing:border-box}
.card{width:min(680px,100%);background:#111827;border:1px solid #334155;border-radius:24px;padding:24px;box-shadow:0 25px 60px rgba(0,0,0,.35)}
h1{margin-top:0;font-size:24px}h2{font-size:17px;margin:24px 0 12px}.grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}@media(max-width:650px){.grid{grid-template-columns:1fr}}
.field{display:grid;gap:7px}.field.full{grid-column:1/-1}label{font-weight:700;font-size:13px}input{width:100%;box-sizing:border-box;padding:12px 13px;border-radius:12px;border:1px solid #475569;background:#0f172a;color:#fff}
button{padding:12px 18px;border:0;border-radius:12px;background:#6366f1;color:white;font-weight:800;cursor:pointer}.note,.err,.ok{margin:14px 0;padding:12px 14px;border-radius:12px;line-height:1.8}.note{background:#172554}.err{background:#450a0a;color:#fecaca}.ok{background:#052e16;color:#bbf7d0}.muted{color:#94a3b8;font-size:13px;line-height:1.8}.actions{margin-top:20px;display:flex;justify-content:flex-start;gap:10px;flex-wrap:wrap}
code{background:#020617;padding:3px 7px;border-radius:6px}
</style>
</head>
<body>
<div class="card">
<h1>نصب سامانه فرم‌ساز دانش‌آموزی</h1>
<?php if ($error): ?><div class="err"><?=h($error)?></div><?php endif; ?>
<?php if ($success): ?><div class="ok"><?=h($success)?></div><?php endif; ?>
<?php if ($alreadyInstalled): ?>
<div class="note">سامانه قبلاً نصب شده است. برای امنیت، فایل <code>install.php</code> را از روی هاست حذف کنید.</div>
<div class="actions"><a href="index.php?mode=admin"><button type="button">ورود به پنل مدیر</button></a><a href="index.php?mode=form"><button type="button">مشاهده فرم</button></a></div>
<?php else: ?>
<div class="muted">این نصب‌کننده دیتابیس MySQL/MariaDB، جدول‌ها، حساب مدیر و فرم اولیه را ایجاد می‌کند.</div>
<form method="post" autocomplete="off">
<h2>اتصال دیتابیس</h2>
<div class="grid">
<div class="field"><label>هاست دیتابیس</label><input name="db_host" value="<?=h($_POST['db_host'] ?? '127.0.0.1')?>" required></div>
<div class="field"><label>پورت</label><input name="db_port" type="number" value="<?=h((string)($_POST['db_port'] ?? 3306))?>" required></div>
<div class="field"><label>نام دیتابیس</label><input name="db_name" value="<?=h($_POST['db_name'] ?? 'student_forms')?>" required></div>
<div class="field"><label>نام کاربری دیتابیس</label><input name="db_user" value="<?=h($_POST['db_user'] ?? '')?>" required></div>
<div class="field full"><label>رمز دیتابیس</label><input name="db_pass" type="password"></div>
</div>
<h2>حساب مدیر</h2>
<div class="grid">
<div class="field"><label>نام کاربری مدیر</label><input name="admin_user" value="<?=h($_POST['admin_user'] ?? 'admin')?>" required></div>
<div class="field"><label>رمز مدیر</label><input name="admin_pass" type="password" required></div>
<div class="field full"><label>تکرار رمز مدیر</label><input name="admin_pass2" type="password" required></div>
</div>
<div class="actions"><button type="submit">نصب سامانه</button></div>
</form>
<?php endif; ?>
</div>
</body>
</html>
