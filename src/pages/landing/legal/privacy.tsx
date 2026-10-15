import { privacyDoc } from "./content";
import { LegalPage } from "./legal-page";

export default function PrivacyPage() {
  return (
    <LegalPage
      title={privacyDoc.title}
      lastUpdated={privacyDoc.lastUpdated}
      sections={privacyDoc.sections}
    />
  );
}
