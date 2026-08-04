<?php
$mode = ($_GET['mode'] ?? 'form') === 'admin' ? 'admin' : 'form';
?><!doctype html>
<html lang="fa" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>فرم ثبت نام دانش‌آموز</title>
<link rel="stylesheet" href="assets/app.css">
</head>
<body data-mode="<?= $mode ?>">
<div class="app">
  <header class="topbar">
    <div class="brand">
      <div class="logo">د</div>
      <div>
        <h1 id="brandTitle">دبیرستان نمونه دولتی شهید شیرآقایی</h1>
        <p id="brandSub">سامانه فرم‌ساز و ثبت اطلاعات دانش‌آموز</p>
      </div>
    </div>
    <div class="top-actions">
      <button class="tab" id="themeBtn" type="button">حالت تاریک</button>
      <a class="tab link-button" href="index.php?mode=<?= $mode === 'admin' ? 'form' : 'admin' ?>"><?= $mode === 'admin' ? 'فرم عمومی' : 'ورود مدیر' ?></a>
    </div>
  </header>

  <?php if ($mode === 'admin'): ?>
  <main id="adminApp" class="wrap admin-shell">
    <section id="adminLoginView" class="login-screen hidden">
      <div class="login-card">
        <div class="login-icon">🔐</div>
        <h2>ورود مدیر</h2>
        <p>برای دسترسی به فرم‌ساز و داده‌های ثبت‌شده، وارد حساب مدیر شوید.</p>
        <div class="field"><label for="loginUsername">نام کاربری</label><input id="loginUsername" autocomplete="username"></div>
        <div class="field"><label for="loginPassword">رمز عبور</label><input id="loginPassword" type="password" autocomplete="current-password"></div>
        <div class="btns"><button class="btn-primary" id="loginBtn" type="button">ورود</button><a class="btn-ghost" href="index.php?mode=form">بازگشت به فرم</a></div>
        <div id="loginStatus" class="small"></div>
      </div>
    </section>

    <section id="adminDashboard" class="hidden">
      <div class="admin-toolbar">
        <div>
          <h2>پنل مدیریت فرم</h2>
          <div class="small" id="adminUserLabel"></div>
        </div>
        <div class="btns">
          <button class="tab active" data-admin-view="builder" type="button">مدیریت فرم</button>
          <button class="tab" data-admin-view="data" type="button">داده‌ها</button>
          <button class="tab" id="refreshAdminBtn" type="button">به‌روزرسانی</button>
          <button class="tab" id="logoutBtn" type="button">خروج</button>
        </div>
      </div>

      <div id="adminBuilderView" class="admin-view">
        <div class="grid">
          <div class="panel">
            <div class="panel-header">
              <div><h2>طراحی فرم</h2><small>پیش‌نویس روی سرور ذخیره می‌شود و پس از انتشار در اختیار همه دستگاه‌ها قرار می‌گیرد.</small></div>
              <div class="btns">
                <button class="btn-soft btn-mini" id="resetSeedBtn" type="button">بازگردانی فرم اولیه</button>
                <button class="btn-success btn-mini" id="saveDraftBtn" type="button">ذخیره پیش‌نویس</button>
                <button class="btn-primary btn-mini" id="publishBtn" type="button">انتشار برای همه دستگاه‌ها</button>
              </div>
            </div>
            <div class="panel-body">
              <div class="summary">
                <div class="stat">تعداد سؤال‌ها<b id="statQ">0</b></div>
                <div class="stat">پاسخ‌های ذخیره‌شده<b id="statR">0</b></div>
                <div class="stat">نسخه منتشرشده<b id="statV">—</b></div>
                <div class="stat">وضعیت<b id="statStatus">—</b></div>
              </div>

              <div id="draftConflictBanner" class="alert warning hidden"></div>

              <div class="row">
                <div class="field"><label for="formTitle">عنوان فرم</label><input id="formTitle" placeholder="مثلاً: فرم اطلاعات دانش‌آموزان"></div>
                <div class="field"><label for="formDesc">توضیح فرم</label><textarea id="formDesc" placeholder="توضیح کوتاه برای دانش‌آموز یا والدین..."></textarea></div>
              </div>
              <div class="row">
                <div class="field"><label for="autoNext">رفتـن خودکار به سؤال بعدی؟</label><select id="autoNext"><option value="1">بله</option><option value="0">خیر</option></select></div>
                <div class="field"><label for="deviceName">نام پیش‌فرض دستگاه</label><input id="deviceName" placeholder="مثلاً: لپ‌تاپ مدرسه - اتاق مشاوره"></div>
              </div>
              <div class="field"><label for="slogan">شعار / متن کوتاه</label><input id="slogan" placeholder="مثلاً: فرم دانش‌آموزی مدرسه"></div>

              <div class="divider"></div>

              <div class="panel nested-panel">
                <div class="panel-header"><div><h2>افزودن / ویرایش سؤال</h2><small>سؤال‌های شرطی، اعتبارسنجی، تاریخ شمسی و سریال شناسنامه</small></div><span class="badge">طراحی</span></div>
                <div class="panel-body">
                  <div class="row">
                    <div class="field"><label for="newLabel">متن سؤال</label><input id="newLabel" placeholder="مثلاً: نام دانش‌آموز"></div>
                    <div class="field"><label for="newType">نوع سؤال</label><select id="newType">
                      <option value="text">متن</option><option value="number">عدد</option><option value="date">تاریخ میلادی</option><option value="jalali">تاریخ شمسی</option><option value="textarea">پاسخ بلند</option><option value="select">سلکت باکس</option><option value="radio">رادیو باتن</option><option value="checkbox">چک‌باکس (چندگزینه‌ای)</option><option value="serial">سریال شناسنامه</option>
                    </select></div>
                  </div>
                  <div class="row">
                    <div class="field"><label for="newOptions">گزینه‌ها (با | جدا کنید)</label><input id="newOptions" placeholder="مثلاً: اجاره‌ای | شخصی"></div>
                    <div class="field"><label for="newPlaceholder">راهنما / Placeholder</label><input id="newPlaceholder" placeholder="متن راهنما درون فیلد"></div>
                  </div>
                  <div class="row">
                    <div class="field"><label for="newOrder">ترتیب</label><select id="newOrder"><option value="end">انتهای لیست</option><option value="start">ابتدای لیست</option></select></div>
                    <div class="field"><label for="newRequired">الزامی بودن</label><select id="newRequired"><option value="yes">الزامی</option><option value="no">اختیاری</option></select></div>
                  </div>
                  <div class="row validation-row">
                    <div class="field"><label for="newMin">حداقل عدد</label><input id="newMin" type="number" step="any" placeholder="مثلاً 0"></div>
                    <div class="field"><label for="newMax">حداکثر عدد</label><input id="newMax" type="number" step="any" placeholder="مثلاً 20"></div>
                  </div>
                  <div class="row validation-row">
                    <div class="field"><label for="newMinLength">حداقل طول متن</label><input id="newMinLength" type="number" min="0" step="1"></div>
                    <div class="field"><label for="newMaxLength">حداکثر طول متن</label><input id="newMaxLength" type="number" min="0" step="1"></div>
                  </div>
                  <div class="row validation-row">
                    <div class="field"><label for="newPattern">Regex اعتبارسنجی</label><input id="newPattern" placeholder="مثلاً ^09[0-9]{9}$"></div>
                    <div class="field"><label for="newInteger">عدد صحیح باشد؟</label><select id="newInteger"><option value="no">خیر</option><option value="yes">بله</option></select></div>
                  </div>

                  <div class="condition-editor">
                    <div class="condition-head"><div><strong>شرایط نمایش</strong><div class="small">سؤال فقط در صورت برقرار بودن شرط‌ها نمایش داده می‌شود.</div></div><button class="btn-soft btn-mini" id="addConditionBtn" type="button">افزودن شرط</button></div>
                    <div id="conditionList" class="condition-list"></div>
                    <div class="small">برای حالت OR کافی است حداقل یکی از شرط‌ها برقرار باشد؛ برای حالت AND همه شرط‌ها باید برقرار باشند.</div>
                    <select id="newCondMode"><option value="and">همه شرط‌ها (AND)</option><option value="or">حداقل یکی (OR)</option></select>
                  </div>

                  <div class="btns" style="margin-top:12px"><button class="btn-primary" id="addQuestionBtn" type="button">افزودن سؤال</button><button class="btn-ghost" id="clearDraftBtn" type="button">پاک کردن فرم افزودن</button></div>
                </div>
              </div>

              <div class="split section-title"><h2>فهرست سؤال‌ها</h2><div class="btns"><button class="btn-ghost btn-mini" id="exportFormBtn" type="button">خروجی JSON</button><label class="btn-ghost btn-mini file-label"><input id="importFile" type="file" accept="application/json"><span>ورود JSON</span></label></div></div>
              <div class="list" id="questionList"></div>
            </div>
          </div>

          <div class="panel sticky-panel">
            <div class="panel-header"><div><h2>تنظیمات مدیر</h2><small>امنیت حساب مدیر و وضعیت انتشار</small></div></div>
            <div class="panel-body">
              <div class="note"><b>وضعیت سرور:</b> <span id="serverStatus">در حال بررسی...</span></div>
              <div class="note"><b>نسخه Draft:</b> <span id="draftVersionLabel">—</span><br><b>آخرین تغییر:</b> <span id="draftUpdatedAt">—</span></div>
              <div class="field"><label for="currentPassword">رمز فعلی</label><input id="currentPassword" type="password" autocomplete="current-password"></div>
              <div class="field"><label for="newPassword">رمز جدید</label><input id="newPassword" type="password" autocomplete="new-password" placeholder="حداقل ۸ کاراکتر"></div>
              <div class="field"><label for="newPassword2">تکرار رمز جدید</label><input id="newPassword2" type="password" autocomplete="new-password"></div>
              <button class="btn-ghost" id="changePasswordBtn" type="button">تغییر رمز مدیر</button>
              <div class="divider"></div>
              <div class="tip"><b>نکته:</b> فرم‌ساز در همه دستگاه‌ها به همین دیتابیس مرکزی متصل است. برای نمایش فرم جدید روی گوشی‌ها، ابتدا پیش‌نویس را ذخیره و سپس انتشار کنید.</div>
            </div>
          </div>
        </div>
      </div>

      <div id="adminDataView" class="admin-view hidden">
        <div class="panel">
          <div class="panel-header"><div><h2>داده‌های ذخیره‌شده</h2><small>پاسخ‌ها از دیتابیس مرکزی خوانده می‌شوند.</small></div><div class="btns"><button class="btn-ghost btn-mini" id="refreshResponsesBtn" type="button">به‌روزرسانی</button><button class="btn-ghost btn-mini" id="exportResponsesBtn" type="button">خروجی JSON</button><button class="btn-success btn-mini" id="exportExcelBtn" type="button">خروجی اکسل</button><button class="btn-danger btn-mini" id="clearResponsesBtn" type="button">حذف همه پاسخ‌ها</button></div></div>
          <div class="panel-body">
            <div class="row">
              <div class="field"><label for="responseSearch">جست‌وجو</label><input id="responseSearch" placeholder="نام، شماره تلفن، آدرس یا هر عبارت موجود در پاسخ"></div>
              <div class="field"><label for="responsePerPage">تعداد در صفحه</label><select id="responsePerPage"><option value="25">25</option><option value="50" selected>50</option><option value="100">100</option></select></div>
            </div>
            <div class="tablewrap"><table><thead><tr id="respHead"></tr></thead><tbody id="respBody"></tbody></table></div>
            <div class="pagination"><button class="btn-ghost btn-mini" id="respPrevBtn" type="button">قبلی</button><span id="respPageLabel">صفحه 1 از 1</span><button class="btn-ghost btn-mini" id="respNextBtn" type="button">بعدی</button></div>
          </div>
        </div>
      </div>
    </section>
  </main>
  <?php else: ?>
  <main id="publicApp" class="wrap public-shell">
    <section id="publicLoading" class="panel centered"><div class="spinner"></div><p>در حال دریافت آخرین نسخه فرم...</p></section>
    <section id="publicUnavailable" class="panel centered hidden"><h2>فرم در دسترس نیست</h2><p id="publicUnavailableMessage">هنوز نسخه‌ای از فرم منتشر نشده است.</p><a href="index.php?mode=admin" class="btn-primary">ورود مدیر</a></section>
    <section id="runnerPanel" class="panel hidden">
      <div class="panel-header"><div><h2 id="runnerTitle">اجرای فرم</h2><small id="runnerDesc"></small></div><div class="btns"><button class="btn-ghost btn-mini" id="runnerRefreshBtn" type="button">دریافت آخرین نسخه</button></div></div>
      <div class="panel-body wizard">
        <div>
          <div class="split"><div class="muted" id="runnerCounter">سؤال 0 از 0</div><div class="inline"><input id="runnerDeviceName" class="device-input" placeholder="نام دستگاه / محل" aria-label="نام دستگاه یا محل"></div><div class="muted" id="runnerVersion"></div></div>
          <div class="progress"><div id="progressBar"></div></div>
          <div class="question-box">
            <h3 id="qText">...</h3><div class="sub" id="qHelp"></div><div class="answer-area" id="answerArea"></div>
            <div class="navrow"><div class="small" id="requiredHint"></div><div class="btns"><button class="btn-ghost" id="prevBtn" type="button">قبلی</button><button class="btn-primary" id="nextBtn" type="button">بعدی</button><button class="btn-success hidden" id="finishBtn" type="button">ثبت نهایی</button></div></div>
            <div class="runtimeBanner" id="runtimeBanner"></div>
          </div>
        </div>
        <div class="footerline" id="runnerFoot"></div>
      </div>
    </section>
  </main>
  <?php endif; ?>
