import { lgpdDoc } from "./content";
import { LegalPage } from "./legal-page";

export default function LgpdPage() {
  return (
    <LegalPage
      title={lgpdDoc.title}
      lastUpdated={lgpdDoc.lastUpdated}
      sections={lgpdDoc.sections}
    />
  );
}
