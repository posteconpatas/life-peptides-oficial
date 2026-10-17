"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const CATEGORIAS_CIENTIFICAS = [
  "Metabolismo y grasa corporal",
  "Metabolismo, apetito y pérdida de peso",
  "Control de glucosa, apetito y peso",
  "Saciedad y control del apetito",
  "Metabolismo de grasas",
  "Metabolismo energético",
  "Metabolismo energético y resistencia física",
  "Metabolismo mitocondrial",
  "Función mitocondrial y protección celular",
  "Protección celular y mitocondrial",
  "Reparación de tejidos",
  "Hormona de crecimiento",
  "Estimulación de la liberación de GH",
  "Estimulación de GH y reducción de grasa visceral",
  "Crecimiento celular y señalización anabólica",
  "Neuroprotección",
  "Neuroprotección y función cognitiva",
  "Ansiedad y estrés (Investigación neurológica)",
  "Neurología",
  "Antiinflamatorio y neuroprotección",
  "Antiinflamatorio experimental",
  "Modulación del sistema inmunitario",
  "Senescencia celular y longevidad",
  "Regulación del sueño",
  "Salud ósea",
  "Función reproductiva",
  "Función sexual",
  "Pigmentación de la piel",
  "Péptidos Cosméticos",
  "Mezclas de Péptidos (Blends)",
  "Biorreguladores",
  "Suministros y Diluyentes"
];

const comprimirImagen = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 900;
        const MAX_HEIGHT = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, ".webp"), {
                type: "image/webp",
                lastModified: Date.now()
              });
              resolve(newFile);
            } else {
              reject(new Error("Error creando el blob de imagen"));
            }
          },
          "image/webp",
          0.82
        );
      };
      img.onerror = (error) => reject(error);
    };
    reader.onerror = (error) => reject(error);
  });
};

