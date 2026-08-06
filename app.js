(() => {
  'use strict';

  const CFG = window.APP_CONFIG || {};
  const MODE = new URLSearchParams(window.location.search).get('mode') === 'admin' ? 'admin' : 'form';
  const $ = (id, root = document) => root === document ? document.getElementById(id) : root.querySelector(`#${CSS.escape(id)}`);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const THEME_KEY = 'student_form_theme_v13';
  const DEVICE_KEY = 'student_form_device_v13';
  const FORM_SLUG = CFG.FORM_SLUG || 'student-registration';
  const SERIAL_LETTERS = ['ا','ب','پ','ت','ث','ج','چ','ح','خ','د','ذ','ر','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی'];
  const QUESTION_TYPES = ['text','number','date','jalali','textarea','select','radio','checkbox','serial'];
  const CONDITION_OPS = ['eq','neq','contains','starts','ends','empty','notempty'];
  const TYPE_LABELS = {text:'متن',number:'عدد',date:'تاریخ میلادی',jalali:'تاریخ شمسی',textarea:'پاسخ بلند',select:'سلکت باکس',radio:'رادیو باتن',checkbox:'چک‌باکس',serial:'سریال شناسنامه'};
  const CONDITION_LABELS = {eq:'برابر است با',neq:'مخالف است با',contains:'شامل است',starts:'شروع می‌شود با',ends:'پایان می‌یابد با',empty:'خالی است',notempty:'خالی نیست'};

  const DEFAULT_FORM = {
    title: 'فرم اطلاعات دانش‌آموزان',
    description: 'فرم ثبت اطلاعات دانش‌آموز و خانواده',
    auto_next: true,
    device_name: 'دستگاه مدرسه',
    slogan: 'فرم دانش‌آموزی',
    questions: [
      {id:'grade',label:'پایه',type:'select',required:true,options:['دهم','یازدهم','دوازدهم'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'field',label:'رشته',type:'select',required:true,options:['تجربی','ریاضی','انسانی'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'student_first_name',label:'نام دانش‌آموز',type:'text',required:true,options:[],placeholder:'نام',validation:{minLength:2,maxLength:80},conditions:[],conditionMode:'and'},
      {id:'student_last_name',label:'نام خانوادگی دانش‌آموز',type:'text',required:true,options:[],placeholder:'نام خانوادگی',validation:{minLength:2,maxLength:100},conditions:[],conditionMode:'and'},
      {id:'birth_serial',label:'سریال شناسنامه',type:'serial',required:false,options:[],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'birth_date',label:'تاریخ تولد',type:'jalali',required:true,options:[],placeholder:'1400/01/15',validation:{},conditions:[],conditionMode:'and'},
      {id:'father_name',label:'نام پدر',type:'text',required:true,options:[],placeholder:'',validation:{minLength:2,maxLength:100},conditions:[],conditionMode:'and'},
      {id:'father_job',label:'شغل پدر',type:'text',required:false,options:[],placeholder:'',validation:{maxLength:120},conditions:[],conditionMode:'and'},
      {id:'father_education',label:'میزان تحصیلات پدر',type:'select',required:false,options:['ابتدایی','سیکل','دیپلم','فوق دیپلم','لیسانس','فوق لیسانس','دکتری'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'father_mobile',label:'شماره تلفن همراه پدر',type:'text',required:false,options:[],placeholder:'09...',validation:{pattern:'^09[0-9]{9}$'},conditions:[],conditionMode:'and'},
      {id:'mother_name',label:'نام و نام خانوادگی مادر',type:'text',required:false,options:[],placeholder:'',validation:{maxLength:120},conditions:[],conditionMode:'and'},
      {id:'mother_job',label:'شغل مادر',type:'text',required:false,options:[],placeholder:'',validation:{maxLength:120},conditions:[],conditionMode:'and'},
      {id:'mother_education',label:'میزان تحصیلات مادر',type:'select',required:false,options:['ابتدایی','سیکل','دیپلم','فوق دیپلم','لیسانس','فوق لیسانس','دکتری'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'mother_mobile',label:'شماره تلفن همراه مادر',type:'text',required:false,options:[],placeholder:'09...',validation:{pattern:'^09[0-9]{9}$'},conditions:[],conditionMode:'and'},
      {id:'home_address',label:'آدرس منزل',type:'textarea',required:false,options:[],placeholder:'آدرس کامل',validation:{maxLength:500},conditions:[],conditionMode:'and'},
      {id:'home_phone',label:'شماره تلفن منزل',type:'text',required:false,options:[],placeholder:'',validation:{maxLength:20},conditions:[],conditionMode:'and'},
      {id:'student_mobile',label:'شماره موبایل دانش‌آموز',type:'text',required:false,options:[],placeholder:'09...',validation:{pattern:'^09[0-9]{9}$'},conditions:[],conditionMode:'and'},
      {id:'previous_average',label:'معدل سال قبل',type:'number',required:false,options:[],placeholder:'مثلاً 19.50',validation:{min:0,max:20,step:0.01},conditions:[],conditionMode:'and'},
      {id:'has_disease',label:'بیماری خاص (دارد/ندارد)',type:'radio',required:true,options:['دارد','ندارد'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'disease_desc',label:'توضیحات در صورت داشتن بیماری',type:'textarea',required:false,options:[],placeholder:'نوع بیماری و توضیحات ضروری',validation:{maxLength:500},conditions:[{questionId:'has_disease',operator:'eq',value:'دارد'}],conditionMode:'and'},
      {id:'housing_status',label:'وضعیت مسکن',type:'select',required:false,options:['اجاره‌ای','شخصی'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'coverage',label:'تحت پوشش',type:'select',required:false,options:['کمیته امداد','بهزیستی','غیره','هیچکدام'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'family_children_count',label:'تعداد فرزندان خانواده',type:'number',required:false,options:[],placeholder:'مثلاً 3',validation:{min:1,max:30,step:1,integer:true},conditions:[],conditionMode:'and'},
      {id:'student_child_order',label:'دانش‌آموز فرزند چندم است',type:'number',required:false,options:[],placeholder:'مثلاً 2',validation:{min:1,max:30,step:1,integer:true},conditions:[],conditionMode:'and'},
      {id:'uses_school_transport',label:'استفاده از سرویس مدارس',type:'radio',required:false,options:['بله','خیر'],placeholder:'',validation:{},conditions:[],conditionMode:'and'},
      {id:'driver_name',label:'نام راننده در صورت استفاده',type:'text',required:false,options:[],placeholder:'',validation:{maxLength:120},conditions:[{questionId:'uses_school_transport',operator:'eq',value:'بله'}],conditionMode:'and'},
      {id:'driver_phone',label:'شماره تماس راننده در صورت استفاده',type:'text',required:false,options:[],placeholder:'09...',validation:{pattern:'^09[0-9]{9}$'},conditions:[{questionId:'uses_school_transport',operator:'eq',value:'بله'}],conditionMode:'and'}
    ]
  };

  const state = {
    sb: null,
    user: null,
    profile: null,
    form: null,
    published: null,
    draftDirty: false,
    editingQuestionId: null,
    conditionDraft: [],
    conditionMode: 'and',
    draggedId: null,
    currentAdminView: 'builder',
    adminChannel: null,
    publicChannel: null,
    responses: {page:1, perPage:50, search:'', total:0, totalPages:1, rows:[]},
    editResponse: null,
    editSchema: null,
    runner: {version:null, current:0, values:{}, pendingVersion:null, deviceName: localStorage.getItem(DEVICE_KEY) || ''},
    jalali: null,
    modal: {resolver:null, closeOnBackdrop:false, previousFocus:null, isConfirm:false}
  };

  function clone(value) {
    return window.structuredClone ? structuredClone(value) : JSON.parse(JSON.stringify(value));
  }
  function uid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return `q_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  }
  function escapeHtml(value='') {
    return String(value).replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }
  function normalizeDigits(value) {
    const fa='۰۱۲۳۴۵۶۷۸۹', ar='٠١٢٣٤٥٦٧٨٩';
    return String(value ?? '').replace(/[۰-۹]/g,d=>String(fa.indexOf(d))).replace(/[٠-٩]/g,d=>String(ar.indexOf(d)));
  }
  function faNumber(value) { return String(value ?? '').replace(/[0-9]/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]); }
  function nowIso() { return new Date().toISOString(); }
  function formatDateTime(value) {
    if (!value) return '—';
    try { return new Intl.DateTimeFormat('fa-IR',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)); }
    catch { return String(value); }
  }
  function debounce(fn, ms=350) { let timer; return (...args) => { clearTimeout(timer); timer=setTimeout(()=>fn(...args),ms); }; }
  function isConfigReady() { return typeof CFG.SUPABASE_URL==='string' && /^https:\/\/[^\s]+\.supabase\.co$/.test(CFG.SUPABASE_URL) && typeof CFG.SUPABASE_ANON_KEY==='string' && CFG.SUPABASE_ANON_KEY.length > 30; }
  function goPublic() { window.location.href = 'index.html?mode=form'; }
  function goAdmin() { window.location.href = 'index.html?mode=admin'; }

  function applyTheme(theme) {
    const value = theme === 'dark' ? 'dark' : 'light';
    document.body.classList.toggle('dark', value === 'dark');
    localStorage.setItem(THEME_KEY, value);
    const btn = $('themeBtn');
    if (btn) btn.textContent = value === 'light' ? 'حالت تاریک' : 'حالت روشن';
  }

  function setConnection(text, kind='neutral') {
    const badge = $('connectionBadge');
    if (!badge) return;
    badge.textContent = text;
    badge.className = `status-badge status-${kind}`;
  }

  function showConfigError() {
    $('configError')?.classList.remove('hidden');
    $('connectionBadge') && setConnection('تنظیمات ناقص','danger');
  }

  function hideConfigError() { $('configError')?.classList.add('hidden'); }

  function showOnly(mode) {
    $('publicApp')?.classList.toggle('hidden', mode !== 'form');
    $('adminApp')?.classList.toggle('hidden', mode !== 'admin');
    const entry = $('adminEntryBtn');
    if (entry) {
      entry.textContent = mode === 'admin' ? 'فرم عمومی' : 'ورود مدیر';
      entry.onclick = mode === 'admin' ? goPublic : goAdmin;
    }
  }

  function openModal({title='پیام',message='',buttons=[{label:'باشه',value:true,kind:'primary'}],closeOnBackdrop=false,isConfirm=false}) {
    const root=$('modalRoot');
    if (!root) return Promise.resolve(true);
    if (state.modal.resolver) state.modal.resolver(false);
    state.modal.previousFocus=document.activeElement;
    state.modal.closeOnBackdrop=closeOnBackdrop;
    state.modal.isConfirm=isConfirm;
    return new Promise(resolve=>{
      state.modal.resolver=resolve;
      $('modalTitle').textContent=title;
      $('modalMessage').textContent=message;
      $('modalIcon').textContent=isConfirm?'?':'i';
      const actions=$('modalActions'); actions.innerHTML='';
      let closed=false;
      const close=(value)=>{
        if(closed)return;
        closed=true;
        root.classList.add('hidden'); root.setAttribute('aria-hidden','true');
        state.modal.resolver=null;
        try{state.modal.previousFocus?.focus?.()}catch{}
        resolve(value);
      };
      buttons.forEach((button,index)=>{
        const el=document.createElement('button'); el.type='button';
        el.className=button.kind==='danger'?'btn btn-danger':button.kind==='success'?'btn btn-success':button.kind==='ghost'?'btn btn-ghost':button.kind==='soft'?'btn btn-soft':'btn btn-primary';
        el.textContent=button.label; el.addEventListener('click',()=>close(button.value)); actions.appendChild(el);
        if(index===buttons.length-1)setTimeout(()=>el.focus(),0);
      });
      root.classList.remove('hidden'); root.setAttribute('aria-hidden','false');
      const backdrop=root.querySelector('.modal-backdrop');
      backdrop.onclick=()=>{if(closeOnBackdrop)close(false);};
    });
  }
  const ui={
    alert:(message,title='پیام')=>openModal({title,message,closeOnBackdrop:true}),
    success:(message)=>openModal({title:'موفق',message,buttons:[{label:'باشه',value:true,kind:'success'}],closeOnBackdrop:true}),
    error:(message)=>openModal({title:'خطا',message,buttons:[{label:'باشه',value:true,kind:'danger'}],closeOnBackdrop:true}),
    confirm:(message,title='تأیید')=>openModal({title,message,buttons:[{label:'لغو',value:false,kind:'ghost'},{label:'تأیید',value:true,kind:'primary'}],isConfirm:true})
  };

  function makeClient() {
    const {createClient}=window.supabase || {};
    if (!createClient) throw new Error('کتابخانه Supabase بارگذاری نشده است.');
    return createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
  }

  async function loadProfile(userId) {
    const {data,error}=await state.sb.from('profiles').select('id,display_name,role').eq('id',userId).maybeSingle();
    if(error)throw error;
    return data;
  }

  async function ensureAdminSession() {
    const {data:{session}}=await state.sb.auth.getSession();
    if(!session){state.user=null;state.profile=null;return false;}
    const profile=await loadProfile(session.user.id);
    if(!profile || profile.role!=='admin'){
      await state.sb.auth.signOut();
      throw new Error('این حساب مجوز مدیر ندارد. ابتدا نقش admin را در جدول profiles تنظیم کنید.');
    }
    state.user=session.user; state.profile=profile; return true;
  }

  function showAdminLogin(message='') {
    $('adminLoginView')?.classList.remove('hidden');
    $('adminDashboard')?.classList.add('hidden');
    const box=$('loginError');
    if(box){box.textContent=message;box.classList.toggle('hidden',!message);}
  }
  function showAdminDashboard() {
    $('adminLoginView')?.classList.add('hidden');
    $('adminDashboard')?.classList.remove('hidden');
    const name=state.profile?.display_name || state.user?.email || 'مدیر';
    $('adminUserLabel').textContent=`حساب فعال: ${name}`;
    $('managerStatus').textContent='مدیر مجاز';
  }

  async function loginAdmin() {
    const email=$('loginEmail').value.trim();
    const password=$('loginPassword').value;
    if(!email || !password)return showAdminLogin('ایمیل و رمز عبور را کامل وارد کنید.');
    $('loginBtn').disabled=true;
    try{
      const {error}=await state.sb.auth.signInWithPassword({email,password});
      if(error)throw error;
      const ok=await ensureAdminSession();
      if(!ok)throw new Error('ورود انجام نشد.');
      showAdminDashboard();
      await loadAdminState({silent:true});
      switchAdminView('builder');
    }catch(error){showAdminLogin(error.message || 'ورود ناموفق بود.');}
    finally{$('loginBtn').disabled=false;}
  }

  async function signOut() {
    await state.sb.auth.signOut();
    state.user=null;state.profile=null;state.form=null;state.published=null;
    if(MODE==='admin')showAdminLogin('از حساب مدیر خارج شدید.');
  }

  function makeSeedForm() {
    return clone(DEFAULT_FORM);
  }

  async function getOrCreateForm() {
    let {data,error}=await state.sb.from('forms').select('*').eq('slug',FORM_SLUG).maybeSingle();
    if(error)throw error;
    if(data)return data;
    const seed=makeSeedForm();
    const payload={slug:FORM_SLUG,title:seed.title,description:seed.description,auto_next:seed.auto_next,device_name:seed.device_name,slogan:seed.slogan,draft_questions:seed.questions,draft_revision:1};
    const inserted=await state.sb.from('forms').insert(payload).select('*').single();
    if(inserted.error){
      if(inserted.error.code==='23505'){
        const retry=await state.sb.from('forms').select('*').eq('slug',FORM_SLUG).single();
        if(retry.error)throw retry.error;
        return retry.data;
      }
      throw inserted.error;
    }
    return inserted.data;
  }

  async function getPublishedVersion(formId) {
    const {data,error}=await state.sb.from('form_versions').select('*').eq('form_id',formId).eq('is_published',true).maybeSingle();
    if(error)throw error;
    return data;
  }

  async function countResponses(formId) {
    const {count,error}=await state.sb.from('responses').select('id',{count:'exact',head:true}).eq('form_id',formId);
    if(error)throw error;
    return count||0;
  }

  async function logAudit(action,entityType='',entityId=null,details={}) {
    if(!state.user)return;
    const {error}=await state.sb.from('audit_logs').insert({admin_id:state.user.id,action,entity_type:entityType||null,entity_id:entityId,details});
    if(error)console.warn('Audit log failed:',error.message);
  }

  function normalizeQuestion(q) {
    return {
      id:String(q.id||uid()),
      label:String(q.label||'').trim(),
      type:QUESTION_TYPES.includes(q.type)?q.type:'text',
      required:Boolean(q.required),
      options:Array.isArray(q.options)?q.options.map(v=>String(v).trim()).filter(Boolean):[],
      placeholder:String(q.placeholder||'').trim(),
      validation:typeof q.validation==='object'&&q.validation?q.validation:{},
      conditions:Array.isArray(q.conditions)?q.conditions.map(c=>({questionId:String(c.questionId||''),operator:String(c.operator||'eq'),value:String(c.value??'')})).filter(c=>c.questionId&&CONDITION_OPS.includes(c.operator)):[],
      conditionMode:q.conditionMode==='or'?'or':'and'
    };
  }

  function normalizeFormRecord(row) {
    return {
      ...row,
      questions:Array.isArray(row?.draft_questions)?row.draft_questions.map(normalizeQuestion):[],
      auto_next:Boolean(row?.auto_next),
      device_name:String(row?.device_name||''),
      slogan:String(row?.slogan||'')
    };
  }

  function localValidateSchema(questions) {
    if(!Array.isArray(questions))return 'ساختار سؤال‌ها معتبر نیست.';
    const ids=new Set();
    for(let i=0;i<questions.length;i++){
      const q=normalizeQuestion(questions[i]);
      if(!q.label)return `متن سؤال شماره ${i+1} خالی است.`;
      if(!/^[A-Za-z0-9_-]{1,80}$/.test(q.id))return `شناسه سؤال «${q.label}» معتبر نیست.`;
      if(ids.has(q.id))return `شناسه سؤال تکراری است: ${q.id}`;
      ids.add(q.id);
      if(!QUESTION_TYPES.includes(q.type))return `نوع سؤال «${q.type}» معتبر نیست.`;
      if(['select','radio','checkbox'].includes(q.type)){
        if(!q.options.length)return `سؤال «${q.label}» حداقل یک گزینه لازم دارد.`;
        if(new Set(q.options).size!==q.options.length)return `گزینه‌های سؤال «${q.label}» نباید تکراری باشند.`;
      }
      const v=q.validation||{};
      if(v.min!==undefined&&v.min!==''&&Number.isNaN(Number(v.min)))return `حداقل عدد سؤال «${q.label}» معتبر نیست.`;
      if(v.max!==undefined&&v.max!==''&&Number.isNaN(Number(v.max)))return `حداکثر عدد سؤال «${q.label}» معتبر نیست.`;
      if(v.min!==undefined&&v.max!==undefined&&v.min!==''&&v.max!==''&&Number(v.min)>Number(v.max))return `حداقل عدد سؤال «${q.label}» نمی‌تواند بیشتر از حداکثر باشد.`;
      if(v.minLength!==undefined&&v.maxLength!==undefined&&v.minLength!==''&&v.maxLength!==''&&Number(v.minLength)>Number(v.maxLength))return `حداقل طول سؤال «${q.label}» نمی‌تواند بیشتر از حداکثر باشد.`;
      if(v.integer && q.type==='number' && v.step!==undefined && Number(v.step)!==1)return `سؤال عددی صحیح «${q.label}» باید گام ۱ داشته باشد.`;
      if(v.pattern){try{new RegExp(v.pattern);}catch{return `Regex سؤال «${q.label}» معتبر نیست.`;}}
      for(const cond of q.conditions){
        const sourceIndex=questions.findIndex(x=>x.id===cond.questionId);
        if(sourceIndex<0)return `سؤال شرطی «${q.label}» به سؤال ناموجود متصل است.`;
        if(sourceIndex>=i)return `شرط سؤال «${q.label}» فقط می‌تواند به سؤال‌های قبلی وابسته باشد.`;
        if(!CONDITION_OPS.includes(cond.operator))return `عملگر شرط سؤال «${q.label}» معتبر نیست.`;
        if(['empty','notempty'].includes(cond.operator) && cond.value) return `برای عملگر «${CONDITION_LABELS[cond.operator]}» مقدار شرط باید خالی باشد.`;
      }
      if(q.conditions.length>1 && !['and','or'].includes(q.conditionMode))return `نحوه ترکیب شرط‌های «${q.label}» معتبر نیست.`;
    }
    return null;
  }

  function syncBuilderMetaFromUI() {
    if(!state.form)return;
    state.form.title=$('formTitle').value.trim()||'فرم اطلاعات دانش‌آموزان';
    state.form.description=$('formDesc').value.trim();
    state.form.auto_next=$('autoNext').value==='1';
    state.form.device_name=$('deviceName').value.trim();
    state.form.slogan=$('slogan').value.trim();
    state.draftDirty=true;
  }

  function updateBuilderStats() {
    if(!state.form)return;
    $('statQ').textContent=faNumber(state.form.questions.length);
    $('statR').textContent=faNumber(state.form.responseCount||0);
    $('statV').textContent=state.published?`نسخه ${faNumber(state.published.version_number)}`:'—';
    $('statStatus').textContent=state.draftDirty?'پیش‌نویس تغییر کرده':'همسان با سرور';
    $('draftVersionLabel').textContent=faNumber(state.form.draft_revision||1);
    $('draftUpdatedAt').textContent=formatDateTime(state.form.draft_updated_at);
    $('publishedAtLabel').textContent=state.published?formatDateTime(state.published.published_at):'—';
  }

  function getEditingIndex() { return state.editingQuestionId ? state.form.questions.findIndex(q=>q.id===state.editingQuestionId) : -1; }
  function getConditionSourceQuestions() {
    if(!state.form)return [];
    const editIndex=getEditingIndex();
    const maxIndex=editIndex>=0?editIndex:state.form.questions.length;
    return state.form.questions.slice(0,maxIndex);
  }

  function renderConditionEditor() {
    const list=$('conditionList'); if(!list)return;
    list.innerHTML='';
    const available=getConditionSourceQuestions();
    if(!state.conditionDraft.length){
      const empty=document.createElement('div'); empty.className='small muted'; empty.textContent='هنوز شرطی اضافه نشده است؛ سؤال همیشه نمایش داده می‌شود.'; list.appendChild(empty); return;
    }
    state.conditionDraft.forEach((cond,index)=>{
      const row=document.createElement('div'); row.className='condition-row'; row.dataset.index=String(index);
      const qSel=document.createElement('select'); qSel.className='input'; qSel.dataset.field='questionId';
      available.forEach(q=>{const o=document.createElement('option');o.value=q.id;o.textContent=q.label;qSel.appendChild(o);});
      if(available.some(q=>q.id===cond.questionId))qSel.value=cond.questionId;
      else if(available[0]){qSel.value=available[0].id;cond.questionId=available[0].id;}
      const opSel=document.createElement('select'); opSel.className='input'; opSel.dataset.field='operator';
      CONDITION_OPS.forEach(op=>{const o=document.createElement('option');o.value=op;o.textContent=CONDITION_LABELS[op];opSel.appendChild(o);}); opSel.value=cond.operator;
      const val=document.createElement('input'); val.className='input'; val.dataset.field='value'; val.value=cond.value||''; val.placeholder=['empty','notempty'].includes(cond.operator)?'بدون مقدار':'مثلاً: بله'; val.disabled=['empty','notempty'].includes(cond.operator);
      const del=document.createElement('button'); del.type='button'; del.className='btn btn-danger btn-sm'; del.dataset.deleteCondition=String(index); del.textContent='حذف';
      row.append(qSel,opSel,val,del); list.appendChild(row);
    });
  }

  function readConditionsFromDOM() {
    state.conditionDraft=$$('.condition-row',$('conditionList')).map(row=>({
      questionId:$('[data-field="questionId"]',row)?.value||'',
      operator:$('[data-field="operator"]',row)?.value||'eq',
      value:$('[data-field="value"]',row)?.value.trim()||''
    }));
  }

  function clearQuestionEditor() {
    state.editingQuestionId=null; state.conditionDraft=[]; state.conditionMode='and';
    $('newLabel').value=''; $('newType').value='text'; $('newOptions').value=''; $('newPlaceholder').value=''; $('newOrder').value='end'; $('newRequired').value='yes'; $('newMin').value=''; $('newMax').value=''; $('newMinLength').value=''; $('newMaxLength').value=''; $('newPattern').value=''; $('newInteger').value='no'; $('newCondMode').value='and';
    $('addQuestionBtn').textContent='افزودن سؤال'; renderConditionEditor();
  }

  function fillQuestionEditor(q) {
    state.editingQuestionId=q.id; state.conditionDraft=clone(q.conditions||[]); state.conditionMode=q.conditionMode||'and';
    $('newLabel').value=q.label; $('newType').value=q.type; $('newOptions').value=(q.options||[]).join(' | '); $('newPlaceholder').value=q.placeholder||''; $('newOrder').value='end'; $('newRequired').value=q.required?'yes':'no';
    const v=q.validation||{}; $('newMin').value=v.min??''; $('newMax').value=v.max??''; $('newMinLength').value=v.minLength??''; $('newMaxLength').value=v.maxLength??''; $('newPattern').value=v.pattern??''; $('newInteger').value=v.integer?'yes':'no'; $('newCondMode').value=state.conditionMode;
    $('addQuestionBtn').textContent='ثبت ویرایش'; renderConditionEditor(); window.scrollTo({top:0,behavior:'smooth'});
  }

  function buildQuestionFromEditor() {
    readConditionsFromDOM();
    const validation={};
    const min=$('newMin').value.trim(),max=$('newMax').value.trim(),minLength=$('newMinLength').value.trim(),maxLength=$('newMaxLength').value.trim(),pattern=$('newPattern').value.trim();
    if(min!=='')validation.min=Number(min); if(max!=='')validation.max=Number(max); if(minLength!=='')validation.minLength=Number(minLength); if(maxLength!=='')validation.maxLength=Number(maxLength); if(pattern)validation.pattern=pattern; if($('newInteger').value==='yes')validation.integer=true; if($('newType').value==='number')validation.step=validation.integer?1:0.01;
    return normalizeQuestion({
      id:state.editingQuestionId||uid(),label:$('newLabel').value.trim(),type:$('newType').value,required:$('newRequired').value==='yes',options:$('newOptions').value.split('|').map(s=>s.trim()).filter(Boolean),placeholder:$('newPlaceholder').value.trim(),validation,conditions:state.conditionDraft,conditionMode:$('newCondMode').value||'and'
    });
  }

  function renderQuestionList() {
    const list=$('questionList'); if(!list||!state.form)return;
    list.innerHTML='';
    if(!state.form.questions.length){const empty=document.createElement('div');empty.className='center-panel';empty.textContent='هنوز سؤالی ثبت نشده است.';list.appendChild(empty);return;}
    state.form.questions.forEach((q,index)=>{
      const card=document.createElement('article');card.className='question-card';card.draggable=true;card.dataset.id=q.id;
      const top=document.createElement('div');top.className='question-top';
      const left=document.createElement('div');
      const title=document.createElement('div');title.className='question-title';title.textContent=`${faNumber(index+1)}. ${q.label}${q.required?' *':''}`;
      const meta=document.createElement('div');meta.className='question-meta';meta.textContent=`نوع: ${TYPE_LABELS[q.type]||q.type}`;
      left.append(title,meta); top.appendChild(left);
      const badge=document.createElement('span');badge.className='chip';badge.textContent=q.required?'الزامی':'اختیاری';top.appendChild(badge);card.appendChild(top);
      const chips=document.createElement('div');chips.className='chip-row';
      if(q.conditions?.length){const c=document.createElement('span');c.className='chip';c.textContent=`شرط ${q.conditionMode==='or'?'OR':'AND'}: ${q.conditions.length} مورد`;chips.appendChild(c);}
      if(q.options?.length){const c=document.createElement('span');c.className='chip';c.textContent=`گزینه‌ها: ${q.options.join(' / ')}`;chips.appendChild(c);}
      if(q.validation?.pattern){const c=document.createElement('span');c.className='chip';c.textContent='Regex فعال';chips.appendChild(c);}
      if(q.type==='jalali'){const c=document.createElement('span');c.className='chip';c.textContent='تقویم شمسی';chips.appendChild(c);}
      if(q.type==='serial'){const c=document.createElement('span');c.className='chip';c.textContent='سریال استاندارد';chips.appendChild(c);}
      if(chips.children.length)card.appendChild(chips);
      const actions=document.createElement('div');actions.className='question-actions';
      [['up','بالا','btn-ghost'],['down','پایین','btn-ghost'],['edit','ویرایش','btn-soft'],['del','حذف','btn-danger']].forEach(([act,label,kind])=>{const b=document.createElement('button');b.type='button';b.className=`btn ${kind} btn-sm`;b.dataset.action=act;b.textContent=label;actions.appendChild(b);});
      card.appendChild(actions); list.appendChild(card);
    });
  }

  async function questionAction(action,id) {
    const index=state.form.questions.findIndex(q=>q.id===id); if(index<0)return;
    if(action==='edit'){fillQuestionEditor(state.form.questions[index]);return;}
    if(action==='del'){
      const dependents=state.form.questions.filter(q=>(q.conditions||[]).some(c=>c.questionId===id));
      let message=`سؤال «${state.form.questions[index].label}» حذف شود؟`;
      if(dependents.length)message+=`\n\nشرط‌های وابسته در ${dependents.length} سؤال نیز حذف خواهند شد.`;
      if(!await ui.confirm(message,'حذف سؤال'))return;
      state.form.questions.splice(index,1);
      state.form.questions.forEach(q=>q.conditions=(q.conditions||[]).filter(c=>c.questionId!==id));
    }else{
      const target=action==='up'?index-1:index+1;
      if(target<0||target>=state.form.questions.length)return;
      const copy=state.form.questions.slice(); [copy[index],copy[target]]=[copy[target],copy[index]];
      const error=localValidateSchema(copy); if(error)return ui.error(error);
      state.form.questions=copy;
    }
    state.draftDirty=true; updateBuilderStats(); renderQuestionList(); renderConditionEditor();
  }

  async function saveDraft() {
    if(!state.form)return;
    syncBuilderMetaFromUI();
    const error=localValidateSchema(state.form.questions); if(error)return ui.error(error);
    const revision=Number(state.form.draft_revision||1);
    $('saveDraftBtn').disabled=true;
    try{
      const payload={title:state.form.title,description:state.form.description,auto_next:state.form.auto_next,device_name:state.form.device_name,slogan:state.form.slogan,draft_questions:state.form.questions,draft_revision:revision+1,updated_at:nowIso()};
      const {data,error:updateError}=await state.sb.from('forms').update(payload).eq('id',state.form.id).eq('draft_revision',revision).select('*').maybeSingle();
      if(updateError)throw updateError;
      if(!data)throw Object.assign(new Error('پیش‌نویس روی دستگاه دیگری تغییر کرده است. ابتدا نسخه جدید را دریافت کنید.'),{code:'DRAFT_CONFLICT'});
      state.form=normalizeFormRecord(data); state.draftDirty=false; updateBuilderStats(); renderQuestionList(); await logAudit('save_draft','forms',state.form.id,{revision:state.form.draft_revision}); await ui.success('پیش‌نویس با موفقیت روی دیتابیس مرکزی ذخیره شد.');
      hideConflict();
    }catch(error){if(error.code==='DRAFT_CONFLICT'){showConflict();}else ui.error(error.message||'ذخیره پیش‌نویس ناموفق بود.');}
    finally{$('saveDraftBtn').disabled=false;}
  }

  async function publishDraft() {
    if(!state.form)return;
    syncBuilderMetaFromUI();
    const error=localValidateSchema(state.form.questions); if(error)return ui.error(error);
    if(state.draftDirty){const ok=await ui.confirm('پیش‌نویس هنوز ذخیره نشده است. ابتدا آن را ذخیره و سپس منتشر کنم؟','ذخیره و انتشار');if(!ok)return;await saveDraft();if(state.draftDirty)return;}
    if(!await ui.confirm('این نسخه فرم برای همه دستگاه‌ها منتشر شود؟ نسخه منتشرشده فرم عمومی تغییر خواهد کرد اما پاسخ‌های قبلی دست‌نخورده می‌مانند.','انتشار فرم'))return;
    $('publishBtn').disabled=true;
    try{
      const {data,error:rpcError}=await state.sb.rpc('publish_form',{p_form_id:state.form.id});
      if(rpcError)throw rpcError;
      await logAudit('publish_form','forms',state.form.id,data);
      await loadAdminState({silent:true});
      await ui.success(`نسخه ${faNumber(data.version_number)} با موفقیت منتشر شد و اکنون همه دستگاه‌ها همان نسخه را دریافت می‌کنند.`);
    }catch(error){ui.error(error.message||'انتشار فرم ناموفق بود.');}
    finally{$('publishBtn').disabled=false;}
  }

  async function resetSeed() {
    if(!state.form)return;
    if(!await ui.confirm('فقط پیش‌نویس فرم به ساختار اولیه برگردد؟ پاسخ‌های ثبت‌شده حذف نخواهند شد.','بازگردانی فرم اولیه'))return;
    state.form.questions=makeSeedForm().questions; state.form.title=DEFAULT_FORM.title; state.form.description=DEFAULT_FORM.description; state.form.auto_next=true; state.form.device_name=DEFAULT_FORM.device_name; state.form.slogan=DEFAULT_FORM.slogan; state.draftDirty=true;
    renderBuilder(); await ui.alert('فرم اولیه در پیش‌نویس جایگزین شد. برای اعمال در فرم عمومی، ابتدا ذخیره و سپس انتشار کنید.');
  }

  function showConflict() {
    const box=$('draftConflictBanner');if(!box)return;box.textContent='این فرم در دستگاه دیگری تغییر کرده است. برای جلوگیری از پاک‌شدن تغییرات، ابتدا «به‌روزرسانی» را بزنید و سپس تغییرات خود را دوباره اعمال کنید.';box.classList.remove('hidden');updateBuilderStats();
  }
  function hideConflict(){$('draftConflictBanner')?.classList.add('hidden');}

  async function loadAdminState({silent=false,overwrite=true}={}) {
    try{
      if(!state.form || overwrite){
        const row=await getOrCreateForm();
        const published=await getPublishedVersion(row.id);
        const count=await countResponses(row.id);
        state.form=normalizeFormRecord(row); state.form.responseCount=count; state.published=published; state.draftDirty=false; state.editingQuestionId=null; state.conditionDraft=[]; hideConflict();
        renderBuilder();
      }else if(state.draftDirty){
        const remote=await getOrCreateForm();
        if(remote.draft_revision!==state.form.draft_revision)showConflict();
      }
      setConnection('متصل و آماده','success'); $('serverStatus').textContent='متصل و آماده'; updateBuilderStats();
      if(state.currentAdminView==='data')await loadResponses();
      subscribeAdminRealtime();
    }catch(error){setConnection('خطای اتصال','danger');$('serverStatus').textContent='خطا در اتصال';if(!silent)ui.error(error.message||'دریافت اطلاعات مدیر ناموفق بود.');}
  }

  function renderBuilder() {
    if(!state.form)return;
    $('formTitle').value=state.form.title||''; $('formDesc').value=state.form.description||''; $('autoNext').value=state.form.auto_next?'1':'0'; $('deviceName').value=state.form.device_name||''; $('slogan').value=state.form.slogan||'';
    $('newCondMode').value=state.conditionMode||'and'; $('serverStatus').textContent='متصل و آماده'; updateBuilderStats(); renderQuestionList(); renderConditionEditor();
  }

  function subscribeAdminRealtime() {
    if(!state.sb || !state.form)return;
    if(state.adminChannel)state.sb.removeChannel(state.adminChannel);
    state.adminChannel=state.sb.channel(`admin-form-${state.form.id}`)
      .on('postgres_changes',{event:'UPDATE',schema:'public',table:'forms',filter:`id=eq.${state.form.id}`},payload=>{
        const remote=normalizeFormRecord(payload.new);
        if(state.draftDirty){if(remote.draft_revision!==state.form.draft_revision)showConflict();return;}
        state.form=remote; state.form.responseCount=state.form.responseCount||0; getPublishedVersion(state.form.id).then(v=>{state.published=v;renderBuilder();}).catch(()=>{});
      })
      .on('postgres_changes',{event:'*',schema:'public',table:'responses',filter:`form_id=eq.${state.form.id}`},()=>{if(state.currentAdminView==='data')loadResponses();countResponses(state.form.id).then(c=>{state.form.responseCount=c;updateBuilderStats();}).catch(()=>{});})
      .subscribe();
  }

  function switchAdminView(view) {
    state.currentAdminView=view;
    $$('#adminDashboard [data-admin-view]').forEach(btn=>btn.classList.toggle('active',btn.dataset.adminView===view));
    $('adminBuilderView').classList.toggle('hidden',view!=='builder'); $('adminDataView').classList.toggle('hidden',view!=='data');
    if(view==='data')loadResponses();
  }

  async function changePassword() {
    const email=state.user?.email; const current=$('currentPassword').value; const p=$('newPassword').value; const p2=$('newPassword2').value;
    if(!email)return ui.error('نشست مدیر معتبر نیست.');
    if(!current)return ui.error('برای تغییر رمز، رمز فعلی را وارد کنید.');
    if(p.length<8)return ui.error('رمز جدید باید حداقل ۸ کاراکتر باشد.');
    if(p!==p2)return ui.error('تکرار رمز جدید یکسان نیست.');
    try{
      const authCheck=await state.sb.auth.signInWithPassword({email,password:current});
      if(authCheck.error)throw new Error('رمز فعلی صحیح نیست.');
      const {error}=await state.sb.auth.updateUser({password:p}); if(error)throw error;
      $('currentPassword').value='';$('newPassword').value='';$('newPassword2').value=''; await logAudit('change_password','profiles',state.user.id,{}); await ui.success('رمز عبور با موفقیت تغییر کرد.');
    }catch(error){ui.error(error.message||'تغییر رمز ناموفق بود.');}
  }

  function exportJson(data,filename) {
    const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
  }

  function exportFormJson() {
    if(!state.form)return;
    syncBuilderMetaFromUI();
    exportJson({format:'student-form-cloud-html-css-js',version:13,exportedAt:nowIso(),form:{title:state.form.title,description:state.form.description,auto_next:state.form.auto_next,device_name:state.form.device_name,slogan:state.form.slogan},questions:state.form.questions},'student-form.json');
  }

  async function importFormJson(file) {
    try{
      const data=JSON.parse(await file.text());
      const questions=Array.isArray(data.questions)?data.questions:Array.isArray(data.form?.questions)?data.form.questions:null;
      if(!questions)throw new Error('فهرست سؤال‌ها پیدا نشد.');
      const normalized=questions.map(normalizeQuestion); const error=localValidateSchema(normalized); if(error)throw new Error(error);
      if(!await ui.confirm('فرم پیش‌نویس فعلی با این فایل جایگزین شود؟ پاسخ‌های ثبت‌شده حذف نخواهند شد.','ورود JSON'))return;
      state.form.questions=normalized; const meta=data.form||data; if(meta.title!==undefined)state.form.title=String(meta.title); if(meta.description!==undefined)state.form.description=String(meta.description); if(meta.auto_next!==undefined)state.form.auto_next=Boolean(meta.auto_next); if(meta.device_name!==undefined)state.form.device_name=String(meta.device_name); if(meta.slogan!==undefined)state.form.slogan=String(meta.slogan);
      state.draftDirty=true; renderBuilder(); await ui.success('فرم JSON وارد شد. برای اعمال روی همه دستگاه‌ها، ابتدا ذخیره پیش‌نویس و سپس انتشار را انجام دهید.');
    }catch(error){ui.error(`ورود JSON انجام نشد: ${error.message}`);}
  }

  function getValueForCondition(values,id) { return values?.[id]; }
  function matchCondition(value,op,target) {
    const t=String(target??'').trim();
    const v=Array.isArray(value)?value.join('، '):String(value??'').trim();
    switch(op){case'empty':return v==='';case'notempty':return v!=='';case'contains':return v.includes(t);case'starts':return v.startsWith(t);case'ends':return v.endsWith(t);case'neq':return v!==t;case'eq':default:return v===t;}
  }
  function isQuestionVisible(q,values) {
    if(!q.conditions?.length)return true;
    const results=q.conditions.map(c=>matchCondition(getValueForCondition(values,c.questionId),c.operator,c.value));
    return q.conditionMode==='or'?results.some(Boolean):results.every(Boolean);
  }
  function visibleQuestions(form,values) { return (form?.questions||[]).filter(q=>isQuestionVisible(q,values)); }

  function pruneHiddenValues(form,values) {
    const visible=new Set(visibleQuestions(form,values).map(q=>q.id));
    const next={...values};
    (form?.questions||[]).forEach(q=>{if(!visible.has(q.id))delete next[q.id];});
    return next;
  }

function isBlankAnswer(value, type) {
    if (value === undefined || value === null) return true;
    if (type === 'checkbox') return !Array.isArray(value) || value.length === 0;
    if (Array.isArray(value)) return value.length === 0 || value.every(item => String(item ?? '').trim() === '');
    return String(value).trim() === '';
  }

  function normalizeSubmissionValues(form, values) {
    const clean = {};
    for (const q of form?.questions || []) {
      if (!isQuestionVisible(q, values)) continue;
      const value = values?.[q.id];
      if (isBlankAnswer(value, q.type)) {
        if (q.required) clean[q.id] = value;
        continue;
      }
      clean[q.id] = value;
    }
    return clean;
  }

  function collectResponseErrors(form, values) {
    const errors = [];
    const visible = visibleQuestions(form, values);
    for (const q of visible) {
      const error = validateQuestion(q, values, form.questions);
      if (error) errors.push(error);
    }
    if (values.family_children_count !== undefined && values.student_child_order !== undefined && String(values.family_children_count) !== '' && String(values.student_child_order) !== '') {
      const count = Number(normalizeDigits(values.family_children_count));
      const order = Number(normalizeDigits(values.student_child_order));
      if (Number.isFinite(count) && Number.isFinite(order) && order > count) {
        errors.push('ترتیب تولد دانش‌آموز نمی‌تواند از تعداد فرزندان خانواده بیشتر باشد.');
      }
    }
    return errors;
  }

  function isValidJalaliDate(value) {
    const m=normalizeDigits(value).match(/^(\d{4})\/(\d{1,2})\/(\d{1,2})$/); if(!m)return false;
    const y=Number(m[1]),mo=Number(m[2]),d=Number(m[3]); if(y<1200||y>1500||mo<1||mo>12||d<1)return false; return d<=jalaaliMonthLength(y,mo);
  }

  function validateQuestion(q,values,questions=q?null:null) {
    if(!q)return null;
    const value=values?.[q.id];
    if(!isQuestionVisible(q,values))return null;
    const empty=q.type==='checkbox'?( !Array.isArray(value)||value.length===0):(value===undefined||value===null||String(value).trim()==='');
    if(q.required&&empty)return `پاسخ «${q.label}» الزامی است.`;
    if(empty)return null;
    const v=q.validation||{};
    if(q.type==='number'){
      const n=Number(normalizeDigits(value)); if(!Number.isFinite(n))return `مقدار «${q.label}» باید عدد باشد.`;
      if(v.integer&&!Number.isInteger(n))return `مقدار «${q.label}» باید عدد صحیح باشد.`;
      if(v.min!==undefined&&n<Number(v.min))return `مقدار «${q.label}» نباید کمتر از ${v.min} باشد.`;
      if(v.max!==undefined&&n>Number(v.max))return `مقدار «${q.label}» نباید بیشتر از ${v.max} باشد.`;
    }
    if(['text','textarea','select','radio'].includes(q.type)){
      const text=String(value??'');
      if(v.minLength!==undefined&&text.length<Number(v.minLength))return `طول «${q.label}» حداقل باید ${v.minLength} کاراکتر باشد.`;
      if(v.maxLength!==undefined&&text.length>Number(v.maxLength))return `طول «${q.label}» بیشتر از ${v.maxLength} کاراکتر نباشد.`;
      if(v.pattern){try{const normalizedPatternValue = normalizeDigits(text); if(!new RegExp(v.pattern).test(normalizedPatternValue))return `قالب «${q.label}» صحیح نیست.`;}catch{return `قالب اعتبارسنجی سؤال «${q.label}» خراب است.`;}}
    }
    if(q.type==='select'||q.type==='radio'){if(q.options.length&&!q.options.includes(String(value)))return `گزینه انتخاب‌شده برای «${q.label}» معتبر نیست.`;}
    if(q.type==='checkbox'){if(!Array.isArray(value)||value.some(vv=>!q.options.includes(String(vv))))return `گزینه‌های انتخاب‌شده برای «${q.label}» معتبر نیستند.`;}
    if(q.type==='date'&&!/^\d{4}-\d{2}-\d{2}$/.test(value))return `تاریخ «${q.label}» معتبر نیست.`;
    if(q.type==='jalali'&&!isValidJalaliDate(value))return `تاریخ شمسی «${q.label}» معتبر نیست.`;
    if(q.type==='serial'){
      const raw=String(value||''); if(raw&&!new RegExp(`^[${SERIAL_LETTERS.join('')}][0-9]{2}\\/[0-9]{6}$`).test(raw))return `فرمت سریال «${q.label}» صحیح نیست.`;
    }
    return null;
  }

  function validateAllResponse(form,values) {
    const visible=visibleQuestions(form,values);
    for(const q of visible){const error=validateQuestion(q,values,form.questions);if(error)return error;}
    if(values.family_children_count!==undefined&&values.student_child_order!==undefined&&String(values.family_children_count)!==''&&String(values.student_child_order)!==''){
      const count=Number(normalizeDigits(values.family_children_count)),order=Number(normalizeDigits(values.student_child_order));
      if(Number.isFinite(count)&&Number.isFinite(order)&&order>count)return 'ترتیب تولد دانش‌آموز نمی‌تواند از تعداد فرزندان خانواده بیشتر باشد.';
    }
    return null;
  }

  function helpText(q){
    if(q.type==='jalali')return'از تقویم شمسی استفاده کنید؛ تاریخ‌های نامعتبر پذیرفته نمی‌شوند.';
    if(q.type==='date')return'تاریخ میلادی را انتخاب کنید.';
    if(q.type==='serial')return'قالب: حرف + دو رقم / شش رقم؛ مثال: ا12/123456';
    if(q.type==='number')return'عدد معتبر وارد کنید.';
    if(['select','radio','checkbox'].includes(q.type))return'گزینه مناسب را انتخاب کنید.';
    return q.placeholder?`راهنما: ${q.placeholder}`:'پاسخ خود را وارد کنید.';
  }

  function makeAnswerId(prefix,id){return `${prefix}_answer_${id}`;}
  function renderQuestionInput(q,value,prefix='public') {
    const id=makeAnswerId(prefix,q.id), ph=escapeHtml(q.placeholder||'');
    if(q.type==='textarea')return `<textarea id="${id}" class="input textarea" placeholder="${ph}">${escapeHtml(value||'')}</textarea>`;
    if(q.type==='number'){
      const v=q.validation||{}; return `<input id="${id}" class="input" type="number" value="${escapeHtml(value??'')}" placeholder="${ph}" ${v.min!==undefined?`min="${escapeHtml(v.min)}"`:''} ${v.max!==undefined?`max="${escapeHtml(v.max)}"`:''} ${v.step!==undefined?`step="${escapeHtml(v.step)}"`:'step="any"'} />`;
    }
    if(q.type==='date')return `<input id="${id}" class="input" type="date" value="${escapeHtml(value||'')}" />`;
    if(q.type==='jalali')return `<div class="button-group"><input id="${id}" class="input" type="text" readonly value="${escapeHtml(value||'')}" placeholder="${ph||'۱۴۰۵/۰۱/۱۵'}" /><button class="btn btn-soft btn-sm" type="button" data-open-jalali="${escapeHtml(q.id)}">تقویم شمسی</button></div>`;
    if(q.type==='serial'){
      const m=String(value||'').match(/^(.)(\d{2})\/(\d{6})$/); const a=m?m[1]:'',b=m?m[2]:'',c=m?m[3]:'';
      return `<div class="serial-editor"><select id="${id}_1" class="input"><option value="">حرف</option>${SERIAL_LETTERS.map(ch=>`<option value="${ch}" ${a===ch?'selected':''}>${ch}</option>`).join('')}</select><input id="${id}_2" class="input" maxlength="2" inputmode="numeric" placeholder="۰۰" value="${escapeHtml(b)}" /><span>/</span><input id="${id}_3" class="input" maxlength="6" inputmode="numeric" placeholder="۰۰۰۰۰۰" value="${escapeHtml(c)}" /></div><div class="small muted">فرمت نهایی: حرف + دو رقم / شش رقم</div>`;
    }
    if(q.type==='select')return `<select id="${id}" class="input"><option value="">— انتخاب کنید —</option>${q.options.map(o=>`<option value="${escapeHtml(o)}" ${String(value??'')===String(o)?'selected':''}>${escapeHtml(o)}</option>`).join('')}</select>`;
    if(q.type==='radio')return `<div class="option-list">${q.options.map(o=>`<label class="option-item"><input type="radio" name="${id}" value="${escapeHtml(o)}" ${String(value??'')===String(o)?'checked':''} /><span>${escapeHtml(o)}</span></label>`).join('')}</div>`;
    if(q.type==='checkbox'){
      const arr=Array.isArray(value)?value:[]; return `<div class="option-list">${q.options.map(o=>`<label class="option-item"><input type="checkbox" data-multi="${escapeHtml(id)}" value="${escapeHtml(o)}" ${arr.includes(o)?'checked':''} /><span>${escapeHtml(o)}</span></label>`).join('')}</div>`;
    }
    return `<input id="${id}" class="input" type="text" value="${escapeHtml(value||'')}" placeholder="${ph}" />`;
  }

  function readAnswer(q,container,prefix) {
    const id=makeAnswerId(prefix,q.id);
    if(q.type==='serial'){
      const letter=$(id+'_1',container)?.value||''; const d2=normalizeDigits($(id+'_2',container)?.value||'').replace(/[^0-9]/g,'').slice(0,2); const d6=normalizeDigits($(id+'_3',container)?.value||'').replace(/[^0-9]/g,'').slice(0,6);
      if(!letter&&!d2&&!d6)return '';
      return `${letter}${d2}/${d6}`;
    }
    if(q.type==='radio')return $$(`input[name="${CSS.escape(id)}"]`,container).find(i=>i.checked)?.value||'';
    if(q.type==='checkbox')return $$(`input[data-multi="${CSS.escape(id)}"]`,container).filter(i=>i.checked).map(i=>i.value);
    return $(id,container)?.value??'';
  }

  function bindAnswer(q,container,prefix,onChanged,{autoNext=false}={}) {
    const id=makeAnswerId(prefix,q.id); const save=()=>{onChanged(q,readAnswer(q,container,prefix));};
    if(q.type==='radio')$$(`input[name="${CSS.escape(id)}"]`,container).forEach(el=>el.addEventListener('change',()=>{save();if(autoNext)setTimeout(()=>onChanged('__AUTO_NEXT__',null),130);}));
    else if(q.type==='checkbox')$$(`input[data-multi="${CSS.escape(id)}"]`,container).forEach(el=>el.addEventListener('change',save));
    if(q.type==='serial'){['_1','_2','_3'].forEach(s=>{const el=$(id+s,container);el?.addEventListener('input',save);el?.addEventListener('change',save);});}
    else if(q.type==='jalali'){
      const input=$(id,container); input?.addEventListener('input',save); $$('[data-open-jalali]',container).forEach(btn=>btn.addEventListener('click',()=>openJalaliPicker(q.id,container,prefix)));
    }else if(q.type==='select')$(id,container)?.addEventListener('change',()=>{save();if(autoNext)setTimeout(()=>onChanged('__AUTO_NEXT__',null),130);});
    else $(id,container)?.addEventListener('input',save);
  }

  function renderPublicRunner() {
    const form=state.runner.version; if(!form)return;
    const vis=visibleQuestions(form,state.runner.values);
    if(!vis.length){$('qText').textContent='هیچ سؤال قابل نمایشی وجود ندارد';$('qHelp').textContent='فرم خالی است یا شرایط نمایش هنوز برقرار نشده‌اند.';return;}
    if(state.runner.current>=vis.length)state.runner.current=vis.length-1;
    if(state.runner.current<0)state.runner.current=0;
    const q=vis[state.runner.current];
    $('runnerTitle').textContent=form.title||'اجرای فرم'; $('runnerDesc').textContent=form.description||''; $('runnerVersion').textContent=`نسخه ${faNumber(form.version_number)}`; $('runnerCounter').textContent=`سؤال ${faNumber(state.runner.current+1)} از ${faNumber(vis.length)}`; $('progressBar').style.width=`${((state.runner.current+1)/vis.length)*100}%`; $('questionKicker').textContent=`سؤال ${faNumber(state.runner.current+1)}`; $('qText').textContent=q.label; $('qHelp').textContent=helpText(q); $('requiredHint').textContent=q.required?'این سؤال الزامی است.':'این سؤال اختیاری است.'; $('prevBtn').disabled=state.runner.current===0; $('nextBtn').classList.toggle('hidden',state.runner.current>=vis.length-1); $('finishBtn').classList.toggle('hidden',state.runner.current<vis.length-1); $('runnerFoot').textContent=form.slogan||'اطلاعات شما پس از ثبت نهایی در دیتابیس مرکزی سامانه ذخیره می‌شود.';
    const area=$('answerArea'); area.innerHTML=renderQuestionInput(q,state.runner.values[q.id], 'public');
    bindAnswer(q,area,'public',(changedQ,value)=>{
      if(changedQ==='__AUTO_NEXT__'){goPublicNext();return;}
      state.runner.values[changedQ.id]=value; state.runner.values=pruneHiddenValues(form,state.runner.values);
      if(['radio','select','checkbox'].includes(q.type)) renderPublicRunner();
    },{autoNext:form.auto_next});
  }

  function goPublicPrev(){if(state.runner.current>0){state.runner.current--;renderPublicRunner();}}
  function goPublicNext(){
    const form=state.runner.version;if(!form)return; const vis=visibleQuestions(form,state.runner.values); const q=vis[state.runner.current];
    const current=readAnswer(q,$('answerArea'),'public'); state.runner.values[q.id]=current; state.runner.values=pruneHiddenValues(form,state.runner.values);
    const error=validateQuestion(q,state.runner.values);if(error)return ui.error(error);
    if(state.runner.current<visibleQuestions(form,state.runner.values).length-1){state.runner.current++;renderPublicRunner();}
  }

  async function finishPublic() {
    const form=state.runner.version;if(!form)return;
    const vis=visibleQuestions(form,state.runner.values); const q=vis[state.runner.current]; if(q)state.runner.values[q.id]=readAnswer(q,$('answerArea'),'public'); state.runner.values=pruneHiddenValues(form,state.runner.values);
    const cleanedValues=normalizeSubmissionValues(form,state.runner.values);
    const errors=collectResponseErrors(form,cleanedValues);
    if(errors.length)return ui.error(`لطفاً موارد زیر را اصلاح کنید:
${errors.map((item,index)=>`${faNumber(index+1)}. ${item}`).join('
')}`);
    if(!await ui.confirm('اطمینان دارید اطلاعات واردشده صحیح است و ثبت نهایی شود؟ پس از ثبت، برای ویرایش باید با مدیر سامانه هماهنگ شود.','ثبت نهایی اطلاعات'))return;
    $('finishBtn').disabled=true;
    try{
      const {data,error:rpcError}=await state.sb.rpc('submit_public_response',{p_form_id:form.form_id,p_form_version_id:form.id,p_response:cleanedValues,p_device_name:state.runner.device_name||''});
      if(rpcError)throw rpcError;
      state.runner.values={};state.runner.current=0;state.runner.pendingVersion=null;
      await ui.success(`اطلاعات با موفقیت ثبت شد. کد پیگیری: ${data}`);
      await loadPublicForm({silent:true});
    }catch(error){ui.error(error.message||'ثبت اطلاعات ناموفق بود.');}
    finally{$('finishBtn').disabled=false;}
  }

  async function loadPublicForm({silent=false}={}) {
    if(!state.sb)return;
    if(!silent){$('publicLoading').classList.remove('hidden');$('publicUnavailable').classList.add('hidden');$('runnerPanel').classList.add('hidden');}
    try{
      const {data,error}=await state.sb.from('form_versions').select('*').eq('slug',FORM_SLUG).eq('is_published',true).maybeSingle();
      if(error)throw error;
      if(!data){$('publicLoading').classList.add('hidden');$('publicUnavailable').classList.remove('hidden');$('publicUnavailableMessage').textContent='هنوز هیچ نسخه‌ای از فرم توسط مدیر منتشر نشده است.';setConnection('منتشر نشده','neutral');return;}
      const version={...data,form_id:data.form_id,questions:Array.isArray(data.questions)?data.questions.map(normalizeQuestion):[]};
      if(state.runner.version && state.runner.version.id!==version.id && Object.keys(state.runner.values).length){state.runner.pendingVersion=version;$('publicUpdateBanner').classList.remove('hidden');}
      else {state.runner.version=version;state.runner.pendingVersion=null;state.runner.current=0;state.runner.values={};$('publicUpdateBanner').classList.add('hidden');}
      $('publicLoading').classList.add('hidden');$('publicUnavailable').classList.add('hidden');$('runnerPanel').classList.remove('hidden');$('runnerDeviceName').value=state.runner.deviceName;renderPublicRunner();setConnection('متصل و آماده','success');subscribePublicRealtime(version.form_id);
    }catch(error){$('publicLoading').classList.add('hidden');$('publicUnavailable').classList.remove('hidden');$('publicUnavailableMessage').textContent=error.message||'خطا در دریافت فرم.';setConnection('خطای اتصال','danger');if(!silent)ui.error(error.message||'دریافت فرم ناموفق بود.');}
  }

  function subscribePublicRealtime(formId) {
    if(!state.sb||!formId)return;
    if(state.publicChannel)state.sb.removeChannel(state.publicChannel);
    state.publicChannel=state.sb.channel(`public-form-${formId}`).on('postgres_changes',{event:'*',schema:'public',table:'form_versions',filter:`form_id=eq.${formId}`},()=>loadPublicForm({silent:true})).subscribe();
  }

  function loadPendingVersion(){if(!state.runner.pendingVersion)return;state.runner.version=state.runner.pendingVersion;state.runner.pendingVersion=null;state.runner.values={};state.runner.current=0;$('publicUpdateBanner').classList.add('hidden');renderPublicRunner();}

  function serialValueValid(value){return !value || new RegExp(`^[${SERIAL_LETTERS.join('')}][0-9]{2}\\/[0-9]{6}$`).test(value);}

  function renderEditResponse() {
    const panel=$('adminEditPanel'); if(!state.editResponse||!state.editSchema){panel.classList.add('hidden');return;}
    panel.classList.remove('hidden'); $('editResponseMeta').textContent=`رکورد ${state.editResponse.id} · ثبت ${formatDateTime(state.editResponse.created_at)} · نسخه ${state.editResponse.schemaVersion||'—'}`;
    const values=state.editResponse.values||{}; const visible=visibleQuestions({questions:state.editSchema},values); const area=$('editAnswerArea'); area.innerHTML='';
    visible.forEach(q=>{
      const wrap=document.createElement('div');wrap.className='field'; const label=document.createElement('label');label.textContent=q.label+(q.required?' *':'');wrap.appendChild(label); const inputWrap=document.createElement('div');inputWrap.innerHTML=renderQuestionInput(q,values[q.id],'edit');wrap.appendChild(inputWrap);area.appendChild(wrap);bindAnswer(q,inputWrap,'edit',(changedQ,value)=>{if(changedQ==='__AUTO_NEXT__')return;state.editResponse.values[changedQ.id]=value;state.editResponse.values=pruneHiddenValues({questions:state.editSchema},state.editResponse.values);});
    });
  }

  async function editResponse(row) {
    state.editResponse={...row,values:clone(row.response||{}),schemaVersion:row.form_versions?.version_number || '—'}; state.editSchema=(Array.isArray(row.schema_snapshot)?row.schema_snapshot:state.form.questions).map(normalizeQuestion); renderEditResponse(); $('adminEditPanel').scrollIntoView({behavior:'smooth',block:'start'});
  }

  async function saveEditedResponse() {
    if(!state.editResponse||!state.editSchema)return;
    const form={questions:state.editSchema};
    const cleanedValues=normalizeSubmissionValues(form,state.editResponse.values);
    const errors=collectResponseErrors(form,cleanedValues);
    if(errors.length)return ui.error(`لطفاً موارد زیر را اصلاح کنید:
${errors.map((item,index)=>`${faNumber(index+1)}. ${item}`).join('
')}`);
    try{
      state.editResponse.values=pruneHiddenValues({questions:state.editSchema},cleanedValues);
      const {error}=await state.sb.from('responses').update({response:state.editResponse.values,device_name:state.editResponse.device_name||'',updated_at:nowIso(),updated_by:state.user.id}).eq('id',state.editResponse.id);
      if(error)throw error;
      await logAudit('update_response','responses',state.editResponse.id,{}); await ui.success('پاسخ با موفقیت به‌روزرسانی شد.'); state.editResponse=null;state.editSchema=null;renderEditResponse();await loadResponses();
    }catch(error){ui.error(error.message||'به‌روزرسانی پاسخ ناموفق بود.');}
  }

  function buildResponseColumns(rows) {
    const map=new Map();
    (state.form?.questions||[]).forEach(q=>map.set(q.id,q.label));
    rows.forEach(row=>(row.schema_snapshot||[]).forEach(q=>{if(!map.has(q.id))map.set(q.id,q.label);}));
    return [...map.entries()].map(([id,label])=>({id,label}));
  }

  async function loadResponses() {
    if(!state.form||state.currentAdminView!=='data')return;
    try{
      const from=(state.responses.page-1)*state.responses.perPage; const to=from+state.responses.perPage-1;
      let query=state.sb.from('responses').select('id,form_id,form_version_id,response,schema_snapshot,device_name,created_at,updated_at,form_versions(version_number)',{count:'exact'}).eq('form_id',state.form.id).order('created_at',{ascending:false}).range(from,to);
      const term=state.responses.search.trim(); if(term)query=query.ilike('search_text',`%${term.toLocaleLowerCase('fa-IR')}%`);
      const {data,error,count}=await query; if(error)throw error;
      state.responses.rows=(data||[]).map(r=>({...r,values:r.response||{}})); state.responses.total=count||0; state.responses.totalPages=Math.max(1,Math.ceil(state.responses.total/state.responses.perPage));
      if(state.responses.page>state.responses.totalPages){state.responses.page=state.responses.totalPages;return loadResponses();}
      renderDataTable();
    }catch(error){ui.error(error.message||'دریافت پاسخ‌ها ناموفق بود.');}
  }

  function renderDataTable() {
    const rows=state.responses.rows||[], cols=buildResponseColumns(rows), head=$('respHead'),body=$('respBody'); head.innerHTML='';body.innerHTML='';
    ['شناسه','زمان ثبت','دستگاه','نسخه','عملیات',...cols.map(c=>c.label)].forEach(label=>{const th=document.createElement('th');th.textContent=label;head.appendChild(th);});
    if(!rows.length){const tr=document.createElement('tr'),td=document.createElement('td');td.colSpan=5+cols.length;td.textContent='هنوز هیچ پاسخی ثبت نشده است.';tr.appendChild(td);body.appendChild(tr);}
    else rows.forEach(row=>{
      const tr=document.createElement('tr'); [row.id,formatDateTime(row.created_at),row.device_name||'—',`نسخه ${faNumber(row.form_versions?.version_number||'—')}`].forEach(v=>{const td=document.createElement('td');td.textContent=String(v);tr.appendChild(td);});
      const actions=document.createElement('td'); const edit=document.createElement('button');edit.type='button';edit.className='btn btn-soft btn-sm';edit.textContent='ویرایش';edit.onclick=()=>editResponse(row);const del=document.createElement('button');del.type='button';del.className='btn btn-danger btn-sm';del.textContent='حذف';del.onclick=()=>deleteResponse(row.id);actions.append(edit,document.createTextNode(' '),del);tr.appendChild(actions);
      cols.forEach(col=>{const td=document.createElement('td');const v=row.values?.[col.id];td.textContent=Array.isArray(v)?v.join('، '):(v??'');tr.appendChild(td);});body.appendChild(tr);
    });
    $('respPageLabel').textContent=`صفحه ${faNumber(state.responses.page)} از ${faNumber(state.responses.totalPages)}`; $('respPrevBtn').disabled=state.responses.page<=1; $('respNextBtn').disabled=state.responses.page>=state.responses.totalPages;
  }

  async function deleteResponse(id) {
    if(!await ui.confirm(`پاسخ ${id} حذف شود؟ این عملیات قابل بازگشت نیست.`,'حذف پاسخ'))return;
    try{const {error}=await state.sb.from('responses').delete().eq('id',id);if(error)throw error;await logAudit('delete_response','responses',id,{});await loadResponses();state.form.responseCount=Math.max(0,(state.form.responseCount||0)-1);updateBuilderStats();}catch(error){ui.error(error.message||'حذف پاسخ ناموفق بود.');}
  }
  async function clearAllResponses() {
    if(!await ui.confirm('تمام پاسخ‌های فرم حذف شوند؟ این عملیات دائمی است. بهتر است ابتدا خروجی پشتیبان بگیرید.','حذف همه پاسخ‌ها'))return;
    try{const {data,error}=await state.sb.rpc('delete_all_form_responses',{p_form_id:state.form.id});if(error)throw error;await logAudit('delete_all_responses','forms',state.form.id,{deleted:data});state.form.responseCount=0;state.responses.page=1;await loadResponses();updateBuilderStats();await ui.success(`${faNumber(data||0)} پاسخ حذف شد.`);}catch(error){ui.error(error.message||'حذف پاسخ‌ها ناموفق بود.');}
  }

  async function fetchAllResponses() {
    const all=[]; let from=0; const size=1000;
    while(true){const {data,error}=await state.sb.from('responses').select('id,form_id,form_version_id,response,schema_snapshot,device_name,created_at,updated_at,form_versions(version_number)').eq('form_id',state.form.id).order('created_at',{ascending:true}).range(from,from+size-1);if(error)throw error;if(!data?.length)break;all.push(...data);if(data.length<size)break;from+=size;}
    return all;
  }
  async function exportResponsesJson() {
    try{const rows=await fetchAllResponses();exportJson({format:'student-form-responses',exportedAt:nowIso(),form:{id:state.form.id,title:state.form.title},rows},'student-form-responses.json');}catch(error){ui.error(error.message||'خروجی JSON ناموفق بود.');}
  }

  function xmlEscape(value) { return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g,''); }
  function excelCol(n){let s='';while(n){const m=(n-1)%26;s=String.fromCharCode(65+m)+s;n=Math.floor((n-1)/26);}return s;}
  function textCell(ref,value){return `<c r="${ref}" t="inlineStr"><is><t>${xmlEscape(value)}</t></is></c>`;}
  function buildSheetXml(rows){const body=rows.map((row,r)=>`<row r="${r+1}">${row.map((v,c)=>textCell(`${excelCol(c+1)}${r+1}`,v)).join('')}</row>`).join('');return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0" rightToLeft="1"/></sheetViews><sheetData>${body}</sheetData><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></worksheet>`;}
  function toU8(str){return new TextEncoder().encode(str);}
  function crc32(buf){let c=0xffffffff;for(let i=0;i<buf.length;i++){c^=buf[i];for(let k=0;k<8;k++)c=(c>>>1)^(0xedb88320&-(c&1));}return(c^0xffffffff)>>>0;}
  function writeU16(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;}
  function writeU32(a,o,v){a[o]=v&255;a[o+1]=(v>>>8)&255;a[o+2]=(v>>>16)&255;a[o+3]=(v>>>24)&255;}
  function dosDateTime(d){return{time:((d.getHours()<<11)|(d.getMinutes()<<5)|(d.getSeconds()>>1))&65535,date:((((d.getFullYear()-1980)&127)<<9)|((d.getMonth()+1)<<5)|d.getDate())&65535};}
  function zipStore(files){const local=[],central=[];let offset=0;const now=dosDateTime(new Date());for(const f of files){const name=toU8(f.name),data=typeof f.data==='string'?toU8(f.data):f.data,crc=crc32(data),lh=new Uint8Array(30+name.length);writeU32(lh,0,0x04034b50);writeU16(lh,4,20);writeU16(lh,6,0);writeU16(lh,8,0);writeU16(lh,10,now.time);writeU16(lh,12,now.date);writeU32(lh,14,crc);writeU32(lh,18,data.length);writeU32(lh,22,data.length);writeU16(lh,26,name.length);writeU16(lh,28,0);lh.set(name,30);local.push(lh,data);const ch=new Uint8Array(46+name.length);writeU32(ch,0,0x02014b50);writeU16(ch,4,20);writeU16(ch,6,20);writeU16(ch,8,0);writeU16(ch,10,0);writeU16(ch,12,now.time);writeU16(ch,14,now.date);writeU32(ch,16,crc);writeU32(ch,20,data.length);writeU32(ch,24,data.length);writeU16(ch,28,name.length);writeU16(ch,30,0);writeU16(ch,32,0);writeU16(ch,34,0);writeU16(ch,36,0);writeU32(ch,38,0);writeU32(ch,42,offset);ch.set(name,46);central.push(ch);offset+=lh.length+data.length;}const centralSize=central.reduce((s,a)=>s+a.length,0),end=new Uint8Array(22);writeU32(end,0,0x06054b50);writeU16(end,4,0);writeU16(end,6,0);writeU16(end,8,files.length);writeU16(end,10,files.length);writeU32(end,12,centralSize);writeU32(end,16,offset);writeU16(end,20,0);const out=new Uint8Array(offset+centralSize+22);let p=0;for(const part of [...local,...central,end]){out.set(part,p);p+=part.length;}return out;}
  function buildXlsx(rows){const contentTypes=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>`;const rootRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>`;const wb=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="پاسخ‌ها" sheetId="1" r:id="rId1"/></sheets></workbook>`;const wbRels=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>`;const styles=`<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="1"><font><sz val="11"/><name val="Arial"/></font></fonts><fills count="1"><fill><patternFill patternType="none"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs></styleSheet>`;const sheet=buildSheetXml(rows);return zipStore([{name:'[Content_Types].xml',data:contentTypes},{name:'_rels/.rels',data:rootRels},{name:'xl/workbook.xml',data:wb},{name:'xl/_rels/workbook.xml.rels',data:wbRels},{name:'xl/styles.xml',data:styles},{name:'xl/worksheets/sheet1.xml',data:sheet}]);}
  async function exportResponsesXlsx(){try{const rows=await fetchAllResponses();const cols=buildResponseColumns(rows);const table=[['شناسه','زمان ثبت','دستگاه',...cols.map(c=>c.label)]];rows.forEach(r=>table.push([r.id,formatDateTime(r.created_at),r.device_name||'',...cols.map(c=>{const v=r.response?.[c.id];return Array.isArray(v)?v.join('، '):(v??'');})]));const blob=new Blob([buildXlsx(table)],{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='student-form-responses.xlsx';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);}catch(error){ui.error(error.message||'خروجی Excel ناموفق بود.');}}

  function openJalaliPicker(questionId,container,prefix) {
    const wrap=$('jalaliWrap'); if(!wrap)return;
    const now=new Date(),today=toJalaali(now.getFullYear(),now.getMonth()+1,now.getDate());
    state.jalali={questionId,container,prefix,jy:today.jy,jm:today.jm};
    const render=()=>{
      $('jpTitle').textContent=`${monthName(state.jalali.jm)} ${faNumber(state.jalali.jy)}`; $('jpSub').textContent='روز موردنظر را انتخاب کنید.'; const y=$('jpYear'),m=$('jpMonth'); y.innerHTML='';m.innerHTML='';
      for(let yy=1200;yy<=1500;yy++){const o=document.createElement('option');o.value=String(yy);o.textContent=faNumber(yy);if(yy===state.jalali.jy)o.selected=true;y.appendChild(o);} for(let mm=1;mm<=12;mm++){const o=document.createElement('option');o.value=String(mm);o.textContent=monthName(mm);if(mm===state.jalali.jm)o.selected=true;m.appendChild(o);}
      const days=$('jpDays');days.innerHTML='';['ش','ی','د','س','چ','پ','ج'].forEach(h=>{const el=document.createElement('div');el.className='jalali-head';el.textContent=h;days.appendChild(el);}); const g=toGregorian(state.jalali.jy,state.jalali.jm,1),start=weekdayOfGregorian(g.gy,g.gm,g.gd);for(let i=0;i<start;i++)days.appendChild(document.createElement('div')); for(let d=1;d<=jalaaliMonthLength(state.jalali.jy,state.jalali.jm);d++){const el=document.createElement('button');el.type='button';el.className='jalali-day';el.textContent=faNumber(d);el.dataset.day=d;el.addEventListener('click',()=>{const input=$(makeAnswerId(prefix,questionId),container);if(input){input.value=`${state.jalali.jy}/${String(state.jalali.jm).padStart(2,'0')}/${String(d).padStart(2,'0')}`;input.dispatchEvent(new Event('input',{bubbles:true}));}wrap.classList.add('hidden');});days.appendChild(el);}
    };
    wrap.classList.remove('hidden'); $('jpClose').onclick=()=>wrap.classList.add('hidden'); wrap.querySelector('.modal-backdrop').onclick=()=>wrap.classList.add('hidden'); $('jpPrevMonth').onclick=()=>{state.jalali.jm--;if(state.jalali.jm<1){state.jalali.jm=12;state.jalali.jy--;}if(state.jalali.jy<1200)state.jalali.jy=1200;render();}; $('jpNextMonth').onclick=()=>{state.jalali.jm++;if(state.jalali.jm>12){state.jalali.jm=1;state.jalali.jy++;}if(state.jalali.jy>1500)state.jalali.jy=1500;render();}; $('jpYear').onchange=()=>{state.jalali.jy=Number($('jpYear').value);render();}; $('jpMonth').onchange=()=>{state.jalali.jm=Number($('jpMonth').value);render();}; render();
  }

  function monthName(m){return['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور','مهر','آبان','آذر','دی','بهمن','اسفند'][m-1]||'';}
  function div(a,b){return Math.floor(a/b);}
  function mod(a,b){return a-div(a,b)*b;}
  function jalCal(jy){const breaks=[-61,9,38,199,426,686,756,818,1111,1181,1210,1635,2060,2097,2192,2262,2324,2394,2456,3178];let bl=breaks.length,gy=jy+621,leapJ=-14,jp=breaks[0],jm,jump,n,i;if(jy<jp||jy>=breaks[bl-1])throw new Error('Invalid Jalaali year');for(i=1;i<bl;i++){jm=breaks[i];jump=jm-jp;if(jy<jm)break;leapJ+=div(jump,33)*8+div(mod(jump,33),4);jp=jm;}n=jy-jp;leapJ+=div(n,33)*8+div(mod(n,33)+3,4);if(mod(jump,33)===4&&jump-n===4)leapJ++;const leapG=div(gy,4)-div((div(gy,100)+1)*3,4)-150,march=20+leapJ-leapG;return{leap:mod(n+1,33)-1<4?1:0,gy,march};}
  function g2d(gy,gm,gd){return div(1461*(gy+4800+div(gm-14,12)),4)+div(367*(gm-2-12*div(gm-14,12)),12)-div(3*div(gy+4900+div(gm-14,12),100),4)+gd-32075;}
  function d2g(jdn){let j=4*jdn+139361631;j+=div(div(4*jdn+183187720,146097)*3,4)*4-3908;const i=div(mod(j,1461),4)*5+308,gd=div(mod(i,153),5)+1,gm=mod(div(i,153),12)+1,gy=div(j,1461)-100100+div(8-gm,6);return{gy,gm,gd};}
  function j2d(jy,jm,jd){const r=jalCal(jy);return g2d(r.gy,3,r.march)+(jm-1)*31-div(jm,7)*(jm-7)+jd-1;}
  function d2j(jdn){const g=d2g(jdn);let jy=g.gy-621,r=jalCal(jy),jdn1f=g2d(g.gy,3,r.march),k=jdn-jdn1f,jm,jd;if(k>=0){if(k<=185){jm=1+div(k,31);jd=mod(k,31)+1;return{jy,jm,jd};}k-=186;}else{jy--;k+=179;if(r.leap===1)k++;}jm=7+div(k,30);jd=mod(k,30)+1;return{jy,jm,jd};}
  function toJalaali(gy,gm,gd){return d2j(g2d(gy,gm,gd));}
  function toGregorian(jy,jm,jd){return d2g(j2d(jy,jm,jd));}
  function jalaaliMonthLength(jy,jm){return jm<=6?31:jm<=11?30:(jalCal(jy).leap===1?30:29);}
  function weekdayOfGregorian(gy,gm,gd){const d=new Date(Date.UTC(gy,gm-1,gd));return(d.getUTCDay()+1)%7;}

  function bindDragDrop(){
    const list=$('questionList'); if(!list)return;
    list.addEventListener('dragstart',e=>{const card=e.target.closest('.question-card');if(!card)return;state.draggedId=card.dataset.id;card.classList.add('dragging');e.dataTransfer.effectAllowed='move';});
    list.addEventListener('dragend',e=>{const card=e.target.closest('.question-card');card?.classList.remove('dragging');$$('.question-card',list).forEach(c=>c.classList.remove('drag-over'));state.draggedId=null;});
    list.addEventListener('dragover',e=>{e.preventDefault();const target=e.target.closest('.question-card');if(!target||!state.draggedId||target.dataset.id===state.draggedId)return;$$('.question-card',list).forEach(c=>c.classList.remove('drag-over'));target.classList.add('drag-over');const rect=target.getBoundingClientRect();const after=e.clientY>rect.top+rect.height/2;if(after)target.after(list.querySelector(`[data-id="${CSS.escape(state.draggedId)}"]`));else target.before(list.querySelector(`[data-id="${CSS.escape(state.draggedId)}"]`));});
    list.addEventListener('drop',()=>{const ids=$$('.question-card',list).map(c=>c.dataset.id);const copy=ids.map(id=>state.form.questions.find(q=>q.id===id));const error=localValidateSchema(copy);if(error){ui.error(error);renderQuestionList();return;}state.form.questions=copy;state.draftDirty=true;renderQuestionList();renderConditionEditor();});
  }

  function bindCommonEvents(){
    $('themeBtn')?.addEventListener('click',()=>applyTheme(document.body.classList.contains('dark')?'light':'dark'));
    $('publicRetryBtn')?.addEventListener('click',()=>loadPublicForm());
    $('adminEntryBtn')?.addEventListener('click',MODE==='admin'?goPublic:goAdmin);
    $('backToPublicBtn')?.addEventListener('click',goPublic);
    $('loginBtn')?.addEventListener('click',loginAdmin);
    $('loginPassword')?.addEventListener('keydown',e=>{if(e.key==='Enter')loginAdmin();});
    $('runnerRefreshBtn')?.addEventListener('click',()=>loadPublicForm());
    $('loadNewVersionBtn')?.addEventListener('click',loadPendingVersion);
    $('prevBtn')?.addEventListener('click',goPublicPrev);
    $('nextBtn')?.addEventListener('click',goPublicNext);
    $('finishBtn')?.addEventListener('click',finishPublic);
    $('runnerDeviceName')?.addEventListener('input',e=>{state.runner.deviceName=e.target.value.trim();localStorage.setItem(DEVICE_KEY,state.runner.deviceName);});
  }

  function bindAdminEvents(){
    $('saveDraftBtn')?.addEventListener('click',saveDraft);
    $('publishBtn')?.addEventListener('click',publishDraft);
    $('resetSeedBtn')?.addEventListener('click',resetSeed);
    $('changePasswordBtn')?.addEventListener('click',changePassword);
    $('openPublicBtn')?.addEventListener('click',goPublic);
    $('refreshAdminBtn')?.addEventListener('click',async()=>{if(state.draftDirty&&!await ui.confirm('تغییرات ذخیره‌نشده روی این دستگاه با دریافت نسخه جدید جایگزین می‌شود. ادامه می‌دهید؟','دریافت نسخه جدید'))return;await loadAdminState({silent:false,overwrite:true});});
    $('logoutBtn')?.addEventListener('click',async()=>{if(await ui.confirm('از حساب مدیر خارج شوید؟'))await signOut();});
    $('saveEditedResponseBtn')?.addEventListener('click',saveEditedResponse);
    $('closeEditPanelBtn')?.addEventListener('click',()=>{state.editResponse=null;state.editSchema=null;renderEditResponse();});
    $$('#adminDashboard [data-admin-view]').forEach(btn=>btn.addEventListener('click',()=>switchAdminView(btn.dataset.adminView)));
    $('formTitle')?.addEventListener('input',()=>{syncBuilderMetaFromUI();updateBuilderStats();});$('formDesc')?.addEventListener('input',()=>{syncBuilderMetaFromUI();updateBuilderStats();});$('autoNext')?.addEventListener('change',()=>{syncBuilderMetaFromUI();updateBuilderStats();});$('deviceName')?.addEventListener('input',()=>{syncBuilderMetaFromUI();updateBuilderStats();});$('slogan')?.addEventListener('input',()=>{syncBuilderMetaFromUI();updateBuilderStats();});
    $('addConditionBtn')?.addEventListener('click',()=>{const sources=getConditionSourceQuestions();if(!sources.length)return ui.error('برای این سؤال، سؤال قبلی قابل استفاده‌ای وجود ندارد.');state.conditionDraft.push({questionId:sources[0].id,operator:'eq',value:''});state.draftDirty=true;renderConditionEditor();});
    $('conditionList')?.addEventListener('change',e=>{if(e.target.matches('[data-field]')){readConditionsFromDOM();state.draftDirty=true;if(e.target.dataset.field==='operator')renderConditionEditor();}});
    $('conditionList')?.addEventListener('click',e=>{const b=e.target.closest('[data-delete-condition]');if(!b)return;readConditionsFromDOM();state.conditionDraft.splice(Number(b.dataset.deleteCondition),1);state.draftDirty=true;renderConditionEditor();});
    $('newCondMode')?.addEventListener('change',()=>{state.conditionMode=$('newCondMode').value;state.draftDirty=true;});
    $('addQuestionBtn')?.addEventListener('click',async()=>{
      try{
        syncBuilderMetaFromUI(); const q=buildQuestionFromEditor(); if(!q.label)return ui.error('متن سؤال را وارد کنید.');
        if(['select','radio','checkbox'].includes(q.type)&&!q.options.length)return ui.error('برای این نوع سؤال حداقل یک گزینه لازم است.');
        if(state.editingQuestionId){const i=getEditingIndex();if(i<0)return ui.error('سؤال برای ویرایش پیدا نشد.');const candidate=state.form.questions.slice();candidate[i]=q;const error=localValidateSchema(candidate);if(error)return ui.error(error);state.form.questions=candidate;}
        else {const candidate=q;const next=state.form.questions.slice();$('newOrder').value==='start'?next.unshift(candidate):next.push(candidate);const error=localValidateSchema(next);if(error)return ui.error(error);state.form.questions=next;}
        state.draftDirty=true;clearQuestionEditor();renderBuilder();await ui.success('سؤال در پیش‌نویس قرار گرفت. برای اعمال عمومی، ذخیره و انتشار را انجام دهید.');
      }catch(error){ui.error(error.message||'ثبت سؤال ناموفق بود.');}
    });
    $('clearDraftBtn')?.addEventListener('click',clearQuestionEditor);
    $('questionList')?.addEventListener('click',e=>{const b=e.target.closest('[data-action]');const card=e.target.closest('.question-card');if(!b||!card)return;questionAction(b.dataset.action,card.dataset.id);});
    $('importFile')?.addEventListener('change',e=>{const f=e.target.files?.[0];if(f)importFormJson(f);e.target.value='';});
    $('exportFormBtn')?.addEventListener('click',exportFormJson);
    $('refreshResponsesBtn')?.addEventListener('click',loadResponses);
    $('responseSearch')?.addEventListener('input',debounce(()=>{state.responses.search=$('responseSearch').value.trim();state.responses.page=1;loadResponses();},400));
    $('responsePerPage')?.addEventListener('change',()=>{state.responses.perPage=Number($('responsePerPage').value)||50;state.responses.page=1;loadResponses();});
    $('respPrevBtn')?.addEventListener('click',()=>{if(state.responses.page>1){state.responses.page--;loadResponses();}});
    $('respNextBtn')?.addEventListener('click',()=>{if(state.responses.page<state.responses.totalPages){state.responses.page++;loadResponses();}});
    $('exportResponsesBtn')?.addEventListener('click',exportResponsesJson);$('exportExcelBtn')?.addEventListener('click',exportResponsesXlsx);$('clearResponsesBtn')?.addEventListener('click',clearAllResponses);
  }

  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      const modal=$('modalRoot'); if(modal&&!modal.classList.contains('hidden')&&!state.modal.isConfirm){state.modal.resolver?.(false);modal.classList.add('hidden');return;}
      const jp=$('jalaliWrap');if(jp&&!jp.classList.contains('hidden'))jp.classList.add('hidden');
    }
    if(e.key!=='Enter'||e.shiftKey||e.altKey||e.ctrlKey||e.metaKey)return;
    const active=document.activeElement;
    if(active?.tagName==='TEXTAREA')return;
    if(MODE==='admin'&&$('adminLoginView')&&!$('adminLoginView').classList.contains('hidden')&&active?.id==='loginPassword'){e.preventDefault();loginAdmin();return;}
    if(MODE==='form'&&state.runner.version&&active?.closest('#answerArea')){e.preventDefault();const vis=visibleQuestions(state.runner.version,state.runner.values);if(state.runner.current>=vis.length-1)finishPublic();else goPublicNext();}
  });

  async function bootPublic(){
    $('runnerDeviceName').value=state.runner.deviceName; await loadPublicForm(); setInterval(()=>loadPublicForm({silent:true}),30000);
  }

  async function bootAdmin(){
    try{
      const has=await ensureAdminSession();
      if(has){showAdminDashboard();await loadAdminState({silent:true});}else showAdminLogin();
    }catch(error){showAdminLogin(error.message||'نشست مدیر معتبر نیست.');}
  }

  async function boot(){
    document.title=`${CFG.APP_NAME||'فرم‌ساز'} | ${CFG.SCHOOL_NAME||''}`;
    $('brandTitle').textContent=CFG.SCHOOL_NAME||'دبیرستان نمونه دولتی شهید شیرآقایی بهشهر';
    $('brandSub').textContent=CFG.APP_NAME||'سامانه مرکزی فرم‌ساز و ثبت اطلاعات دانش‌آموز';
    applyTheme(localStorage.getItem(THEME_KEY)==='dark'?'dark':'light');showOnly(MODE);bindCommonEvents();
    if(!isConfigReady()){showConfigError();return;} hideConfigError();
    try{state.sb=makeClient();state.sb.auth.onAuthStateChange(async(event)=>{if(event==='SIGNED_OUT'&&MODE==='admin')showAdminLogin();});setConnection('در حال اتصال…','neutral');if(MODE==='admin'){bindAdminEvents();await bootAdmin();}else await bootPublic();}
    catch(error){setConnection('خطا','danger');if(MODE==='admin')showAdminLogin(error.message);else{$('publicLoading').classList.add('hidden');$('publicUnavailable').classList.remove('hidden');$('publicUnavailableMessage').textContent=error.message;}}
  }

  bindDragDrop();
  boot();
})();
