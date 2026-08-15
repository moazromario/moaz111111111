# وثيقة الأمن والأذونات ومصفوفة الصلاحيات لـ Firestore ERP
# Firestore Security Matrix & Hardening Plan

**تاريخ التوثيق:** أغسطس 2026  
**النظام:** ERP مصنع النجار للأثاث (Smart Factory ERP)  
**اسم القاعدة المحدثة للاختبار:** `firestore.rules.staging`  
**حالة البيئة الحالية (Production):** مشغلة مع Catch-all مؤقت لحين استكمال ربط Firebase Authentication على مستوى التطبيق.

---

## 1. حصر شامل لمجموعات البيانات (Firestore Collections Inventory)

تم فحص وإحصاء **55 مجموعة بيانات (Collection)** في قاعدة البيانات، مع تصنيف الحساسية والعمليات المطلوبة:

| # | اسم المجموعة (Collection) | نوع البيانات | مستوى الحساسية | القراءة (Read) | الإنشاء/التحديث/الحذف (C/U/D) |
|---|---------------------------|--------------|----------------|----------------|-------------------------------|
| 1 | `users` | مستخدمين وكلمات مرور وصلاحيات | **حرجة جداً** | المستخدم ذاته + Admin | Admin / Super Admin |
| 2 | `settings` | إعدادات النظام وتخصيص الشركة | **عالية** | جميع المستخدمين المسجلين | Admin / Super Admin |
| 3 | `warehouses` | المستودعات والمخازن | متوسطة | Inventory, Reports | Inventory |
| 4 | `units` | وحدات القياس | منخفضة | جميع المستخدمين المسجلين | Inventory |
| 5 | `costCenters` | مراكز التكلفة المحاسبية | **مالية عالية** | Finance, Reports | Finance, Admin |
| 6 | `items` | دليل الخامات والأصناف ورصيد المخزون | مالية/مخزون | Inventory, Production, Purchasing, Reports | Inventory |
| 7 | `suppliers` | دليل الموردين وديونهم | **موردين/مالية** | Purchasing, Finance, Reports | Purchasing |
| 8 | `purchases` | فواتير الشراء والتوريد | **مالية/مشتريات** | Purchasing, Finance, Reports | Purchasing |
| 9 | `supplierPayments` | سندات صرف وحوالات الموردين | **مالية/خزينة** | Purchasing, Finance, Reports | Purchasing, Finance |
| 10 | `issuances` | أذون صرف الخامات لأوامر الشغل | مخزون/إنتاج | Inventory, Production, Reports | Inventory, Production |
| 11 | `productionJobs` | بطاقات التشغيل الإنتاجي | إنتاج | Production, Reports | Production |
| 12 | `furnitureWorkOrders` | أوامر شغل الأثاث والغرف | إنتاج/مبيعات | Production, Sales, Reports | Production, Sales |
| 13 | `loadingManifests` | مانيقستو كشوفات التحميل والنقل | إنتاج/لوجستيات | Production, Sales, Reports | Production |
| 14 | `waste` | سكراب وهالك الخامات | مخزون/إنتاج | Inventory, Production, Reports | Inventory, Production |
| 15 | `bladeSharpening` | صيانة وسن السلاح والمنشار | صيانة | Maintenance, Reports | Maintenance |
| 16 | `plateSharpening` | صيانة وسن صواني التقطيع | صيانة | Maintenance, Reports | Maintenance |
| 17 | `maintenanceOrders` | أوامر صيانة الماكينات | صيانة | Maintenance, Reports | Maintenance |
| 18 | `employees` | ملفات الموظفين والرواتب الأساسية | **HR/حساسة** | HR, Finance, Reports | HR |
| 19 | `attendance` | سجلات الحضور والغياب | HR/موظفين | HR, Reports | HR |
| 20 | `hrTransactions` | المكافآت والحوافز والجزاءات | **HR/مالية** | HR, Finance, Reports | HR |
| 21 | `loans` | السلف والقروض | **HR/مالية** | HR, Finance, Reports | HR, Finance |
| 22 | `payrolls` | المسيرات والرواتب الشهرية | **HR/مالية حرجة** | HR, Finance, Admin | HR, Admin |
| 23 | `productionRecords` | سجلات الإنتاج بالقطعة للعمالة | HR/إنتاج | Production, HR, Reports | Production, HR |
| 24 | `jobLabors` | تكاليف وساعات العمالة المباشرة | إنتاج/مالية | Production, Finance, Reports | Production |
| 25 | `jobOtherCosts` | المصاريف المباشرة للأوامر | إنتاج/مالية | Production, Finance, Reports | Production, Finance |
| 26 | `deliveryReceipts` | إيصالات واستلامات العملاء | مبيعات | Sales, Production, Reports | Sales, Production |
| 27 | `deliveryDocuments` | مستندات الشحن والتسليم | مبيعات | Sales, Production, Reports | Sales, Production |
| 28 | `customers` | دليل العملاء وديونهم | **عملاء/مالية** | Sales, Finance, Reports | Sales |
| 29 | `salesOrders` | عقود المبيعات والبيابين | **مبيعات/مالية** | Sales, Finance, Reports | Sales |
| 30 | `showrooms` | المعارض صالات العرض | مبيعات/معارض | Sales, Showroom, Reports | Sales, Showroom, Admin |
| 31 | `showroomInventory` | مخزون عينات ومنتجات المعارض | مبيعات/معارض | Sales, Showroom, Inventory, Reports | Showroom, Inventory |
| 32 | `transferOrders` | أذون تحويل المنتجات للمعارض | مبيعات/معارض | Sales, Showroom, Inventory, Reports | Showroom, Inventory |
| 33 | `boms` | شجرات المنتج والتراكيب (BOM) | إنتاج/مخزون | Production, Inventory, Reports | Production |
| 34 | `workCenters` | مراكز العمل وتكلفة الساعة | إنتاج | Production, Reports | Production, Admin |
| 35 | `manufacturingOperations` | العمليات المسارية والتشغيلية | إنتاج | Production, Reports | Production |
| 36 | `productRecipes` | معادلات التكلفة المعيارية | إنتاج/مالية | Production, Inventory, Reports | Production |
| 37 | `safes` | أرصدة الخزائن والبنوك | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 38 | `safeTransactions` | حركات المقبوضات والمصروفات | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 39 | `safeAudits` | جلسات محاضر جرد الخزائن | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 40 | `safeSettlements` | تصفية وتسوية الخزائن | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 41 | `banks` | الحسابات البنكية وأرصدتها | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 42 | `bankTransactions` | الحركات البنكية كشوف الحساب | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 43 | `bankChecks` | حافظة ومتابعة الشيكات الصادرة والواردة | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 44 | `treasuryCustodies` | العهد المالية للموظفين | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 45 | `custodySettlements` | تصفية وتسوية العهد | **مالية حرجة** | Finance, Admin | Finance, Admin |
| 46 | `vehicles` | شاحنات وسيارات المصنع | صيانة/لوجستيات | Maintenance, Production, Reports | Maintenance, Production |
| 47 | `vehicleExpenses` | مصاريف الوقود وصيانة السيارات | مالية/صيانة | Maintenance, Finance, Reports | Maintenance, Finance |
| 48 | `byproductSales` | مبيعات النشارة وخلفات الخشب | مبيعات/مالية | Sales, Finance, Reports | Sales, Finance |
| 49 | `lostSales` | فرص المبيعات الضائعة | مبيعات | Sales, Reports | Sales |
| 50 | `stockAudits` | جلسات الجرد الفعلي للمخازن | مخزون/مالية | Inventory, Reports | Create: Inventory, U/D: Admin |
| 51 | `mrpOrders` | خُطط التخطيط الاحتياجات MRP | إنتاج/مشتريات | Production, Purchasing, Reports | Production, Purchasing |
| 52 | `mrpScrap` | مخلفات وتالف خطط MRP | إنتاج/مخزون | Production, Inventory, Reports | Production, Inventory |
| 53 | `productionRates` | فئات ومعدلات أجور القطعة | HR/إنتاج | جميع المسجلين | HR, Production, Admin |
| 54 | `auditLogs` | سجلات المراجعة للعمليات | **أمنية/حساسة** | Admin | Create: Authenticated, U/D: Deny |
| 55 | `chatMessages` | المحادثات الداخلية | اتصالات | جميع المستخدمين المسجلين | جميع المستخدمين المسجلين |

