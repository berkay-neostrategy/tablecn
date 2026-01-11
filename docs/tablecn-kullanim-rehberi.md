# TableCN Kullanım Rehberi

> Bu doküman, tablecn projesini kendi projenizde nasıl kullanacağınızı, yeni sayfalar nasıl oluşturacağınızı ve dizaynı nasıl özelleştireceğinizi anlatır.

## 📑 İçindekiler

1. [Sıfırdan Kurulum](#sıfırdan-kurulum)
2. [Hangi Tablo Tipini Kullanmalıyım?](#hangi-tablo)
3. [Yeni Sayfa Oluşturma - DataTable](#datatable-sayfa)
4. [Yeni Sayfa Oluşturma - DataGrid](#datagrid-sayfa)
5. [Dizayn Özelleştirme](#dizayn)
6. [Gerçek Proje Senaryoları](#senaryolar)

---

## 🚀 Sıfırdan Kurulum {#sıfırdan-kurulum}

### Mevcut Projeye Entegrasyon

Eğer zaten bir Next.js projeniz varsa ve tablecn'yi entegre etmek istiyorsanız:

#### Adım 1: Gerekli Paketleri Yükleyin

```bash
# Core dependencies
npm install @tanstack/react-table@^8.21.3
npm install nuqs@^2.8.5
npm install zod@^4.1.13

# Drag-drop (column reordering için)
npm install @dnd-kit/core@^6.3.1
npm install @dnd-kit/sortable@^10.0.0

# Date handling
npm install date-fns@^4.1.0

# Toast notifications
npm install sonner@^2.0.7
```

#### Adım 2: shadcn/ui Bileşenlerini Ekleyin

```bash
npx shadcn@latest add button checkbox dropdown-menu input select table badge
```

#### Adım 3: DataTable Dosyalarını Kopyalayın

Bu repo'dan kendi projenize kopyalamanız gereken dosyalar:

**Temel DataTable için:**

```
tablecn/src/                           → your-project/src/
├── components/data-table/             → components/data-table/
│   ├── data-table.tsx                 ✅
│   ├── data-table-toolbar.tsx         ✅
│   ├── data-table-column-header.tsx   ✅
│   ├── data-table-pagination.tsx      ✅
│   ├── data-table-skeleton.tsx        ✅
│   └── data-table-view-options.tsx    ✅
│
├── hooks/
│   ├── use-data-table.ts              ✅
│   └── use-debounced-callback.ts      ✅
│
├── lib/
│   ├── data-table.ts                  ✅
│   ├── parsers.ts                     ✅
│   └── utils.ts                       ✅
│
├── types/
│   └── data-table.ts                  ✅
│
└── config/
    └── data-table.ts                  ✅
```

**Gelişmiş Filtreler için (opsiyonel):**

```
├── components/data-table/
│   ├── data-table-advanced-toolbar.tsx  ✅
│   ├── data-table-filter-list.tsx       ✅
│   ├── data-table-filter-menu.tsx       ✅
│   ├── data-table-sort-list.tsx         ✅
│   └── data-table-faceted-filter.tsx    ✅
│
└── lib/
    └── filter-columns.ts                ✅
```

**DataGrid için (opsiyonel):**

```
├── components/data-grid/              → tüm data-grid componentleri
├── hooks/
│   └── use-data-grid.ts               ✅ (3434 satır!)
├── lib/
│   ├── data-grid.ts                   ✅
│   └── data-grid-filters.ts           ✅
└── types/
    └── data-grid.ts                   ✅
```

---

## 🤔 Hangi Tablo Tipini Kullanmalıyım? {#hangi-tablo}

### Hızlı Karar Ağacı

```
Kullanım senaryonuz nedir?
│
├─ "Sadece veri listelemek istiyorum"
│   └─ → DataTable kullan ✅
│
├─ "Kullanıcılar hızlı veri girişi yapacak (Excel gibi)"
│   └─ → DataGrid kullan ✅
│
├─ "100k+ satır var"
│   └─ → DataTable kullan (server-side) ✅
│
├─ "Çok sık güncellenecek, real-time önemli"
│   └─ → DataGrid Live kullan ✅
│
└─ "Admin paneli yapıyorum"
    └─ → DataTable kullan ✅
```

### Detaylı Karşılaştırma

| Senaryo | Önerilen | Neden? |
|---------|----------|--------|
| Müşteri listesi | DataTable | Read-only, büyük dataset |
| Sipariş geçmişi | DataTable | Filtreleme önemli, SEO |
| Task yönetimi | DataGrid | Hızlı editing, drag-drop |
| CRM veri girişi | DataGrid Live | Real-time, collaboration |
| Analitik rapor | DataTable | Export, server-side |
| Envanter güncelleme | DataGrid | Batch editing |
| Log görüntüleyici | DataTable | Sadece okuma |
| Bütçe planlama | DataGrid | Hesaplamalar, inline edit |

### SaaS Projenizde Önerim

**%80 durumda DataTable yeterli!**

DataGrid sadece şu durumlarda kullanın:
- Kullanıcılar **aktif olarak** veri girişi yapacak
- **Excel benzeri** deneyim isteniyor
- **Keyboard shortcuts** kritik
- Dataset küçük (< 10k satır)

---

## 📝 Soru 1: Sıfırdan Next.js Projesine Nasıl İmplemente Edilir? {#datatable-sayfa}

### Adım Adım: Firmalar Tablosu Örneği

Diyelim ki SaaS projenizde bir **Firmalar Listesi** sayfası oluşturacaksınız.

#### 1. Dizin Yapısını Oluşturun

```bash
mkdir -p src/app/companies/components
mkdir -p src/app/companies/lib
```

#### 2. Database Schema (Drizzle kullanıyorsanız)

```typescript
// src/db/schema.ts

import { pgTable, varchar, timestamp, boolean } from "drizzle-orm/pg-core";

export const companies = pgTable("companies", {
  id: varchar("id", { length: 30 }).primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  industry: varchar("industry", {
    length: 50,
    enum: ["tech", "finance", "healthcare", "retail", "other"],
  }).notNull().default("other"),
  size: varchar("size", {
    length: 20,
    enum: ["1-10", "11-50", "51-200", "201-500", "500+"],
  }).notNull().default("1-10"),
  location: varchar("location", { length: 256 }),
  website: varchar("website", { length: 512 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
```

#### 3. Validation Schema

```typescript
// src/app/companies/lib/validations.ts

import { createSearchParamsCache, parseAsInteger, parseAsArrayOf, parseAsStringEnum } from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";
import { companies } from "@/db/schema";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Company>().withDefault([
    { id: "createdAt", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  industry: parseAsArrayOf(parseAsStringEnum(companies.industry.enumValues)).withDefault([]),
});

export type GetCompaniesSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
```

#### 4. Server Queries

```typescript
// src/app/companies/lib/queries.ts

"use cache";
import "server-only";
import { and, asc, count, desc, ilike, inArray } from "drizzle-orm";
import { db } from "@/db";
import { companies } from "@/db/schema";
import type { GetCompaniesSchema } from "./validations";

export async function getCompanies(input: GetCompaniesSchema) {
  const offset = (input.page - 1) * input.perPage;

  const where = and(
    input.name ? ilike(companies.name, `%${input.name}%`) : undefined,
    input.industry.length > 0 ? inArray(companies.industry, input.industry) : undefined,
  );

  const orderBy = input.sort.map((item) =>
    item.desc ? desc(companies[item.id]) : asc(companies[item.id])
  );

  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select()
      .from(companies)
      .limit(input.perPage)
      .offset(offset)
      .where(where)
      .orderBy(...orderBy);

    const total = await tx
      .select({ count: count() })
      .from(companies)
      .where(where)
      .then((res) => res[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.perPage);
  return { data, pageCount };
}

export async function getCompanyIndustryCounts() {
  return await db
    .select({ industry: companies.industry, count: count() })
    .from(companies)
    .groupBy(companies.industry)
    .then((res) =>
      res.reduce((acc, { industry, count }) => {
        acc[industry] = count;
        return acc;
      }, {} as Record<string, number>)
    );
}
```

#### 5. Column Definitions

```typescript
// src/app/companies/components/companies-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Building2, Globe } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import type { Company } from "@/db/schema";

interface GetCompaniesTableColumnsProps {
  industryCounts: Record<string, number>;
}

export function getCompaniesTableColumns({
  industryCounts,
}: GetCompaniesTableColumnsProps): ColumnDef<Company>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      id: "name",
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Firma Adı" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{row.getValue("name")}</span>
        </div>
      ),
      meta: {
        label: "Firma Adı",
        placeholder: "Firma ara...",
        variant: "text",
      },
      enableColumnFilter: true,
    },
    {
      id: "industry",
      accessorKey: "industry",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Sektör" />
      ),
      cell: ({ cell }) => {
        const industry = cell.getValue<string>();
        return (
          <Badge variant="outline" className="capitalize">
            {industry}
          </Badge>
        );
      },
      meta: {
        label: "Sektör",
        variant: "multiSelect",
        options: [
          { label: "Teknoloji", value: "tech", count: industryCounts.tech || 0 },
          { label: "Finans", value: "finance", count: industryCounts.finance || 0 },
          { label: "Sağlık", value: "healthcare", count: industryCounts.healthcare || 0 },
          { label: "Perakende", value: "retail", count: industryCounts.retail || 0 },
          { label: "Diğer", value: "other", count: industryCounts.other || 0 },
        ],
      },
      enableColumnFilter: true,
    },
    {
      id: "website",
      accessorKey: "website",
      header: "Website",
      cell: ({ cell }) => {
        const website = cell.getValue<string>();
        return website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline"
          >
            <Globe className="h-4 w-4" />
            Ziyaret Et
          </a>
        ) : (
          <span className="text-muted-foreground">-</span>
        );
      },
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Durum" />
      ),
      cell: ({ cell }) => {
        const isActive = cell.getValue<boolean>();
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Aktif" : "Pasif"}
          </Badge>
        );
      },
    },
  ];
}
```

#### 6. Table Component

```typescript
// src/app/companies/components/companies-table.tsx

"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import type { Company } from "@/db/schema";
import { getCompaniesTableColumns } from "./companies-table-columns";
import type { getCompanies, getCompanyIndustryCounts } from "../lib/queries";

interface CompaniesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getCompanies>>,
      Awaited<ReturnType<typeof getCompanyIndustryCounts>>,
    ]
  >;
}

export function CompaniesTable({ promises }: CompaniesTableProps) {
  const [{ data, pageCount }, industryCounts] = React.use(promises);

  const columns = React.useMemo(
    () => getCompaniesTableColumns({ industryCounts }),
    [industryCounts],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: "createdAt", desc: true }],
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
```

#### 7. Page Component

```typescript
// src/app/companies/page.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import type { SearchParams } from "@/types";
import { CompaniesTable } from "./components/companies-table";
import { getCompanies, getCompanyIndustryCounts } from "./lib/queries";
import { searchParamsCache } from "./lib/validations";

interface CompaniesPageProps {
  searchParams: Promise<SearchParams>;
}

export default function CompaniesPage(props: CompaniesPageProps) {
  return (
    <div className="container py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Firmalar</h1>
        <p className="text-muted-foreground">Tüm firmaları görüntüleyin ve yönetin.</p>
      </div>
      
      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={5}
            filterCount={2}
            cellWidths={["10rem", "30rem", "12rem", "12rem", "8rem"]}
            shrinkZero
          />
        }
      >
        <CompaniesTableWrapper {...props} />
      </Suspense>
    </div>
  );
}

async function CompaniesTableWrapper(props: CompaniesPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getCompanies(search),
    getCompanyIndustryCounts(),
  ]);

  return <CompaniesTable promises={promises} />;
}
```

### Özet Checklist

✅ Schema tanımla (`src/db/schema.ts`)  
✅ Validation oluştur (`lib/validations.ts`)  
✅ Query fonksiyonları yaz (`lib/queries.ts`)  
✅ Kolonları tanımla (`components/...-columns.tsx`)  
✅ Table component'i oluştur (`components/...-table.tsx`)  
✅ Page component'i oluştur (`page.tsx`)  

---

## 🎯 Soru 2: İki Çeşit Tablo Var, Farkları Ne? {#soru-2}

### DataTable (Server-Side Tablo)

**Ne zaman kullanmalı:**
- ✅ Admin paneli, rapor sayfaları
- ✅ Büyük veri setleri (> 10k satır)
- ✅ SEO önemli (URL-based state)
- ✅ Sadece görüntüleme veya nadir güncelleme

**Özellikler:**
- Server-side pagination, sorting, filtering
- URL state management
- 3 çeşit filter UI (basit, advanced, command)
- Faceted filters
- Column visibility & reordering
- Export functionality

**Dosya boyutu:** ~50KB (minified)

### DataGrid (Excel-like Interaktif Tablo)

**Ne zaman kullanmalı:**
- ✅ Hızlı veri girişi gerekli
- ✅ Excel benzeri UX isteniyor
- ✅ Inline editing kritik
- ✅ Copy-paste desteği önemli

**Özellikler:**
- Inline editing (9 farklı cell tipi)
- Excel-like keyboard navigation
- Copy-paste (Excel'den bile!)
- Multi-cell selection
- Context menu (sağ tık)
- File upload per cell
- Search & highlight
- Virtual scrolling

**Dosya boyutu:** ~150KB (minified)

### DataGrid Live (Real-time Sync)

**Ne zaman kullanmalı:**
- ✅ Multi-user collaboration
- ✅ Real-time updates kritik
- ✅ Offline-first yaklaşım
- ✅ Optimistic updates

**Ek özellikler:**
- TanStack DB entegrasyonu
- Automatic sync to server
- Conflict resolution
- Offline support

**Dosya boyutu:** ~200KB (minified)

### Tek Projede Her İkisi Birden Kullanılır mı?

**Evet!** Aynı projede farklı sayfalarda farklı tablo tipleri kullanabilirsiniz:

```
SaaS Projeniz/
├── /dashboard
│   └── Overview widgets (DataTable - read-only)
│
├── /customers
│   └── Customer list (DataTable - filtreleme önemli)
│
├── /orders
│   └── Order history (DataTable - büyük dataset)
│
├── /projects
│   └── Project list (DataTable)
│   └── /projects/[id]/tasks
│       └── Task management (DataGrid - inline editing)
│
└── /crm
    └── Leads entry (DataGrid Live - real-time)
```

### Hangisini İmplemente Etmeliyim?

**Başlangıç için öneri:**

1. **İlk önce DataTable** - %80 ihtiyacı karşılar
2. Eğer gerçekten Excel-like editing gerekiyorsa **DataGrid**
3. Real-time collaboration lazımsa **DataGrid Live**

**Çoğu SaaS sadece DataTable ile yeterli!**

---

## 💡 Soru 3: Yeni Bi Sayfa Yapmak İstesem Nasıl Yaparım? {#soru-3}

### Pratik Örnek: "Çalışanlar Tablosu"

Diyelim ki bir **Çalışanlar (Employees)** sayfası yapmak istiyorsunuz.

#### Adım 1: Klasör Yapısını Oluştur

```bash
mkdir -p src/app/employees/components
mkdir -p src/app/employees/lib
touch src/app/employees/page.tsx
touch src/app/employees/lib/validations.ts
touch src/app/employees/lib/queries.ts
touch src/app/employees/components/employees-table.tsx
touch src/app/employees/components/employees-table-columns.tsx
```

#### Adım 2: Schema (Zaten Varsa Atlayın)

```typescript
// src/db/schema.ts

export const employees = pgTable("employees", {
  id: varchar("id", { length: 30 }).primaryKey(),
  firstName: varchar("first_name", { length: 128 }).notNull(),
  lastName: varchar("last_name", { length: 128 }).notNull(),
  email: varchar("email", { length: 256 }).notNull().unique(),
  department: varchar("department", {
    length: 50,
    enum: ["engineering", "sales", "marketing", "hr", "finance"],
  }).notNull(),
  role: varchar("role", { length: 128 }).notNull(),
  salary: integer("salary").notNull(),
  hireDate: timestamp("hire_date").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Employee = typeof employees.$inferSelect;
```

#### Adım 3: Validations (URL State)

```typescript
// src/app/employees/lib/validations.ts

import { createSearchParamsCache, parseAsInteger, parseAsArrayOf, parseAsStringEnum, parseAsString } from "nuqs/server";
import { getSortingStateParser } from "@/lib/parsers";
import { employees } from "@/db/schema";

export const searchParamsCache = createSearchParamsCache({
  page: parseAsInteger.withDefault(1),
  perPage: parseAsInteger.withDefault(10),
  sort: getSortingStateParser<Employee>().withDefault([
    { id: "hireDate", desc: true },
  ]),
  name: parseAsString.withDefault(""),
  department: parseAsArrayOf(parseAsStringEnum(employees.department.enumValues)).withDefault([]),
  isActive: parseAsString.withDefault(""),
});

export type GetEmployeesSchema = Awaited<ReturnType<typeof searchParamsCache.parse>>;
```

#### Adım 4: Queries (Veri Çekme)

```typescript
// src/app/employees/lib/queries.ts

"use cache";
import "server-only";
import { and, asc, count, desc, ilike, inArray, eq, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { employees } from "@/db/schema";
import type { GetEmployeesSchema } from "./validations";

export async function getEmployees(input: GetEmployeesSchema) {
  const offset = (input.page - 1) * input.perPage;

  // Filters
  const where = and(
    input.name 
      ? or(
          ilike(employees.firstName, `%${input.name}%`),
          ilike(employees.lastName, `%${input.name}%`),
          ilike(employees.email, `%${input.name}%`)
        )
      : undefined,
    input.department.length > 0 
      ? inArray(employees.department, input.department) 
      : undefined,
    input.isActive 
      ? eq(employees.isActive, input.isActive === "true") 
      : undefined,
  );

  // Sorting
  const orderBy = input.sort.map((item) =>
    item.desc ? desc(employees[item.id]) : asc(employees[item.id])
  );

  // Parallel queries
  const { data, total } = await db.transaction(async (tx) => {
    const data = await tx
      .select({
        id: employees.id,
        firstName: employees.firstName,
        lastName: employees.lastName,
        email: employees.email,
        department: employees.department,
        role: employees.role,
        salary: employees.salary,
        hireDate: employees.hireDate,
        isActive: employees.isActive,
        // Computed field
        fullName: sql<string>`${employees.firstName} || ' ' || ${employees.lastName}`,
      })
      .from(employees)
      .limit(input.perPage)
      .offset(offset)
      .where(where)
      .orderBy(...orderBy);

    const total = await tx
      .select({ count: count() })
      .from(employees)
      .where(where)
      .then((res) => res[0]?.count ?? 0);

    return { data, total };
  });

  const pageCount = Math.ceil(total / input.perPage);
  return { data, pageCount };
}

export async function getEmployeeDepartmentCounts() {
  return await db
    .select({
      department: employees.department,
      count: count(),
    })
    .from(employees)
    .groupBy(employees.department)
    .then((res) =>
      res.reduce((acc, { department, count }) => {
        acc[department] = count;
        return acc;
      }, {} as Record<string, number>)
    );
}
```

#### Adım 5: Columns (Kolon Tanımları)

```typescript
// src/app/employees/components/employees-table-columns.tsx

"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, User, Mail, Briefcase } from "lucide-react";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/format";
import type { Employee } from "@/db/schema";

interface GetEmployeesTableColumnsProps {
  departmentCounts: Record<string, number>;
}

const departmentLabels = {
  engineering: "Yazılım",
  sales: "Satış",
  marketing: "Pazarlama",
  hr: "İnsan Kaynakları",
  finance: "Finans",
} as const;

export function getEmployeesTableColumns({
  departmentCounts,
}: GetEmployeesTableColumnsProps): ColumnDef<Employee>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
        />
      ),
      enableSorting: false,
      size: 40,
    },
    {
      id: "fullName",
      accessorFn: (row) => `${row.firstName} ${row.lastName}`,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Ad Soyad" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </span>
        </div>
      ),
      meta: {
        label: "Ad Soyad",
        placeholder: "Çalışan ara...",
        variant: "text",
      },
      enableColumnFilter: true,
    },
    {
      id: "email",
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Email" />
      ),
      cell: ({ cell }) => (
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a
            href={`mailto:${cell.getValue<string>()}`}
            className="text-primary hover:underline"
          >
            {cell.getValue<string>()}
          </a>
        </div>
      ),
    },
    {
      id: "department",
      accessorKey: "department",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Departman" />
      ),
      cell: ({ cell }) => {
        const department = cell.getValue<keyof typeof departmentLabels>();
        return (
          <Badge variant="outline">
            {departmentLabels[department] || department}
          </Badge>
        );
      },
      meta: {
        label: "Departman",
        variant: "multiSelect",
        options: Object.entries(departmentLabels).map(([value, label]) => ({
          label,
          value,
          count: departmentCounts[value] || 0,
        })),
      },
      enableColumnFilter: true,
    },
    {
      id: "role",
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Pozisyon" />
      ),
      cell: ({ cell }) => (
        <div className="flex items-center gap-2">
          <Briefcase className="h-4 w-4 text-muted-foreground" />
          <span>{cell.getValue<string>()}</span>
        </div>
      ),
    },
    {
      id: "salary",
      accessorKey: "salary",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="Maaş" />
      ),
      cell: ({ cell }) => {
        const salary = cell.getValue<number>();
        return (
          <span className="font-mono">
            {new Intl.NumberFormat("tr-TR", {
              style: "currency",
              currency: "TRY",
            }).format(salary)}
          </span>
        );
      },
    },
    {
      id: "hireDate",
      accessorKey: "hireDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} label="İşe Başlama" />
      ),
      cell: ({ cell }) => formatDate(cell.getValue<Date>()),
      meta: {
        label: "İşe Başlama",
        variant: "dateRange",
      },
      enableColumnFilter: true,
    },
    {
      id: "isActive",
      accessorKey: "isActive",
      header: "Durum",
      cell: ({ cell }) => {
        const isActive = cell.getValue<boolean>();
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Aktif" : "Pasif"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Düzenle</DropdownMenuItem>
            <DropdownMenuItem>Detaylar</DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              Sil
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
      size: 40,
    },
  ];
}
```

#### Adım 6: Table Component

```typescript
// src/app/employees/components/employees-table.tsx

"use client";

import * as React from "react";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { useDataTable } from "@/hooks/use-data-table";
import { getEmployeesTableColumns } from "./employees-table-columns";
import type { getEmployees, getEmployeeDepartmentCounts } from "../lib/queries";

interface EmployeesTableProps {
  promises: Promise<
    [
      Awaited<ReturnType<typeof getEmployees>>,
      Awaited<ReturnType<typeof getEmployeeDepartmentCounts>>,
    ]
  >;
}

export function EmployeesTable({ promises }: EmployeesTableProps) {
  const [{ data, pageCount }, departmentCounts] = React.use(promises);

  const columns = React.useMemo(
    () => getEmployeesTableColumns({ departmentCounts }),
    [departmentCounts],
  );

  const { table } = useDataTable({
    data,
    columns,
    pageCount,
    initialState: {
      sorting: [{ id: "hireDate", desc: true }],
      columnPinning: { right: ["actions"] },
    },
  });

  return (
    <DataTable table={table}>
      <DataTableToolbar table={table} />
    </DataTable>
  );
}
```

#### Adım 7: Page Component

```typescript
// src/app/employees/page.tsx

import { Suspense } from "react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import type { SearchParams } from "@/types";
import { EmployeesTable } from "./components/employees-table";
import { getEmployees, getEmployeeDepartmentCounts } from "./lib/queries";
import { searchParamsCache } from "./lib/validations";

interface EmployeesPageProps {
  searchParams: Promise<SearchParams>;
}

export default function EmployeesPage(props: EmployeesPageProps) {
  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Çalışanlar</h1>
          <p className="text-muted-foreground mt-1">
            Şirket çalışanlarını görüntüleyin ve yönetin.
          </p>
        </div>
      </div>

      <Suspense
        fallback={
          <DataTableSkeleton
            columnCount={7}
            filterCount={2}
            cellWidths={["3rem", "16rem", "16rem", "10rem", "12rem", "10rem", "8rem"]}
            shrinkZero
          />
        }
      >
        <EmployeesTableWrapper {...props} />
      </Suspense>
    </div>
  );
}

async function EmployeesTableWrapper(props: EmployeesPageProps) {
  const searchParams = await props.searchParams;
  const search = searchParamsCache.parse(searchParams);

  const promises = Promise.all([
    getEmployees(search),
    getEmployeeDepartmentCounts(),
  ]);

  return <EmployeesTable promises={promises} />;
}
```

### Hızlı Template

Yeni bir sayfa yapmak için bu şablonu kullanabilirsiniz:

```bash
# 1. Klasör oluştur
mkdir -p src/app/[sayfa-adi]/components
mkdir -p src/app/[sayfa-adi]/lib

# 2. Dosyaları oluştur
touch src/app/[sayfa-adi]/page.tsx
touch src/app/[sayfa-adi]/lib/validations.ts
touch src/app/[sayfa-adi]/lib/queries.ts
touch src/app/[sayfa-adi]/components/[sayfa-adi]-table.tsx
touch src/app/[sayfa-adi]/components/[sayfa-adi]-table-columns.tsx

# 3. Yukarıdaki örnekleri kopyala-düzenle!
```

---

## 🎨 Soru 4: Tabloların Dizaynı Nereden Kontrol Ediliyor? {#soru-4}

### Genel Dizayn Kontrol Noktaları

#### 1. Global Styles (`src/styles/globals.css`)

Tüm renk paleti ve temel stiller burada:

```css
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
    --primary: 240 5.9% 10%;
    --muted: 240 4.8% 95.9%;
    --border: 240 5.9% 90%;
    /* ... */
  }

  .dark {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
    /* Dark mode colors */
  }
}
```

**Renk değiştirmek için:**

```css
:root {
  --primary: 220 100% 50%; /* Mavi */
  --primary-foreground: 0 0% 100%; /* Beyaz */
}
```

#### 2. Tailwind Config (`tailwind.config.js`)

Spacing, font, breakpoint'ler burada:

```javascript
export default {
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--primary))",
        // ...
      },
      spacing: {
        18: "4.5rem", // Custom spacing
      },
      fontSize: {
        xxs: "0.625rem", // Custom font size
      },
    },
  },
};
```

#### 3. DataTable Component Stilleri

**Tablo border'larını değiştirme:**

```tsx
// src/components/data-table/data-table.tsx

<div className="overflow-hidden rounded-lg border-2 border-primary">
  {/* ^ border kalınlığı ve rengi */}
  <Table>
    {/* ... */}
  </Table>
</div>
```

**Satır yüksekliğini değiştirme:**

```tsx
<TableRow className="h-16"> {/* Default: h-12 */}
  {/* ... */}
</TableRow>
```

**Hover efektini değiştirme:**

```tsx
<TableRow className="hover:bg-muted/50"> {/* Daha açık hover */}
  {/* ... */}
</TableRow>
```

#### 4. Column Stilleri

Her kolonda `className` ile özelleştirme:

```typescript
{
  id: "name",
  accessorKey: "name",
  header: ({ column }) => (
    <DataTableColumnHeader 
      column={column} 
      label="Name"
      className="text-lg font-bold" // Başlık stili
    />
  ),
  cell: ({ row }) => (
    <div className="font-medium text-primary"> {/* Cell stili */}
      {row.getValue("name")}
    </div>
  ),
  size: 300, // Kolon genişliği (px)
}
```

#### 5. Pagination Stilleri

```tsx
// src/components/data-table/data-table-pagination.tsx

<div className="flex items-center justify-between px-2">
  <div className="text-sm text-muted-foreground">
    {/* Sayfa bilgisi */}
  </div>
  
  <div className="flex items-center gap-2">
    <Button
      variant="outline"
      size="sm"
      className="h-8" // Buton yüksekliği
    >
      Önceki
    </Button>
  </div>
</div>
```

#### 6. Filter Stilleri

```tsx
// src/components/data-table/data-table-toolbar.tsx

<div className="flex items-center gap-2">
  <Input
    placeholder="Ara..."
    className="h-9 w-[150px] lg:w-[250px]" 
    // ^ Responsive genişlik
  />
  
  <DataTableFacetedFilter
    column={table.getColumn("status")}
    title="Durum"
    options={statusOptions}
    className="w-[200px]" // Dropdown genişliği
  />
</div>
```

### Yaygın Dizayn Özelleştirmeleri

#### Koyu Tema Aktif Etme

```tsx
// src/app/layout.tsx

import { ThemeProvider } from "next-themes";

export default function RootLayout({ children }) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark" // ← Varsayılan koyu tema
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

#### Seçili Satır Rengini Değiştirme

```css
/* src/styles/globals.css */

@layer base {
  [data-state="selected"] {
    @apply bg-primary/10; /* Daha belirgin */
  }
}
```

Veya component içinde:

```tsx
<TableRow 
  data-state={row.getIsSelected() && "selected"}
  className="data-[state=selected]:bg-blue-100 dark:data-[state=selected]:bg-blue-950"
>
```

#### Sticky Header

```tsx
// src/components/data-table/data-table.tsx

<div className="relative max-h-[600px] overflow-auto">
  <Table>
    <TableHeader className="sticky top-0 z-10 bg-background">
      {/* Header içeriği */}
    </TableHeader>
    <TableBody>
      {/* Body içeriği */}
    </TableBody>
  </Table>
</div>
```

#### Zebra Striping (Çizgili Satırlar)

```tsx
<TableRow 
  className={row.index % 2 === 0 ? "bg-muted/30" : ""}
>
  {/* Cell içeriği */}
</TableRow>
```

#### Compact Mode (Daha Sıkışık Tablo)

```tsx
<Table className="text-sm"> {/* Küçük font */}
  <TableHeader>
    <TableRow className="h-9"> {/* Kısa header */}
      {/* ... */}
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow className="h-10"> {/* Kısa satırlar */}
      {/* ... */}
    </TableRow>
  </TableBody>
</Table>
```

#### Custom Badge Renkleri

```tsx
// src/app/[sayfa]/components/columns.tsx

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
} as const;

<Badge className={statusColors[status]}>
  {status}
</Badge>
```

### Dizayn Değişikliği Kontrol Listesi

Tablo dizaynını özelleştirmek için:

1. **Renkler** → `src/styles/globals.css` (CSS variables)
2. **Spacing** → `tailwind.config.js` (custom spacing)
3. **Table layout** → `src/components/data-table/data-table.tsx`
4. **Cell görünümü** → Column definitions (`*-columns.tsx`)
5. **Header stili** → `data-table-column-header.tsx`
6. **Pagination** → `data-table-pagination.tsx`
7. **Filters** → `data-table-toolbar.tsx`
8. **Tema** → `ThemeProvider` in `layout.tsx`

---

## 🚀 Gerçek Proje Senaryoları {#senaryolar}

### Senaryo 1: E-ticaret Admin Paneli

**İhtiyaçlar:**
- Ürün listesi (>100k ürün)
- Sipariş listesi (filtreleme kritik)
- Müşteri listesi
- Stok yönetimi (hızlı güncelleme)

**Çözüm:**

```
/products → DataTable (büyük dataset)
/orders → DataTable (advanced filters)
/customers → DataTable (export önemli)
/inventory → DataGrid (inline editing)
```

### Senaryo 2: CRM Uygulaması

**İhtiyaçlar:**
- Lead listesi
- Pipeline view
- Hızlı not girişi
- Real-time updates

**Çözüm:**

```
/leads → DataTable (filtreleme ve sorting)
/pipeline → Custom Kanban (table değil)
/contacts → DataGrid Live (hızlı güncelleme)
```

### Senaryo 3: Proje Yönetimi

**İhtiyaçlar:**
- Proje listesi
- Task yönetimi
- Time tracking
- Collaboration

**Çözüm:**

```
/projects → DataTable (liste görünümü)
/projects/[id]/tasks → DataGrid Live (Excel-like editing)
/time-tracking → DataGrid (inline girişler)
```

### Senaryo 4: Finans/Muhasebe

**İhtiyaçlar:**
- Fatura listesi
- Gider girişi
- Hesap dökümleri
- Excel export

**Çözüm:**

```
/invoices → DataTable (export + filters)
/expenses → DataGrid (hızlı giriş)
/statements → DataTable (rapor)
```

---

## 📝 Özet ve Best Practices

### Yeni Sayfa Oluşturma Adımları

1. ✅ Klasör yapısı oluştur (`/app/[page]/`)
2. ✅ Schema tanımla (varsa)
3. ✅ Validations yaz (`lib/validations.ts`)
4. ✅ Query fonksiyonları (`lib/queries.ts`)
5. ✅ Kolonları tanımla (`components/*-columns.tsx`)
6. ✅ Table component (`components/*-table.tsx`)
7. ✅ Page component (`page.tsx`)

### Hangi Tablo Tipini Seçmeli?

- **%80 durumda** → DataTable
- **Excel-like editing** → DataGrid
- **Real-time collaboration** → DataGrid Live

### Dizayn Değişiklikleri

- **Renkler** → `globals.css` (CSS variables)
- **Layout** → Component'lerdeki `className`
- **Tema** → `ThemeProvider`

### Performance Tips

- Server-side pagination kullan (DataTable)
- Virtual scrolling aktif (DataGrid)
- Debounced filters (300ms)
- React.memo() kritik componentlerde
- useMemo() column definitions'da

### Accessibility

- ARIA labels ekle
- Keyboard navigation test et
- Screen reader uyumlu
- Contrast ratios kontrol et

---

## 🎯 Sonuç

Bu rehberle:
- ✅ Sıfırdan kurulum yapabilirsiniz
- ✅ Yeni sayfa oluşturabilirsiniz
- ✅ Hangi tablo tipini kullanacağınızı bilirsiniz
- ✅ Dizayn özelleştirmesi yapabilirsiniz

**Sorularınız için:** [tablecn-kaynak-analiz.md](./tablecn-kaynak-analiz.md) dosyasına bakın.

---

**Son Güncelleme:** 2026-01-11  
**Hazırlayan:** AI Assistant
