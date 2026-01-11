# TableCN - Derinlemesine Proje Analizi

> Bu doküman TableCN projesinin tüm bileşenlerini, mimarisini ve yapısını detaylıca açıklar. Herhangi bir sorunuz olduğunda bu kaynağa dönebilirsiniz.

## 📑 İçindekiler

1. [Proje Genel Bakış](#proje-genel-bakış)
2. [Teknoloji Stack](#teknoloji-stack)
3. [Proje Yapısı](#proje-yapısı)
4. [İki Tablo Tipi: DataTable vs DataGrid](#iki-tablo-tipi)
5. [DataTable Detaylı İnceleme](#datatable-detaylı)
6. [DataGrid Detaylı İnceleme](#datagrid-detaylı)
7. [Veritabanı ve ORM](#veritabanı-orm)
8. [Hook'lar ve Yardımcı Fonksiyonlar](#hooklar)
9. [Stil ve Tema Yönetimi](#stil-tema)
10. [Önemli Konfigürasyonlar](#konfigürasyonlar)

---

## 🎯 Proje Genel Bakış {#proje-genel-bakış}

TableCN, TanStack Table + shadcn/ui kombinasyonunu kullanarak güçlü, yeniden kullanılabilir tablo bileşenleri sunan bir Next.js projesidir.

### Temel Özellikler

- ✅ Server-side pagination, sorting, filtering
- ✅ Özelleştirilebilir kolonlar
- ✅ Kolon tanımlarından otomatik filtre üretimi
- ✅ Notion/Airtable benzeri gelişmiş filtreleme
- ✅ Linear benzeri command palette filtreleme
- ✅ Satır seçiminde action bar
- ✅ Excel-like inline editing (DataGrid)
- ✅ Copy-paste desteği (DataGrid)
- ✅ Dosya yükleme desteği (DataGrid)
- ✅ Gerçek zamanlı senkronizasyon (DataGrid Live)

---

## 🛠️ Teknoloji Stack {#teknoloji-stack}

### Core Framework & UI

```json
{
  "next": "^16.0.10",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "typescript": "^5.9.3"
}
```

### Tablo ve State Management

```json
{
  "@tanstack/react-table": "^8.21.3",
  "@tanstack/react-virtual": "^3.13.13",
  "@tanstack/react-query": "^5.90.12",
  "@tanstack/react-db": "^0.1.55",
  "nuqs": "^2.8.5"
}
```

**Önemli:** 
- `@tanstack/react-table` → Tablo mantığı ve state yönetimi
- `@tanstack/react-virtual` → DataGrid'de performans için virtual scrolling
- `@tanstack/react-db` → DataGrid Live için client-side veritabanı
- `nuqs` → URL-based state yönetimi (sayfa yenilendiğinde filtreler korunur)

### Database & ORM

```json
{
  "drizzle-orm": "^0.45.1",
  "postgres": "^3.4.7"
}
```

### UI Components

```json
{
  "@radix-ui/*": "Birçok UI primitive",
  "shadcn": "3.5.2",
  "tailwindcss": "^4.1.18",
  "lucide-react": "^0.560.0"
}
```

### Diğer Önemli Kütüphaneler

```json
{
  "@dnd-kit/*": "Sürükle-bırak için",
  "@uploadthing/react": "Dosya yükleme için",
  "zod": "^4.1.13",
  "react-hook-form": "^7.68.0"
}
```

---

## 📂 Proje Yapısı {#proje-yapısı}

```
tablecn/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Ana sayfa (DataTable örneği)
│   │   ├── data-grid/                # DataGrid demo sayfası
│   │   ├── data-grid-live/           # DataGrid Live demo
│   │   ├── data-grid-render/         # DataGrid render demo
│   │   ├── components/               # Sayfa özel componentler
│   │   │   ├── tasks-table.tsx       # Ana tablo componenti
│   │   │   ├── tasks-table-columns.tsx # Kolon tanımları
│   │   │   └── ...
│   │   ├── lib/                      # Sayfa özel logic
│   │   │   ├── actions.ts            # Server actions
│   │   │   ├── queries.ts            # Server queries
│   │   │   └── validations.ts        # Zod schemas
│   │   └── api/                      # API routes
│   │
│   ├── components/                    # Paylaşılan componentler
│   │   ├── data-table/               # DataTable bileşenleri
│   │   │   ├── data-table.tsx        # Ana DataTable
│   │   │   ├── data-table-toolbar.tsx
│   │   │   ├── data-table-advanced-toolbar.tsx
│   │   │   ├── data-table-column-header.tsx
│   │   │   ├── data-table-pagination.tsx
│   │   │   ├── data-table-filter-menu.tsx
│   │   │   ├── data-table-filter-list.tsx
│   │   │   ├── data-table-sort-list.tsx
│   │   │   └── ...
│   │   │
│   │   ├── data-grid/                # DataGrid bileşenleri
│   │   │   ├── data-grid.tsx         # Ana DataGrid
│   │   │   ├── data-grid-row.tsx
│   │   │   ├── data-grid-cell.tsx
│   │   │   ├── data-grid-cell-variants.tsx
│   │   │   ├── data-grid-column-header.tsx
│   │   │   ├── data-grid-search.tsx
│   │   │   ├── data-grid-context-menu.tsx
│   │   │   ├── data-grid-paste-dialog.tsx
│   │   │   ├── data-grid-filter-menu.tsx
│   │   │   ├── data-grid-sort-menu.tsx
│   │   │   ├── data-grid-view-menu.tsx
│   │   │   └── ...
│   │   │
│   │   └── ui/                       # shadcn/ui bileşenleri
│   │       └── ... (28 component)
│   │
│   ├── hooks/                         # Custom hooks
│   │   ├── use-data-table.ts         # DataTable hook
│   │   ├── use-data-grid.ts          # DataGrid hook (3434 satır!)
│   │   ├── use-debounced-callback.ts
│   │   ├── use-media-query.ts
│   │   └── ...
│   │
│   ├── lib/                           # Yardımcı fonksiyonlar
│   │   ├── data-table.ts             # DataTable utils
│   │   ├── data-grid.ts              # DataGrid utils
│   │   ├── data-grid-filters.ts      # DataGrid filtre logic
│   │   ├── filter-columns.ts         # Server-side filtering
│   │   ├── parsers.ts                # URL parser'lar
│   │   ├── utils.ts                  # Genel utilities
│   │   └── ...
│   │
│   ├── types/                         # TypeScript tipleri
│   │   ├── data-table.ts
│   │   ├── data-grid.ts
│   │   └── index.ts
│   │
│   ├── config/                        # Konfigürasyonlar
│   │   ├── data-table.ts             # Filter operatörleri
│   │   ├── flag.ts                   # Feature flags
│   │   └── site.ts                   # Site config
│   │
│   ├── db/                            # Database
│   │   ├── index.ts                  # DB connection
│   │   ├── schema.ts                 # Drizzle schemas
│   │   ├── seed.ts                   # Seed script
│   │   ├── mock-data.ts              # Mock data
│   │   └── ...
│   │
│   └── styles/
│       └── globals.css               # Global styles
│
├── drizzle/                           # Drizzle migrations
├── public/                            # Static files
└── ... (config dosyaları)
```

---

## 🔍 İki Tablo Tipi: DataTable vs DataGrid {#iki-tablo-tipi}

Bu proje **iki farklı tablo yaklaşımı** sunar:

### 1. DataTable (Klasik Server-Side Tablo)

**Kullanım Alanı:**
- Admin panelleri
- Veri listeleme sayfaları
- Raporlama ekranları
- Çok fazla datanın olduğu senaryolar (binlerce kayıt)

**Özellikler:**
- ✅ Server-side pagination
- ✅ Server-side sorting
- ✅ Server-side filtering
- ✅ URL-based state (sayfa refresh'te state korunur)
- ✅ Gelişmiş filtre sistemleri (3 çeşit: basit, advanced, command)
- ✅ Column visibility control
- ✅ Column reordering (sürükle-bırak)
- ✅ Faceted filters (count'larla)
- ✅ Action bar (seçili satırlarda)

**Ne Zaman Kullanılmalı:**
- Backend'de büyük dataset var
- Real-time editing gerekmiyorsa
- SEO ve URL paylaşımı önemli
- Performans kritik (verinin hepsi client'a gelmez)

### 2. DataGrid (Excel-like Interaktif Tablo)

**Kullanım Alanı:**
- Spreadsheet-like uygulamalar
- Hızlı veri girişi gereken formlar
- Interaktif düzenleme ekranları
- Küçük-orta boyutlu dataset'ler

**Özellikler:**
- ✅ Inline editing (çift tıklama veya Enter)
- ✅ Excel-like navigation (klavye ile hareket)
- ✅ Copy-paste desteği (Excel'den yapıştırma dahil)
- ✅ Multi-cell selection
- ✅ Context menu (sağ tık)
- ✅ Cell variants (text, number, select, multi-select, date, checkbox, url, file)
- ✅ File upload per cell
- ✅ Search & highlight
- ✅ Virtual scrolling (performans için)
- ✅ Row height adjustment
- ✅ Undo/Redo (cut/paste için)
- ✅ Keyboard shortcuts

**DataGrid Live:**
- ✅ Yukarıdaki tüm özellikler
- ✅ TanStack DB ile gerçek zamanlı senkronizasyon
- ✅ Optimistic updates
- ✅ Offline-first yaklaşım

**Ne Zaman Kullanılmalı:**
- Kullanıcılar hızlı veri girişi yapacak
- Excel-like deneyim gerekli
- Real-time editing önemli
- Dataset yönetilebilir boyutta (< 10k satır)

### Karşılaştırma Tablosu

| Özellik | DataTable | DataGrid | DataGrid Live |
|---------|-----------|----------|---------------|
| Pagination | Server-side | Client-side | Client-side |
| Filtering | Server-side | Client-side | Client-side |
| Sorting | Server-side | Client-side | Client-side |
| Inline Edit | ❌ | ✅ | ✅ |
| Copy-Paste | ❌ | ✅ | ✅ |
| Keyboard Nav | Temel | Gelişmiş | Gelişmiş |
| Virtual Scroll | ❌ | ✅ | ✅ |
| Real-time Sync | ❌ | ❌ | ✅ |
| File Upload | ❌ | ✅ | ✅ |
| Context Menu | ❌ | ✅ | ✅ |
| Dataset Size | Sınırsız | < 10k | < 5k |
| Performans | 🔥🔥🔥 | 🔥🔥 | 🔥 |
| Setup Kolaylığı | 🔥🔥🔥 | 🔥 | 🔥 |

**Önerim:** Saas projenizde:
- **DataTable** → Rapor, liste, admin paneli gibi yerlerde
- **DataGrid Live** → Kullanıcıların aktif veri girişi yaptığı formlarda (örn: CRM, proje yönetimi)

---

## 📊 DataTable Detaylı İnceleme {#datatable-detaylı}

### Mimari

```
page.tsx (Server Component)
  ↓
TasksTableWrapper (async function)
  ↓ Veri çekme (getTasks, getCounts)
  ↓
TasksTable (Client Component)
  ↓ useDataTable hook
  ↓
DataTable Component
  ↓ Children (Toolbar, Filters)
  ↓
TanStack Table render
```

### Core Dosyalar

#### 1. `src/app/page.tsx`

Server Component. Suspense ile data fetch eder.

```typescript
// Önemli pattern:
// 1. Suspense ile async veri çekme
// 2. searchParamsCache ile URL parsing
// 3. Promise.all ile paralel veri çekme

async function TasksTableWrapper(props: IndexPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);
  
  const promises = Promise.all([
    getTasks(search),
    getTaskStatusCounts(),
    getTaskPriorityCounts(),
    getEstimatedHoursRange(),
  ]);
  
  return <TasksTable promises={promises} />;
}
```

#### 2. `src/app/components/tasks-table.tsx`

Client Component. Hook kullanır ve render eder.

```typescript
export function TasksTable({ promises }) {
  // React.use() ile promise resolve
  const [{ data, pageCount }, statusCounts, ...] = React.use(promises);
  
  // useDataTable hook
  const { table, shallow, debounceMs, throttleMs } = useDataTable({
    data,
    columns,
    pageCount,
    enableAdvancedFilter,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
      columnPinning: { right: ["actions"] },
    },
  });
  
  return (
    <DataTable table={table} actionBar={<ActionBar />}>
      <DataTableAdvancedToolbar table={table}>
        {/* Filters */}
      </DataTableAdvancedToolbar>
    </DataTable>
  );
}
```

#### 3. `src/hooks/use-data-table.ts`

Core logic. URL state management + TanStack Table setup.

**Önemli Özellikler:**
- `nuqs` kullanarak URL-based state yönetimi
- Pagination, sorting, filtering state'i URL'de
- Debounced filter updates
- Manual pagination/sorting/filtering (server-side)

### 3 Farklı Filter UI

#### 1. Basit Filter (DataTableToolbar)

```
[Search Input] [Status Filter] [Priority Filter] [View Options]
```

#### 2. Advanced Filters (DataTableAdvancedToolbar + DataTableFilterList)

```
[+ Add Filter] [Sort]

Filter 1: [Column] [Operator] [Value] [×]
Filter 2: [Column] [Operator] [Value] [×]
```

Notion/Airtable benzeri. Her filtre satırı:
- Column seçimi
- Operator seçimi (contains, equals, etc.)
- Value input (kolona göre değişir)

#### 3. Command Filters (DataTableFilterMenu)

```
[🔍 Search or filter results...]

Quick Filters:
  ○ Status
  ○ Priority
  ○ Created At
  
Sorts:
  ↑ Name
  ↓ Date
```

Linear benzeri. Cmd+K gibi açılan command palette.

---

## 🎨 DataGrid Detaylı İnceleme {#datagrid-detaylı}

### Mimari

DataGrid çok daha karmaşık bir yapıya sahip çünkü:
- Virtual scrolling
- Keyboard navigation
- Cell editing
- Copy-paste
- Context menu
- Search & highlight
- File upload

```
DataGridDemo (Component)
  ↓
useDataGrid hook (3434 satır!)
  ↓ Virtual scrolling setup
  ↓ Keyboard event handlers
  ↓ Cell selection logic
  ↓ Copy-paste logic
  ↓ Context menu logic
  ↓ Search logic
  ↓
DataGrid Component
  ↓
  ├─ DataGridSearch
  ├─ DataGridContextMenu
  ├─ DataGridPasteDialog
  ├─ DataGridVisualizerDialog
  └─ Grid Structure
      ├─ Header (Sortable columns)
      ├─ Body (Virtualized rows)
      │   └─ DataGridRow
      │       └─ DataGridCell
      │           └─ CellVariants (based on type)
      └─ Footer (Add row button)
```

### Cell Types (Variants)

DataGrid 8 farklı cell tipi destekler:

1. **short-text** - Kısa metin (tek satır input)
2. **long-text** - Uzun metin (textarea)
3. **number** - Sayı (min, max, step ile)
4. **select** - Tekli seçim (dropdown)
5. **multi-select** - Çoklu seçim (badge'lerle)
6. **checkbox** - Boolean değer
7. **date** - Tarih seçici
8. **url** - Link (otomatik validasyon)
9. **file** - Dosya yükleme (multiple file support)

### Keyboard Shortcuts

```typescript
// Editing
Enter → Start editing / Stop editing and move down
Escape → Cancel editing
Tab → Move to next cell
Shift+Tab → Move to previous cell

// Navigation
Arrow keys → Move focus
Ctrl+Home → Go to first cell
Ctrl+End → Go to last cell
PageUp/PageDown → Scroll page

// Selection
Shift+Arrow → Extend selection
Ctrl+A → Select all
Ctrl+C → Copy
Ctrl+X → Cut
Ctrl+V → Paste

// Search
Ctrl+F / Cmd+F → Open search
Enter → Next match
Shift+Enter → Previous match
Escape → Close search

// Rows
Ctrl+D → Delete selected rows
```

---

## 🗄️ Veritabanı ve ORM {#veritabanı-orm}

### Schema Tanımları

```typescript
// src/db/schema.ts

// DataTable için
export const tasks = pgTable("tasks", {
  id: varchar("id", { length: 30 })
    .$defaultFn(() => generateId())
    .primaryKey(),
  code: varchar("code", { length: 128 }).notNull().unique(),
  title: varchar("title", { length: 128 }),
  status: varchar("status", {
    length: 30,
    enum: ["todo", "in-progress", "done", "canceled"],
  }).notNull().default("todo"),
  priority: varchar("priority", {
    length: 30,
    enum: ["low", "medium", "high"],
  }).notNull().default("low"),
  estimatedHours: real("estimated_hours").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
```

---

## 🎣 Hook'lar ve Yardımcı Fonksiyonlar {#hooklar}

### Custom Hooks

#### 1. `use-data-table.ts`

DataTable için. URL state management.

**Key Features:**
- URL-based state (nuqs)
- Debounced filters
- Manual pagination/sorting/filtering

#### 2. `use-data-grid.ts` (3434 satır!)

DataGrid için. Her şey burada:
- Virtual scrolling setup
- Keyboard navigation
- Cell selection
- Copy-paste
- Context menu
- Search
- File upload

#### 3. `use-debounced-callback.ts`

```typescript
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number,
) {
  const timeoutRef = React.useRef<NodeJS.Timeout>();
  
  return React.useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      callback(...args);
    }, delay);
  }, [callback, delay]);
}
```

---

## 🎨 Stil ve Tema Yönetimi {#stil-tema}

### Tailwind CSS v4

Projede Tailwind CSS v4 kullanılıyor. CSS variables ile tema yönetimi yapılıyor.

### CSS Variables

```css
/* src/styles/globals.css */

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    /* ... */
  }
  
  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* ... */
  }
}
```

---

## ⚙️ Önemli Konfigürasyonlar {#konfigürasyonlar}

### 1. Data Table Config

```typescript
// src/config/data-table.ts

export const dataTableConfig = {
  textOperators: [
    { label: "Contains", value: "iLike" as const },
    { label: "Is", value: "eq" as const },
    // ...
  ],
  numericOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Greater than", value: "gt" as const },
    // ...
  ],
  // ...
};
```

### 2. Feature Flags

```typescript
// src/config/flag.ts

export const flagConfig = {
  featureFlags: [
    {
      value: "advancedFilters",
      label: "Advanced Filters",
    },
    {
      value: "commandFilters",
      label: "Command Filters",
    },
  ] as const,
};
```

---

## 🔑 Önemli Notlar

### Performance Considerations

#### DataTable
- Server-side operations → skalabilite ✅
- Sadece mevcut sayfa render edilir
- Büyük dataset'ler için ideal
- SEO friendly (SSR)

#### DataGrid
- Client-side operations → limit var
- Virtual scrolling ile optimize
- < 10k satır için uygun
- Interaktif editing için mükemmel

#### DataGrid Live
- TanStack DB overhead'i var
- < 5k satır önerilen
- Real-time sync maliyet
- Offline-first avantaj

### Best Practices

1. **DataTable için:**
   - Her zaman server-side validation
   - Cache tags ile revalidation
   - Debounced filters
   - URL state management

2. **DataGrid için:**
   - Virtual scrolling kullan
   - Cell updates'i batch'le
   - File upload'ları optimize et
   - Keyboard shortcuts ekle

3. **Genel:**
   - Type safety (TypeScript)
   - Error handling
   - Loading states
   - Accessibility (ARIA)

---

## 📚 Kaynaklar

- [TanStack Table Docs](https://tanstack.com/table/latest)
- [TanStack Virtual Docs](https://tanstack.com/virtual/latest)
- [TanStack DB Docs](https://tanstack.com/db/latest)
- [shadcn/ui](https://ui.shadcn.com)
- [Drizzle ORM](https://orm.drizzle.team)
- [nuqs](https://nuqs.47ng.com)

---

**Son Güncelleme:** 2026-01-11  
**Proje Versiyonu:** 0.1.0
