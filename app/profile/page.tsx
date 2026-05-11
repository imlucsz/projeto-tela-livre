"use client";

import { useState } from "react";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { ProfileSidebar } from "@/components/profile/profile-sidebar";
import { ProfileSavedEvents } from "@/components/profile/profile-saved-events";
import { ProfileParticipatingEvents } from "@/components/profile/profile-participating-events";

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<"saved" | "participating">("participating");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Meu Perfil
            </h1>
            <p className="mt-2 text-muted-foreground">
              Gerencie seus eventos e preferências
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            <div className="lg:col-span-1">
              <ProfileSidebar activeTab={activeTab} setActiveTab={setActiveTab} />
            </div>
            <div className="lg:col-span-3">
              {activeTab === "saved" && <ProfileSavedEvents />}
              {activeTab === "participating" && <ProfileParticipatingEvents />}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
