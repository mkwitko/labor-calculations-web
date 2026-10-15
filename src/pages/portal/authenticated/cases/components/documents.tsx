import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  getDocumentDownloadUrl,
  getGetClientDocumentsQueryKey,
  useClientConfirmDocumentUpload,
  useGetClientDocuments,
  useGetDocumentUploadUrl,
} from "@/http/generated/client-portal/client-portal";
import { queryClient } from "@/lib/react-query";
import { formatDate } from "@/utils/value-format";
import {
  AlertCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  DownloadIcon,
  FileTextIcon,
  Loader2Icon,
  UploadIcon,
  XCircleIcon,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";

const STATUS_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  pendente: { icon: ClockIcon, color: "text-amber-500", label: "Pendente" },
  enviado: { icon: UploadIcon, color: "text-blue-500", label: "Enviado" },
  aprovado: { icon: CheckCircleIcon, color: "text-green-500", label: "Aprovado" },
  rejeitado: { icon: XCircleIcon, color: "text-red-500", label: "Rejeitado" },
};

export function CaseDocuments({ caseId }: { caseId: string }) {
  const { data, isLoading } = useGetClientDocuments(caseId);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [selectedReqId, setSelectedReqId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Stats */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-medium text-foreground">{data.stats.completionPercentage}%</span>
          </div>
          <Progress value={data.stats.completionPercentage} className="h-2" />
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>{data.stats.aprovado} aprovados</span>
            <span>{data.stats.enviado} enviados</span>
            <span>{data.stats.pendente} pendentes</span>
            <span>{data.stats.rejeitado} rejeitados</span>
          </div>
        </CardContent>
      </Card>

      {/* Requirements list */}
      <div className="space-y-2">
        {data.requirements.map((req) => {
          const statusCfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.pendente;
          const StatusIcon = statusCfg.icon;

          return (
            <div
              key={req.id}
              className="flex items-start gap-3 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
            >
              <div className="mt-0.5">
                <StatusIcon className={`w-5 h-5 ${statusCfg.color}`} />
              </div>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground">
                    {req.customName ?? req.kind}
                  </p>
                  {req.isMandatory && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">Obrigatório</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{req.description}</p>
                {req.dueDate && (
                  <p className="text-xs text-muted-foreground">Prazo: {formatDate(req.dueDate)}</p>
                )}
                {req.status === "rejeitado" && req.rejectionReason && (
                  <p className="text-xs text-red-500 flex items-center gap-1">
                    <AlertCircleIcon className="w-3 h-3" />
                    {req.rejectionReason}
                  </p>
                )}
                {req.document && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-muted-foreground">{req.document.fileName}</span>
                    <DownloadButton documentId={req.document.id} fileName={req.document.fileName} />
                  </div>
                )}
              </div>
              <div className="shrink-0">
                {req.status === "pendente" || req.status === "rejeitado" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => {
                      setSelectedReqId(req.id);
                      setUploadOpen(true);
                    }}
                  >
                    <UploadIcon className="w-3.5 h-3.5" />
                    Enviar
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-xs">{statusCfg.label}</Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {data.requirements.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <FileTextIcon className="w-6 h-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium text-foreground">Nenhum documento requisitado</p>
          <p className="text-xs text-muted-foreground max-w-xs">
            Os documentos necessários aparecerão aqui.
          </p>
        </div>
      )}

      {selectedReqId && (
        <UploadDialog
          caseId={caseId}
          requirementId={selectedReqId}
          open={uploadOpen}
          onOpenChange={setUploadOpen}
        />
      )}
    </div>
  );
}

function DownloadButton({ documentId, fileName }: { documentId: string; fileName: string }) {
  const [loading, setLoading] = useState(false);

  async function handleDownload() {
    setLoading(true);
    try {
      const res = await getDocumentDownloadUrl(documentId);
      const link = document.createElement("a");
      link.href = res.downloadUrl;
      link.download = fileName;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.click();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="ghost" size="icon-xs" aria-label="Baixar documento" onClick={handleDownload} disabled={loading}>
      {loading ? <Loader2Icon className="w-3 h-3 animate-spin" /> : <DownloadIcon className="w-3 h-3" />}
    </Button>
  );
}

function UploadDialog({
  caseId,
  requirementId,
  open,
  onOpenChange,
}: {
  caseId: string;
  requirementId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { mutateAsync: getUploadUrl } = useGetDocumentUploadUrl();
  const { mutateAsync: confirmDocumentUpload } = useClientConfirmDocumentUpload()

  const handleUpload = useCallback(async () => {
    if (!file) return;
    setUploading(true);
    try {
      const uploadData = await getUploadUrl({
        data: {
          requirementId,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        },
      });

      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      await confirmDocumentUpload({
        data: {
          requirementId,
          fileKey: uploadData.fileKey,
          fileName: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }
      })

      await queryClient.invalidateQueries({ queryKey: getGetClientDocumentsQueryKey(caseId) });
      onOpenChange(false);
      setFile(null);
    } finally {
      setUploading(false);
    }
  }, [file, requirementId, getUploadUrl, caseId, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setFile(null); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar documento</DialogTitle>
          <DialogDescription>Selecione o arquivo para enviar</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Arquivo</Label>
            <input
              ref={inputRef}
              type="file"
              className="block w-full text-sm text-muted-foreground file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90 file:cursor-pointer"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
          {file && (
            <p className="text-xs text-muted-foreground">
              {file.name} ({(file.size / 1024 / 1024).toFixed(1)} MB)
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={uploading}>
            Cancelar
          </Button>
          <Button onClick={handleUpload} disabled={!file || uploading} className="gap-2">
            {uploading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <UploadIcon className="w-4 h-4" />}
            {uploading ? "Enviando..." : "Enviar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