export default function AdminPanel() {
  const [tab, setTab] = useState<"productos" | "cupones" | "metricas">("productos");
  const [productos, setProductos] = useState<any[]>([]);
  const [cupones, setCupones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auth, setAuth] = useState(false);
  const [password, setPassword] = useState("");
  const [editando, setEditando] = useState<any>(null);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [ordenAdmin, setOrdenAdmin] = useState<"az" | "clics" | "pedidos" | "precio">("az");
  const [toast, setToast] = useState<{ msg: string; type: "ok" | "err" } | null>(null);

  // Estado para crear cupones
  const [nuevoCupon, setNuevoCupon] = useState({
    codigo: "",
    tipo: "porcentaje",
    descuento: 10
  });

  const mostrarNotificacion = (msg: string, type: "ok" | "err" = "ok") => {
    setToast({ msg, type });
    setTimeout(() => {
      setToast(null);
    }, 2000);
  };

  const emptyForm = {
    nombre: "",
    dosis: "",
    precio: 0,
    imagen: "",
    visible: true,
    categoria: "",
    descripcion_es: "",
    descripcion_pt: "",
    descripcion_en: "",
    detalles_es: "",
    detalles_pt: "",
    detalles_en: ""
  };

  const [form, setForm] = useState<any>(emptyForm);

  const cargarDatos = async () => {
    setLoading(true);
    const { data: prodData } = await supabase
      .from("productos")
      .select("*")
      .order("nombre", { ascending: true });
    if (prodData) setProductos(prodData);

    const { data: cupData } = await supabase
      .from("cupones")
      .select("*")
      .order("created_at", { ascending: false });
    if (cupData) setCupones(cupData);

    setLoading(false);
  };

  useEffect(() => {
    if (auth) cargarDatos();
  }, [auth]);

  const login = (e: any) => {
    e.preventDefault();
    if (password === "admin2026") {
      setAuth(true);
      mostrarNotificacion("Sesión iniciada correctamente");
    } else {
      mostrarNotificacion("Contraseña incorrecta", "err");
    }
  };

  const handleSubirFoto = async (e: any) => {
    const fileOriginal = e.target.files[0];
    if (!fileOriginal) return;
    setSubiendoFoto(true);

    try {
      const fileComprimido = await comprimirImagen(fileOriginal);
      const fileExt = fileComprimido.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;

      const { error } = await supabase.storage.from("productos").upload(fileName, fileComprimido);

      if (error) {
        mostrarNotificacion("Error subiendo foto: " + error.message, "err");
      } else {
        const { data } = supabase.storage.from("productos").getPublicUrl(fileName);
        setForm({ ...form, imagen: data.publicUrl });
        mostrarNotificacion("¡Foto optimizada y cargada!");
      }
    } catch (error) {
      mostrarNotificacion("Error al comprimir la imagen", "err");
      console.error(error);
    }

    setSubiendoFoto(false);
  };

  const guardarProducto = async (e: any) => {
    e.preventDefault();
    const payloadBase: any = {
      nombre: form.nombre,
      dosis: form.dosis ? form.dosis.trim() : "",
      precio: form.precio,
      imagen: form.imagen,
      visible: form.visible,
      descripcion_es: form.descripcion_es,
      descripcion_pt: form.descripcion_pt,
      descripcion_en: form.descripcion_en,
      categoria: form.categoria || "",
      detalles_es: form.detalles_es || "",
      detalles_pt: form.detalles_pt || "",
      detalles_en: form.detalles_en || ""
    };

    let res = editando
      ? await supabase.from("productos").update(payloadBase).eq("id", editando.id)
      : await supabase.from("productos").insert([payloadBase]);

    if (res.error) {
      const { categoria, detalles_es, detalles_pt, detalles_en, ...fallbackPayload } = payloadBase;
      res = editando
        ? await supabase.from("productos").update(fallbackPayload).eq("id", editando.id)
        : await supabase.from("productos").insert([fallbackPayload]);
    }

    if (res.error) {
      return mostrarNotificacion("Error al guardar: " + res.error.message, "err");
    }

    mostrarNotificacion(editando ? "Producto actualizado con éxito" : "Producto creado con éxito");
    setForm(emptyForm);
    setEditando(null);
    document.getElementById("form-modal")?.classList.add("hidden");
    cargarDatos();
  };

  const eliminarProducto = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este producto?")) {
      await supabase.from("productos").delete().eq("id", id);
      mostrarNotificacion("Producto eliminado");
      cargarDatos();
    }
  };

  const toggleVisibilidad = async (producto: any) => {
    const nuevaVisibilidad = !producto.visible;
    const { error } = await supabase.from("productos").update({ visible: nuevaVisibilidad }).eq("id", producto.id);
    if (!error) {
      setProductos((prev) => prev.map((p) => (p.id === producto.id ? { ...p, visible: nuevaVisibilidad } : p)));
      mostrarNotificacion(nuevaVisibilidad ? "Producto visible en tienda" : "Producto oculto");
    }
  };

  // === FUNCIONES DE CUPONES ===
  const crearCupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const codigoLimpio = nuevoCupon.codigo.trim().toUpperCase();
    if (!codigoLimpio || nuevoCupon.descuento <= 0) {
      return mostrarNotificacion("Ingresa un código y descuento válido", "err");
    }

    const { error } = await supabase.from("cupones").insert([
      {
        codigo: codigoLimpio,
        tipo: nuevoCupon.tipo,
        descuento: Number(nuevoCupon.descuento),
        activo: true,
        usos: 0
      }
    ]);

    if (error) {
      return mostrarNotificacion("Error al crear cupón (verifica haber corrido el SQL)", "err");
    }

    mostrarNotificacion(`Cupón ${codigoLimpio} creado`);
    setNuevoCupon({ codigo: "", tipo: "porcentaje", descuento: 10 });
    cargarDatos();
  };

  const toggleCupon = async (cupon: any) => {
    const nuevoEstado = !cupon.activo;
    const { error } = await supabase.from("cupones").update({ activo: nuevoEstado }).eq("id", cupon.id);
    if (!error) {
      setCupones((prev) => prev.map((c) => (c.id === cupon.id ? { ...c, activo: nuevoEstado } : c)));
      mostrarNotificacion(nuevoEstado ? "Cupón activado" : "Cupón pausado");
    }
  };

  const eliminarCupon = async (id: string) => {
    if (confirm("¿Eliminar este cupón de descuento?")) {
      await supabase.from("cupones").delete().eq("id", id);
      mostrarNotificacion("Cupón eliminado");
      cargarDatos();
    }
  };

  // === FUNCIONES DE MÉTRICAS ===
  const reiniciarMetricasProducto = async (id: string) => {
    const { error } = await supabase.from("productos").update({ clics: 0, pedidos: 0 }).eq("id", id);
    if (!error) {
      setProductos((prev) => prev.map((p) => (p.id === id ? { ...p, clics: 0, pedidos: 0 } : p)));
      mostrarNotificacion("Contadores reiniciados");
    }
  };

  const reiniciarTodasLasMetricas = async () => {
    if (!confirm("¿Seguro que deseas poner en 0 los clics y pedidos de todos los productos?")) return;
    const { error } = await supabase.from("productos").update({ clics: 0, pedidos: 0 }).neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) {
      setProductos((prev) => prev.map((p) => ({ ...p, clics: 0, pedidos: 0 })));
      mostrarNotificacion("Todas las métricas fueron reiniciadas");
    }
  };

  if (!auth) {
    return (
      <div className="min-h-screen bg-[#0a0f1c] flex items-center justify-center relative p-4">
        {toast && (
          <div className={`fixed top-5 right-5 z-[100] px-5 py-3 rounded-xl shadow-lg font-bold text-sm text-white flex items-center gap-2.5 transition-all duration-300 ${toast.type === "ok" ? "bg-[#00b050]" : "bg-red-600"}`}>
            <span>{toast.type === "ok" ? "✓" : "✕"}</span>
            {toast.msg}
          </div>
        )}
        <form onSubmit={login} className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 text-center w-full max-w-sm">
          <img src="/logo.jpeg" alt="Logo" className="h-20 mx-auto mb-5 rounded-full object-cover shadow-md" />
          <h2 className="text-gray-900 text-xl font-black mb-1">Panel Administrativo</h2>
          <p className="text-xs text-gray-400 mb-6">Life Peptides Bolivia</p>
          <input
            type="password"
            placeholder="Contraseña de acceso"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 text-gray-800 p-3.5 rounded-xl mb-4 text-sm focus:outline-none focus:border-[#00b050]"
          />
          <button type="submit" className="w-full bg-[#00b050] hover:bg-[#009040] text-white font-bold py-3.5 rounded-xl transition-colors shadow-md">
            Ingresar al Panel
          </button>
        </form>
      </div>
    );
  }

  const totalClics = productos.reduce((acc, p) => acc + Number(p.clics || 0), 0);
  const totalPedidos = productos.reduce((acc, p) => acc + Number(p.pedidos || 0), 0);
  const totalUsosCupones = cupones.reduce((acc, c) => acc + Number(c.usos || 0), 0);

  const productosFiltrados = productos
    .filter((p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    .sort((a, b) => {
      if (ordenAdmin === "clics") return Number(b.clics || 0) - Number(a.clics || 0);
      if (ordenAdmin === "pedidos") return Number(b.pedidos || 0) - Number(a.pedidos || 0);
      if (ordenAdmin === "precio") return Number(b.precio || 0) - Number(a.precio || 0);
      return a.nombre.localeCompare(b.nombre);
    });

  const topClics = [...productos].sort((a, b) => Number(b.clics || 0) - Number(a.clics || 0)).slice(0, 10);
  const topPedidos = [...productos].sort((a, b) => Number(b.pedidos || 0) - Number(a.pedidos || 0)).slice(0, 10);
  const maxClics = Math.max(1, Number(topClics[0]?.clics || 1));
  const maxPedidos = Math.max(1, Number(topPedidos[0]?.pedidos || 1));

  return (
    <div className="min-h-screen bg-[#f4f7f6] p-4 md:p-8 font-sans relative">
      {toast && (
        <div className={`fixed top-5 right-5 z-[100] px-5 py-3.5 rounded-xl shadow-xl font-bold text-sm text-white flex items-center gap-2.5 transition-all duration-300 ${toast.type === "ok" ? "bg-[#00b050]" : "bg-red-600"}`}>
          <span className="bg-white/20 rounded-full w-5 h-5 flex items-center justify-center text-xs">
            {toast.type === "ok" ? "✓" : "!"}
          </span>
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        {/* CABECERA PRINCIPAL Y RESUMEN DE MÉTRICAS */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-gray-900">Centro de Control · LifePeptidesBo</h1>
              <a href="/" target="_blank" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-3 py-1 rounded-full transition-colors">
                Ver Tienda ↗
              </a>
            </div>
            <p className="text-sm text-gray-500 mt-1">Gestiona tu catálogo, crea cupones de descuento y analiza los productos más solicitados.</p>
          </div>

          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            <button
              onClick={() => setTab("productos")}
              className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                tab === "productos" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📦 Catálogo ({productos.length})
            </button>
            <button
              onClick={() => setTab("cupones")}
              className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                tab === "cupones" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              🎟️ Cupones ({cupones.length})
            </button>
            <button
              onClick={() => setTab("metricas")}
              className={`flex-1 lg:flex-initial px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                tab === "metricas" ? "bg-gray-900 text-white shadow-md" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              📊 Ranking y Clics
            </button>
            <button
              onClick={() => {
                setEditando(null);
                setForm(emptyForm);
                document.getElementById("form-modal")?.classList.remove("hidden");
              }}
              className="w-full sm:w-auto bg-[#00b050] hover:bg-[#009040] text-white font-bold py-2.5 px-5 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-xs sm:text-sm shadow-sm"
            >
              <span>+</span> Nuevo Producto
            </button>
          </div>
        </div>

        {/* TARJETAS KPI RÁPIDAS */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Productos Visibles</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">
              {productos.filter((p) => p.visible).length} <span className="text-sm font-medium text-gray-400">/ {productos.length}</span>
            </p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Total Clics en Productos</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">👁️ {totalClics}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00b050]">Enviados a WhatsApp</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">🛒 {totalPedidos}</p>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Cupones Canjeados</span>
            <p className="text-2xl sm:text-3xl font-black text-gray-900 mt-1">🎟️ {totalUsosCupones}</p>
          </div>
        </div>

        {/* ==================== PESTAÑA 1: CATÁLOGO DE PRODUCTOS ==================== */}
        {tab === "productos" && (
          <>
            <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center w-full px-2">
                <svg className="w-5 h-5 text-gray-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Buscar producto por nombre en el catálogo..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full bg-transparent border-none focus:outline-none p-2.5 text-sm text-gray-700"
                />
              </div>
              <select
                value={ordenAdmin}
                onChange={(e) => setOrdenAdmin(e.target.value as any)}
                className="w-full sm:w-64 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-gray-700 focus:outline-none focus:border-[#00b050]"
              >
                <option value="az">Ordenar: Alfabético (A-Z)</option>
                <option value="clics">Ordenar: Más Clickeados (👁️)</option>
                <option value="pedidos">Ordenar: Más Pedidos (🛒)</option>
                <option value="precio">Ordenar: Mayor Precio ($)</option>
              </select>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-[#d32f2f] font-black uppercase tracking-wider text-sm">CATÁLOGO PRINCIPAL</h3>
                <span className="text-xs text-gray-400">{productosFiltrados.length} resultados</span>
              </div>

              {loading ? (
                <p className="text-gray-500">Cargando inventario...</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {productosFiltrados.map((p) => (
                    <div
                      key={p.id}
                      className={`bg-white border ${
                        p.visible ? "border-gray-200" : "border-gray-200 opacity-55"
                      } rounded-2xl p-3.5 flex flex-col justify-between gap-3 transition-all hover:shadow-md`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-14 h-14 shrink-0 bg-gray-900 rounded-xl flex items-center justify-center border border-gray-100 overflow-hidden">
                            {p.imagen ? (
                              <img src={p.imagen} alt={p.nombre} className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-[10px] text-gray-400 text-center leading-tight">
                                Sin
                                <br />
                                Foto
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-bold text-gray-900 truncate">{p.nombre}</h4>
                            {p.dosis && p.dosis.trim() !== "" && <p className="text-xs text-gray-500">{p.dosis}</p>}
                            <p className="text-sm font-black text-[#00b050] mt-0.5">{p.precio} USD</p>
                          </div>
                        </div>

                        <div className="flex gap-1 shrink-0">
                          <button
                            onClick={() => toggleVisibilidad(p)}
                            className={`p-2 rounded-lg border transition-colors ${
                              p.visible ? "text-[#00b050] border-gray-100 hover:bg-green-50" : "text-gray-400 border-gray-100 hover:bg-gray-50"
                            }`}
                            title={p.visible ? "Ocultar" : "Mostrar"}
                          >
                            {p.visible ? (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            )}
                          </button>
                          <button
                            onClick={() => {
                              setEditando(p);
                              setForm({ ...emptyForm, ...p, dosis: p.dosis || "" });
                              document.getElementById("form-modal")?.classList.remove("hidden");
                            }}
                            className="p-2 text-gray-500 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => eliminarProducto(p.id)}
                            className="p-2 text-gray-500 rounded-lg border border-gray-100 hover:bg-red-50 hover:text-red-500 transition-colors"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* BARRA INFERIOR DE MÉTRICAS DEL PRODUCTO */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                        <div className="flex gap-2">
                          <span className="bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded-md">
                            👁️ {Number(p.clics || 0)} clics
                          </span>
                          <span className="bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-md">
                            🛒 {Number(p.pedidos || 0)} pedidos
                          </span>
                        </div>
                        {(Number(p.clics || 0) > 0 || Number(p.pedidos || 0) > 0) && (
                          <button
                            onClick={() => reiniciarMetricasProducto(p.id)}
                            className="text-[10px] text-gray-400 hover:text-red-500"
                            title="Reiniciar contador a 0"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ==================== PESTAÑA 2: CUPONES DE DESCUENTO ==================== */}
        {tab === "cupones" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Formulario para crear cupón */}
            <form onSubmit={crearCupon} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4 h-fit">
              <div>
                <h3 className="text-lg font-black text-gray-900">Crear Nuevo Cupón</h3>
                <p className="text-xs text-gray-500 mt-0.5">El cliente podrá escribir este código en su carrito.</p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 mb-1 block">Código del Cupón</label>
                <input
                  required
                  type="text"
                  placeholder="Ej: LIFE10, VIP20, PROMO15"
                  value={nuevoCupon.codigo}
                  onChange={(e) => setNuevoCupon({ ...nuevoCupon, codigo: e.target.value.toUpperCase() })}
                  className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold uppercase tracking-wider text-gray-900 focus:outline-none focus:border-[#00b050]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">Tipo de Descuento</label>
                  <select
                    value={nuevoCupon.tipo}
                    onChange={(e) => setNuevoCupon({ ...nuevoCupon, tipo: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-[#00b050]"
                  >
                    <option value="porcentaje">Porcentaje (%)</option>
                    <option value="fijo">Monto fijo ($ USD)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-600 mb-1 block">
                    Valor ({nuevoCupon.tipo === "porcentaje" ? "%" : "$ USD"})
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    min="1"
                    max={nuevoCupon.tipo === "porcentaje" ? "100" : "10000"}
                    value={nuevoCupon.descuento}
                    onChange={(e) => setNuevoCupon({ ...nuevoCupon, descuento: parseFloat(e.target.value) })}
                    className="w-full bg-gray-50 border border-gray-200 p-3 rounded-xl text-sm font-bold text-gray-900 focus:outline-none focus:border-[#00b050]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#00b050] hover:bg-[#009040] text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm"
              >
                + Guardar Cupón
              </button>
            </form>

            {/* Lista de cupones creados */}
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-black text-gray-900 mb-4">Cupones Registrados ({cupones.length})</h3>

              {cupones.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl">
                  <p className="text-sm text-gray-500">Aún no has creado ningún cupón de descuento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cupones.map((c) => (
                    <div
                      key={c.id}
                      className={`p-4 rounded-2xl border-2 border-dashed flex items-center justify-between transition-all ${
                        c.activo ? "border-[#00b050]/40 bg-green-50/30" : "border-gray-200 bg-gray-50 opacity-60"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black tracking-widest text-gray-900 bg-white px-3 py-1 rounded-lg border border-gray-200 shadow-sm">
                            {c.codigo}
                          </span>
                          <span className="text-xs font-black text-[#00b050] bg-green-100 px-2.5 py-1 rounded-full">
                            {c.tipo === "fijo" ? `-$${c.descuento} USD` : `-${c.descuento}% OFF`}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          Canjeado en pedidos: <strong className="text-gray-800">{c.usos || 0} veces</strong>
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleCupon(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            c.activo ? "bg-amber-100 text-amber-800 hover:bg-amber-200" : "bg-[#00b050] text-white"
                          }`}
                        >
                          {c.activo ? "Pausar" : "Activar"}
                        </button>
                        <button
                          onClick={() => eliminarCupon(c.id)}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                          title="Eliminar cupón"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================== PESTAÑA 3: MÉTRICAS Y RANKING ==================== */}
        {tab === "metricas" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div>
                <h3 className="text-lg font-black text-gray-900">Rendimiento de Productos en Tiempo Real</h3>
                <p className="text-xs text-gray-500">Cada vez que un visitante abre la ficha de un producto o envía un pedido a WhatsApp, suma +1 automáticamente.</p>
              </div>
              <button
                onClick={reiniciarTodasLasMetricas}
                className="text-xs font-bold text-red-600 hover:bg-red-50 border border-red-200 px-4 py-2 rounded-xl transition-colors"
              >
                Reiniciar Todos los Contadores
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* TOP 10 MÁS CLICKEADOS */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-wider text-blue-600 mb-4">
                  👁️ Top 10 · Productos Más Clickeados (Vistos)
                </h4>
                <div className="space-y-3">
                  {topClics.map((p, idx) => {
                    const pct = Math.round((Number(p.clics || 0) / maxClics) * 100);
                    return (
                      <div key={p.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-800">
                          <span>
                            #{idx + 1} · {p.nombre} <span className="text-gray-400 font-normal">{p.dosis}</span>
                          </span>
                          <span className="text-blue-600">{Number(p.clics || 0)} clics</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* TOP 10 MÁS PEDIDOS EN WHATSAPP */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <h4 className="text-sm font-black uppercase tracking-wider text-[#00b050] mb-4">
                  🛒 Top 10 · Más Enviados en Pedidos a WhatsApp
                </h4>
                <div className="space-y-3">
                  {topPedidos.map((p, idx) => {
                    const pct = Math.round((Number(p.pedidos || 0) / maxPedidos) * 100);
                    return (
                      <div key={p.id} className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-gray-800">
                          <span>
                            #{idx + 1} · {p.nombre} <span className="text-gray-400 font-normal">{p.dosis}</span>
                          </span>
                          <span className="text-[#00b050]">{Number(p.pedidos || 0)} unidades</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className="h-full bg-[#00b050] rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Formulario de Producto */}
        <div id="form-modal" className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 hidden flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h2 className="text-xl font-bold text-gray-800">{editando ? "Editar Producto" : "Nuevo Producto"}</h2>
              <button
                type="button"
                onClick={() => document.getElementById("form-modal")?.classList.add("hidden")}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <form onSubmit={guardarProducto} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Nombre</label>
                  <input
                    required
                    type="text"
                    value={form.nombre}
                    onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#00b050]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Dosis (Opcional)</label>
                  <input
                    type="text"
                    placeholder="Ej: 10MG (o vacío)"
                    value={form.dosis || ""}
                    onChange={(e) => setForm({ ...form, dosis: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#00b050]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Precio (USD)</label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    value={form.precio}
                    onChange={(e) => setForm({ ...form, precio: parseFloat(e.target.value) })}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#00b050]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-500 mb-1 block">Categoría Científica</label>
                <select
                  value={form.categoria || ""}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                  className="w-full bg-white border border-gray-200 p-3 rounded-lg text-sm text-gray-800 focus:outline-none focus:border-[#00b050]"
                >
                  <option value="">Automática (Detectar según el nombre del péptido)</option>
                  {CATEGORIAS_CIENTIFICAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="border border-gray-200 p-4 rounded-lg bg-gray-50">
                <label className="text-xs font-bold text-gray-500 mb-2 block">Imagen del Producto</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleSubirFoto}
                  className="text-sm text-gray-600 w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-[#00b050] hover:file:bg-green-100"
                />
                {subiendoFoto && <span className="text-xs text-blue-500 block mt-2">Optimizando y subiendo imagen...</span>}
                {form.imagen && <img src={form.imagen} alt="Preview" className="h-20 object-contain mt-3 rounded border border-gray-200 bg-white" />}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Resumen Corto (ES)</label>
                  <textarea
                    required
                    value={form.descripcion_es}
                    onChange={(e) => setForm({ ...form, descripcion_es: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-xs text-gray-800 h-16"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Resumen Corto (PT)</label>
                  <textarea
                    required
                    value={form.descripcion_pt}
                    onChange={(e) => setForm({ ...form, descripcion_pt: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-xs text-gray-800 h-16"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-500 mb-1 block">Resumen Corto (EN)</label>
                  <textarea
                    required
                    value={form.descripcion_en}
                    onChange={(e) => setForm({ ...form, descripcion_en: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-2.5 rounded-lg text-xs text-gray-800 h-16"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-3">
                <p className="text-xs font-bold text-gray-700 mb-2">
                  Ficha Técnica Detallada / Composición / Recomendaciones (Opcional - se muestra al abrir el producto)
                </p>
                <div className="space-y-3">
                  <textarea
                    placeholder="Detalles completos en Español (composición, secuencia, protocolo de estudio...)"
                    value={form.detalles_es || ""}
                    onChange={(e) => setForm({ ...form, detalles_es: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg text-xs text-gray-800 h-20"
                  />
                  <textarea
                    placeholder="Detalhes completos em Português (opcional)"
                    value={form.detalles_pt || ""}
                    onChange={(e) => setForm({ ...form, detalles_pt: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg text-xs text-gray-800 h-16"
                  />
                  <textarea
                    placeholder="Full details in English (optional)"
                    value={form.detalles_en || ""}
                    onChange={(e) => setForm({ ...form, detalles_en: e.target.value })}
                    className="w-full bg-white border border-gray-200 p-3 rounded-lg text-xs text-gray-800 h-16"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="visible"
                  checked={form.visible}
                  onChange={(e) => setForm({ ...form, visible: e.target.checked })}
                  className="w-4 h-4 text-[#00b050] rounded border-gray-300 focus:ring-[#00b050]"
                />
                <label htmlFor="visible" className="text-sm text-gray-700 font-semibold">
                  Producto Visible en Tienda
                </label>
              </div>

              <div className="flex gap-4 pt-6 border-t border-gray-100 mt-6">
                <button
                  type="button"
                  onClick={() => document.getElementById("form-modal")?.classList.add("hidden")}
                  className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-[#00b050] hover:bg-[#009040] text-white font-bold py-3 rounded-lg shadow-md">
                  {editando ? "Guardar Cambios" : "Agregar Producto"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}