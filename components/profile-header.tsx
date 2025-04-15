"use client";

import Link from "next/link";
import ThemeToggleWrapper from "./theme-toggle-wrapper";

export default function ProfileHeader({ title }: { title: string }) {
  return (
    <header className="bg-[#000] border-b border-zinc-800">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        
        <div className="flex items-center space-x-4">
          <ThemeToggleWrapper />
          <Link 
            href="/profile/edit" 
            className="inline-flex items-center px-4 py-2 border border-zinc-800 rounded-md text-sm font-medium text-white bg-zinc-900 hover:bg-zinc-800"
          >
            Editar Perfil
          </Link>
        </div>
      </div>
    </header>
  );
}