---

## 2. مصفوفة الصلاحيات المعتمدة (Security Authorization Matrix)

تحدد هذه المصفوفة صلاحيات الوصول حسب الأدوار الـ 11 المطلوبة:

| الأدوار (Roles) | `users` / `settings` | البيانات المالية والخزينة | HR والرواتب | المشتريات والموردين | المخزون والخامات | الإنتاج وأوامر الشغل | المبيعات والعملاء | المعارض صالات العرض | الصيانة | التقارير |
|-----------------|---------------------|--------------------------|-------------|---------------------|-------------------|----------------------|-------------------|----------------------|----------|----------|
| **Super Admin** | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Read |
| **Admin** | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Full Access | Read |
| **Finance** | Read Only | Full Access | Read / Loans | Read / Payments | Read | Read Costs | Read Sales | Read | Read Expenses | Read |
| **Inventory** | No | No | No | Read Suppliers | Full Access | Read Issuances | No | Read Stock | No | Read |
| **Purchasing** | No | Read Payments | No | Full Access | Read Items | Read MRP | No | No | No | Read |
| **Sales** | No | Read Payments | No | No | Read Items | Read Work Orders | Full Access | Full Access | No | Read |
| **Production** | No | Read Job Costs | Read Labor | No | Read / Issuance | Full Access | Read Orders | No | Read Machines | Read |
| **HR** | No | No | Full Access | No | No | Read Labor | No | No | No | Read |
| **Maintenance** | No | Read Expenses | No | No | No | Read Vehicles | No | No | Full Access | Read |
| **Reports** | No | No | No | No | Read | Read | Read | Read | Read | Full Access (Read) |
| **Showroom** | No | No | No | No | Read Showroom Stock | Read Orders | Read Sales | Full Access Showroom | No | Read |

