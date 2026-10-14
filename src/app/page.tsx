"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lang = "es" | "pt" | "en";

type Producto = {
  id: string;
  nombre: string;
  dosis: string;
  precio: number;
  imagen: string;
  categoria: string;
  descripcion: Record<Lang, string>;
  detalles: Record<Lang, string>;
};

type CartItem = Producto & { cantidad: number };

const numeroWhatsApp = "59178272722";

// Clasificador exacto y flexible según la tabla científica proporcionada
const detectarCategoria = (nombre: string): string => {
  const n = nombre.toUpperCase();
  
  if (n.includes("5-AMINO") || n.includes("5 AMINO")) return "Metabolismo y grasa corporal";
  if (n.includes("ABALOPARATIDE")) return "Salud ósea";
  if (n.includes("ADAMAX")) return "Neuroprotección";
  if (n.includes("AICAR")) return "Metabolismo energético";
  if (n.includes("AOD")) return "Metabolismo de grasas";
  if (n.includes("ARA-290") || n.includes("ARA 290") || n.includes("ARA290")) return "Antiinflamatorio y neuroprotección";
  if (n.includes("BPC")) return "Reparación de tejidos";
  if (n.includes("CAGRILINTIDE")) return "Saciedad y control del apetito";
  if (n.includes("CEREBROLYSIN")) return "Neurología";
  if (n.includes("DSIP")) return "Regulación del sueño";
  if (n.includes("FOXO4")) return "Senescencia celular y longevidad";
  if (n.includes("HGH") || n.includes("SOMATROPIN")) return "Hormona de crecimiento";
  if (n.includes("HUMANIN")) return "Protección celular y mitocondrial";
  if (n.includes("IGF")) return "Crecimiento celular y señalización anabólica";
  if (n.includes("KISSPEPTIN")) return "Función reproductiva";
  if (n.includes("KPV")) return "Antiinflamatorio experimental";
  if (n.includes("MELANOTAN")) return "Pigmentación de la piel";
  if (n.includes("MITO PRIME") || n.includes("MITOPRIME")) return "Metabolismo mitocondrial";
  if (n.includes("MOTS")) return "Metabolismo energético";
  if (n.includes("PT-141") || n.includes("PT 141") || n.includes("PT141")) return "Función sexual";
  if (n.includes("RETATRUTIDE")) return "Metabolismo, apetito y pérdida de peso";
  if (n.includes("SELANK")) return "Ansiedad y estrés (Investigación neurológica)";
  if (n.includes("SEMAX")) return "Neuroprotección y función cognitiva";
  if (n.includes("SERMORELIN") || n.includes("SERMORILIN")) return "Estimulación de la liberación de GH";
  if (n.includes("SLU-PP") || n.includes("SLU PP") || n.includes("SLU")) return "Metabolismo energético y resistencia física";
  if (n.includes("SS-31") || n.includes("SS 31") || n.includes("SS31")) return "Función mitocondrial y protección celular";
  if (n.includes("TB-500") || n.includes("TB 500") || n.includes("TB500")) return "Reparación de tejidos";
  if (n.includes("TESAMORELIN") || n.includes("TESAMORILIN")) return "Estimulación de GH y reducción de grasa visceral";
  if (n.includes("THYMOSIN") || n.includes("ALPHA-1") || n.includes("ALPHA 1")) return "Modulación del sistema inmunitario";
  if (n.includes("TIRZEPATIDA") || n.includes("TIRZEPATIDE")) return "Control de glucosa, apetito y peso";
  
  if (n.includes("WATER") || n.includes("BAC")) return "Suministros y Diluyentes";
  if (n.includes("BLEND") || n.includes("+") || n.includes("GLOW") || n.includes("KLOW") || n.includes("WOLVERINE") || n.includes("NAD")) return "Mezclas de Péptidos (Blends)";
  if (n.includes("GHK") || n.includes("AHK") || n.includes("SNAP")) return "Péptidos Cosméticos";
  if (n.includes("CARDIOGEN") || n.includes("CARTALAX") || n.includes("CRYSTAGEN") || n.includes("PINEALON") || n.includes("PROSTAMAX") || n.includes("VESILUTE") || n.includes("EPITALON")) return "Biorreguladores";
  
  return "Compuesto de Investigación"; // Categoría por defecto si subes algo que no está en la lista
};

