"use client";

import { useState } from "react";
import { Button } from "@/components/ui";
import { Modal, inputClass } from "@/components/ui/modal";
import { dummyComponents, dummyUnits } from "../dummy-data";

export function AssignComponentModal({ onClose }: { onClose: () => void }) {
  const [selectedComponents, setSelectedComponents] = useState<Set<string>>(new Set(["1", "2", "3", "4", "5"]));
  const [selectedUnits, setSelectedUnits] = useState<Set<string>>(new Set(["1", "2", "3"]));
  const [searchUnit, setSearchUnit] = useState("");

  const toggleComponent = (id: string) => {
    const next = new Set(selectedComponents);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedComponents(next);
  };

  const toggleUnit = (id: string) => {
    const next = new Set(selectedUnits);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedUnits(next);
  };

  return (
    <Modal
      open
      title={
        <div>
          <div className="text-xl font-bold italic">Asign Komponen ke Unit</div>
          <div className="text-xs text-zinc-400 italic font-normal mt-1">Perbaharui Asign Komponen ke Unit</div>
        </div>
      }
      onClose={onClose}
      className="max-w-4xl"
      footer={
        <div className="w-full flex items-center justify-between">
          <div className="text-xs text-zinc-500 flex flex-col gap-1 font-bold">
            <div>{selectedComponents.size} dari 20 Komponen dipilih</div>
            <div>{selectedUnits.size} dari 120 Unit dipilih</div>
          </div>
          <div className="flex gap-2">
            <Button variant="danger" onClick={onClose} className="rounded-full px-6">
              ✕ Batal
            </Button>
            <Button onClick={onClose} className="rounded-full px-6">
              ✓ Simpan Perubahan
            </Button>
          </div>
        </div>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 h-[450px]">
        {/* Left Table: Komponen Tagihan */}
        <div className="border border-zinc-200 rounded-xl flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-zinc-100">
            <h4 className="text-lg font-bold italic">Komponen Tagihan</h4>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#EFECE5] text-zinc-500 font-semibold z-10">
                <tr>
                  <th className="px-3 py-2 text-left w-10">
                    <div className="w-4 h-4 rounded bg-brand-700 flex items-center justify-center text-white">
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </div>
                  </th>
                  <th className="px-2 py-2 text-left">Nama</th>
                  <th className="px-2 py-2 text-left">Desc</th>
                </tr>
              </thead>
              <tbody>
                {dummyComponents.map(c => (
                  <tr key={c.id} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer" onClick={() => toggleComponent(c.id)}>
                    <td className="px-3 py-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${selectedComponents.has(c.id) ? 'bg-brand-700' : 'border border-zinc-300'}`}>
                        {selectedComponents.has(c.id) && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                    </td>
                    <td className="px-2 py-3 font-bold">{c.name}</td>
                    <td className="px-2 py-3 text-zinc-500">{c.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400">
            <div>Showing 1-5 of 120</div>
            <div className="flex items-center gap-1 font-medium">
              <button className="px-1">‹</button>
              <button className="w-5 h-5 rounded bg-zinc-800 text-white flex items-center justify-center">1</button>
              <button className="w-5 h-5 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">2</button>
              <button className="w-5 h-5 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">3</button>
              <span>...</span>
              <button className="w-5 h-5 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">14</button>
              <button className="px-1">›</button>
            </div>
          </div>
        </div>

        {/* Right Table: Unit */}
        <div className="border border-zinc-200 rounded-xl flex flex-col overflow-hidden bg-white">
          <div className="p-4 border-b border-zinc-100">
            <h4 className="text-lg font-bold italic mb-2">Unit</h4>
            <div className="text-xs text-zinc-400 mb-1">Search</div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search"
                className={`${inputClass} rounded-lg text-sm`}
                value={searchUnit}
                onChange={(e) => setSearchUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#EFECE5] text-zinc-500 font-semibold z-10">
                <tr>
                  <th className="px-3 py-2 text-left w-10">
                    <div className="w-4 h-4 rounded border border-zinc-400 bg-white"></div>
                  </th>
                  <th className="px-2 py-2 text-left">Unit</th>
                  <th className="px-2 py-2 text-left">Penguni</th>
                  <th className="px-2 py-2 text-left">Komponen Aktif</th>
                </tr>
              </thead>
              <tbody>
                {dummyUnits.map(u => (
                  <tr key={u.id} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer" onClick={() => toggleUnit(u.id)}>
                    <td className="px-3 py-3">
                      <div className={`w-4 h-4 rounded flex items-center justify-center text-white ${selectedUnits.has(u.id) ? 'bg-brand-700' : 'border border-zinc-300'}`}>
                        {selectedUnits.has(u.id) && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M10 3L4.5 8.5L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </div>
                    </td>
                    <td className="px-2 py-3 font-bold">{u.code}</td>
                    <td className="px-2 py-3 text-zinc-500">{u.residentName}</td>
                    <td className="px-2 py-3 text-zinc-500 truncate max-w-[100px]" title={u.activeComponents}>{u.activeComponents}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="p-3 border-t border-zinc-100 flex justify-between items-center text-[10px] text-zinc-400">
            <div>Showing 1-5 of 120</div>
            <div className="flex items-center gap-1 font-medium">
              <button className="px-1">‹</button>
              <button className="w-5 h-5 rounded bg-zinc-800 text-white flex items-center justify-center">1</button>
              <button className="w-5 h-5 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">2</button>
              <button className="w-5 h-5 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">3</button>
              <span>...</span>
              <button className="w-5 h-5 rounded hover:bg-zinc-100 flex items-center justify-center text-zinc-700">14</button>
              <button className="px-1">›</button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
