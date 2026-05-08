"use client";

import { useCallback, useState, useRef, type DragEvent } from "react";
import { useRouter } from "next/navigation";
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { importTransactionsCsv, type CsvImportResult } from "@/lib/api";

type CsvImportModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

type ImportState = "idle" | "preview" | "importing" | "success" | "error";

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [state, setState] = useState<ImportState>("idle");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string[][]>([]);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const resetState = useCallback(() => {
    setState("idle");
    setFile(null);
    setPreview([]);
    setResult(null);
    setError(null);
    setIsDragging(false);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const parsePreview = useCallback(async (selectedFile: File) => {
    const text = await selectedFile.text();
    const lines = text.split("\n").filter((line) => line.trim());
    const previewLines = lines.slice(0, 6).map((line) => {
      return line.split(",").map((cell) => cell.trim().replace(/^"|"$/g, ""));
    });
    setPreview(previewLines);
  }, []);

  const handleFileSelect = useCallback(
    async (selectedFile: File) => {
      if (!selectedFile.name.endsWith(".csv")) {
        setError("Por favor, selecione um arquivo CSV");
        return;
      }

      setFile(selectedFile);
      setError(null);
      await parsePreview(selectedFile);
      setState("preview");
    },
    [parsePreview],
  );

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        await handleFileSelect(droppedFile);
      }
    },
    [handleFileSelect],
  );

  const handleInputChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        await handleFileSelect(selectedFile);
      }
    },
    [handleFileSelect],
  );

  const handleImport = useCallback(async () => {
    if (!file) return;

    setState("importing");
    setError(null);

    try {
      const importResult = await importTransactionsCsv(file);
      setResult(importResult);
      setState("success");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao importar arquivo");
      setState("error");
    }
  }, [file, router]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <Card className="w-full max-w-2xl border-slate-700 bg-slate-900 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-50">
            Importar Transações via CSV
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-50"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {state === "idle" && (
          <>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
                isDragging
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-slate-600 hover:border-slate-500 hover:bg-slate-800/50"
              }`}
            >
              <Upload className="mb-4 h-12 w-12 text-slate-400" />
              <p className="mb-2 text-center text-slate-300">
                Arraste e solte o arquivo CSV aqui
              </p>
              <p className="text-sm text-slate-500">ou clique para selecionar</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="hidden"
              />
            </div>

            <div className="mt-4 rounded-lg bg-slate-800 p-4">
              <p className="mb-2 text-sm font-medium text-slate-300">
                Formato esperado do CSV:
              </p>
              <code className="text-xs text-slate-400">
                data,descrição,valor,tipo,categoria
                <br />
                01/01/2024,Salário,5000.00,receita,Salário
                <br />
                02/01/2024,Aluguel,1500.00,despesa,Moradia
              </code>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg bg-red-500/10 p-3 text-red-400">
                <AlertCircle className="h-5 w-5" />
                <span>{error}</span>
              </div>
            )}
          </>
        )}

        {state === "preview" && file && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-slate-800 p-3">
              <FileText className="h-6 w-6 text-blue-400" />
              <div>
                <p className="font-medium text-slate-200">{file.name}</p>
                <p className="text-sm text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-sm font-medium text-slate-300">
                Preview das primeiras linhas:
              </p>
              <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-700 bg-slate-800">
                      {preview[0]?.map((header, i) => (
                        <th
                          key={i}
                          className="px-3 py-2 text-left font-medium text-slate-300"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(1).map((row, rowIndex) => (
                      <tr
                        key={rowIndex}
                        className="border-b border-slate-700/50 last:border-0"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="px-3 py-2 text-slate-400"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={resetState}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancelar
              </Button>
              <Button onClick={handleImport}>Confirmar Importação</Button>
            </div>
          </>
        )}

        {state === "importing" && (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="mb-4 h-12 w-12 animate-spin text-blue-500" />
            <p className="text-slate-300">Importando transações...</p>
          </div>
        )}

        {state === "success" && result && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-green-500/10 p-4">
              <Check className="h-8 w-8 text-green-500" />
              <div>
                <p className="font-medium text-green-400">
                  Importação concluída!
                </p>
                <p className="text-sm text-slate-300">
                  {result.imported} transações importadas com sucesso
                </p>
              </div>
            </div>

            {result.failed > 0 && (
              <div className="mb-4 rounded-lg bg-yellow-500/10 p-4">
                <p className="mb-2 font-medium text-yellow-400">
                  {result.failed} transações falharam:
                </p>
                <ul className="max-h-40 space-y-1 overflow-y-auto text-sm text-slate-400">
                  {result.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </>
        )}

        {state === "error" && (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-lg bg-red-500/10 p-4">
              <AlertCircle className="h-8 w-8 text-red-500" />
              <div>
                <p className="font-medium text-red-400">Erro na importação</p>
                <p className="text-sm text-slate-300">{error}</p>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={resetState}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Tentar novamente
              </Button>
              <Button onClick={handleClose}>Fechar</Button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