const dict = {
  es: {
    nav: { prod: "Productos", sci: "Ciencia", ben: "Beneficios" },
    hero: {
      sub: "Investigación de Precisión",
      title: "LA CIENCIA DE LA PRECISIÓN",
      desc: "Péptidos de grado científico, sintetizados con rigor y trazabilidad. Pureza verificada, entrega controlada, resultados que respaldan la investigación seria.",
      btn: "Explorar Colección",
      scroll: "Scroll"
    },
    ben: {
      sub: "Por qué elegirnos",
      title: "Excelencia Científica",
      cards: [
        { n: "01", t: "Pureza Certificada", d: "Cada lote es verificado mediante HPLC con certificados de análisis disponibles." },
        { n: "02", t: "Liofilización Avanzada", d: "Presentación en polvo liofilizado al vacío para preservar la máxima integridad molecular durante el envío." },
        { n: "03", t: "Uso Investigativo", d: "Formulaciones desarrolladas exclusivamente para fines de investigación en laboratorio." }
      ]
    },
    cat: {
      sub: "Colección",
      title: "Nuestros Péptidos",
      resDisclaimer: "Exclusivamente para investigación científica y desarrollo de laboratorio in vitro.",
      search: "Buscar compuesto por nombre...",
      sortAZ: "Ordenar: A-Z",
      sortAsc: "Precio: menor a mayor",
      sortDesc: "Precio: mayor a menor",
      add: "Añadir al Carrito",
      empty: "No se encontraron productos.",
      sidebarBtn: "Índice de Productos",
      modal: {
        badge: "Grado de Investigación · Pureza ≥99% (HPLC)",
        bonusBadge: "🎁 +1 AGUA BACTERIOSTÁTICA GRATIS INCLUIDA",
        bonusDesc: "Para garantizar la mejor experiencia, cada vial de este producto incluye como cortesía exclusiva su respectiva Agua Bacteriostática (BAC) lista para su correcta reconstitución, sin ningún costo adicional.",
        purposeTitle: "Propósito de Investigación y Aplicaciones",
        specsTitle: "Especificaciones Técnicas y Composición",
        specForm: "Forma física",
        specFormVal: "Polvo liofilizado estéril / Solución bacteriostática",
        specPurity: "Pureza",
        specPurityVal: "≥ 99.0% verificada por análisis HPLC / MS",
        specStorage: "Almacenamiento",
        specStorageVal: "Conservar refrigerado entre 2°C y 8°C. Proteger de la luz.",
        specContent: "Contenido",
        specUse: "Clasificación",
        specUseVal: "Reactivo químico exclusivo para investigación in vitro",
        legalTitle: "Aviso legal relativo a este producto",
        legalP1: "Este producto está destinado exclusivamente a la investigación científica. Se clasifica únicamente como compuesto químico para investigación. Su uso se limita exclusivamente a pruebas in vitro y experimentación en laboratorio. La introducción de este producto en humanos o animales por cualquier vía está estrictamente prohibida.",
        legalP2: "Este producto no debe utilizarse como medicamento, alimento ni cosmético comercial.",
        viewDetails: "Ver ficha técnica"
      }
    },
    sci: {
      sub: "La Ciencia",
      title: "Ingeniería Molecular de Precisión",
      p1: "Nuestros péptidos se sintetizan mediante metodologías de fase sólida, garantizando secuencias de aminoácidos exactas y máxima estabilidad.",
      p2: "Trabajamos con laboratorios acreditados para asegurar consistencia lote a lote, cumpliendo los más altos estándares de la industria."
    },
    foot: {
      tagline: "Ciencia, pureza y precisión en cada síntesis.",
      legal: "© 2026 LIFE PEPTIDES BOLIVIA. Todos los productos están destinados exclusivamente a la investigación química y de laboratorio.",
      disclaimer: "Los productos adquiridos en este sitio web no están destinados al consumo humano ni animal. Toda la información tiene fines exclusivamente educativos y científicos."
    },
    cart: {
      title: "Tu Carrito",
      empty: "El carrito está vacío.",
      qty: "x",
      del: "Eliminar",
      total: "Total",
      bonusInc: "Incluye Agua BAC de regalo",
      formTitle: "Datos del Solicitante",
      name: "Nombre completo",
      age: "Edad",
      email: "Correo electrónico",
      phone: "Teléfono / WhatsApp",
      send: "Enviar Pedido a WhatsApp"
    },
    calc: {
      title: "Calculadora de Reconstitución",
      sub: "Convierta la masa en mg a volumen y unidades U-100",
      s1: "Contenido del Frasco",
      s1d: "Masa del compuesto",
      s2: "Volumen de Diluyente",
      s2d: "BAC / Agua Estéril",
      s3: "Jeringa de Medición U-100",
      s3d: "unidades",
      s4: "Medida Deseada",
      s4d: "Cantidad por prueba",
      other: "Otro",
      res: "Resultado",
      wait: "Elija el frasco, el diluyente, la jeringa y la medida para ver el resultado.",
      errTitle: "¡El volumen excede la capacidad!",
      errDesc: "Considere una jeringa mayor o menos diluyente.",
      est: "Volumen estimado:",
      un: "unidades",
      conc: "Concentración",
      dosF: "Medidas en Frasco",
      de: "de",
      tDose: "Medida",
      tVol: "Volumen",
      tUn: "Unidades",
      copy: "Copiar",
      print: "IMPRIMIR",
      reset: "RESETEAR",
      msgTitle: "CALCULA MI MEDIDA",
      msgF: "Frasco",
      msgDil: "Diluyente",
      msgJer: "Jeringa",
      msgConc: "Concentración",
      msgRes: "RESULTADO",
      msgDose: "Medida",
      msgVolEst: "Volumen estimado",
      msgDosIn: "Medidas en el frasco",
      msgNear: "Medidas próximas",
      msgWarn: "Exclusivamente informativo para laboratorio.",
      msgLink: "Consulte la calculadora:"
    }
  },
  pt: {
    nav: { prod: "Produtos", sci: "Ciência", ben: "Benefícios" },
    hero: {
      sub: "Pesquisa de Precisão",
      title: "A CIÊNCIA DA PRECISÃO",
      desc: "Peptídeos de grau científico, sintetizados com rigor e rastreabilidade. Pureza verificada, entrega controlada, resultados que apoiam a pesquisa séria.",
      btn: "Explorar Coleção",
      scroll: "Rolar"
    },
    ben: {
      sub: "Por que nos escolher",
      title: "Excelência Científica",
      cards: [
        { n: "01", t: "Pureza Certificada", d: "Cada lote é verificado por HPLC com certificados de análise disponíveis." },
        { n: "02", t: "Liofilização Avançada", d: "Apresentação em pó liofilizado a vácuo para preservar a máxima integridade molecular durante o envio." },
        { n: "03", t: "Uso Investigativo", d: "Formulações desenvolvidas exclusivamente para fins de pesquisa em laboratório." }
      ]
    },
    cat: {
      sub: "Coleção",
      title: "Nossos Peptídeos",
      resDisclaimer: "Exclusivamente para pesquisa científica e desenvolvimento laboratorial in vitro.",
      search: "Buscar composto...",
      sortAZ: "Ordenar: A-Z",
      sortAsc: "Preço: menor a maior",
      sortDesc: "Preço: maior a menor",
      add: "Adicionar",
      empty: "Nenhum produto encontrado.",
      sidebarBtn: "Índice de Produtos",
      modal: {
        badge: "Grau de Pesquisa · Pureza ≥99% (HPLC)",
        bonusBadge: "🎁 +1 ÁGUA BACTERIOSTÁTICA GRÁTIS INCLUÍDA",
        bonusDesc: "Para garantir a melhor experiência, cada frasco inclui como cortesia exclusiva sua respectiva Água Bacteriostática (BAC) pronta para reconstituição, sem custo adicional.",
        purposeTitle: "Objetivo de Pesquisa e Aplicações",
        specsTitle: "Especificações Técnicas e Composição",
        specForm: "Forma física",
        specFormVal: "Pó liofilizado estéril / Solução bacteriostática",
        specPurity: "Pureza",
        specPurityVal: "≥ 99.0% verificada por análise HPLC / MS",
        specStorage: "Armazenamento",
        specStorageVal: "Manter refrigerado entre 2°C e 8°C. Proteger da luz.",
        specContent: "Conteúdo",
        specUse: "Classificação",
        specUseVal: "Reagente químico exclusivo para pesquisa in vitro",
        legalTitle: "Aviso legal relativo a este produto",
        legalP1: "Este produto destina-se exclusivamente à pesquisa científica. É classificado apenas como produto químico para pesquisa. Seu uso é limitado exclusivamente a testes in vitro e experimentação em laboratório. A introdução deste produto em humanos ou animais é estritamente proibida.",
        legalP2: "Este produto não deve ser utilizado como medicamento, alimento ou cosmético.",
        viewDetails: "Ver ficha técnica"
      }
    },
    sci: {
      sub: "A Ciência",
      title: "Engenharia Molecular de Precisão",
      p1: "Nossos peptídeos são sintetizados usando metodologias de fase sólida, garantindo sequências exatas de aminoácidos e máxima estabilidade.",
      p2: "Trabalhamos com laboratórios credenciados para garantir a consistência de lote para lote, atendendo aos mais altos padrões da indústria."
    },
    foot: {
      tagline: "Ciência, pureza e precisão em cada síntese.",
      legal: "© 2026 LIFE PEPTIDES BOLIVIA. Apenas para fins de pesquisa laboratorial.",
      disclaimer: "Os produtos adquiridos neste site são destinados exclusivamente à pesquisa química. Não se destinam ao consumo humano ou animal."
    },
    cart: {
      title: "Seu Carrinho",
      empty: "O carrinho está vazio.",
      qty: "x",
      del: "Remover",
      total: "Total",
      bonusInc: "Inclui Água BAC grátis",
      formTitle: "Dados do Cliente",
      name: "Nome completo",
      age: "Idade",
      email: "E-mail",
      phone: "Telefone / WhatsApp",
      send: "Enviar Pedido via WhatsApp"
    },
    calc: {
      title: "Calculadora de Reconstituição e Dose",
      sub: "Converta a dose em mg no volume e nas unidades U-100",
      s1: "Conteúdo do Frasco",
      s1d: "Massa do composto",
      s2: "Volume de Diluente",
      s2d: "BAC / Água Estéril",
      s3: "Seringa de Insulina U-100",
      s3d: "unidades",
      s4: "Dose Desejada",
      s4d: "Quantidade por aplicação",
      other: "Outro",
      res: "Resultado",
      wait: "Escolha o frasco, o diluente, a seringa e a dose para ver o resultado.",
      errTitle: "Volume excede a capacidade!",
      errDesc: "Considere uma seringa maior ou menos diluente.",
      est: "Volume estimado:",
      un: "unidades",
      conc: "Concentração",
      dosF: "Doses no Frasco",
      de: "de",
      tDose: "Dose",
      tVol: "Volume",
      tUn: "Unidades",
      copy: "Copiar",
      print: "IMPRIMIR",
      reset: "RESETAR",
      msgTitle: "CALCULA MINHA DOSE",
      msgF: "Frasco",
      msgDil: "Diluente",
      msgJer: "Seringa",
      msgConc: "Concentração",
      msgRes: "RESULTADO",
      msgDose: "Dose",
      msgVolEst: "Volume estimado",
      msgDosIn: "Doses no frasco",
      msgNear: "Doses próximas",
      msgWarn: "Informativo para uso em laboratório.",
      msgLink: "Consulte sua dose:"
    }
  },
  en: {
    nav: { prod: "Products", sci: "Science", ben: "Benefits" },
    hero: {
      sub: "Precision Research",
      title: "THE SCIENCE OF PRECISION",
      desc: "Scientific-grade peptides, synthesized with rigor and traceability. Verified purity, controlled delivery, results that support serious research.",
      btn: "Explore Collection",
      scroll: "Scroll"
    },
    ben: {
      sub: "Why choose us",
      title: "Scientific Excellence",
      cards: [
        { n: "01", t: "Certified Purity", d: "Each batch is verified by HPLC with available certificates of analysis." },
        { n: "02", t: "Advanced Lyophilization", d: "Vacuum lyophilized powder presentation to preserve maximum molecular integrity during shipping." },
        { n: "03", t: "Research Use", d: "Formulations developed exclusively for laboratory research purposes." }
      ]
    },
    cat: {
      sub: "Collection",
      title: "Our Peptides",
      resDisclaimer: "Strictly for scientific research and in vitro laboratory development.",
      search: "Search compound...",
      sortAZ: "Sort: A-Z",
      sortAsc: "Price: Low to High",
      sortDesc: "Price: High to Low",
      add: "Add to Cart",
      empty: "No products found.",
      sidebarBtn: "Product Index",
      modal: {
        badge: "Research Grade · Purity ≥99% (HPLC)",
        bonusBadge: "🎁 +1 FREE BACTERIOSTATIC WATER INCLUDED",
        bonusDesc: "As an exclusive courtesy, each vial includes its respective Bacteriostatic Water (BAC) ready for reconstitution at no additional cost.",
        purposeTitle: "Research Purpose & Applications",
        specsTitle: "Technical Specifications & Composition",
        specForm: "Physical form",
        specFormVal: "Sterile lyophilized powder / Bacteriostatic solution",
        specPurity: "Purity",
        specPurityVal: "≥ 99.0% verified via HPLC / MS analysis",
        specStorage: "Storage",
        specStorageVal: "Store refrigerated between 2°C and 8°C. Protect from light.",
        specContent: "Content",
        specUse: "Classification",
        specUseVal: "Chemical reagent strictly for in vitro research",
        legalTitle: "Legal Disclaimer Regarding This Product",
        legalP1: "This product is intended strictly for scientific research. It is classified solely as a research chemical. Its use is limited exclusively to in vitro testing and laboratory experimentation. Introduction of this product into humans or animals by any route is strictly prohibited.",
        legalP2: "This product must not be used as a drug, food, or commercial cosmetic.",
        viewDetails: "View specifications"
      }
    },
    sci: {
      sub: "The Science",
      title: "Precision Molecular Engineering",
      p1: "Our peptides are synthesized using solid-phase methodologies, guaranteeing exact amino acid sequences and maximum stability.",
      p2: "We work with accredited laboratories to ensure batch-to-batch consistency, meeting the highest industry standards."
    },
    foot: {
      tagline: "Science, purity, and precision in every synthesis.",
      legal: "© 2026 LIFE PEPTIDES BOLIVIA. For laboratory research use only.",
      disclaimer: "Products purchased on this website are intended solely for chemical research. Not for human or animal consumption."
    },
    cart: {
      title: "Your Cart",
      empty: "Your cart is empty.",
      qty: "x",
      del: "Remove",
      total: "Total",
      bonusInc: "Includes Free BAC Water",
      formTitle: "Customer Data",
      name: "Full Name",
      age: "Age",
      email: "Email",
      phone: "Phone / WhatsApp",
      send: "Send Order to WhatsApp"
    },
    calc: {
      title: "Reconstitution and Dose Calculator",
      sub: "Convert mg mass to volume and U-100 syringe units",
      s1: "Vial Content",
      s1d: "Compound mass",
      s2: "Diluent Volume",
      s2d: "BAC / Sterile Water",
      s3: "U-100 Insulin Syringe",
      s3d: "units",
      s4: "Desired Dose",
      s4d: "Amount per test",
      other: "Other",
      res: "Result",
      wait: "Choose the vial, diluent, syringe, and dose to see the result.",
      errTitle: "Volume exceeds capacity!",
      errDesc: "Consider a larger syringe or less diluent.",
      est: "Estimated volume:",
      un: "units",
      conc: "Concentration",
      dosF: "Doses in Vial",
      de: "of",
      tDose: "Dose",
      tVol: "Volume",
      tUn: "Units",
      copy: "Copy",
      print: "PRINT",
      reset: "RESET",
      msgTitle: "CALCULATE MY DOSE",
      msgF: "Vial",
      msgDil: "Diluent",
      msgJer: "Syringe",
      msgConc: "Concentration",
      msgRes: "RESULT",
      msgDose: "Dose",
      msgVolEst: "Estimated volume",
      msgDosIn: "Doses in the vial",
      msgNear: "Nearby doses",
      msgWarn: "Informational for laboratory research.",
      msgLink: "Check your dose:"
    }
  }
};

