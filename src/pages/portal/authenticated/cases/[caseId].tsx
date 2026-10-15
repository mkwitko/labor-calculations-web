import {
  ArrowLeftIcon,
  BriefcaseIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  GavelIcon,
  Loader2Icon,
  MapPinIcon,
  VideoIcon,
  MailIcon,
  PhoneIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetClientCase } from "@/http/generated/client-portal/client-portal";
import { formatDate, formatDateTime, getHearingKindLabel, getDeadlineKindLabel } from "@/utils/value-format";
import { CaseMessages } from "./components/case-messages";
import { CaseTimeline } from "./components/timeline";
import { CaseDocuments } from "./components/documents";
import { CaseSettlements } from "./components/settlements";

export default function PortalCaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { data: caseData, isLoading } = useGetClientCase(caseId ?? "");

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2Icon className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center px-4">
        <p className="text-sm font-medium text-foreground">Processo não encontrado</p>
        <Button variant="outline" size="sm" onClick={() => navigate("/portal/inicio")}>
          Voltar
        </Button>
      </div>
    );
  }

  return (
    <div className="px-6 py-10 max-w-7xl mx-auto w-full space-y-6 pb-24 lg:pb-10">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/portal/inicio")}
          className="mt-0.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeftIcon className="w-4 h-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold text-foreground tracking-tight truncate">
            {caseData.title}
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="secondary">{caseData.phase}</Badge>
            {caseData.processNumber && (
              <span className="text-xs text-muted-foreground">{caseData.processNumber}</span>
            )}
          </div>
        </div>
      </div>

      <Tabs defaultValue="resumo" className="space-y-6">
        <TabsList variant="line">
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="mensagens">Mensagens</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="acordos">Acordos</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo" className="space-y-6">
          {/* Case info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BriefcaseIcon className="w-4 h-4 text-muted-foreground" />
                Informações do processo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {caseData.court && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-muted-foreground">Tribunal</span>
                  <span className="text-sm font-medium text-foreground">{caseData.court}</span>
                </div>
              )}
              {caseData.vara && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-muted-foreground">Vara</span>
                  <span className="text-sm font-medium text-foreground">{caseData.vara}</span>
                </div>
              )}
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-muted-foreground">Abertura</span>
                <span className="text-sm font-medium text-foreground">{formatDate(caseData.openedAt)}</span>
              </div>
              {caseData.closedAt && (
                <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-xs text-muted-foreground">Encerramento</span>
                  <span className="text-sm font-medium text-foreground">{formatDate(caseData.closedAt)}</span>
                </div>
              )}
              {caseData.observations && (
                <div className="py-2">
                  <span className="text-xs text-muted-foreground">Observações</span>
                  <p className="text-sm text-foreground mt-1">{caseData.observations}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lawyer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GavelIcon className="w-4 h-4 text-muted-foreground" />
                Seu advogado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-3">
                {caseData.lawyer.logoUrl ? (
                  <img src={caseData.lawyer.logoUrl} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <GavelIcon className="w-5 h-5 text-muted-foreground" />
                  </div>
                )}
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">{caseData.lawyer.name}</p>
                  <p className="text-xs text-muted-foreground">OAB {caseData.lawyer.oabNumber}</p>
                  {caseData.lawyer.officeName && (
                    <p className="text-xs text-muted-foreground">{caseData.lawyer.officeName}</p>
                  )}
                  <div className="flex items-center gap-3 pt-1">
                    <a href={`mailto:${caseData.lawyer.mail}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                      <MailIcon className="w-3 h-3" />
                      E-mail
                    </a>
                    {caseData.lawyer.phone && (
                      <a href={`tel:${caseData.lawyer.phone}`} className="inline-flex items-center gap-1 text-xs text-primary hover:underline">
                        <PhoneIcon className="w-3 h-3" />
                        Telefone
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Next hearing */}
          {caseData.nextHearing && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  Próxima audiência
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CalendarIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {getHearingKindLabel(caseData.nextHearing.kind)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(caseData.nextHearing.scheduledAt)}
                    </p>
                    {caseData.nextHearing.location && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPinIcon className="w-3 h-3" />
                        {caseData.nextHearing.location}
                      </div>
                    )}
                    {caseData.nextHearing.link && (
                      <a
                        href={caseData.nextHearing.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
                      >
                        <VideoIcon className="w-3 h-3" />
                        Link da audiência
                      </a>
                    )}
                    {caseData.nextHearing.notes && (
                      <p className="text-xs text-muted-foreground mt-1">{caseData.nextHearing.notes}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Next deadline */}
          {caseData.nextDeadline && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="w-4 h-4 text-muted-foreground" />
                  Próximo prazo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center shrink-0">
                    <ClockIcon className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {getDeadlineKindLabel(caseData.nextDeadline.kind, caseData.nextDeadline.customLabel)}
                    </p>
                    <p className="text-sm text-muted-foreground">{formatDate(caseData.nextDeadline.dueAt)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="mensagens">
          <CaseMessages caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="timeline">
          <CaseTimeline caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="documentos">
          <CaseDocuments caseId={caseData.id} />
        </TabsContent>

        <TabsContent value="acordos">
          <CaseSettlements caseId={caseData.id} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
