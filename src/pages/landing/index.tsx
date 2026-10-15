import {
  MotionConfig,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
} from "framer-motion";
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { AudienceSection } from "./components/audience-section";
import { ComparisonSection } from "./components/comparison-section";
import { CTASection } from "./components/cta-section";
import { FAQSection } from "./components/faq-section";
import { FeaturesSection } from "./components/features-section";
import { Footer } from "./components/footer";
import { HeroSection } from "./components/hero-section";
import { Navbar } from "./components/navbar";
import { PricingSection } from "./components/pricing-section";
import { ProblemSection } from "./components/problem-section";
import { ProductDemoSection } from "./components/product-demo-section";
import { SocialProofSection } from "./components/social-proof-section";
import { TrustSection } from "./components/trust-section";
import { getScroller, scrollToSection } from "./utils/scroll";

/**
 * Descrição do produto para o buscador. Fica na página, e não só no
 * `index.html`, porque o HTML servido na raiz é o mesmo para todas as rotas do
 * SPA — o dado estruturado específico da landing precisa entrar no lugar onde
 * ele é verdade.
 */
const productJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "LexLaboral",
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "LegalTech",
  operatingSystem: "Web",
  inLanguage: "pt-BR",
  url: "https://lexlaboral.com.br/",
  description:
    "Plataforma de cálculo trabalhista e gestão de casos para advogados: verbas, liquidação com correção monetária e juros, passivo em lote, documentos em DOCX, prazos e portal do cliente.",
  offers: {
    "@type": "Offer",
    category: "SaaS",
    priceCurrency: "BRL",
    // Sem `price`: o valor vem do Stripe e muda sem passar por aqui. Anunciar
    // um número neste bloco é a mesma promessa que a landing evita na tela.
    availability: "https://schema.org/InStock",
  },
});

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { hash } = useLocation();
  const reduceMotion = useReducedMotion();
  const scrollProgress = useMotionValue(0);
  const scaleX = useSpring(scrollProgress, { stiffness: 100, damping: 30 });

  // O `useScroll` da framer e o `window.scrollY` observam a janela, e quem rola
  // aqui é o `#root` (ver `utils/scroll.ts`). Enquanto isso não era levado em
  // conta, a barra de progresso ficava zerada e a navbar nunca compactava.
  useEffect(() => {
    const scroller = getScroller();

    const handleScroll = () => {
      const top = scroller.scrollTop || window.scrollY;
      const range = scroller.scrollHeight - scroller.clientHeight;
      setIsScrolled(top > 50);
      scrollProgress.set(range > 0 ? Math.min(top / range, 1) : 0);
    };

    handleScroll();
    scroller.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrollProgress]);

  // O navegador não rola para o hash num SPA: quando o HTML chega, a seção
  // ainda não existe. Rola depois da montagem — é assim que `/#precos` vindo do
  // rodapé de outra landing chega onde deveria.
  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const timer = window.setTimeout(() => scrollToSection(id), 80);
    return () => window.clearTimeout(timer);
  }, [hash]);

  return (
    // `reducedMotion="user"` vale para toda a árvore: quem pediu menos animação
    // no sistema recebe as seções já no estado final, sem entrada nem
    // deslocamento, em vez de cada componente ter que lembrar disso sozinho.
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-background">
        {!reduceMotion && (
          <motion.div
            aria-hidden="true"
            style={{ scaleX }}
            className="fixed top-0 right-0 left-0 z-50 h-0.5 origin-left bg-primary"
          />
        )}

        <Navbar isScrolled={isScrolled} />

        <main>
          <HeroSection />
          <SocialProofSection />
          <ProblemSection />
          <ProductDemoSection />
          <FeaturesSection />
          <TrustSection />
          <AudienceSection />
          <ComparisonSection />
          <PricingSection />
          <FAQSection />
          <CTASection />
        </main>

        <Footer />

        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD estático, sem entrada do usuário
          dangerouslySetInnerHTML={{ __html: productJsonLd }}
        />
      </div>
    </MotionConfig>
  );
}
