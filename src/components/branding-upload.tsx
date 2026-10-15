import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Loader2Icon, UploadCloudIcon, XIcon } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AXIOS_INSTANCE } from "@/lib/api";
import { env } from "@/env";
import { cn } from "@/lib/utils";

type Props = {
  asset: "logo" | "letterhead";
  value: string;
  onChange: (url: string) => void;
  /** Allow PDF in addition to images (used for letterhead). */
  allowPdf?: boolean;
};

const MAX_BYTES = 5_242_880;

export function BrandingUpload({ asset, value, onChange, allowPdf }: Props) {
  const [uploading, setUploading] = useState(false);

  async function upload(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("Arquivo excede 5MB");
      return;
    }
    setUploading(true);
    try {
      const { data } = await AXIOS_INSTANCE.post<{
        uploadUrl: string;
        fileKey: string;
      }>("/user/branding/upload-url", {
        asset,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      const res = await fetch(data.uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });
      if (!res.ok) throw new Error("upload failed");
      onChange(`${env.VITE_STORAGE_URL}/${data.fileKey}`);
      toast.success("Arquivo enviado");
    } catch {
      toast.error("Falha ao enviar arquivo");
    } finally {
      setUploading(false);
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    multiple: false,
    maxSize: MAX_BYTES,
    accept: {
      "image/png": [".png"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/webp": [".webp"],
      ...(allowPdf ? { "application/pdf": [".pdf"] } : {}),
    },
    onDrop: (accepted) => {
      const file = accepted[0];
      if (file) void upload(file);
    },
    onDropRejected: () => toast.error("Arquivo inválido (formato ou tamanho)"),
    disabled: uploading,
  });

  const isPdf = value.toLowerCase().endsWith(".pdf");

  if (value) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-border p-3">
        {isPdf ? (
          <div className="flex h-14 w-14 items-center justify-center rounded bg-muted text-xs font-medium text-muted-foreground shrink-0">
            PDF
          </div>
        ) : (
          <img
            src={value}
            alt="Pré-visualização"
            className="h-14 w-14 rounded object-contain bg-muted shrink-0"
          />
        )}
        <p className="min-w-0 flex-1 truncate text-xs text-muted-foreground">
          {value.split("/").pop()}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label="Remover"
          onClick={() => onChange("")}
        >
          <XIcon />
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-border px-4 py-3 transition-colors hover:border-primary/50 hover:bg-muted/30",
        isDragActive && "border-primary bg-primary/5",
        uploading && "cursor-not-allowed opacity-60",
      )}
    >
      <input {...getInputProps()} />
      {uploading ? (
        <Loader2Icon className="h-5 w-5 shrink-0 animate-spin text-muted-foreground" />
      ) : (
        <UploadCloudIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
      )}
      <div className="min-w-0">
        <p className="text-xs text-foreground">
          {uploading
            ? "Enviando..."
            : isDragActive
              ? "Solte o arquivo aqui"
              : "Arraste um arquivo ou clique para selecionar"}
        </p>
        <p className="text-[11px] text-muted-foreground/70">
          PNG, JPG, WEBP{allowPdf ? " ou PDF" : ""} · até 5MB
        </p>
      </div>
    </div>
  );
}
