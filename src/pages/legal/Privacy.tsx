import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/common/Card';

export function Privacy() {
  return (
    <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-foreground">Política de Privacidad</CardTitle>
            <p className="text-sm text-muted-foreground">Última actualización: {new Date().toLocaleDateString()}</p>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none space-y-6 text-foreground">
            <section>
              <h3 className="text-xl font-semibold">1. Introducción</h3>
              <p>
                En ConstruLab SaaS ("nosotros", "nuestro" o "la Empresa"), respetamos su privacidad y estamos comprometidos a proteger sus datos personales. 
                Esta política de privacidad explica cómo recopilamos, usamos, divulgamos y salvaguardamos su información cuando utiliza nuestra plataforma SaaS.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">2. Información que Recopilamos</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Información de la Cuenta:</strong> Nombre, dirección de correo electrónico, nombre de la empresa y contraseña encriptada.</li>
                <li><strong>Datos del Servicio:</strong> Información sobre proyectos, muestras, ensayos y resultados ingresados en el sistema.</li>
                <li><strong>Información de Uso:</strong> Datos técnicos sobre cómo interactúa con nuestro servicio (logs, dirección IP, tipo de navegador).</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">3. Uso de la Información</h3>
              <p>Utilizamos la información recopilada para:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Proporcionar, operar y mantener nuestros servicios.</li>
                <li>Mejorar, personalizar y expandir nuestra plataforma.</li>
                <li>Entender y analizar cómo utiliza nuestros servicios.</li>
                <li>Desarrollar nuevos productos, servicios, características y funcionalidades.</li>
                <li>Comunicarnos con usted, directamente o a través de uno de nuestros socios, para servicio al cliente, actualizaciones y fines de marketing.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-xl font-semibold">4. Seguridad de los Datos</h3>
              <p>
                Implementamos medidas de seguridad técnicas y organizativas apropiadas para proteger sus datos personales contra el acceso no autorizado, 
                la alteración, la divulgación o la destrucción. Utilizamos encriptación SSL/TLS para la transmisión de datos y almacenamiento seguro en la nube.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">5. Derechos ARCO</h3>
              <p>
                Usted tiene derecho a Acceder, Rectificar, Cancelar y Oponerse al tratamiento de sus datos personales. 
                Para ejercer estos derechos, por favor contáctenos a través de nuestro soporte técnico.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">6. Retención de Datos</h3>
              <p>
                Conservaremos su información personal solo durante el tiempo que sea necesario para los fines establecidos en esta política de privacidad, 
                a menos que se requiera o permita un período de retención más largo por ley.
              </p>
            </section>

            <section>
              <h3 className="text-xl font-semibold">7. Contacto</h3>
              <p>
                Si tiene preguntas sobre esta política de privacidad, por favor contáctenos en: legal@construlab.com
              </p>
            </section>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
