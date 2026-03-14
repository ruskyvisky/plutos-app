# Plutos - Finansal Karar Merkezi

Plutos, kullanıcılara karmaşık finansal verileri sadeleştirerek sunan, güven veren ve doğru finansal kararlar almayı kolaylaştıran bir **"finansal karar ve portföy simülasyonu"** platformudur. Bir trading oyunundan ziyade, bir mentor ve banka kasası ciddiyetinde, temiz ve analitik bir yapı sunmayı hedefler.

## 🎯 Proje Vizyonu ve Felsefesi

- **Güven Atmosferi (Tutarlılık):** Uygulama içindeki tüm formatlar ($10,25$ vs.), grafik stilleri, buton boyutları ve metin yapıları %100 istikrarlıdır. Düzen bozukluklarına yer verilmez.
- **Bilişsel Yükü Yönetme (Kademeli Açıklama):** Ekranda ilk bakışta sadece "en önemli" bilgiler (portföy toplamı, en kritik 3-4 hisse) yer alır. Derinlik, analiz tabloları alt katmanlara(tıklanınca) gizlenmiştir.
- **Görsel Hiyerarşi:** Kullanıcının gözü kaybolmaz. Fiyat > % Değişim > Grafik şeklinde kullanıcının odak noktası dikkatle yönlendirilir.
- **Sakin Renk Paleti:** Agresif ve göz yoran neon tonlar ("kumarhane" algısı) yerine doygun, pastel ve koyu tonlar (banka kasası ciddiyeti) tercih edilir.
- **Mikro Geri Bildirimler:** İşlem yapıldığında ya da favoriye hisse eklendiğinde "İşlemini aldım, her şey yolunda" hissi veren küçük renk değişiklikleri veya zarif animasyonlar kullanılır.
- **Karar Yorgunluğunu Azaltma:** Binlerce hisse arasında boğulmayı engellemek için "Günün En Çok Artanları", "Hacim Şampiyonları" gibi küratörlü listeler sunulur.
- **Veri Kaynağı Şeffaflığı:** Tüm verilerin kaynağı ("Veri Kaynağı: Borsa İstanbul" vb.) açıkça belirtilerek bilinçaltı güven onayı sağlanır.
- **Hız Algısı:** Yükleme durumları (spinner) yerine verinin geleceği alanlarda "Skeleton Screens" (Gri taslak kutucuklar) kullanılır.
- **Kontrol Hissi (Kişiselleştirme):** Kullanıcı, Watchlist ve Alarmlar aracılığıyla uygulama tarafından yönetilmediğini, uygulamayı yönettiğini hisseder.
- **Pilot Kokpiti Estetiği:** Kaostan uzak, agresif animasyonları olmayan, "white space" (boşluklar) ile zenginleştirilmiş stabil, temiz bir arayüz bulunur.

---

## 🎨 Tasarım Sistemi (Design System)

### 1. Renk ve Anlam Yönetimi
Finansal veride renk süs değil, sinyaldir.
- **Marka Kimliği:** `#0B1F3B` (Gece Mavisi) ana zemin ve güveni, `#1E5EFF` eylemi (buton, link) temsil eder.
- **Durum Renkleri:** Pozitif veriler `#16C784`, Negatif veriler `#EA3943` ile her zaman aynı tonda verilir.
- **Nötr Veriler/Tarihler:** Hacim veya yatay giden veriler mutlaka `#94A3B8` (Açık Gri) ile gösterilir.
- **Kontrast Kuralı:** Metin okunabilirliği için net bir 4.5:1 kontrast oranı korunur.

### 2. Tipografi ve Okunabilirlik
- **Font Ailesi:** Üstün okunabilirlik sunan `Inter` veya `Manrope`.
- **Sayı Formatı:** Sayıların alt alta hizalanırken kaymasını önleyen `tabular-nums` (eş aralıklı sayılar) zorunludur.
- **H1 (32px):** Portföy toplamı gibi kritik veriler.
- **H2 (24px):** Sayfa başlıkları, hisse isimleri.
- **Body (16px):** Analiz metni ve açıklamalar.

### 3. Veri Görselleştirme (Grafik Standartları)
- Grafikler bağırmaz, hikaye anlatır. Gereksiz grid (ızgara) çizgilerinden tamamen arındırılır.
- Ekran kenarları ile grafik arasında "nefes alma boşluğu" bırakılır.
- Grafiğe dokunulduğunda (hover/tap), dikey bir çizgi eşliğinde o anın verisini gösteren net bir okuyucu kutucuğu belirir.

