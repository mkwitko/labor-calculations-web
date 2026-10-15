import { termsDoc } from "./content";
import { LegalPage } from "./legal-page";

export default function TermsPage() {
  return (
    <LegalPage
      title={termsDoc.title}
      lastUpdated={termsDoc.lastUpdated}
      sections={termsDoc.sections}
    />
  );
}
