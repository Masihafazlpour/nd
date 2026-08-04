<?php

declare(strict_types=1);
require __DIR__ . '/app/bootstrap.php';

$action = (string) ($_GET['action'] ?? $_POST['action'] ?? '');
$method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');

try {
    switch ($action) {
        case 'me':
            json_response(['ok' => true, 'admin' => current_admin(), 'csrf' => csrf_token()]);

        case 'login':
            if ($method !== 'POST') json_response(['ok' => false, 'message' => 'روش درخواست نامعتبر است.'], 405);
            $data = input_json();
            $username = trim((string) ($data['username'] ?? ''));
            $password = (string) ($data['password'] ?? '');
            if ($username === '' || $password === '') json_response(['ok' => false, 'message' => 'نام کاربری و رمز عبور الزامی است.'], 422);

            $stmt = db()->prepare('SELECT * FROM admins WHERE username = ? LIMIT 1');
            $stmt->execute([$username]);
            $admin = $stmt->fetch();
            if (!$admin) {
                usleep(250000);
                json_response(['ok' => false, 'message' => 'نام کاربری یا رمز عبور اشتباه است.'], 401);
            }

            if (!empty($admin['locked_until']) && strtotime($admin['locked_until']) > time()) {
                json_response(['ok' => false, 'message' => 'به دلیل تلاش‌های ناموفق متعدد، ورود موقتاً قفل شده است.'], 429);
            }

            if (!password_verify($password, $admin['password_hash'])) {
                $failed = (int) $admin['failed_attempts'] + 1;
                $lockUntil = $failed >= 5 ? date('Y-m-d H:i:s', time() + 600) : null;
                $stmt = db()->prepare('UPDATE admins SET failed_attempts = ?, locked_until = ?, updated_at = ? WHERE id = ?');
                $stmt->execute([$failed, $lockUntil, now_sql(), $admin['id']]);
                usleep(250000);
                json_response(['ok' => false, 'message' => $lockUntil ? 'ورود به مدت ۱۰ دقیقه قفل شد.' : 'نام کاربری یا رمز عبور اشتباه است.'], 401);
            }

            session_regenerate_id(true);
            $_SESSION['admin_id'] = (int) $admin['id'];
            $_SESSION['admin_username'] = (string) $admin['username'];
            $_SESSION['csrf'] = bin2hex(random_bytes(32));
            $stmt = db()->prepare('UPDATE admins SET failed_attempts = 0, locked_until = NULL, updated_at = ? WHERE id = ?');
            $stmt->execute([now_sql(), $admin['id']]);
            audit('login');
            json_response(['ok' => true, 'admin' => current_admin(), 'csrf' => csrf_token()]);

        case 'logout':
            require_admin();
            require_csrf();
            audit('logout');
            $_SESSION = [];
            if (ini_get('session.use_cookies')) {
                $params = session_get_cookie_params();
                setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'] ?? '', (bool) $params['secure'], (bool) $params['httponly']);
            }
            session_destroy();
            json_response(['ok' => true]);

        case 'public_form':
            $form = get_form();
            $version = get_published_version((int) $form['id']);
            if (!$version) json_response(['ok' => true, 'published' => false, 'message' => 'هنوز نسخه‌ای از فرم منتشر نشده است.']);
            json_response([
                'ok' => true,
                'published' => true,
                'form' => [
                    'id' => (int) $form['id'],
                    'slug' => $form['slug'],
                    'title' => $version['title'],
                    'description' => $version['description'],
                    'autoNext' => (bool) $version['auto_next'],
                    'deviceName' => $version['device_name'],
                    'slogan' => $version['slogan'],
                    'versionId' => (int) $version['id'],
                    'versionNumber' => (int) $version['version_number'],
                    'publishedAt' => $version['created_at'],
                    'questions' => read_json_string($version['schema_json'])['questions'] ?? [],
                ],
            ]);

        case 'admin_state':
            require_admin();
            $form = get_form();
            $published = get_published_version((int) $form['id']);
            $countStmt = db()->prepare('SELECT COUNT(*) FROM responses WHERE form_id = ?');
            $countStmt->execute([$form['id']]);
            $responseCount = (int) $countStmt->fetchColumn();
            $draft = read_json_string($form['draft_json']);
            json_response([
                'ok' => true,
                'csrf' => csrf_token(),
                'admin' => current_admin(),
                'form' => [
                    'id' => (int) $form['id'],
                    'slug' => $form['slug'],
                    'title' => $form['title'],
                    'description' => $form['description'],
                    'autoNext' => (bool) $form['auto_next'],
                    'deviceName' => $form['device_name'],
                    'slogan' => $form['slogan'],
                    'draftVersion' => (int) $form['draft_version'],
                    'draftUpdatedAt' => $form['updated_at'],
                    'draft' => $draft,
                    'published' => $published ? [
                        'id' => (int) $published['id'],
                        'versionNumber' => (int) $published['version_number'],
                        'createdAt' => $published['created_at'],
                    ] : null,
                    'responseCount' => $responseCount,
                ],
            ]);

        case 'save_draft':
            $admin = require_admin();
            require_csrf();
            if ($method !== 'POST') json_response(['ok' => false, 'message' => 'روش درخواست نامعتبر است.'], 405);
            $data = input_json();
            $form = get_form();
            $expected = (int) ($data['draftVersion'] ?? 0);
            if ($expected !== (int) $form['draft_version']) {
                json_response(['ok' => false, 'error' => 'DRAFT_CONFLICT', 'message' => 'این فرم در دستگاه دیگری تغییر کرده است. ابتدا نسخه جدید را دریافت کنید.'], 409);
            }
            $draft = is_array($data['draft'] ?? null) ? $data['draft'] : [];
            $schema = ['questions' => $draft['questions'] ?? []];
            [$valid, $message] = validate_schema($schema);
            if (!$valid) json_response(['ok' => false, 'message' => $message], 422);
            $title = trim((string) ($draft['title'] ?? 'فرم اطلاعات دانش‌آموزان'));
            $description = trim((string) ($draft['description'] ?? ''));
            $autoNext = !empty($draft['autoNext']) ? 1 : 0;
            $deviceName = trim((string) ($draft['deviceName'] ?? ''));
            $slogan = trim((string) ($draft['slogan'] ?? ''));

            $pdo = db();
            $stmt = $pdo->prepare('UPDATE forms SET title = ?, description = ?, draft_json = ?, draft_version = draft_version + 1, auto_next = ?, device_name = ?, slogan = ?, updated_at = ? WHERE id = ? AND draft_version = ?');
            $stmt->execute([
                $title,
                $description,
                json_encode(['questions' => $draft['questions'] ?? []], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                $autoNext,
                $deviceName,
                $slogan,
                now_sql(),
                $form['id'],
                $expected,
            ]);
            if ($stmt->rowCount() !== 1) json_response(['ok' => false, 'error' => 'DRAFT_CONFLICT', 'message' => 'نسخه فرم در دستگاه دیگری تغییر کرده است.'], 409);
            audit('save_draft', 'form', (int) $form['id'], ['draftVersion' => $expected + 1]);
            json_response(['ok' => true, 'draftVersion' => $expected + 1]);

        case 'reset_seed':
            $admin = require_admin();
            require_csrf();
            $data = input_json();
            $form = get_form();
            $expected = (int) ($data['draftVersion'] ?? 0);
            if ($expected !== (int) $form['draft_version']) json_response(['ok' => false, 'error' => 'DRAFT_CONFLICT', 'message' => 'نسخه فرم تغییر کرده است.'], 409);
            $seedFile = __DIR__ . '/seed.json';
            if (!is_file($seedFile)) json_response(['ok' => false, 'message' => 'فایل فرم اولیه پیدا نشد.'], 500);
            $seed = json_decode(file_get_contents($seedFile), true);
            if (!is_array($seed)) json_response(['ok' => false, 'message' => 'فایل فرم اولیه معتبر نیست.'], 500);
            [$valid, $message] = validate_schema(['questions' => $seed['questions'] ?? []]);
            if (!$valid) json_response(['ok' => false, 'message' => $message], 500);
            $stmt = db()->prepare('UPDATE forms SET title = ?, description = ?, draft_json = ?, draft_version = draft_version + 1, auto_next = ?, device_name = ?, slogan = ?, updated_at = ? WHERE id = ? AND draft_version = ?');
            $stmt->execute([
                $seed['title'],
                $seed['description'],
                json_encode(['questions' => $seed['questions']], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                !empty($seed['autoNext']) ? 1 : 0,
                (string) ($seed['deviceName'] ?? ''),
                (string) ($seed['slogan'] ?? ''),
                now_sql(),
                $form['id'],
                $expected,
            ]);
            if ($stmt->rowCount() !== 1) json_response(['ok' => false, 'error' => 'DRAFT_CONFLICT', 'message' => 'نسخه فرم تغییر کرده است.'], 409);
            audit('reset_seed', 'form', (int) $form['id']);
            json_response(['ok' => true, 'draftVersion' => $expected + 1]);

        case 'publish':
            $admin = require_admin();
            require_csrf();
            $data = input_json();
            $form = get_form();
            $expected = (int) ($data['draftVersion'] ?? 0);
            $pdo = db();
            $pdo->beginTransaction();
            try {
                $stmt = $pdo->prepare('SELECT * FROM forms WHERE id = ? FOR UPDATE');
                $stmt->execute([$form['id']]);
                $locked = $stmt->fetch();
                if (!$locked || (int) $locked['draft_version'] !== $expected) throw new RuntimeException('DRAFT_CONFLICT');
                $draft = read_json_string($locked['draft_json']);
                $schema = ['questions' => $draft['questions'] ?? []];
                [$valid, $message] = validate_schema($schema);
                if (!$valid) throw new RuntimeException('INVALID_SCHEMA:' . $message);
                $maxStmt = $pdo->prepare('SELECT COALESCE(MAX(version_number), 0) FROM form_versions WHERE form_id = ?');
                $maxStmt->execute([$locked['id']]);
                $nextVersion = (int) $maxStmt->fetchColumn() + 1;
                $insert = $pdo->prepare('INSERT INTO form_versions (form_id, version_number, title, description, schema_json, auto_next, device_name, slogan, published_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
                $insert->execute([
                    $locked['id'],
                    $nextVersion,
                    $locked['title'],
                    $locked['description'],
                    json_encode($schema, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES),
                    (int) $locked['auto_next'],
                    $locked['device_name'],
                    $locked['slogan'],
                    $admin['id'],
                    now_sql(),
                ]);
                $versionId = (int) $pdo->lastInsertId();
                $upd = $pdo->prepare('UPDATE forms SET published_version_id = ?, updated_at = ? WHERE id = ?');
                $upd->execute([$versionId, now_sql(), $locked['id']]);
                $pdo->commit();
            } catch (Throwable $e) {
                if ($pdo->inTransaction()) $pdo->rollBack();
                if ($e->getMessage() === 'DRAFT_CONFLICT') json_response(['ok' => false, 'error' => 'DRAFT_CONFLICT', 'message' => 'فرم در دستگاه دیگری تغییر کرده است. ابتدا نسخه جدید را دریافت کنید.'], 409);
                if (str_starts_with($e->getMessage(), 'INVALID_SCHEMA:')) json_response(['ok' => false, 'message' => substr($e->getMessage(), 15)], 422);
                throw $e;
            }
            audit('publish', 'form', (int) $form['id'], ['versionId' => $versionId, 'versionNumber' => $nextVersion]);
            json_response(['ok' => true, 'versionId' => $versionId, 'versionNumber' => $nextVersion]);

        case 'save_response':
            if ($method !== 'POST') json_response(['ok' => false, 'message' => 'روش درخواست نامعتبر است.'], 405);
            $data = input_json();
            $form = get_form();
            $versionId = (int) ($data['versionId'] ?? 0);
            $stmt = db()->prepare('SELECT * FROM form_versions WHERE id = ? AND form_id = ? LIMIT 1');
            $stmt->execute([$versionId, $form['id']]);
            $version = $stmt->fetch();
            if (!$version) json_response(['ok' => false, 'message' => 'نسخه فرم معتبر نیست. صفحه را تازه‌سازی کنید.'], 422);
            $values = is_array($data['values'] ?? null) ? $data['values'] : [];
            [$valid, $clean, $message] = validate_response_values(read_json_string($version['schema_json']), $values);
            if (!$valid) json_response(['ok' => false, 'message' => $message], 422);
            $deviceName = trim((string) ($data['deviceName'] ?? ''));
            if (mb_strlen($deviceName) > 255) $deviceName = mb_substr($deviceName, 0, 255);
            $responseJson = json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
            if (strlen($responseJson) > ($GLOBALS['config']['app']['max_response_bytes'] ?? 524288)) json_response(['ok' => false, 'message' => 'حجم پاسخ بیش از حد مجاز است.'], 413);
            $stmt = db()->prepare('INSERT INTO responses (form_id, form_version_id, response_json, device_name, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)');
            $now = now_sql();
            $stmt->execute([$form['id'], $versionId, $responseJson, $deviceName, $now, $now]);
            json_response(['ok' => true, 'responseId' => (int) db()->lastInsertId(), 'message' => 'پاسخ با موفقیت ثبت شد.']);

        case 'responses':
            require_admin();
            $form = get_form();
            $page = max(1, (int) ($_GET['page'] ?? 1));
            $perPage = min(100, max(10, (int) ($_GET['perPage'] ?? 50)));
            $search = trim((string) ($_GET['search'] ?? ''));
            $where = 'WHERE form_id = ?';
            $params = [$form['id']];
            if ($search !== '') {
                $where .= ' AND (response_json LIKE ? OR device_name LIKE ?)';
                $like = '%' . $search . '%';
                $params[] = $like; $params[] = $like;
            }
            $countStmt = db()->prepare('SELECT COUNT(*) FROM responses ' . $where);
            $countStmt->execute($params);
            $total = (int) $countStmt->fetchColumn();
            $offset = ($page - 1) * $perPage;
            $listStmt = db()->prepare('SELECT r.*, v.version_number, v.title, v.schema_json FROM responses r JOIN form_versions v ON v.id = r.form_version_id ' . $where . ' ORDER BY r.id DESC LIMIT ' . (int) $perPage . ' OFFSET ' . (int) $offset);
            $listStmt->execute($params);
            $rows = [];
            while ($row = $listStmt->fetch()) {
                $rows[] = [
                    'id' => (int) $row['id'],
                    'versionId' => (int) $row['form_version_id'],
                    'versionNumber' => (int) $row['version_number'],
                    'title' => $row['title'],
                    'deviceName' => $row['device_name'],
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at'],
                    'values' => read_json_string($row['response_json']),
                    'fields' => array_reduce((read_json_string($row['schema_json'])['questions'] ?? []), static function($carry, $q) { if (isset($q['id'])) $carry[$q['id']] = $q['label'] ?? $q['id']; return $carry; }, []),
                ];
            }
            json_response(['ok' => true, 'rows' => $rows, 'total' => $total, 'page' => $page, 'perPage' => $perPage, 'totalPages' => (int) ceil($total / $perPage)]);

        case 'export_responses':
            require_admin();
            $form = get_form();
            $stmt = db()->prepare('SELECT r.*, v.version_number, v.title, v.schema_json FROM responses r JOIN form_versions v ON v.id = r.form_version_id WHERE r.form_id = ? ORDER BY r.id ASC');
            $stmt->execute([$form['id']]);
            $rows = [];
            while ($row = $stmt->fetch()) {
                $rows[] = [
                    'id' => (int) $row['id'],
                    'versionId' => (int) $row['form_version_id'],
                    'versionNumber' => (int) $row['version_number'],
                    'title' => $row['title'],
                    'deviceName' => $row['device_name'],
                    'createdAt' => $row['created_at'],
                    'updatedAt' => $row['updated_at'],
                    'values' => read_json_string($row['response_json']),
                    'fields' => array_reduce((read_json_string($row['schema_json'])['questions'] ?? []), static function($carry, $q) { if (isset($q['id'])) $carry[$q['id']] = $q['label'] ?? $q['id']; return $carry; }, []),
                ];
            }
            json_response(['ok' => true, 'rows' => $rows]);

        case 'get_response':
            require_admin();
            $id = (int) ($_GET['id'] ?? 0);
            $stmt = db()->prepare('SELECT r.*, v.title, v.schema_json, v.version_number FROM responses r JOIN form_versions v ON v.id = r.form_version_id WHERE r.id = ? LIMIT 1');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) json_response(['ok' => false, 'message' => 'پاسخ پیدا نشد.'], 404);
            json_response(['ok' => true, 'response' => [
                'id' => (int) $row['id'],
                'versionId' => (int) $row['form_version_id'],
                'versionNumber' => (int) $row['version_number'],
                'title' => $row['title'],
                'deviceName' => $row['device_name'],
                'createdAt' => $row['created_at'],
                'updatedAt' => $row['updated_at'],
                'values' => read_json_string($row['response_json']),
                'questions' => read_json_string($row['schema_json'])['questions'] ?? [],
            ]]);

        case 'update_response':
            require_admin();
            require_csrf();
            $data = input_json();
            $id = (int) ($data['id'] ?? 0);
            $stmt = db()->prepare('SELECT r.*, v.schema_json FROM responses r JOIN form_versions v ON v.id = r.form_version_id WHERE r.id = ? LIMIT 1');
            $stmt->execute([$id]);
            $row = $stmt->fetch();
            if (!$row) json_response(['ok' => false, 'message' => 'پاسخ پیدا نشد.'], 404);
            $values = is_array($data['values'] ?? null) ? $data['values'] : [];
            [$valid, $clean, $message] = validate_response_values(read_json_string($row['schema_json']), $values);
            if (!$valid) json_response(['ok' => false, 'message' => $message], 422);
            $deviceName = trim((string) ($data['deviceName'] ?? $row['device_name']));
            $stmt = db()->prepare('UPDATE responses SET response_json = ?, device_name = ?, updated_at = ?, updated_by = ? WHERE id = ?');
            $stmt->execute([json_encode($clean, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), $deviceName, now_sql(), current_admin()['id'], $id]);
            audit('update_response', 'response', $id);
            json_response(['ok' => true]);

        case 'delete_response':
            require_admin();
            require_csrf();
            $data = input_json();
            $id = (int) ($data['id'] ?? 0);
            $stmt = db()->prepare('DELETE FROM responses WHERE id = ?');
            $stmt->execute([$id]);
            audit('delete_response', 'response', $id);
            json_response(['ok' => true]);

        case 'delete_all_responses':
            require_admin();
            require_csrf();
            $form = get_form();
            $stmt = db()->prepare('DELETE FROM responses WHERE form_id = ?');
            $stmt->execute([$form['id']]);
            audit('delete_all_responses', 'form', (int) $form['id'], ['count' => $stmt->rowCount()]);
            json_response(['ok' => true, 'deleted' => $stmt->rowCount()]);

        case 'change_password':
            require_admin();
            require_csrf();
            $data = input_json();
            $current = (string) ($data['currentPassword'] ?? '');
            $new = (string) ($data['newPassword'] ?? '');
            if (mb_strlen($new) < 8) json_response(['ok' => false, 'message' => 'رمز جدید باید حداقل ۸ کاراکتر باشد.'], 422);
            $stmt = db()->prepare('SELECT password_hash FROM admins WHERE id = ?');
            $stmt->execute([current_admin()['id']]);
            $hash = (string) $stmt->fetchColumn();
            if (!password_verify($current, $hash)) json_response(['ok' => false, 'message' => 'رمز فعلی اشتباه است.'], 422);
            $stmt = db()->prepare('UPDATE admins SET password_hash = ?, updated_at = ? WHERE id = ?');
            $stmt->execute([password_hash($new, PASSWORD_DEFAULT), now_sql(), current_admin()['id']]);
            audit('change_password');
            json_response(['ok' => true]);

        default:
            json_response(['ok' => false, 'message' => 'عملیات ناشناخته است.'], 404);
    }
} catch (PDOException $e) {
    error_log('DB error: ' . $e->getMessage());
    json_response(['ok' => false, 'message' => 'خطای پایگاه داده رخ داد.'], 500);
} catch (Throwable $e) {
    error_log('API error: ' . $e->getMessage());
    json_response(['ok' => false, 'message' => 'خطای غیرمنتظره رخ داد.'], 500);
}