### 4. Bileşen Standartları & Mikro-etkileşimler
- **Kartlar:** Beynin veriyi gruplaması için ayrıştırılmış, hafif gölgeli yüzeyler.
- **Butonlar:** Ana eylemler Dolgulu (Solid), ikincil eylemler Çerçeveli (Outline).
- **Animasyon:** Sayfa geçişleri "Ease-in-out" (yavaş-hızlı-yavaş) yumuşaklığında 200-300ms arasında olmalıdır.
- **Dil / Microcopy:** Heyecanlı pazarlama dili yerine tamamen nötr dil. Karmaşık bilgiler için dokunulduğunda açılan 1-2 cümlelik "Nedir?" baloncukları.

---

## 🏗️ Modül Mimarisi

1. **Home (Piyasa Özeti):** Uygulamanın anasayfası, 10 saniyelik piyasa özeti. (BIST100, BIST30, Günün Yıldızları, Düşenleri, Hacmi).
2. **Stock Detail (Hisse Detayı):** Uygulamanın kalbi. Zaman aralıklı grafikler, temel finansal veriler (F/K, PD/DD), temettü analizleri, KAP ve gündem.
3. **Portfolio (Sanal Portföy Simülasyonu):** Öğrenmenin başladığı risksiz arena. Gerçek para yok ama gerçek zamanlı veri ile çalışan bir trade motoru.
4. **Discover (Keşfet):** Hisse ve fonlara yönelik filtreleme ve arama merkezi.
5. **News (Haberler):** Piyasa genelinden analiz, rapor ve finans takvimi akışı.

---

## 🚀 Geliştirme Yol Haritası ve Yapılacaklar (To-Do)

Geliştirme yığınımız; hız, stabilite ve veri yoğunluğunu kaldırması adına **Backend: Python (FastAPI)** ve **Frontend: React Native (Expo) / React** olarak belirlenmiştir.

### 🟢 Backend (Python FastAPI) Görev Listesi

