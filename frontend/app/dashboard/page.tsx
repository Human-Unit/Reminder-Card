"use client";
import { useState, useEffect, useCallback } from "react";
import Header from "../../components/Header";
import CreateEntryForm from "../../components/CreateEntryForm";
import EntryList from "../../components/EntryList";
import api from "../../lib/axios";
import { Entry } from "../../types";
import { AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/user/entries");

      // Обработка разных форматов ответа от бэкенда
      const data = Array.isArray(res.data)
        ? res.data
        : res.data.data || res.data.entries || [];

      setEntries(data);
    } catch (error: any) {
      console.error("Failed to load entries:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.message ||
        "Failed to load entries";
      setError(errorMsg);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        <Header />

        {/* Ошибка подключения к API */}
        {error && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl flex items-start gap-3">
            <AlertCircle
              size={20}
              className="text-yellow-600 flex-shrink-0 mt-0.5"
            />
            <div>
              <h3 className="font-bold text-yellow-800">Connection Error</h3>
              <p className="text-sm text-yellow-700">{error}</p>
              <p className="text-xs text-yellow-600 mt-1">
                Backend should be running on {process.env.NEXT_PUBLIC_API_URL}
              </p>
              <button
                onClick={fetchEntries}
                className="mt-2 text-xs font-bold text-yellow-700 hover:text-yellow-800 underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Форма создания записи */}
        <CreateEntryForm onEntryCreated={fetchEntries} />

        {/* Список записей с индикатором загрузки */}
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          </div>
        ) : (
          // В DashboardPage
          <EntryList entries={entries} onRefresh={fetchEntries} />
        )}
      </div>
    </div>
  );
}
