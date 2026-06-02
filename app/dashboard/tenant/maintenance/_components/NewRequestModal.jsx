"use client";
import { Camera } from "lucide-react";

export const NewRequestModal = ({ onClose }) => (
  <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
    <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900">
      <form className="p-6 space-y-4">
        <input
          className="w-full rounded-xl bg-gray-100 px-4 py-2.5 outline-none dark:bg-white/5 dark:text-white"
          placeholder="Title"
        />
        <div className="grid grid-cols-2 gap-4">
          <select className="rounded-xl bg-gray-100 px-4 py-2.5 dark:bg-white/5">
            <option>General</option>
            <option>Plumbing</option>
            <option>Electrical</option>
            <option>HVAC</option>
          </select>
          <select className="rounded-xl bg-gray-100 px-4 py-2.5 dark:bg-white/5">
            <option>Low</option>
            <option>Medium</option>
            <option>High</option>
          </select>
        </div>
        <textarea
          className="w-full rounded-xl bg-gray-100 px-4 py-2.5 outline-none dark:bg-white/5 dark:text-white"
          placeholder="Description"
          rows={4}
        />
        <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 cursor-pointer">
          <Camera size={18} />
          Add photos
          <input className="hidden" type="file" />
        </label>
        <div className="flex gap-3 pt-2">
          <button
            className="flex-1 rounded-xl bg-gray-200 py-3 dark:bg-white/10"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="flex-1 rounded-xl bg-gray-900 text-white py-3 dark:bg-white dark:text-gray-900">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
);