#### 1. Temel Proje ve Veritabanı Kurulumu
- [ ] Reponun başlatılması ve FastAPI iskeletinin oluşturulması.
- [ ] Çevre değişkenlerinin (`.env`) ve yapılandırma (Config) katmanının ayarlanması.
- [ ] PostgreSQL veritabanı bağlantısının ve SQLAlchemy ORM altyapısının kurulması.
- [ ] Veritabanı rotasyonları (Migrations) için Alembic entegrasyonu.
- [ ] Pydantic Schemas (Veri Doğrulama ve DTO'lar) dosyalarının klasörlenmesi.
- [ ] Çok sık çağrılacak BIST verileri için (Redis/Memcached) Caching konfigürasyonunun hazırlanması.

#### 2. Kimlik Doğrulama ve Kullanıcı Yönetimi
- [ ] Kullanıcı (Users) tablosunun veri modellemesi.
- [ ] JWT tabanlı Login, Register, Logout endpoint'lerinin yazılması.
- [ ] OAuth (Google/Apple Login) altyapısına hazırlık.
- [ ] Kullanıcı profil ve tercihlerini (Theme, Bildirim ayarları) döndüren Get/Update API'leri.

#### 3. Finansal Veri Entegrasyonu (Market Data Sync)
- [ ] Borsa verisi çekmek için arka plan işleyicilerinin (Celery veya APScheduler) kurulması.
- [ ] `borsapy` (veya benzeri bir entegrasyon) üzerinden piyasa verilerini asenkron çeken Data Seeder servisinin yazılması.
- [ ] BIST100, BIST30 canlı endeks verisi sunan endpoint'lerin kodlanması.
- [ ] "Günün Yükselenleri", "En Çok Düşenleri", "İşlem Hacmi Yüksekleri" verilerini aggregate (filtreleyen) eden endpoint'lerin yazılması.

#### 4. Hisse Detay ve İstatistik Motoru
- [ ] Hisse Sembolüne (ör: THYAO) göre OHLCV (Açılış, Yüksek, Düşük, Kapanış, Hacim) zaman serisi verisi veren endpoint (1G, 1H, 1A, 1Y desteğiyle).
- [ ] Şirket profili, F/K, PD/DD, Hisse Başına Kar gibi temel metrikleri döndüren API yapısı.
- [ ] Şirket temettü geçmişini ve tahmini verimini döndüren veri bloğu.

#### 5. Portföy Simülasyon Motoru (Simulation Engine)
- [ ] Sanal Portföy ve İşlemler (Transactions - Alış/Satış kayıtları) veritabanı modellerinin tasarımı.
- [ ] Kullanıcılara başlangıç için (Örn: 100.000 TL) sanal bakiye atayan mekanizma.
- [ ] Girilen hisseyi o anki canlı fiyatı üzerinden bakiyeden düşerek (veya ekleyerek) "Alım / Satım" yaptıracak uçlar. (Mutations)
- [ ] Anlık piyasa verisi okunarak, portföydeki tüm hisselerin toplam anlık boyutunu, Kar/Zarar statüsünü hesaplayan karmaşık Aggregation endpoint'i.

#### 6. Haberler, Watchlist ve Bildirimler
- [ ] Sembol bazlı veya piyasa genel KAP haberleri ve Finans metinlerini listeleyen endpoint.
- [ ] Kullanıcının favori hisselerini (Watchlist) oluşturması, ekleyip/çıkartması (CRUD API işlemleri).
- [ ] Fiyat seviyesine göre Alarm Kurma API'si ve tetiklendiğinde Push Notification atacak WebSocket/Worker entegrasyonu.

---

### 🔵 Frontend (React / React Native Expo) Görev Listesi

#### 1. Proje Mimarisi ve Tasarım Sistemi (Design System) Entegrasyonu
- [ ] React Native (Expo) projesinde klasör modülerizasyonu (`/app`, `/components`, `/hooks`, `/services`, `/store`).
- [ ] Tema ve Renk Paletinin global konfigürasyona tanımlanması (`#0B1F3B`, `#1E5EFF` vs.).
- [ ] Kullanılacak fontların (Inter veya Manrope) yüklenmesi ve tüm Text componentlerinde `tabular-nums` stiliyle ezilmesi.
- [ ] Tüm veri çağırımlarında kullanılacak genel Spinner yerine özel **Skeleton Loaders** (moti vb. ile) bileşeninin oluşturulması.
- [ ] H1, H2, Body tiplerine sahip kendi `Typography` bileşenimizin inşası (Microcopy uygunluğunda).
- [ ] Gölgeli, kavisli temel "Card" yapısının ve Custom Butonların (Solid, Outline) üretimi.

#### 2. Uygulama İçi Yönlendirme ve Durum Yönetimi (Routing/State)
- [ ] Expo Router ile Bottom Tab Bar sekmesinin kodlanması (Piyasa, Keşfet, Portföy, Haberler).
- [ ] Modüller arası geçişlerde "Ease-in-out" 200-300ms konforunda animasyon parametrelerinin ayarlanması.
- [ ] Tanımlı kullanıcı, token ve tema bilgileri için Zustand / Redux / Context altyapısının ayarlanması.

#### 3. Piyasa Özeti (Home Screen) Modülü
- [ ] Sayfaya girildiğinde API cevabını beklerken Skeleton taslakların gösterilmesi.
- [ ] En tepeye portföyün küçültülmüş bir özet kartının (opsiyonel gizlenebilir) eklenmesi.
- [ ] Yatay listelenebilir (Horizontal Scroll) BIST100 / BIST30 yüzdelik çubuk widget'larının yapımı.
- [ ] Yükselenler, Düşenler, Hacim Şampiyonlarını sekmeli (Tabs) veya alt alta hiyerarşik kartlar olarak FlatList/SectionList formatında tasarımı.

#### 4. Hisse Detay Ekranı (Stock Detail) Sahneleri
- [ ] Hisse grafik kütüphanesinin (Wagmi Charts / Victory Native) seçilip grid çizgilerinden tamamen arındırılması.
- [ ] Dokunmatik ekranlarda grafiğin içine parmak girince verilerin tooltip (uçan etiket) içinde okunabilmesi kodlaması.
- [ ] Grafik altında 1G, 1H, 1A, 1Y zaman aralığı (Timeframe) seçici butonların state yönetimi.
- [ ] Temel Veriler bölümü için kart tasarımı (F/K, PD/DD değerlerinin yorulmadan okunduğu ızgara).
- [ ] Anlaşılması zor metriklerin yanına eklenecek, asenkron tepki veren küçük "Nedir?" bilgilendirme baloncuklarının entegrasyonu.

#### 5. Sanal Portföy (Portföy Motoru) Arayüzü
- [ ] Ekranın en tepesine yüksek kontrastlı (H1) kocaman "Toplam Bakiye" numaratörü eklenmesi.
- [ ] Günlük getiri / götürü verisinin sakin yeşil ve kırmızı renk kurallarına sadık yazdırılması.
- [ ] Hisseler listesinde her varlığın maliyeti ile güncel fiyatının kıyası tasarımı.
- [ ] İşlem Yap (Al/Sat) formunun pürüzsüz bir `BottomSheet` veya kayan menü ile kodlanması (hisse miktarına odaklanan sade arayüz).
- [ ] İşlem sonrasında beyni rahatlatacak küçük checkmark/mikro-animasyon.

#### 6. Keşfet, Arama ve Diğerleri
- [ ] Gelişmiş, debounced (beklemeli) Hisse Arama Çubuğu bileşeni.
- [ ] Sektörsel olarak borsadaki şirketlerin ağaç/liste yapısında sergileneceği Keşfet ekranı.
- [ ] Ayarlar ekranından kullanıcı bildirim tercihlerinin yönetilmesi, Watchlist (Kişisel izleme listesi) ekranının modüler inşası.
- [ ] Veri Kaynağı "Borsa İstanbul" ibaresinin şeffaf olarak dipnot (Footer) bileşeniyle ilgili ekranlara yerleştirilmesi.