</div>

<div id="modalRoot" class="modalRoot hidden" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="modalTitle">
  <div class="modalBackdrop"></div><div class="modalCard"><h3 id="modalTitle">پیام</h3><p id="modalMessage"></p><div class="modalActions" id="modalActions"></div></div>
</div>

<div id="loginRoot" class="modalRoot hidden" aria-hidden="true" role="dialog" aria-modal="true" aria-labelledby="loginModalTitle">
  <div class="modalBackdrop"></div><div class="modalCard login-modal"><h3 id="loginModalTitle">ورود مدیر</h3><p>برای ادامه، اطلاعات مدیر را وارد کنید.</p><div class="field"><label for="modalLoginUsername">نام کاربری</label><input id="modalLoginUsername"></div><div class="field"><label for="modalLoginPassword">رمز عبور</label><input id="modalLoginPassword" type="password"></div><div class="modalActions"><button class="btn-ghost" id="modalLoginCancel" type="button">انصراف</button><button class="btn-primary" id="modalLoginSubmit" type="button">ورود</button></div></div>
</div>

<div id="jalaliWrap" class="modalRoot hidden" aria-hidden="true" role="dialog" aria-modal="true">
  <div class="modalBackdrop"></div><div class="modalCard jalali-card"><div class="jpTop"><div><h3 id="jpTitle">تقویم شمسی</h3><div class="small" id="jpSub"></div></div><div class="jpControls"><select id="jpYear"></select><select id="jpMonth"></select><button class="btn-ghost btn-mini" id="jpPrevMonth" type="button">ماه قبل</button><button class="btn-ghost btn-mini" id="jpNextMonth" type="button">ماه بعد</button><button class="btn-danger btn-mini" id="jpClose" type="button">بستن</button></div></div><div class="jpGrid" id="jpDays"></div></div>
</div>

<script>window.APP_MODE = <?= json_encode($mode) ?>;</script>
<script src="assets/app.js" defer></script>
</body>
</html>
