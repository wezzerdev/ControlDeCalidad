import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/common/Button';
import { 
  BarChart2, 
  FileText, 
  Shield, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  Server, 
  Users, 
  HelpCircle, 
  Menu, 
  X, 
  LayoutDashboard,
  Package,
  Smartphone,
  Zap,
  Briefcase
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-y-auto">
      {/* Navbar */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-primary/10 p-2 rounded-lg">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-foreground">ConstruLab SaaS</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {loading ? (
               <div className="h-10 w-32 bg-muted animate-pulse rounded-md"></div>
            ) : user ? (
              <Link to="/app/dashboard">
                <Button>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Ir al Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Iniciar Sesión</Button>
                </Link>
                <Link to="/register">
                  <Button>Comenzar Gratis</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-foreground p-2 rounded-md hover:bg-accent"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border bg-card">
            <div className="px-4 py-6 space-y-4 flex flex-col">
              {loading ? (
                 <div className="h-10 w-full bg-muted animate-pulse rounded-md"></div>
              ) : user ? (
                <Link to="/app/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full justify-center">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Ir al Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">Iniciar Sesión</Button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full justify-center">Comenzar Gratis</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-24 lg:pt-32 lg:pb-40 min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20 mb-6">
            ✨ Gestión Integral de Laboratorios 2.0
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground mb-6">
            Control Total de <span className="text-primary">Calidad, Inventario</span> <br />
            y Procesos de Obra
          </h1>
          <p className="mt-4 text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
            La plataforma todo en uno que digitaliza tu laboratorio. Gestiona muestras, controla tu inventario de equipos y reactivos, y emite certificados normativos en segundos.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="w-full sm:w-auto text-lg px-8 py-6 shadow-lg shadow-primary/25">
                Prueba Gratis 14 Días
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="outline" size="lg" className="w-full sm:w-auto text-lg px-8 py-6">
                Ver Demo en Vivo
              </Button>
            </Link>
          </div>
          
          <div className="mt-12 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-sm text-muted-foreground grayscale opacity-70">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Normas NMX / ASTM
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Control de Inventarios
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> App Móvil Offline
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" /> Roles y Permisos
            </div>
          </div>
        </div>
        
        {/* Background gradient blob */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl z-0 opacity-30 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-primary rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-20 w-72 h-72 bg-primary/80 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary/60 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </section>

      {/* Modules Highlight Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Todo tu Laboratorio en una Sola Plataforma</h2>
            <p className="mt-4 text-lg text-muted-foreground">Deja de usar múltiples hojas de cálculo desconectadas.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <ModuleCard 
              icon={<Briefcase className="h-6 w-6 text-blue-500" />}
              title="Gestión de Proyectos"
              description="Administra múltiples obras, asigna personal y vincula normas específicas a cada proyecto."
              color="bg-blue-500/10"
            />
            <ModuleCard 
              icon={<Package className="h-6 w-6 text-orange-500" />}
              title="Inventarios y Equipos"
              description="Controla stock de reactivos, calibración de prensas y ubicación de moldes en tiempo real."
              color="bg-orange-500/10"
            />
             <ModuleCard 
              icon={<FileText className="h-6 w-6 text-green-500" />}
              title="Normas Personalizables"
              description="Crea y edita tus propias normas (Locales o Privadas) o usa las plantillas NMX/ASTM incluidas."
              color="bg-green-500/10"
            />
            <ModuleCard 
              icon={<Users className="h-6 w-6 text-purple-500" />}
              title="Roles y Accesos"
              description="Perfiles específicos para Técnicos, Residentes, Gerentes y Administradores."
              color="bg-purple-500/10"
            />
          </div>
        </div>
      </section>

      {/* Solutions by Role Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-foreground">Una Solución, Múltiples Perspectivas</h2>
                <p className="mt-4 text-lg text-muted-foreground">Herramientas especializadas para cada miembro de tu equipo.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <RoleCard 
                    title="Gerentes de Calidad"
                    features={[
                        "Dashboard de KPIs en tiempo real",
                        "Control de facturación y rentabilidad",
                        "Supervisión remota de técnicos",
                        "Auditoría de logs de actividad"
                    ]}
                    image="/images/role-manager.jpg"
                    fallback="/images/role-manager.jpg"
                />
                 <RoleCard 
                    title="Técnicos de Campo"
                    features={[
                        "App móvil con modo offline",
                        "Cálculos automáticos en sitio",
                        "Validación inmediata de errores",
                        "Escaneo de códigos QR"
                    ]}
                    image="/images/role-tech.jpg"
                    fallback="/images/role-tech.jpg"
                />
                 <RoleCard 
                    title="Residentes de Obra"
                    features={[
                        "Consulta de informes 24/7",
                        "Notificaciones de resultados críticos",
                        "Historial completo de la obra",
                        "Solicitud de servicios desde app"
                    ]}
                    image="/images/role-resident.jpg"
                    fallback="/images/role-resident.jpg"
                />
            </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Flujo de Trabajo Simplificado</h2>
            <p className="mt-4 text-lg text-muted-foreground">Elimina el papel y los errores humanos en 3 simples pasos.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent z-0"></div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-card border-2 border-primary/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Recepción</h3>
              <p className="text-muted-foreground">Registra la muestra y genera automáticamente una etiqueta con código QR único para trazabilidad total.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-card border-2 border-primary/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Ensayo</h3>
              <p className="text-muted-foreground">Los técnicos capturan datos en tabletas usando formularios validados que alertan si hay errores.</p>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-card border-2 border-primary/20 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <span className="text-3xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Informe</h3>
              <p className="text-muted-foreground">El sistema calcula resultados y genera el certificado PDF listo para firmar y enviar al cliente.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Standards Library Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-foreground">Biblioteca Normativa Incluida</h2>
                <p className="mt-4 text-lg text-muted-foreground">Soportamos las normas más utilizadas en la industria de la construcción.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                <StandardGroup title="Concreto Hidráulico">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> NMX-C-414 (Cabecería)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> NMX-C-155 (Especificaciones)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> NMX-C-083 (Resistencia)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> ASTM C39 / C143</li>
                    </ul>
                </StandardGroup>
                <StandardGroup title="Terracerías y Suelos">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> NMX-C-416 (Proctor)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> ASTM D1557 (Compactación)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> ASTM D1883 (CBR)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> Límites de Atterberg</li>
                    </ul>
                </StandardGroup>
                 <StandardGroup title="Aceros de Refuerzo">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> NMX-B-172 (Tensión)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> NMX-B-113 (Doblado)</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> ASTM A615 / A706</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> Corrugaciones</li>
                    </ul>
                </StandardGroup>
                 <StandardGroup title="Mezclas Asfálticas">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> Protocolo AMAAC</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> Contenido de Asfalto</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> Granulometría</li>
                        <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-green-500"/> Marshall / Superpave</li>
                    </ul>
                </StandardGroup>
            </div>
            <div className="mt-12 text-center">
                 <p className="text-sm text-muted-foreground">¿No ves tu norma? <span className="font-semibold text-primary">Nuestro motor de normas permite crear cualquier especificación personalizada.</span></p>
            </div>
        </div>
      </section>

      {/* Security & Privacy Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 text-sm font-medium mb-6">
                <Shield className="mr-2 h-4 w-4" /> Seguridad de Datos
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                Tus datos están seguros y siempre disponibles
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Entendemos que la información de tus ensayos es crítica. Por eso utilizamos estándares de seguridad bancaria para proteger tu información.
              </p>
              
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="bg-background p-2 rounded-lg border border-border h-fit">
                    <Lock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Encriptación de Extremo a Extremo</h4>
                    <p className="text-sm text-muted-foreground">Todos los datos viajan encriptados mediante SSL/TLS y se almacenan seguros en la nube.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="bg-background p-2 rounded-lg border border-border h-fit">
                    <Server className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Respaldos Automáticos</h4>
                    <p className="text-sm text-muted-foreground">Realizamos copias de seguridad diarias para garantizar que nunca pierdas un resultado.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="bg-background p-2 rounded-lg border border-border h-fit">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Control de Acceso Granular</h4>
                    <p className="text-sm text-muted-foreground">Tú defines quién puede ver, editar o eliminar información mediante roles de usuario.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-2xl blur-3xl transform rotate-3"></div>
              <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
                <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                  <span className="ml-2 text-xs text-muted-foreground">security-check.log</span>
                </div>
                <div className="space-y-3 font-mono text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-green-500">System Operational</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Encryption:</span>
                    <span className="text-blue-500">AES-256 Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Backup:</span>
                    <span className="text-foreground">Just now</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Uptime:</span>
                    <span className="text-foreground">99.99%</span>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
                    &gt; Verificando integridad de datos... OK<br/>
                    &gt; Sincronizando réplicas... OK<br/>
                    &gt; Acceso seguro establecido.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Funcionalidades Potentes</h2>
            <p className="mt-4 text-lg text-muted-foreground">Herramientas diseñadas específicamente para técnicos y gerentes de calidad.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard 
              icon={<Smartphone className="h-8 w-8 text-primary" />}
              title="Modo Offline"
              description="Trabaja sin conexión a internet en obra. Los datos se sincronizan automáticamente cuando recuperas la señal."
            />
            <FeatureCard 
              icon={<Shield className="h-8 w-8 text-primary" />}
              title="Trazabilidad Total"
              description="Generación de códigos QR para cada muestra. Rastrea ubicación, estado y responsable en tiempo real."
            />
            <FeatureCard 
              icon={<BarChart2 className="h-8 w-8 text-primary" />}
              title="Informes Automáticos"
              description="Genera certificados de calidad en PDF con un solo clic. Firmas digitales y formatos personalizables."
            />
             <FeatureCard 
              icon={<Zap className="h-8 w-8 text-primary" />}
              title="Alertas en Tiempo Real"
              description="Recibe notificaciones inmediatas sobre resultados fuera de norma o muestras pendientes de ensayo."
            />
             <FeatureCard 
              icon={<FileText className="h-8 w-8 text-primary" />}
              title="Biblioteca Normativa"
              description="Acceso a normas actualizadas. Configura límites de aceptación y rechazo automáticos."
            />
             <FeatureCard 
              icon={<Users className="h-8 w-8 text-primary" />}
              title="Trabajo Colaborativo"
              description="Múltiples usuarios trabajando simultáneamente en los mismos proyectos sin conflictos de datos."
            />
          </div>
        </div>
      </section>

      {/* Tech Specs Section */}
      <section className="py-20 bg-muted/30 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground">Ficha Técnica Completa</h2>
            <p className="mt-4 text-lg text-muted-foreground">Tecnología confiable y preparada para operación en campo.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <BarChart2 className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Arquitectura</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>React 18 + Vite 6 + TypeScript</li>
                <li>UI con TailwindCSS</li>
                <li>Estado local con Zustand</li>
                <li>Ruteo con React Router 7</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Server className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Backend</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Supabase Auth + Postgres</li>
                <li>Políticas RLS por rol y permisos</li>
                <li>Logs y notificaciones en tiempo real</li>
                <li>Migraciones SQL versionadas</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Seguridad</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>SSL/TLS y encriptación de datos</li>
                <li>Control granular de permisos</li>
                <li>Auditoría de actividad de usuarios</li>
                <li>Respaldos automáticos</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Smartphone className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Móvil</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Modo offline para obra</li>
                <li>Sincronización automática</li>
                <li>Lectura de códigos QR</li>
                <li>Interfaz optimizada para tablets</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Package className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Inventarios</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Equipos, reactivos y materiales</li>
                <li>Estados operativos y mantenimiento</li>
                <li>Ubicación por proyecto</li>
                <li>Alertas por mínimo en stock</li>
              </ul>
            </div>
            
            <div className="bg-card p-6 rounded-xl border border-border">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="h-6 w-6 text-primary" />
                <h3 className="text-lg font-bold text-foreground">Informes</h3>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Certificados PDF personalizables</li>
                <li>Plantillas por cliente o proyecto</li>
                <li>Firmas digitales</li>
                <li>Exportación a CSV/Excel</li>
              </ul>
            </div>
          </div>
        </div>
      </section>
 
      {/* FAQ Section */}
      <section className="py-20 bg-muted/30 border-t border-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground">Preguntas Frecuentes</h2>
          </div>
          
          <div className="space-y-6">
            <FaqItem 
              question="¿Dónde se guardan mis datos?"
              answer="Tus datos se alojan en servidores seguros de AWS (Amazon Web Services) con redundancia geográfica. Esto significa que si un servidor falla, tu información está segura en otro."
            />
            <FaqItem 
              question="¿Puedo exportar mi información?"
              answer="Sí, absolutamente. Tus datos son tuyos. Puedes exportar todos tus informes, registros de muestras y bases de datos a formatos estándar como Excel o CSV en cualquier momento."
            />
            <FaqItem 
              question="¿Qué pasa si pierdo mi conexión a internet?"
              answer="Nuestra aplicación guarda los datos localmente en tu dispositivo mientras trabajas. Una vez que recuperas la conexión, todo se sincroniza automáticamente con la nube."
            />
            <FaqItem 
              question="¿Puedo personalizar los informes?"
              answer="Sí, puedes configurar plantillas de certificados con tu propio logotipo, colores corporativos y formatos específicos."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-primary/5 rounded-2xl p-12 border border-primary/10">
            <h2 className="text-3xl font-bold text-foreground mb-6">¿Listo para modernizar tu laboratorio?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Únete a los laboratorios que ya están ahorrando horas de trabajo administrativo cada semana.
            </p>
            <Link to="/register">
              <Button size="lg">Crear Cuenta Ahora</Button>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">No requiere tarjeta de crédito • Cancela cuando quieras</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-primary/10 p-1.5 rounded-md">
                   <BarChart2 className="h-5 w-5 text-primary" />
                </div>
                <span className="font-bold text-foreground">ConstruLab SaaS</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Software especializado para el control de calidad en la industria de la construcción.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Producto</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Características</a></li>
                <li><a href="#" className="hover:text-foreground">Precios</a></li>
                <li><a href="#" className="hover:text-foreground">Seguridad</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Recursos</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground">Documentación</a></li>
                <li><a href="#" className="hover:text-foreground">Blog</a></li>
                <li><a href="#" className="hover:text-foreground">Soporte</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link to="/legal/privacy" className="hover:text-foreground">Privacidad</Link></li>
                <li><Link to="/legal/terms" className="hover:text-foreground">Términos</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div>© {new Date().getFullYear()} ConstruLab Inc. Todos los derechos reservados.</div>
            <div className="flex gap-4 mt-4 md:mt-0">
              {/* Social icons placeholder */}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-shadow">
      <div className="bg-background w-14 h-14 rounded-lg flex items-center justify-center mb-6 shadow-sm border border-border/50">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function ModuleCard({ icon, title, description, color }: { icon: React.ReactNode, title: string, description: string, color: string }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border hover:border-primary/50 transition-colors group">
      <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 ${color} group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

function RoleCard({ title, features, image, fallback }: { title: string, features: string[], image: string, fallback?: string }) {
  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden">
      <div className="h-36 w-full overflow-hidden">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover" 
          onError={(e) => { e.currentTarget.src = fallback || '/images/role-tech.jpg'; }}
        />
      </div>
      <div className="p-6">
        <h3 className="text-lg font-bold text-foreground mb-4">{title}</h3>
        <ul className="space-y-2">
          {features.map((f, idx) => (
            <li key={idx} className="flex items-start text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 mr-2" />
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StandardGroup({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-card p-6 rounded-xl border border-border">
      <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function FaqItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <div className="border border-border rounded-lg bg-card overflow-hidden">
      <button 
        className="w-full px-6 py-4 text-left flex justify-between items-center font-medium hover:bg-muted/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        {question}
        <HelpCircle className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 py-4 border-t border-border bg-muted/20 text-muted-foreground">
          {answer}
        </div>
      )}
    </div>
  );
}
