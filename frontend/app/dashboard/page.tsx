"use client";
import Header from "../../components/Header";
import CreateEntryForm from "../../components/CreateEntryForm";
import EntryList from "../../components/EntryList";
import { useEntries } from "../../hooks/useEntries";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const { data: entries = [], isLoading, error } = useEntries();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-4 md:p-8 font-sans transition-colors">
      <div className="max-w-4xl mx-auto">
        <Header />

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 rounded-xl flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="font-bold text-yellow-800 dark:text-yellow-400">Connection Error</h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300">{error instanceof Error ? error.message : 'Failed to load entries'}</p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400/80 mt-1">
                Backend should be running on {process.env.NEXT_PUBLIC_API_URL}
              </p>
            </div>
          </div>
        )}

        {/* Create Form */}
        {/* We don't need onEntryCreated anymore because React Query handles invalidation automatically */}
        <CreateEntryForm />

        {/* List */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          <EntryList entries={entries} />
        )}
      </div>
    </div>
  );
}
