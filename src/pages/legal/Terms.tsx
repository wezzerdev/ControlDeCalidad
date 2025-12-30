import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

export function Terms() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">Términos y Condiciones de Uso</CardTitle>
            <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h3 className="text-xl font-semibold">1. Aceptación de los Términos</h3>
              <p>
                Al acceder o utilizar ConstruLab SaaS, usted acepta estar legalmente vinculado por estos Términos y Condiciones. 
                Si no está de acuerdo con alguna parte de los términos, no podrá acceder al servicio.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">2. Descripción del Servicio</h3>
              <p>
                ConstruLab SaaS es una plataforma de gestión para laboratorios de construcción que permite administrar proyectos, muestras, ensayos y certificados. 
                El servicio se proporciona "tal cual" (as-is) y "según disponibilidad".
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">3. Cuentas de Usuario</h3>
              <p>
                Usted es responsable de salvaguardar la contraseña que utiliza para acceder al servicio y de cualquier actividad o acción bajo su contraseña. 
                Debe notificarnos inmediatamente al darse cuenta de cualquier violación de seguridad o uso no autorizado de su cuenta.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">4. Propiedad Intelectual</h3>
              <p>
                El Servicio y su contenido original, características y funcionalidad son y seguirán siendo propiedad exclusiva de ConstruLab Inc. y sus licenciantes. 
                El Servicio está protegido por derechos de autor, marcas registradas y otras leyes.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">5. Limitación de Responsabilidad</h3>
              <div className="bg-muted/50 p-4 rounded-lg border border-border text-sm">
                <p className="font-bold mb-2">IMPORTANTE: DESLINDE DE RESPONSABILIDAD</p>
                <p>
                  En ningún caso ConstruLab Inc., ni sus directores, empleados, socios, agentes, proveedores o afiliados, serán responsables por daños indirectos, 
                  incidentales, especiales, consecuentes o punitivos, incluyendo sin limitación, pérdida de beneficios, datos, uso, buena voluntad, u otras pérdidas intangibles, 
                  resultantes de:
                </p>
                <ul className="list-disc pl-5 mt-2 space-y-1">
                  <li>Su acceso o uso o la imposibilidad de acceder o usar el Servicio;</li>
                  <li>Cualquier error en los cálculos, reportes o certificados generados por el software. <strong>El usuario final es el único responsable de verificar y validar técnicamente todos los resultados antes de su emisión oficial.</strong></li>
                  <li>Cualquier conducta o contenido de cualquier tercero en el Servicio;</li>
                  <li>Acceso no autorizado, uso o alteración de sus transmisiones o contenido.</li>
                </ul>
              </div>
            </section>

            <section>
              <h3 className="text-xl font-semibold">6. Exactitud de la Información Técnica</h3>
              <p>
                Aunque nos esforzamos por mantener actualizadas las normas y fórmulas (NMX, ASTM, ACI), no garantizamos que el software esté libre de errores. 
                Es responsabilidad exclusiva del laboratorio y sus técnicos calificados validar que los procedimientos y cálculos cumplan con la normativa vigente aplicable a cada proyecto.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">7. Modificaciones al Servicio</h3>
              <p>
                Nos reservamos el derecho de retirar o modificar nuestro Servicio, y cualquier servicio o material que proporcionemos, a nuestra entera discreción y sin previo aviso.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">8. Ley Aplicable</h3>
              <p>
                Estos Términos se regirán e interpretarán de acuerdo con las leyes vigentes, sin tener en cuenta sus disposiciones sobre conflictos de leyes.
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