---

## 3. استراتيجية الهوية والأمان (Firebase UID Identity Strategy)

1. **الاعتماد الصارم على UID**:
   - لا يُستخدم البريد الإلكتروني كـ Primary Document ID للمستندات السريّة.
   - يتم تخزين ملفات المستخدمين في الممر `/users/{uid}` حيث يكون `{uid}` هو معرف `request.auth.uid` الصادر من Firebase Authentication.
2. **الربط مع Custom Claims و User Documents**:
   - تعتمد القواعد المتقدمة في `firestore.rules.staging` على دالة `get(/databases/$(database)/documents/users/$(request.auth.uid))` للتحقق من صلاحية الدور المخزن في ملف المستخدم أو من خلال `request.auth.token.role`.

---

## 4. تقرير المجموعات التي تتطلب تأجيل الحظر المباشر (Legacy Dependencies Report)

أثناء الفحص الميداني، تبين أن التطبيق يحتوي حالياً على **المجموعات التالية التي تعتمد عليها الواجهة أو برمجيات قديمة بدون توثيق Firebase Auth كامل**:

1. **`users`**: التطبيق يستخدم حالياً تسجيل دخول بحالة محلية أو استعلامات بريد إلكتروني بدون تسجيل Firebase Auth حقيقي لكافة المستخدمين.
2. **`settings`**: يتم طلب إعدادات الشركة قبل إتمام عملية تسجبل الدخول أو إنشاء الجلسات.
3. **`safes` & `safeTransactions`**: يتم استدعاؤها في بعض الشاشات بدون تمرير التوكن الأمني الصادر من Firebase SDK.

**القرار الهندسي المسؤول:**  
الحفاظ على `firestore.rules` بالحالة المرنة مع الـ Catch-all مؤقتاً في بيئة Production لمنع توقف المصنع أو انقطاع الخدمة عن المستخدمين، وتوفير كافة القواعد المشددة في `firestore.rules.staging` لتجهيز بيئة الاختبار الشاملة.

---

## 5. خطة الهجرة والاختبار (Migration & Testing Strategy)

1. **مرحلة الإعداد (Staging Phase)**:
   - تم إنشاء وتحديث `firestore.rules.staging` متضمنة كود الحماية المشدد لكل الـ 55 مجموعة.
2. **مرحلة ترحيل المستخدمين (Auth Migration Phase)**:
   - ربط واجهات تسجيل الدخول في React بـ `signInWithEmailAndPassword` الخاصة بـ Firebase Auth.
   - إنشاء مستند لكل مستخدم في `/users/{uid}` يحتوي على الأدوار والصلاحيات.
3. **مرحلة الاختبار والتحقق (Validation)**:
   - تجربة كل دور من الأدوار الـ 11 في بيئة Staging للتأكد من عدم رفض الحركات الشرعية (False Positives).
4. **مرحلة النشر النهائي (Production Deployment)**:
   - بعد استكمال تسجيل كافة عمال وموظفي المصنع في Firebase Auth، يتم استبدال `firestore.rules` بـ `firestore.rules.staging` وإيقاف القاعدة المفتوحة نهائياً.
