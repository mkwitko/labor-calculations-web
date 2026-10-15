import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { UploadCloudIcon, FileIcon, FileImageIcon, FileTextIcon, Trash2Icon, DownloadIcon, XIcon, LoaderIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AXIOS_INSTANCE } from "@/lib/api";
import { env } from "@/env";
import { queryClient } from "@/lib/react-query";
import { getGetCaseQueryKey } from "@/http/generated/case/case";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type DocumentKind = "ctps" | "holerite" | "contrato" | "comprovante" | "outros";

type Document = {
  id: string;
  fileName: string;
  kind: string;
  mimeType: string;
  fileKey: string;
  sizeBytes: number;
  createdAt: string | Date;
};

type Props = {
  caseId: string;
  documents: Document[];
};

const KIND_LABELS: Record<string, string> = {
  ctps: "CTPS",
  holerite: "Holerite",
  contrato: "Contrato",
  comprovante: "Comprovante",
  outros: "Outros",
};

const KIND_COLORS: Record<string, string> = {
  ctps: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  holerite: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  contrato: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  comprovante: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  outros: "bg-muted text-muted-foreground",
};

const ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];

const MAX_BYTES = 26_214_400;

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getDocumentUrl(fileKey: string): string {
  return `${env.VITE_STORAGE_URL}/${fileKey}`;
}

function FileTypeIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith("image/")) return <FileImageIcon className="size-4 text-muted-foreground" />;
  if (mimeType === "application/pdf") return <FileTextIcon className="size-4 text-muted-foreground" />;
  return <FileIcon className="size-4 text-muted-foreground" />;
}

export function DocumentsTab({ caseId, documents }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedKind, setSelectedKind] = useState<DocumentKind>("outros");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { mutate: uploadDocument, isPending: isUploading } = useMutation({
    mutationFn: async ({ file, kind }: { file: File; kind: DocumentKind }) => {
      const { data: urlData } = await AXIOS_INSTANCE.post(
        `/cases/${caseId}/documents/upload-url`,
        { fileName: file.name, mimeType: file.type, kind, sizeBytes: file.size },
      );
      await fetch(urlData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      await AXIOS_INSTANCE.post(`/cases/${caseId}/documents`, {
        fileKey: urlData.fileKey,
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        kind,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
      setSelectedFile(null);
      setSelectedKind("outros");
      toast("Documento enviado");
    },
    onError: () => toast.error("Erro ao enviar documento"),
  });

  const { mutate: deleteDocument, isPending: isDeleting } = useMutation({
    mutationFn: async (documentId: string) => {
      await AXIOS_INSTANCE.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: getGetCaseQueryKey(caseId) });
      setPreviewDoc(null);
      toast("Documento removido");
    },
    onError: () => toast.error("Erro ao remover documento"),
  });

  function handleFileSelect(file: File) {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Tipo de arquivo não suportado. Use PDF, imagem, DOCX ou XLSX.");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Arquivo excede 25MB.");
      return;
    }
    setSelectedFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
    e.target.value = "";
  }

  const isPreviewable = (mimeType: string) =>
    mimeType === "application/pdf" || mimeType.startsWith("image/");

  return (
    <div className="space-y-6">
      {/* Upload area */}
      <div
        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50 hover:bg-muted/30"
          }`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => !selectedFile && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx"
          onChange={handleInputChange}
        />
        {selectedFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 text-sm">
              <FileTypeIcon mimeType={selectedFile.type} />
              <span className="font-medium text-foreground truncate max-w-xs">{selectedFile.name}</span>
              <span className="text-muted-foreground">({formatBytes(selectedFile.size)})</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="size-4" />
              </button>
            </div>
            <div className="flex items-center justify-center gap-3" onClick={(e) => e.stopPropagation()}>
              <Select value={selectedKind} onValueChange={(v) => setSelectedKind(v as DocumentKind)}>
                <SelectTrigger className="w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(KIND_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                onClick={() => uploadDocument({ file: selectedFile, kind: selectedKind })}
                disabled={isUploading}
              >
                {isUploading && <LoaderIcon className="size-4 animate-spin" />}
                {isUploading ? "Enviando..." : "Enviar"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <UploadCloudIcon className="size-8 mx-auto text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">
              Clique ou arraste um arquivo
            </p>
            <p className="text-xs text-muted-foreground">
              PDF, imagem, DOCX ou XLSX — máximo 25MB
            </p>
          </div>
        )}
      </div>

      {/* Documents list */}
      {documents.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento enviado.</p>
      ) : (
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-muted/30 transition-colors"
            >
              <FileTypeIcon mimeType={doc.mimeType} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{doc.fileName}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${KIND_COLORS[doc.kind] ?? KIND_COLORS.outros}`}>
                    {KIND_LABELS[doc.kind] ?? doc.kind}
                  </span>
                  <span className="text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {isPreviewable(doc.mimeType) && (
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="Pré-visualizar documento"
                    onClick={() => setPreviewDoc(previewDoc?.id === doc.id ? null : doc)}
                  >
                    <FileTextIcon className="size-4" />
                  </Button>
                )}
                <a
                  href={getDocumentUrl(doc.fileKey)}
                  target="_blank"
                  rel="noreferrer"
                  download
                >
                  <Button variant="ghost" size="icon-sm" asChild aria-label="Baixar documento">
                    <span><DownloadIcon className="size-4" /></span>
                  </Button>
                </a>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon-sm" aria-label="Remover documento" className="text-destructive hover:text-destructive">
                      <Trash2Icon className="size-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent size="sm">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover documento?</AlertDialogTitle>
                      <AlertDialogDescription>
                        <strong>{doc.fileName}</strong> será removido permanentemente.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        variant="destructive"
                        onClick={() => deleteDocument(doc.id)}
                        disabled={isDeleting}
                      >
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inline preview */}
      {previewDoc && (
        <div className="rounded-lg border overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
            <span className="text-sm font-medium text-foreground truncate">{previewDoc.fileName}</span>
            <Button variant="ghost" size="icon-sm" aria-label="Fechar prévia" onClick={() => setPreviewDoc(null)}>
              <XIcon className="size-4" />
            </Button>
          </div>
          {previewDoc.mimeType.startsWith("image/") ? (
            <img
              src={getDocumentUrl(previewDoc.fileKey)}
              alt={previewDoc.fileName}
              className="max-w-full max-h-[500px] object-contain mx-auto block"
            />
          ) : (
            <iframe
              src={getDocumentUrl(previewDoc.fileKey)}
              title={previewDoc.fileName}
              className="w-full h-[500px]"
            />
          )}
        </div>
      )}
    </div>
  );
}
