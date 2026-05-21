# Project Context & Agent Rules (GEMINI.md)

File ini berisi panduan, konvensi, dan aturan pengembangan standar untuk proyek ini. AI Agent dan developer diwajibkan untuk mematuhi aturan berikut demi menjaga kualitas dan konsistensi kode (Clean Code).

---

## 1. Arsitektur Folder & Konvensi
- **`app/`**: Core directory Next.js App Router (Gunakan route groups `(nama-grup)` untuk layouting).
- **`app/components/`**: Komponen spesifik untuk suatu fitur/domain.
- **`components/ui/`**: Berisi Reusable UI Components (Radix UI / Shadcn) dan Reusable Components lainnya.
- **`hooks/api/`**: Custom React Hooks untuk operasi API (React Query).
- **`services/`**: Fungsi murni berbasis Axios untuk memanggil endpoint API backend.
- **`store/`**: Direktori untuk manajemen state global klien (Zustand).
- **`lib/validations/`**: Skema validasi Zod untuk seluruh formulir.
- **`types/`**: Definisi antarmuka (interface) dan tipe data TypeScript.

---

## 2. Aturan Next.js Server Components (RSC) vs Client
- **Server First**: Secara default, semua komponen adalah Server Components.
- Jangan gunakan `'use client'` di level `page.tsx` atau `layout.tsx` kecuali halaman tersebut berupa dasbor interaktif yang sangat bergantung pada *browser state*.
- Gunakan `'use client'` HANYA pada *leaf components* (ujung komponen) yang membutuhkan `useState`, `useEffect`, event listener (`onClick`), atau *hooks* klien (seperti React Query).

---

## 3. Komponen UI (Radix / Shadcn)
- **WAJIB menggunakan komponen di dalam `components/ui/`** sebelum menulis tag HTML standar (`<button>`, `<input>`) atau meng-import pustaka komponen eksternal.
- **Instalasi Shadcn CLI**: Jika komponen UI belum tersedia di `components/ui/`, install menggunakan: `pnpm dlx shadcn@latest add <nama-komponen>`. Jangan *copy-paste* kode secara manual.

---

## 4. State Management (Zustand & React Query)
- **Global Client State (Zustand)**: Gunakan Zustand untuk mengelola state global UI (misal: sidebar, modal, tema). Letakkan store di dalam folder `store/` (contoh: `store/use-ui-store.ts`).
- **Server State & API Fetching (React Query)**: Dilarang keras melakukan fetch API langsung di dalam komponen UI menggunakan `useEffect`.
- **Services Layer**: Fungsi Axios diletakkan di `services/domain.service.ts`.
- **Hooks Layer**: Fungsi dibungkus dengan `useQuery` / `useMutation` di `hooks/api/use-domain.ts`.
- **Query Keys Factory**: Wajib membuat object konstanta `domainQK` di dalam hook untuk standarisasi cache (`all`, `lists`, `list`, `detail`).
- Mutasi data (`useMutation`) yang berhasil (onSuccess) wajib melakukan `queryClient.invalidateQueries` untuk me-refresh data tampilan.

---

## 5. Manajemen Form & Validasi (React Hook Form + Zod)
- Dilarang mengelola input form kompleks menggunakan state murni (`useState`). Gunakan **React Hook Form**.
- Skema validasi form wajib menggunakan **Zod** dan ditempatkan di `lib/validations/`.
- Gunakan komponen pembungkus standar Shadcn: `<Form>`, `<FormField>`, `<FormItem>`, `<FormLabel>`, `<FormControl>`, `<FormMessage>`.

---

## 6. Standarisasi Styling (Tailwind CSS)
- Gunakan utilitas **Tailwind CSS**. Dilarang menggunakan *Inline Styles*.
- **Wajib menggunakan `cn()`** (`clsx` + `tailwind-merge`) di utilitas class dinamis / properti `className` yang diterima komponen untuk menghindari konflik spesifitas CSS.
- Prioritaskan CSS Variables (misal: `bg-primary`, `text-muted-foreground`) untuk warna ketimbang hex/RGB kustom demi *theme support* (dark mode).

---

## 7. Error Handling & Loading States
- Operasi fetching/mutasi wajib menampilkan indikator pemrosesan: tombol *disabled* dengan status "Loading...", atau menggunakan komponen `<Skeleton />` untuk memuat area besar.
- Error pada mutasi (`onError`) atau fetch API wajib direspon dengan pesan toast yang *user-friendly* menggunakan library `sonner` (`toast.error()`), jangan biarkan error *fail silently*.

---

## 8. Git Workflow & Conventional Commits
Penamaan *commit* wajib menggunakan konvensi berikut:
- `feat(scope): deskripsi` (Menambah fitur)
- `fix(scope): deskripsi` (Memperbaiki bug)
- `chore(scope): deskripsi` (Perubahan non-kode seperti update dependency)
- `refactor(scope): deskripsi` (Optimasi/refactor tanpa merubah output)

*Branch naming*: Gunakan `feat/nama-fitur` atau `fix/nama-bug`.
