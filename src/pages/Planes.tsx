import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Check, Info } from 'lucide-react';
import { plans } from '../data/plans';
import { useCompany } from '../context/CompanyContext';
import { useToast } from '../context/ToastContext';

export default function Planes() {
  const { companyInfo, updatePlan } = useCompany();
  const { addToast } = useToast();

  const handleSelectPlan = (planId: string) => {
    updatePlan(planId);
    addToast('Plan actualizado correctamente', 'success');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Planes y Precios</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Elige el plan que mejor se adapte a las necesidades de tu laboratorio. 
          Escala sin problemas a medida que creces.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8">
        {plans.map((plan) => {
          const isCurrent = companyInfo.planId === plan.id;
          return (
            <Card key={plan.id} className={`relative flex flex-col ${isCurrent ? 'border-primary ring-2 ring-primary ring-offset-2' : ''}`}>
              {isCurrent && (
                <div className="absolute top-0 right-0 -mt-2 -mr-2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full shadow-sm">
                  ACTUAL
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline text-foreground">
                  <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                  {plan.period && <span className="ml-1 text-xl font-semibold text-muted-foreground">/{plan.period}</span>}
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col justify-between">
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <div className="flex-shrink-0">
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                      <p className="ml-3 text-sm text-foreground">{feature}</p>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant={isCurrent ? 'outline' : 'primary'} 
                  className="w-full"
                  disabled={isCurrent}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrent ? 'Plan Actual' : 'Seleccionar Plan'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-lg p-6 flex items-start space-x-4 mt-12">
        <Info className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-semibold text-foreground">¿Necesitas una norma específica?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Nuestro equipo puede digitalizar normas locales o especificaciones privadas para tu laboratorio. 
            Contáctanos para una cotización de implementación personalizada.
          </p>
        </div>
      </div>
    </div>
  );
}
