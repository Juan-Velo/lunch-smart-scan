# School Bites

1. Problema

¿Cuál es el problema?: Alto consumo de comida chatarra y ultraprocesados en escolares debido a la falta de opciones saludables, colas caóticas en el quiosco y falta de supervisión parental en el punto de venta.

¿Por qué es un problema?: Genera problemas de salud a largo plazo (sobrepeso, obesidad infantil, malnutrición) y desaprovecha el tiempo del recreo en filas lentas.

¿Por qué? (5 Porqués):

¿Por qué el alumno come mal? Porque compra ultraprocesados rápidos en el quiosco con el dinero en efectivo que le dan.

¿Por qué compra ultraprocesados y no opciones sanas? Porque son más accesibles, rápidos de entregar y no hay una oferta personalizada atractiva.

¿Por qué el quiosco prioriza snacks empacados? Porque el tiempo del recreo es corto (15-20 min) y despachar comida fresca preparada genera cuellos de botella.

¿Por qué los padres no intervienen? Porque no tienen tiempo de preparar lonchera ni visibilidad de lo que el quiosco vende en el momento.

¿Por qué no hay personalización ni control? Porque no existe un sistema que cruce el perfil nutricional del niño con un mecanismo de despacho express sin efectivo.

2. Usuario & Actores

Usuario (¿Quiénes tienen el problema / a quiénes impacta?):

Padres y madres de familia (comprador/supervisor): Necesitan asegurar nutrición adecuada sin invertir tiempo matutino cocinando.

Estudiantes (usuario final/consumidor): Necesitan recibir su comida rápido para disfrutar su recreo sin cargar dinero físico.

Actores / Stakeholders:

Personal y concesionario del quiosco escolar (operador de despacho).

Dirección del colegio y profesores (supervisores del bienestar estudiantil).

Nutricionistas escolares / APAFA.

Sponsor:

Dirección del Colegio / Consorcio Educativo / Empresa concesionaria de alimentos.

3. Hipótesis

Si los padres preordenan loncheras basadas en el perfil nutricional del alumno y el quiosco despacha mediante escaneo de QR:

Se reducirán los tiempos de atención en el recreo de minutos a segundos por alumno.

Se eliminará el uso de efectivo escolar, asegurando que el presupuesto se destine 100% a alimentos balanceados.

El quiosco podrá optimizar su producción matutina conociendo la demanda exacta por perfil calórico.

4. Solución & Solución Priorizada

¿Cómo será la solución?: Plataforma omnicanal (App Padres + Web/POS Quiosco). El padre configura el perfil de salud de su hijo (edad, peso, alergias, nivel de actividad) y recibe sugerencias de combos. Al preordenar, se asigna el pedido al QR único del fotocheck/credencial del alumno. En el recreo, el quiosco escanea el QR, valida el pedido y entrega el pack listo en segundos.

Output esperado:

App Móvil para padres con catálogo dinámico y sugerencias nutricionales inteligentes.

Módulo POS / Escáner QR para el personal del quiosco con confirmación visual instantánea del pedido.

Carnet / Fotocheck digital o físico con código QR dinámico/estático por alumno.

Reporte periódico de consumo de macro/micronutrientes para los padres.

Solución priorizada / Tipo de modelo analítico:

Descriptivo: Dashboard de consumo calórico, registro histórico de asistencia al quiosco y métricas de velocidad de despacho.

Predictivo: Modelo de previsión de demanda de ingredientes diarios según las tendencias de preorden y el calendario escolar.

Prescriptivo / Recomendador (Core Inteligente): Motor de recomendación nutricional que sugiere loncheras personalizadas optimizando presupuesto, balance calórico diario y restricciones de salud (alergias/intolerancias).

5. Data

Data interna:

Registro de estudiantes (ID, grado, sección, edad, alergias, restricciones médicas).

Catálogo de productos con desglose de macronutrientes, calorías, alérgenos y costos.

Registro de transacciones (logs de escaneo de QR, tiempo de atención, preórdenes confirmadas).

Data externa:

Tablas nutricionales oficiales (Ministerio de Salud / OMS) de requerimientos calóricos infantiles por edad y etapa de desarrollo.

Calendario escolar institucional (evaluaciones, eventos deportivos, días festivos).

Data a recolectar / crear fácilmente:

Registro de entrega por escaneo (Timestamp de escaneo de QR vs entrega).

Feedback y calificación del niño/padre sobre la lonchera recibida (1 a 5 estrellas).

Preferencias de sabor declaradas (ej. no le gusta la manzana, prefiere cítricos).

6. Métricas Claves

Métricas de Adopción y Experiencia:

% de alumnos que utilizan el sistema de despacho por QR en el recreo.

Tasa de preorden semanal recurrente por parte de los padres.

NPS (Net Promoter Score) de satisfacción de padres y concesionarios.

Métricas de Eficiencia Operativa (Quiosco):

Tiempo promedio de despacho por alumno en mostrador (meta: < 10 segundos).

% de reducción en merma de alimentos perecibles por sobreproducción.

Métricas de Impacto en Salud:

Cumplimiento del perfil calórico recomendado (% de preórdenes dentro de los parámetros saludables).

% de incidentes por alergias evitados gracias al filtrado preventivo del sistema.

7. Impacto

En los Padres: Cero fricción matutina, tranquilidad absoluta y trazabilidad en tiempo real sobre la alimentación escolar de sus hijos.

En el Estudiante: Recreos más largos y entretenidos (sin colas interminables), meriendas ricas adaptadas a sus gustos y necesidades energéticas.

En el Quiosco / Colegio:

Operación ágil y libre de manejo de efectivo (menor riesgo de pérdidas o errores de caja).

Mayor volumen de ventas por automatización y capacidad de despacho express.

Certificación y reputación de la institución como entorno escolar saludable y tecnológico.

8. Acciones / Siguientes Pasos

Fase 1 (Arquitectura & Perfilado): Diseñar el modelo de datos para perfiles nutricionales infantiles y armar el catálogo base con validación de un nutricionista.

Fase 2 (Prototipo del Flujo QR): Desarrollar un MVP funcional que permita generar una preorden básica y leer el QR del estudiante desde un smartphone/tablet en el mostrador.

Fase 3 (Algoritmo Recomendador): Integrar el motor de sugerencias personalizadas en la app de los padres según el perfil de salud ingresado.

Fase 4 (Piloto en Colegio): Implementar una prueba piloto de 2 semanas en un nivel educativo específico (ej. 3ro y 4to de primaria) para calibrar la velocidad de escaneo y entrega en el recreo.



Desarrolla esta app.... como solo será un mockup, entonces puedes manejar roles y que me permita ver la vista del padre y la vista de quiosco en una sola app.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://lunch-smart-scan.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/7eca6ef5-75ac-4427-a90c-d04e5e21ea11).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