const circularMask = { mixBlendMode: "screen" as const, WebkitMaskImage: "radial-gradient(circle at center, black 35%, transparent 70%)", maskImage: "radial-gradient(circle at center, black 35%, transparent 70%)" };
const ovalMask = { mixBlendMode: "screen" as const, WebkitMaskImage: "radial-gradient(ellipse 55% 55% at 50% 50%, black 40%, transparent 100%)", maskImage: "radial-gradient(ellipse 55% 55% at 50% 50%, black 40%, transparent 100%)" };

export default function Home() {
  const [lang, setLang] = useState<Lang>("es");
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const t = dict[lang];

  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  const [scrolled, setScrolled] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [formData, setFormData] = useState({ nombre: "", edad: "", correo: "", telefono: "" });
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"az" | "price-asc" | "price-desc">("az");

  const [selectedProd, setSelectedProd] = useState<Producto | null>(null);
  const [modalQty, setModalQty] = useState<number>(1);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [isCalcOpen, setIsCalcOpen] = useState(false);
  const [frascoMg, setFrascoMg] = useState<number | null>(null);
  const [diluenteMl, setDiluenteMl] = useState<number | null>(null);
  const [seringaMl, setSeringaMl] = useState<number | null>(null);
  const [dosisMg, setDosisMg] = useState<number | null>(null);

  const isComplete = frascoMg !== null && diluenteMl !== null && seringaMl !== null && dosisMg !== null;
  const concentracion = isComplete ? (frascoMg! / diluenteMl!) : 0;
  const volumenDosis = isComplete ? (dosisMg! / concentracion) : 0;
  const unidadesJeringa = isComplete ? (volumenDosis * 100) : 0;
  const dosisPorFrasco = isComplete ? Math.floor(frascoMg! / dosisMg!) : 0;
  const isExceeding = isComplete && volumenDosis > seringaMl!;

  const standardDoses = [0.25, 0.5, 1, 1.7, 2, 2.4, 2.5, 4, 5, 7.5, 10, 12, 12.5, 15, 17.5, 20, 25, 30];

  useEffect(() => {
    async function obtenerProductos() {
      try {
        setLoading(true);
        const { data, error } = await supabase.from('productos').select('*');

        if (error) {
          console.error("Error al cargar productos:", error);
          setLoading(false);
          return;
        }

        if (data && data.length > 0) {
          const productosVisibles = data.filter(p => p.visible === true || p.visible === "true" || p.visible === 1);
          const datosAMostrar = productosVisibles.length > 0 ? productosVisibles : data;

          const prodFormateados = datosAMostrar.map(p => ({
            id: p.id,
            nombre: p.nombre,
            dosis: p.dosis || "",
            precio: p.precio,
            imagen: p.imagen || "",
            categoria: detectarCategoria(p.nombre),
            descripcion: {
              es: p.descripcion_es || "",
              pt: p.descripcion_pt || "",
              en: p.descripcion_en || ""
            },
            detalles: {
              es: p.detalles_es || "",
              pt: p.detalles_pt || "",
              en: p.detalles_en || ""
            }
          }));
          setProductos(prodFormateados);
        }
      } catch (err) {
        console.error("Error de conexión:", err);
      } finally {
        setLoading(false);
      }
    }
    obtenerProductos();
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handleScroll);
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((e) => { 
        if (e.isIntersecting) e.target.classList.add("active"); 
      });
    }, { threshold: 0.1 });

    const elements = document.querySelectorAll(".reveal");
    elements.forEach((el) => observer.observe(el));

    return () => { 
      window.removeEventListener("scroll", handleScroll); 
      observer.disconnect(); 
    };
  }, [query, sort, lang, isClient, productos]); 

  const addToCart = (prod: Producto, qty: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === prod.id);
      if (existing) return prev.map((item) => item.id === prod.id ? { ...item, cantidad: item.cantidad + qty } : item);
      return [...prev, { ...prod, cantidad: qty }];
    });
  };

  const removeFromCart = (id: string) => setCart((prev) => prev.filter((item) => item.id !== id));
  const getTotal = () => cart.reduce((total, item) => total + item.precio * item.cantidad, 0);

  const handleSendOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return alert(t.cart.empty);
    let mensaje = `${lang === 'es' ? 'Hola, me gustaría realizar el siguiente pedido de investigación:' : lang === 'pt' ? 'Olá, gostaria de fazer o seguinte pedido de pesquisa:' : 'Hello, I would like to place the following research order:'}\n\n👤 *${t.cart.formTitle}:*\n- ${t.cart.name}: ${formData.nombre}\n- ${t.cart.age}: ${formData.edad}\n- ${t.cart.email}: ${formData.correo}\n- ${t.cart.phone}: ${formData.telefono}\n\n🛒 *Pedido:*\n`;
    
    cart.forEach((item) => { 
      const bonoInfo = item.categoria !== "Suministros y Diluyentes" ? ` [+ ${item.cantidad}x BAC Water 🎁]` : "";
      mensaje += `- ${item.cantidad}x ${item.nombre} ${item.dosis && item.dosis.trim() !== "" ? `(${item.dosis})` : ""}${bonoInfo} - $${(item.precio * item.cantidad).toFixed(2)}\n`; 
    });
    
    mensaje += `\n💰 *${t.cart.total}:* $${getTotal().toFixed(2)} USD`;
    window.open(`https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`, "_blank");
    setIsCartOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getNearbyDoses = () => {
    if (!isComplete) return [];
    let nearby = standardDoses.filter(d => d >= dosisMg! * 0.25 && d <= dosisMg! * 2.5);
    if (!nearby.includes(dosisMg!)) nearby.push(dosisMg!);
    return Array.from(new Set(nearby)).sort((a,b) => a-b).slice(0, 6); 
  };

  const generateCalcMessage = () => {
    if (!isComplete || isExceeding) return "";
    
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : "https://lifepeptidesbolivia.com";

    let text = `━━━━━━━━━━━━━━━━━━━━━\n  💉 *${t.calc.msgTitle}*\n━━━━━━━━━━━━━━━━━━━━━\n\n`;
    text += `🧪 *${t.calc.msgF}:* ${frascoMg}mg\n`;
    text += `💧 *${t.calc.msgDil}:* ${diluenteMl}mL\n`;
    text += `🔬 *${t.calc.msgJer}:* ${seringaMl!.toString().replace('.',',')}mL (${seringaMl!*100} ${t.calc.un})\n`;
    text += `⚖️ *${t.calc.msgConc}:* ${concentracion.toFixed(0)} mg/mL\n\n`;
    
    text += `🎯 *${t.calc.msgRes}*\n─────────────────────\n`;
    text += `${t.calc.msgDose}: *${dosisMg!.toString().replace('.',',')}mg (${dosisMg!*1000}mcg)*\n`;
    text += `${t.calc.msgVolEst}: *${volumenDosis.toFixed(3).replace('.',',')}mL* = *${Math.round(unidadesJeringa)} ${t.calc.un}*\n`;
    text += `${t.calc.msgDosIn}: *${dosisPorFrasco}*\n─────────────────────\n\n`;
    
    text += `📊 *${t.calc.msgNear}:*\n\n`;
    getNearbyDoses().forEach(d => {
      const v = d / concentracion;
      const u = Math.round(v * 100);
      if (d === dosisMg) {
        text += `  ◉ *${d.toString().replace('.',',')}mg → ${v.toFixed(3).replace('.',',')}mL → ${u} un.* ←\n`;
      } else {
        text += `  ○ ${d.toString().replace('.',',')}mg → ${v.toFixed(3).replace('.',',')}mL → ${u} un.\n`;
      }
    });

    text += `\n⚠️ _${t.calc.msgWarn}_\n\n`;
    text += `━━━━━━━━━━━━━━━━━━━━━\n${t.calc.msgLink}\n🌐 ${siteUrl}`;
    return text;
  };

  const handleCopyCalc = () => {
    navigator.clipboard.writeText(generateCalcMessage());
    alert(lang === 'es' ? "¡Copiado!" : lang === 'pt' ? "Copiado!" : "Copied!");
  };

  const handleWhatsAppCalc = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(generateCalcMessage())}`, "_blank");
  };

  const cartCount = cart.reduce((total, item) => total + item.cantidad, 0);

  const filtered = productos
    .filter((p) => p.nombre.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => {
      if (sort === "price-asc") return a.precio - b.precio;
      if (sort === "price-desc") return b.precio - a.precio;
      return a.nombre.localeCompare(b.nombre);
    });

  const abrirProductoModal = (prod: Producto) => {
    setSelectedProd(prod);
    setModalQty(1);
  };

  const categoriasUnicas = Array.from(new Set(productos.map(p => p.categoria))).sort((a, b) => {
    if (a === "Suministros y Diluyentes") return 1;
    if (b === "Suministros y Diluyentes") return -1;
    return a.localeCompare(b);
  });

  if (!isClient) {
    return <div suppressHydrationWarning className="min-h-screen bg-[#0a0f1c]" />;
  }

  return (
    <>
      <nav className={`fixed top-0 left-0 w-full z-40 flex justify-between items-center px-4 sm:px-6 md:px-16 py-2.5 md:py-3 transition-all duration-500 border-b ${scrolled ? "bg-[#111a2e]/95 backdrop-blur-md border-gold/15 shadow-[0_10px_30px_rgba(0,0,0,0.35)]" : "bg-transparent border-transparent"}`}>
        <div className="flex items-center w-20 sm:w-24 md:w-28 -ml-1 md:ml-0">
          <img src="/logo.jpeg" alt="Life Peptides" className="w-full h-auto transition-transform duration-500 hover:scale-105" style={circularMask} />
        </div>

        <div className="hidden md:flex gap-12 text-[13px] tracking-[3px] uppercase text-white-lp/80 font-sans">
          <a href="#productos" className="relative py-1 transition-colors duration-300 hover:text-gold-light after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-gold after:transition-all after:duration-400 hover:after:w-full">{t.nav.prod}</a>
          <a href="#ciencia" className="relative py-1 transition-colors duration-300 hover:text-gold-light after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-gold after:transition-all after:duration-400 hover:after:w-full">{t.nav.sci}</a>
          <a href="#beneficios" className="relative py-1 transition-colors duration-300 hover:text-gold-light after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-gold after:transition-all after:duration-400 hover:after:w-full">{t.nav.ben}</a>
          
          <a href="/terminos" className="relative py-1 transition-colors duration-300 text-gold hover:text-gold-light after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-gold after:transition-all after:duration-400 hover:after:w-full">
            {lang === "es" ? "Términos de Uso" : lang === "pt" ? "Termos de Uso" : "Terms of Use"}
          </a>
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          <select value={lang} onChange={(e) => setLang(e.target.value as Lang)} className="bg-transparent text-gold hover:text-gold-light border-none outline-none cursor-pointer text-xs font-sans uppercase font-bold tracking-widest appearance-none text-center">
            <option value="es" className="bg-[#111a2e]">ES</option>
            <option value="pt" className="bg-[#111a2e]">PT</option>
            <option value="en" className="bg-[#111a2e]">EN</option>
          </select>

          <button onClick={() => setIsCartOpen(true)} className="relative text-gold hover:text-gold-light transition-all duration-300 hover:scale-110 ml-1 sm:ml-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            {cartCount > 0 && <span className="absolute -top-2 -right-2 bg-gold text-navy text-[10px] font-semibold w-4 h-4 md:w-5 md:h-5 flex items-center justify-center rounded-full animate-fade-up">{cartCount}</span>}
          </button>
          <button className="md:hidden text-gold-light" onClick={() => setMenuOpen((v) => !v)}><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">{menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.3} d="M4 7h16M4 12h16M4 17h16" />}</svg></button>
        </div>
        
        {menuOpen && (
          <div className="absolute top-full left-0 w-full bg-[#111a2e] border-b border-gold/15 flex flex-col items-center py-6 gap-5 md:hidden animate-fade-up">
            <a href="#productos" onClick={() => setMenuOpen(false)} className="text-sm tracking-[3px] uppercase text-white-lp/85 hover:text-gold-light transition-colors">{t.nav.prod}</a>
            <a href="#ciencia" onClick={() => setMenuOpen(false)} className="text-sm tracking-[3px] uppercase text-white-lp/85 hover:text-gold-light transition-colors">{t.nav.sci}</a>
            <a href="#beneficios" onClick={() => setMenuOpen(false)} className="text-sm tracking-[3px] uppercase text-white-lp/85 hover:text-gold-light transition-colors">{t.nav.ben}</a>
            <a href="/terminos" onClick={() => setMenuOpen(false)} className="text-sm tracking-[3px] uppercase text-gold hover:text-gold-light transition-colors">
              {lang === "es" ? "Términos de Uso" : lang === "pt" ? "Termos de Uso" : "Terms of Use"}
            </a>
          </div>
        )}
      </nav>

      {/* BOTÓN FLOTANTE LATERAL INFERIOR "LISTA DE PRODUCTOS" */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-5 sm:bottom-6 left-4 sm:left-6 z-30 bg-[#0a101d]/95 backdrop-blur-md border border-gold/40 hover:bg-gold hover:border-gold text-gold-light hover:text-navy font-bold text-[10px] sm:text-[11px] tracking-[2px] uppercase py-3 px-4 sm:px-5 rounded-full shadow-[0_5px_20px_rgba(203,161,92,0.25)] transition-all duration-300 flex items-center justify-center gap-2 group animate-fade-up [animation-delay:1600ms]"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gold group-hover:text-navy transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
        <span className="hidden sm:inline">{t.cat.sidebarBtn}</span>
        <span className="sm:hidden">Índice</span>
      </button>

      {/* DRAWER LATERAL CON ÍNDICE DINÁMICO POR FUNCIONES */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative z-10 w-80 sm:w-96 max-w-[88vw] bg-[#0d1526] border-r border-gold/25 h-full overflow-y-auto p-5 sm:p-6 shadow-2xl animate-fade-right">
            <div className="flex justify-between items-center border-b border-gold/20 pb-4 mb-5 sticky top-0 bg-[#0d1526] z-10">
              <div>
                <h3 className="text-gold-light font-display text-lg tracking-[2px] uppercase">{t.cat.sidebarBtn}</h3>
                <p className="text-[10px] text-white-lp/50 uppercase tracking-widest mt-0.5">{productos.length} compuestos</p>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-gold-light/70 hover:text-gold text-3xl leading-none">&times;</button>
            </div>

            <div className="space-y-6">
              {categoriasUnicas.map((catKey) => {
                const itemsCat = productos.filter(p => p.categoria === catKey).sort((a, b) => a.nombre.localeCompare(b.nombre));
                if (itemsCat.length === 0) return null;
                return (
                  <div key={catKey}>
                    <div className="w-full text-left bg-gradient-to-r from-gold/25 to-gold/5 border-l-2 border-gold px-3 py-2 text-[10px] sm:text-xs font-bold uppercase tracking-[1px] sm:tracking-[2px] text-gold-light mb-2.5 flex justify-between items-center">
                      <span className="pr-2">{catKey}</span>
                      <span className="text-[10px] text-gold/80 shrink-0">({itemsCat.length})</span>
                    </div>
                    <ul className="space-y-1 pl-2">
                      {itemsCat.map((item) => (
                        <li key={item.id}>
                          <button
                            onClick={() => {
                              setIsSidebarOpen(false);
                              abrirProductoModal(item);
                            }}
                            className="w-full text-left text-xs text-white-lp/75 hover:text-gold-light py-1.5 px-2 rounded hover:bg-white/5 transition-colors flex justify-between items-center gap-2 font-sans"
                          >
                            <span className="truncate">{item.nombre} {item.dosis && <span className="text-gold/70 text-[11px]">{item.dosis}</span>}</span>
                            <span className="text-[11px] text-gold/80 shrink-0">${item.precio.toFixed(0)}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FICHA TÉCNICA CON BANNER DE AGUA BAC GRATIS */}
      {selectedProd && (
        <div
          className="fixed inset-0 z-50 flex justify-center items-start md:items-center bg-[#060911]/90 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fade-up"
          onClick={() => setSelectedProd(null)}
        >
          <div
            className="bg-[#0f1829] border border-gold/30 w-full max-w-4xl rounded-xl shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center px-5 py-4 border-b border-gold/15 bg-[#0a101d]">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[2px] text-gold font-semibold truncate pr-4">
                {selectedProd.categoria}
              </span>
              <button onClick={() => setSelectedProd(null)} className="text-gold-light/70 hover:text-gold text-3xl leading-none px-2 shrink-0">&times;</button>
            </div>

            <div className="p-5 sm:p-8 max-h-[82vh] overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
                
                <div className="md:col-span-5 bg-[#060911] border border-gold/15 rounded-lg overflow-hidden aspect-[9/14] max-h-[380px] mx-auto w-full flex items-center justify-center relative">
                  {selectedProd.imagen && selectedProd.imagen.trim() !== "" ? (
                    <img
                      src={selectedProd.imagen}
                      alt={selectedProd.nombre}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="vial scale-150" />
                  )}
                </div>

                <div className="md:col-span-7 flex flex-col justify-between space-y-5 text-left">
                  <div>
                    <div className="inline-block bg-gold/10 border border-gold/30 text-gold-light text-[10px] uppercase tracking-[2px] px-3 py-1 rounded-full mb-3">
                      {t.cat.modal.badge}
                    </div>
                    <h2 className="font-display text-2xl sm:text-3xl text-gold-light tracking-wider">
                      {selectedProd.nombre}
                    </h2>
                    {selectedProd.dosis && selectedProd.dosis.trim() !== "" && (
                      <p className="text-gold text-sm sm:text-base font-bold tracking-[2px] mt-1 uppercase">
                        {selectedProd.dosis}
                      </p>
                    )}
                    <div className="text-2xl sm:text-3xl font-display text-white-lp mt-3">
                      ${selectedProd.precio.toFixed(2)} <span className="text-xs text-gold/70 font-sans">USD</span>
                    </div>

                    {/* BANNER PROMOCIONAL DE AGUA BACTERIOSTÁTICA (CON ANIMACIÓN SEGURO AQUÍ) */}
                    {selectedProd.categoria !== "Suministros y Diluyentes" && (
                      <div className="mt-4 bg-gradient-to-r from-gold/15 to-transparent border-l-[3px] border-gold p-3 rounded-r-lg flex items-center gap-3">
                        <span className="text-2xl drop-shadow-[0_0_8px_rgba(203,161,92,0.8)] animate-pulse">🎁</span>
                        <div>
                          <p className="text-gold-light text-[10px] sm:text-xs font-bold uppercase tracking-wider">{t.cat.modal.bonusBadge}</p>
                          <p className="text-white-lp/70 text-[9px] sm:text-[10px] mt-1 leading-relaxed pr-2">{t.cat.modal.bonusDesc}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-[#0a101d] border border-gold/15 rounded-lg p-4 space-y-2">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-[2px] text-gold font-bold">
                      {t.cat.modal.purposeTitle}
                    </h4>
                    <p className="text-xs sm:text-sm text-white-lp/85 leading-relaxed">
                      {selectedProd.descripcion[lang] || selectedProd.descripcion['es']}
                    </p>
                    {(selectedProd.detalles[lang] || selectedProd.detalles['es']) && (
                      <p className="text-xs sm:text-sm text-white-lp/75 leading-relaxed pt-2 border-t border-white/5 whitespace-pre-line">
                        {selectedProd.detalles[lang] || selectedProd.detalles['es']}
                      </p>
                    )}
                  </div>

                  <div className="bg-[#0a101d] border border-gold/15 rounded-lg p-4">
                    <h4 className="text-[11px] sm:text-xs uppercase tracking-[2px] text-gold font-bold mb-3">
                      {t.cat.modal.specsTitle}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                      <div className="bg-[#0f1829] p-2.5 rounded border border-white/5">
                        <span className="text-white-lp/45 block text-[10px] uppercase">{t.cat.modal.specContent}</span>
                        <span className="text-white-lp font-semibold">{selectedProd.nombre} {selectedProd.dosis || "Estándar"}</span>
                      </div>
                      <div className="bg-[#0f1829] p-2.5 rounded border border-white/5">
                        <span className="text-white-lp/45 block text-[10px] uppercase">{t.cat.modal.specPurity}</span>
                        <span className="text-white-lp font-semibold">{t.cat.modal.specPurityVal}</span>
                      </div>
                      <div className="bg-[#0f1829] p-2.5 rounded border border-white/5">
                        <span className="text-white-lp/45 block text-[10px] uppercase">{t.cat.modal.specForm}</span>
                        <span className="text-white-lp font-semibold">{t.cat.modal.specFormVal}</span>
                      </div>
                      <div className="bg-[#0f1829] p-2.5 rounded border border-white/5">
                        <span className="text-white-lp/45 block text-[10px] uppercase">{t.cat.modal.specStorage}</span>
                        <span className="text-white-lp font-semibold">{t.cat.modal.specStorageVal}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                    <div className="flex items-center justify-center border border-gold/40 bg-[#0a101d] rounded-lg px-2">
                      <button
                        type="button"
                        onClick={() => setModalQty(q => Math.max(1, q - 1))}
                        className="px-3 py-2.5 text-gold hover:text-white text-lg font-bold"
                      >
                        −
                      </button>
                      <span className="px-4 py-2 text-sm font-bold text-white-lp">{modalQty}</span>
                      <button
                        type="button"
                        onClick={() => setModalQty(q => q + 1)}
                        className="px-3 py-2.5 text-gold hover:text-white text-lg font-bold"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        addToCart(selectedProd, modalQty);
                        setSelectedProd(null);
                        setIsCartOpen(true);
                      }}
                      className="flex-1 bg-gold hover:bg-gold-light text-navy font-bold text-[11px] sm:text-xs uppercase tracking-[2px] py-3.5 px-4 sm:px-6 rounded-lg transition-all duration-300 shadow-[0_6px_20px_rgba(203,161,92,0.3)]"
                    >
                      {t.cat.add} · ${(selectedProd.precio * modalQty).toFixed(2)} USD
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-[#141d33] border border-gold/25 rounded-xl p-5 sm:p-6 text-left space-y-3">
                <div className="flex items-center gap-2 text-gold font-bold text-[11px] sm:text-sm uppercase tracking-wider">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                  <span>{t.cat.modal.legalTitle}</span>
                </div>
                <p className="text-[10px] sm:text-xs text-white-lp/75 leading-relaxed font-sans">
                  {t.cat.modal.legalP1}
                </p>
                <p className="text-[10px] sm:text-xs text-white-lp/75 leading-relaxed font-sans">
                  {t.cat.modal.legalP2}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CALCULADORA */}
      {isCalcOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-start lg:items-center bg-[#0a0f1c]/95 backdrop-blur-md p-3 sm:p-5 overflow-y-auto animate-fade-up">
          <div className="w-full max-w-6xl flex flex-col my-auto py-4 sm:py-6">
            
            <div className="flex justify-between items-start gap-4 mb-5 sm:mb-6 border-b border-white/10 pb-4">
              <div className="text-left sm:text-center w-full">
                <h2 className="text-white text-base sm:text-xl md:text-2xl font-semibold tracking-wide leading-snug">{t.calc.title}</h2>
                <p className="text-white/50 text-xs sm:text-sm mt-1">{t.calc.sub}</p>
              </div>
              <button onClick={() => setIsCalcOpen(false)} className="text-white/60 hover:text-white text-3xl sm:text-4xl leading-none px-2 -mt-1 shrink-0">&times;</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
              <div className="lg:col-span-2 space-y-4 sm:space-y-6">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 sm:p-6 text-center shadow-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-xs font-bold flex items-center justify-center mx-auto mb-2.5">1</div>
                    <h3 className="text-white text-xs sm:text-sm font-bold tracking-wide uppercase">{t.calc.s1}</h3>
                    <p className="text-white/40 text-[11px] sm:text-xs mb-4 sm:mb-6">{t.calc.s1d}</p>
                    
                    <svg viewBox="0 0 40 100" className="h-16 sm:h-20 mx-auto mb-4 sm:mb-6 opacity-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      <path d="M12 20 L12 10 Q12 5 20 5 Q28 5 28 10 L28 20 Z" fill="#334155" />
                      <rect x="10" y="20" width="20" height="75" rx="4" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                      <rect x="11.5" y="40" width="17" height="30" fill="#1e293b" />
                      <text x="20" y="65" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{frascoMg ? `${frascoMg}mg` : '_mg'}</text>
                    </svg>

                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                      {[5, 10, 15, 20, 30, 60].map(v => (
                        <button key={v} onClick={() => setFrascoMg(v)} className={`px-3 sm:px-4 py-2 text-xs font-semibold rounded-md transition-all ${frascoMg === v ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]' : 'bg-[#21262d] text-white/70 hover:bg-[#30363d]'}`}>{v}mg</button>
                      ))}
                      <button className="px-3 sm:px-4 py-2 text-xs font-semibold rounded-md bg-[#21262d] text-white/70 hover:bg-[#30363d]">{t.calc.other}</button>
                    </div>
                  </div>

                  <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 sm:p-6 text-center shadow-lg">
                    <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-xs font-bold flex items-center justify-center mx-auto mb-2.5">2</div>
                    <h3 className="text-white text-xs sm:text-sm font-bold tracking-wide uppercase">{t.calc.s2}</h3>
                    <p className="text-white/40 text-[11px] sm:text-xs mb-4 sm:mb-6">{t.calc.s2d}</p>
                    
                    <svg viewBox="0 0 40 100" className="h-20 sm:h-24 mx-auto mb-4 opacity-90 drop-shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                      <path d="M15 15 L15 5 Q15 0 20 0 Q25 0 25 5 L25 15 L32 20 L32 95 Q32 100 20 100 Q8 100 8 95 L8 20 Z" fill="#0f172a" stroke="#475569" strokeWidth="1.5" />
                      <rect x="10" y="50" width="20" height="30" fill="#1e293b" />
                      <text x="20" y="75" fill="#fff" fontSize="10" fontWeight="bold" textAnchor="middle">{diluenteMl ? `${diluenteMl}mL` : '_mL'}</text>
                    </svg>

                    <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
                      {[0.5, 1, 1.5, 2, 2.5, 3].map(v => (
                        <button key={v} onClick={() => setDiluenteMl(v)} className={`px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-md transition-all ${diluenteMl === v ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]' : 'bg-[#21262d] text-white/70 hover:bg-[#30363d]'}`}>{v.toString().replace('.',',')}mL</button>
                      ))}
                      <button className="px-2.5 sm:px-3 py-2 text-xs font-semibold rounded-md bg-[#21262d] text-white/70 hover:bg-[#30363d]">{t.calc.other}</button>
                    </div>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 sm:p-5 shadow-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0">3</div>
                    <h3 className="text-white text-xs sm:text-sm font-bold tracking-wide uppercase">{t.calc.s3}</h3>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full sm:ml-2">
                    {[{v: 0.3, l: 30}, {v: 0.5, l: 50}, {v: 1, l: 100}].map(j => (
                      <button key={j.v} onClick={() => setSeringaMl(j.v)} className={`p-2.5 sm:py-3 sm:px-2 flex flex-col items-center justify-center rounded-lg border transition-all overflow-hidden ${seringaMl === j.v ? 'border-blue-500 bg-blue-500/10 shadow-[0_0_12px_rgba(37,99,235,0.25)]' : 'border-transparent bg-[#21262d] hover:bg-[#30363d]'}`}>
                        <div className="flex items-center w-full max-w-[56px] sm:max-w-[76px] h-3.5 sm:h-4 mb-2 relative mx-auto">
                          <div className={`w-2 sm:w-3 h-full ${seringaMl === j.v ? 'bg-blue-400' : 'bg-slate-600'} rounded-l-sm shrink-0`} />
                          <div className={`w-full h-full border ${seringaMl === j.v ? 'border-blue-500' : 'border-slate-500'} flex`}>
                             <div className="w-1/3 h-full border-r border-white/20"></div>
                             <div className="w-1/3 h-full border-r border-white/20"></div>
                             <div className="w-1/3 h-full"></div>
                          </div>
                          <div className={`w-1 h-3.5 sm:h-4 ${seringaMl === j.v ? 'bg-blue-400' : 'bg-slate-500'} shrink-0`} />
                        </div>
                        <span className="text-xs sm:text-sm font-bold text-white mb-0.5">{j.v.toString().replace('.',',')}mL</span>
                        <span className="text-[10px] text-white/50 leading-tight">{j.l} {t.calc.s3d}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#161b22] border border-white/5 rounded-xl p-4 sm:p-6 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-6 h-6 bg-blue-500 rounded-full text-white text-xs font-bold flex items-center justify-center shrink-0">4</div>
                    <div>
                      <h3 className="text-white text-xs sm:text-sm font-bold tracking-wide uppercase">{t.calc.s4}</h3>
                      <p className="text-white/40 text-[11px] sm:text-xs">{t.calc.s4d}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {standardDoses.map(v => (
                      <button key={v} onClick={() => setDosisMg(v)} className={`py-2 px-1 text-xs font-semibold rounded-md transition-all ${dosisMg === v ? 'bg-blue-600 text-white shadow-[0_0_12px_rgba(37,99,235,0.5)]' : 'bg-[#21262d] text-white/70 hover:bg-[#30363d]'}`}>{v.toString().replace('.',',')}mg</button>
                    ))}
                    <button className="py-2 px-1 text-xs font-semibold rounded-md bg-[#21262d] text-white/70 hover:bg-[#30363d]">{t.calc.other}</button>
                  </div>
                </div>

              </div>

              <div className={`bg-[#161b22] rounded-xl shadow-lg border transition-all duration-300 flex flex-col p-4 sm:p-6 relative ${isExceeding ? 'border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.15)]' : 'border-white/5'}`}>
                
                <h3 className="text-white/50 text-xs font-bold tracking-widest text-center uppercase mb-4 sm:mb-6">{t.calc.res}</h3>

                {!isComplete && (
                  <div className="flex flex-col items-center justify-center flex-grow py-6 opacity-40">
                    <svg viewBox="0 0 60 200" className="h-36 sm:h-48 mb-6">
                      <rect x="25" y="10" width="10" height="150" fill="#334155" />
                      <rect x="15" y="10" width="30" height="5" fill="#475569" />
                      <rect x="20" y="40" width="20" height="130" rx="2" fill="transparent" stroke="#475569" strokeWidth="2" />
                      <rect x="29" y="170" width="2" height="20" fill="#475569" />
                    </svg>
                    <p className="text-white text-xs sm:text-sm text-center px-4 leading-relaxed">{t.calc.wait}</p>
                  </div>
                )}

                {isExceeding && (
                  <div className="flex flex-col items-center justify-center flex-grow py-6 animate-fade-up">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full border-2 border-red-500 flex items-center justify-center mb-4 sm:mb-6">
                      <svg className="w-7 h-7 sm:w-8 sm:h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </div>
                    <h3 className="text-red-500 font-bold text-base sm:text-lg mb-3 text-center">{t.calc.errTitle}</h3>
                    <p className="text-white/70 text-xs sm:text-sm text-center px-2 leading-relaxed">{t.calc.errDesc}</p>
                  </div>
                )}

                {isComplete && !isExceeding && (
                  <div className="flex flex-col flex-grow animate-fade-up">
                    <div className="relative h-40 sm:h-48 mb-4 sm:mb-6 mx-auto">
                      <svg viewBox="0 0 60 200" className="h-full drop-shadow-[0_10px_15px_rgba(59,130,246,0.3)]">
                        <rect x="25" y={Math.max(10, 170 - (volumenDosis/seringaMl!) * 130)} width="10" height="150" fill="#475569" />
                        <rect x="15" y={Math.max(10, 170 - (volumenDosis/seringaMl!) * 130)} width="30" height="5" fill="#94a3b8" />
                        <rect x="20" y="40" width="20" height="130" rx="2" fill="transparent" stroke="#64748b" strokeWidth="2" />
                        <line x1="40" y1="50" x2="45" y2="50" stroke="#64748b" strokeWidth="1"/><text x="48" y="53" fill="#64748b" fontSize="8">50</text>
                        <line x1="40" y1="80" x2="45" y2="80" stroke="#64748b" strokeWidth="1"/><text x="48" y="83" fill="#64748b" fontSize="8">40</text>
                        <line x1="40" y1="110" x2="45" y2="110" stroke="#64748b" strokeWidth="1"/><text x="48" y="113" fill="#64748b" fontSize="8">30</text>
                        <line x1="40" y1="140" x2="45" y2="140" stroke="#64748b" strokeWidth="1"/><text x="48" y="143" fill="#64748b" fontSize="8">20</text>
                        <rect x="21" y={170 - ((volumenDosis/seringaMl!) * 130)} width="18" height={(volumenDosis/seringaMl!) * 130} fill="#3b82f6" opacity="0.9" />
                        <rect x="29" y="170" width="2" height="20" fill="#cbd5e1" />
                      </svg>
                    </div>

                    <p className="text-center text-white/80 text-xs sm:text-sm mb-2">{t.calc.est}</p>
                    <div className="bg-blue-500 rounded-lg text-white font-bold text-xl sm:text-2xl py-2.5 sm:py-3 px-2 text-center shadow-[0_5px_20px_rgba(59,130,246,0.4)] mb-4 sm:mb-6">
                      {volumenDosis.toFixed(3).replace('.',',')}mL <span className="opacity-50 font-light mx-1">|</span> {Math.round(unidadesJeringa)} {t.calc.un}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-4 sm:mb-6">
                      <div className="bg-[#0f172a] rounded-lg p-2.5 sm:p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{t.calc.conc}</p>
                        <p className="text-white font-bold text-xs sm:text-sm">{concentracion.toFixed(0)} mg/mL</p>
                      </div>
                      <div className="bg-[#0f172a] rounded-lg p-2.5 sm:p-3 border border-white/5 text-center">
                        <p className="text-[10px] text-white/50 uppercase tracking-widest mb-1">{t.calc.dosF}</p>
                        <p className="text-white font-bold text-xs sm:text-sm"><span className="text-green-500 bg-green-500/10 px-1 rounded">{dosisPorFrasco}</span> {t.calc.de} {dosisMg}mg</p>
                      </div>
                    </div>

                    <div className="bg-[#0f172a] rounded-lg border border-white/5 overflow-hidden mb-4 sm:mb-6">
                      <div className="grid grid-cols-3 text-[10px] text-white/40 uppercase tracking-wider p-2 border-b border-white/5 text-center">
                        <span>{t.calc.tDose}</span><span>{t.calc.tVol}</span><span>{t.calc.tUn}</span>
                      </div>
                      {getNearbyDoses().map((d, i) => {
                        const isCurrent = d === dosisMg;
                        const v = d / concentracion;
                        return (
                          <div key={i} className={`grid grid-cols-3 text-xs text-center p-2 border-b border-white/5 last:border-0 ${isCurrent ? 'bg-blue-600/20 text-blue-400 font-bold' : 'text-white/70'}`}>
                            <span>{isCurrent && '▶ '}{d.toString().replace('.',',')}mg</span>
                            <span>{v.toFixed(3).replace('.',',')}mL</span>
                            <span>{Math.round(v * 100)}</span>
                          </div>
                        )
                      })}
                    </div>

                    <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-auto">
                      <button onClick={handleCopyCalc} className="bg-[#21262d] hover:bg-[#30363d] text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg> {t.calc.copy}
                      </button>
                      <button onClick={handleWhatsAppCalc} className="bg-[#25D366] hover:bg-[#128C7E] text-white text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors shadow-[0_0_15px_rgba(37,211,102,0.2)]">
                        <svg className="w-4 h-4 fill-white" viewBox="0 0 448 512"><path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.6c-33.6 0-66.5-9-95.4-26l-6.8-4-70.9 18.6 18.9-69.1-4.4-7C46.8 296 36 260.6 36 224c0-103.7 84.4-188.2 188.2-188.2 55.3 0 107.3 21.5 146.4 60.6 39.1 39.1 60.6 91.2 60.6 146.4 0 103.7-84.4 188.2-188.2 188.2zM326.6 288.7c-5.6-2.8-33.4-16.5-38.6-18.4-5.2-1.9-9-2.8-12.8 2.8-3.8 5.6-14.6 18.4-17.9 22.2-3.3 3.8-6.6 4.2-12.2 1.4-5.6-2.8-23.8-8.8-45.3-28.1-16.7-15-28-33.6-31.3-39.2-3.3-5.6-.4-8.6 2.4-11.4 2.5-2.5 5.6-6.6 8.5-9.9 2.8-3.3 3.8-5.6 5.6-9.4 1.9-3.8.9-7.1-.5-9.9-1.4-2.8-12.8-30.9-17.5-42.3-4.6-11.1-9.3-9.6-12.8-9.8-3.3-.2-7.1-.2-10.8-.2-3.8 0-10.2 1.4-15.5 7.1-5.4 5.6-20.4 19.9-20.4 48.5s20.9 56.2 23.8 60c2.8 3.8 40.8 62.3 98.9 87.4 13.8 5.9 24.6 9.4 33 12 13.8 4.4 26.4 3.8 36.3 2.3 11.2-1.7 33.4-13.6 38.1-26.8 4.7-13.2 4.7-24.6 3.3-26.8-1.4-2.2-5.2-3.3-10.8-6.1z" />
                        </svg> WhatsApp
                      </button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mt-5 sm:mt-6">
                  <button className={`py-3 text-xs font-bold rounded-lg transition-all ${isComplete && !isExceeding ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-blue-600/50 text-white/50 cursor-not-allowed'}`}>{t.calc.print}</button>
                  <button onClick={() => { setFrascoMg(null); setDiluenteMl(null); setSeringaMl(null); setDosisMg(null); }} className="bg-[#21262d] hover:bg-[#30363d] text-white/70 py-3 text-xs font-bold rounded-lg transition-colors">{t.calc.reset}</button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CARRITO */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-navy/90 backdrop-blur-sm p-4 animate-fade-up">
          <div className="bg-navy-2/95 backdrop-blur-xl border border-gold/20 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_20px_60px_rgba(0,0,0,0.5)] flex flex-col">
            <div className="p-5 md:p-6 border-b border-gold/15 flex justify-between items-center sticky top-0 bg-navy-2/95 backdrop-blur-xl z-10">
              <h2 className="font-display text-lg md:text-2xl tracking-[3px] text-gold-light uppercase font-light">{t.cart.title}</h2>
              <button onClick={() => setIsCartOpen(false)} className="text-gold-light/70 hover:text-gold text-3xl leading-none transition-colors">&times;</button>
            </div>

            <div className="p-5 md:p-6 flex-grow">
              {cart.length === 0 ? (
                <p className="text-center text-white-lp/50 py-14 text-sm font-sans">{t.cart.empty}</p>
              ) : (
                <div className="space-y-3 mb-8">
                  {cart.map((item, index) => (
                    <div key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-navy/60 p-4 border border-gold/10 gap-3 sm:gap-0">
                      <div>
                        <h4 className="text-gold-light text-sm font-sans">{item.nombre}</h4>
                        <span className="text-white-lp/45 text-xs font-sans">
                          {item.dosis && item.dosis.trim() !== "" ? `${item.dosis} · ` : ""}${item.precio.toFixed(2)} c/u
                        </span>
                        
                        {/* CONFIRMACIÓN DE AGUA DE REGALO EN EL CARRITO */}
                        {item.categoria !== "Suministros y Diluyentes" && (
                          <span className="block text-gold text-[10px] mt-1.5 font-bold tracking-wide">
                            🎁 {item.cantidad > 1 ? `Incluye ${item.cantidad}x Aguas BAC de regalo` : t.cart.bonusInc}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                        <span className="text-white-lp/80 text-sm font-sans">{t.cart.qty}{item.cantidad}</span>
                        <button onClick={() => removeFromCart(item.id)} className="text-red-400/80 hover:text-red-300 text-xs uppercase tracking-wider font-sans">{t.cart.del}</button>
                      </div>
                    </div>
                  ))}
                  <div className="text-right text-gold-light text-lg tracking-widest pt-4 border-t border-gold/15 font-display">
                    {t.cart.total}: ${getTotal().toFixed(2)} USD
                  </div>
                </div>
              )}

              {cart.length > 0 && (
                <form onSubmit={handleSendOrder} className="space-y-4 border-t border-gold/15 pt-6">
                  <h3 className="text-xs md:text-sm text-gold tracking-[3px] uppercase mb-4 text-center font-sans">{t.cart.formTitle}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input required type="text" name="nombre" value={formData.nombre} onChange={handleInputChange} placeholder={t.cart.name} className="w-full bg-navy/60 border border-gold/25 px-4 py-3 text-sm text-white-lp focus:outline-none focus:border-gold transition-colors font-sans" />
                    <input required type="number" name="edad" value={formData.edad} onChange={handleInputChange} placeholder={t.cart.age} className="w-full bg-navy/60 border border-gold/25 px-4 py-3 text-sm text-white-lp focus:outline-none focus:border-gold transition-colors font-sans" />
                    <input required type="email" name="correo" value={formData.correo} onChange={handleInputChange} placeholder={t.cart.email} className="w-full bg-navy/60 border border-gold/25 px-4 py-3 text-sm text-white-lp focus:outline-none focus:border-gold transition-colors font-sans" />
                    <input required type="tel" name="telefono" value={formData.telefono} onChange={handleInputChange} placeholder={t.cart.phone} className="w-full bg-navy/60 border border-gold/25 px-4 py-3 text-sm text-white-lp focus:outline-none focus:border-gold transition-colors font-sans" />
                  </div>
                  
                  <label className="flex items-start gap-2.5 text-left text-[11px] text-white-lp/75 pt-2 cursor-pointer mt-2">
                    <input required type="checkbox" className="mt-0.5 accent-[#cba15c] w-3.5 h-3.5 shrink-0" />
                    <span className="leading-tight">
                      {lang === "es"
                        ? "Confirmo que soy mayor de 21 años y acepto los "
                        : lang === "pt"
                        ? "Confirmo que tenho mais de 21 anos e aceito os "
                        : "I confirm I am 21+ years old and agree to the "}
                      <a href="/terminos" target="_blank" className="text-gold underline hover:text-gold-light">
                        {lang === "es" ? "Términos y Condiciones de Investigación" : lang === "pt" ? "Termos e Condições de Pesquisa" : "Research Terms & Conditions"}
                      </a>.
                    </span>
                  </label>

                  <button type="submit" className="w-full mt-4 bg-gold text-navy font-semibold uppercase tracking-[2px] py-4 hover:bg-gold-light transition-colors duration-300 shadow-[0_8px_25px_rgba(203,161,92,0.25)] font-sans">
                    {t.cart.send}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* HERO */}
      <section className="relative min-h-[92vh] pt-24 pb-12 flex flex-col justify-center items-center text-center px-5 overflow-hidden">
        <div className="absolute inset-0 tech-grid" />
        <div className="glow-orb w-[420px] h-[420px] bg-gold/10 top-[-10%] left-1/2 -translate-x-1/2" />
        <div className="glow-orb w-[280px] h-[280px] bg-gold/5 bottom-[5%] left-[15%] [animation-delay:2s]" />
        <span className="particle" style={{ left: "12%", bottom: "10%", animationDelay: "0s" }} />
        <span className="particle" style={{ left: "28%", bottom: "10%", animationDelay: "1.5s" }} />
        <span className="particle" style={{ left: "44%", bottom: "10%", animationDelay: "3s" }} />
        <span className="particle" style={{ left: "62%", bottom: "10%", animationDelay: "0.8s" }} />
        <span className="particle" style={{ left: "78%", bottom: "10%", animationDelay: "2.2s" }} />
        <span className="particle" style={{ left: "90%", bottom: "10%", animationDelay: "4s" }} />

        <div className="relative z-10 opacity-0 animate-fade-up [animation-delay:150ms] text-[10px] md:text-xs tracking-[4px] sm:tracking-[6px] text-gold uppercase mb-6 sm:mb-8 font-sans">
          {t.hero.sub}
        </div>

        <div className="relative z-10 opacity-0 animate-fade-up [animation-delay:350ms] mb-6">
          <img src="/logo.jpeg" alt="Life Peptides" className="w-[55vw] max-w-[200px] sm:max-w-[280px] md:max-w-[340px] mx-auto" style={ovalMask} />
        </div>

        <h1 className="relative z-10 opacity-0 animate-fade-up [animation-delay:600ms] font-display text-2xl sm:text-4xl md:text-5xl tracking-[4px] sm:tracking-[6px] md:tracking-[10px] text-gold-light font-light">
          {t.hero.title}
        </h1>

        <p className="relative z-10 w-[90vw] max-w-lg mx-auto mt-5 sm:mt-7 text-xs sm:text-sm md:text-base leading-relaxed text-white-lp/70 opacity-0 animate-fade-up [animation-delay:850ms] font-sans">
          {t.hero.desc}
        </p>

        <a href="#productos" className="relative z-10 mt-8 sm:mt-10 px-8 sm:px-10 py-3.5 sm:py-4 border border-gold/70 text-gold-light tracking-[3px] text-xs md:text-sm uppercase transition-all duration-500 hover:bg-gold hover:text-navy hover:border-gold hover:shadow-[0_0_40px_rgba(203,161,92,0.35)] opacity-0 animate-fade-up [animation-delay:1100ms] font-sans">
          {t.hero.btn}
        </a>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="relative py-20 md:py-40 px-5 md:px-6">
        <div className="text-center text-[10px] md:text-xs tracking-[5px] text-gold uppercase mb-4 reveal font-sans">{t.ben.sub}</div>
        <h2 className="text-center font-display text-3xl md:text-5xl tracking-[3px] text-gold-light mb-14 md:mb-24 font-light reveal">{t.ben.title}</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 max-w-6xl mx-auto divide-y md:divide-y-0 md:divide-x divide-gold/10">
          {t.ben.cards.map((it, i) => (
            <div key={it.n} className="group relative px-6 md:px-10 py-10 text-center reveal" style={{ transitionDelay: `${i * 120}ms` }}>
              <div className="font-display text-5xl md:text-6xl text-gold/25 group-hover:text-gold/50 transition-colors duration-500 mb-4">{it.n}</div>
              <h3 className="text-sm md:text-base tracking-[3px] uppercase text-gold-light mb-4 font-sans">{it.t}</h3>
              <p className="text-xs md:text-sm leading-relaxed text-white-lp/60 max-w-[240px] mx-auto font-sans">{it.d}</p>
              <div className="mx-auto mt-6 w-8 h-px bg-gold/40 group-hover:w-16 transition-all duration-500" />
            </div>
          ))}
        </div>
      </section>

      {/* CATÁLOGO */}
      <section id="productos" className="relative py-20 md:py-36 px-3 sm:px-6 bg-navy-2">
        <div className="text-center text-[10px] md:text-xs tracking-[5px] text-gold uppercase mb-3 reveal font-sans">{t.cat.sub}</div>
        <h2 className="text-center font-display text-2xl sm:text-3xl md:text-5xl tracking-[3px] text-gold-light mb-3 font-light reveal">{t.cat.title}</h2>
        
        <p className="text-center text-[10px] sm:text-xs text-white-lp/45 max-w-xl mx-auto mb-8 sm:mb-10 reveal font-sans">
          {t.cat.resDisclaimer}
        </p>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center max-w-2xl mx-auto mb-10 sm:mb-14 px-2 reveal">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={t.cat.search} className="w-full sm:w-72 bg-transparent border border-gold/25 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white-lp placeholder:text-white-lp/35 focus:outline-none focus:border-gold transition-colors font-sans" />
          <select value={sort} onChange={(e) => setSort(e.target.value as any)} className="w-full sm:w-52 bg-navy border border-gold/25 px-4 py-2.5 sm:py-3 text-xs sm:text-sm text-white-lp/80 focus:outline-none focus:border-gold transition-colors font-sans">
            <option value="az">{t.cat.sortAZ}</option>
            <option value="price-asc">{t.cat.sortAsc}</option>
            <option value="price-desc">{t.cat.sortDesc}</option>
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
             <p className="text-gold-light text-lg tracking-widest uppercase animate-pulse">{t.cat.empty}</p>
          </div>
        ) : productos.length === 0 ? (
          <p className="text-center text-white-lp/40 mt-16 text-sm font-sans">No hay productos visibles en este momento.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 md:gap-7 max-w-7xl mx-auto">
            {filtered.map((prod, index) => (
              <div key={`${prod.id}`} className="group relative border border-gold/15 hover:border-gold/50 flex flex-col h-full overflow-hidden transition-all duration-500 hover:-translate-y-1 reveal bg-[#060911]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(203,161,92,0.10),transparent_65%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10" />
                <div className="absolute top-0 left-0 h-px w-0 bg-gradient-to-r from-transparent via-gold to-transparent group-hover:w-full transition-all duration-700 z-20" />

                <div
                  onClick={() => abrirProductoModal(prod)}
                  className="relative w-full aspect-[9/14] sm:aspect-[9/15] overflow-hidden bg-[#060911] flex items-center justify-center cursor-pointer"
                >
                  <span className="absolute top-2 left-2 sm:top-3.5 sm:left-3.5 z-20 text-[9px] sm:text-[11px] tracking-[1.5px] sm:tracking-[2px] text-gold/80 font-sans bg-[#0a0f1c]/80 px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded backdrop-blur-md border border-gold/20">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  
                  {prod.categoria !== "Suministros y Diluyentes" && (
                    <div className="absolute top-2 right-2 sm:top-3.5 sm:right-3.5 z-20 bg-gradient-to-r from-gold to-gold-light text-navy text-[8px] sm:text-[9px] font-black px-2 py-1 rounded shadow-md uppercase tracking-wider transform-gpu">
                      🎁 + BAC GRATIS
                    </div>
                  )}

                  {prod.imagen && prod.imagen.trim() !== "" ? (
                    <img 
                      src={prod.imagen} 
                      alt={prod.nombre} 
                      className="w-full h-full object-cover object-center scale-[1.03] transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="vial scale-110 sm:scale-150 transition-transform duration-500 group-hover:scale-125 sm:group-hover:scale-[1.65]" />
                  )}

                  <div className="absolute bottom-2 right-2 z-20 bg-[#0a0f1c]/85 border border-gold/30 text-gold-light text-[9px] sm:text-[10px] uppercase tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {t.cat.modal.viewDetails}
                  </div>
                </div>

                <div className="relative z-10 flex-grow flex flex-col justify-between p-3 sm:p-5 md:p-6 border-t border-gold/30 text-center bg-navy-2">
                  <div onClick={() => abrirProductoModal(prod)} className="cursor-pointer">
                    <span className="block text-[9px] sm:text-[10px] uppercase tracking-[1.5px] text-white-lp/45 mb-1 truncate">
                      {prod.categoria}
                    </span>
                    <h4 className="text-gold-light hover:text-gold text-xs sm:text-base md:text-lg font-semibold tracking-wide sm:tracking-wider leading-snug font-sans line-clamp-2 transition-colors">
                      {prod.nombre}
                    </h4>
                    {prod.dosis && prod.dosis.trim() !== "" && (
                      <span className="block text-gold text-[10px] sm:text-xs md:text-sm font-bold tracking-[1.5px] sm:tracking-[2px] mt-0.5 sm:mt-1 font-sans uppercase">
                        {prod.dosis}
                      </span>
                    )}
                    <p className="text-white-lp/65 text-[10px] sm:text-xs leading-relaxed mt-1.5 sm:mt-2.5 font-sans italic opacity-90 line-clamp-3">
                      {prod.descripcion[lang] || prod.descripcion['es']}
                    </p>
                  </div>

                  <div className="mt-3 sm:mt-5 pt-2 sm:pt-3 border-t border-gold/10">
                    <span className="block text-gold text-sm sm:text-lg md:text-xl tracking-wider sm:tracking-widest mb-2.5 sm:mb-3.5 font-display">
                      ${prod.precio.toFixed(2)} <span className="text-[9px] sm:text-[11px] text-gold/60 font-sans">USD</span>
                    </span>
                    <button onClick={() => addToCart(prod)} className="w-full border border-gold/60 text-gold-light text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[1px] sm:tracking-[2px] py-2 sm:py-3 px-1 transition-all duration-300 hover:bg-gold hover:text-navy hover:border-gold font-sans">
                      {t.cat.add}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* CIENCIA */}
      <section id="ciencia" className="relative py-20 md:py-40 px-5 md:px-6 border-b border-gold/5 overflow-hidden">
        <div className="glow-orb w-[360px] h-[360px] bg-gold/8 top-1/2 left-1/4 -translate-y-1/2" />
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20 max-w-6xl mx-auto items-center">
          <div className="h-80 md:h-[420px] border border-gold/15 relative flex items-center justify-center reveal overflow-hidden bg-[radial-gradient(ellipse_at_center,rgba(203,161,92,0.06),transparent_70%)]">
            <div className="absolute inset-0 tech-grid opacity-60" />
            <div className="dna-3d relative z-10 flex flex-col justify-center items-center gap-[10px] md:gap-[13px]">
              {Array.from({ length: 16 }).map((_, i) => (
                <div key={i} className="dna-rung w-[70px] md:w-[100px]" style={{ animationDelay: `${i * -0.25}s` }} />
              ))}
            </div>
          </div>

          <div className="reveal text-center md:text-left">
            <div className="text-[10px] md:text-xs tracking-[5px] text-gold uppercase mb-4 font-sans">{t.sci.sub}</div>
            <h2 className="font-display text-2xl md:text-4xl tracking-[2px] text-gold-light mb-6 font-light">{t.sci.title}</h2>
            <p className="text-sm leading-loose text-white-lp/65 mb-4 font-sans">{t.sci.p1}</p>
            <p className="text-sm leading-loose text-white-lp/65 font-sans">{t.sci.p2}</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative py-16 md:py-20 px-6 text-center bg-[#111a2e] border-t border-gold/10">
        <div className="mb-6 flex justify-center w-40 md:w-52 mx-auto">
          <img src="/logo.jpeg" alt="Life Peptides" className="w-full h-auto" style={circularMask} />
        </div>
        <p className="text-xs md:text-sm text-gold-light/70 tracking-[2px] mb-8 font-sans">{t.foot.tagline}</p>
        <div className="flex justify-center gap-8 mb-8 text-[11px] tracking-[2px] uppercase text-white-lp/50 font-sans">
          <a href="#productos" className="hover:text-gold transition-colors">{t.nav.prod}</a>
          <a href="#ciencia" className="hover:text-gold transition-colors">{t.nav.sci}</a>
          <a href="#beneficios" className="hover:text-gold transition-colors">{t.nav.ben}</a>
          
          <a href="/terminos" className="hover:text-gold transition-colors underline">
            {lang === "es" ? "Términos y Condiciones" : lang === "pt" ? "Termos e Condições" : "Terms & Conditions"}
          </a>
        </div>
        <div className="max-w-2xl mx-auto border-t border-gold/10 pt-6 space-y-2">
          <div className="text-[10px] md:text-xs text-white-lp/50 tracking-wider font-sans">{t.foot.legal}</div>
          <p className="text-[10px] text-white-lp/35 leading-relaxed font-sans">{t.foot.disclaimer}</p>
        </div>
      </footer>

      {/* BOTÓN FLOTANTE CALCULADORA */}
      <button onClick={() => setIsCalcOpen(true)} title="Calculadora de Dosis" className="fixed bottom-[84px] md:bottom-[100px] right-4 md:right-6 z-30 bg-[#1e2a44] border border-gold hover:bg-gold w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(203,161,92,0.2)] transition-all duration-300 hover:scale-110 group animate-fade-up [animation-delay:1700ms]">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 md:w-6 md:h-6 text-gold group-hover:text-navy transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      </button>

      {/* BOTÓN FLOTANTE WHATSAPP OFICIAL */}
      <a href={`https://wa.me/${numeroWhatsApp}?text=Hola%20quiero%20recibir%20m%C3%A1s%20informaci%C3%B3n`} target="_blank" rel="noopener noreferrer" title="Contacto WhatsApp" className="fixed bottom-5 right-4 md:right-6 z-30 bg-[#25D366] hover:bg-[#128C7E] w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-[0_6px_20px_rgba(37,211,102,0.4)] transition-all duration-300 hover:scale-110 animate-fade-up [animation-delay:1500ms]">
        <svg className="w-5 h-5 md:w-7 md:h-7 fill-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
          <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zM223.9 413.6c-33.6 0-66.5-9-95.4-26l-6.8-4-70.9 18.6 18.9-69.1-4.4-7C46.8 296 36 260.6 36 224c0-103.7 84.4-188.2 188.2-188.2 55.3 0 107.3 21.5 146.4 60.6 39.1 39.1 60.6 91.2 60.6 146.4 0 103.7-84.4 188.2-188.2 188.2zM326.6 288.7c-5.6-2.8-33.4-16.5-38.6-18.4-5.2-1.9-9-2.8-12.8 2.8-3.8 5.6-14.6 18.4-17.9 22.2-3.3 3.8-6.6 4.2-12.2 1.4-5.6-2.8-23.8-8.8-45.3-28.1-16.7-15-28-33.6-31.3-39.2-3.3-5.6-.4-8.6 2.4-11.4 2.5-2.5 5.6-6.6 8.5-9.9 2.8-3.3 3.8-5.6 5.6-9.4 1.9-3.8.9-7.1-.5-9.9-1.4-2.8-12.8-30.9-17.5-42.3-4.6-11.1-9.3-9.6-12.8-9.8-3.3-.2-7.1-.2-10.8-.2-3.8 0-10.2 1.4-15.5 7.1-5.4 5.6-20.4 19.9-20.4 48.5s20.9 56.2 23.8 60c2.8 3.8 40.8 62.3 98.9 87.4 13.8 5.9 24.6 9.4 33 12 13.8 4.4 26.4 3.8 36.3 2.3 11.2-1.7 33.4-13.6 38.1-26.8 4.7-13.2 4.7-24.6 3.3-26.8-1.4-2.2-5.2-3.3-10.8-6.1z" />
        </svg>
      </a>
    </>
  );
}