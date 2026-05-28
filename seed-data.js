/* ─────────────────────────────────────────────────────────
   FCNOISE — Seed desde Hoja de Cálculo
   Se ejecuta UNA sola vez (guarda marca en localStorage).
   Después de cargar los datos se puede eliminar este archivo.
   ───────────────────────────────────────────────────────── */
(function () {
  const SEED_KEY = 'fcn_seeded_sheet1';
  if (localStorage.getItem(SEED_KEY)) return; // ya corrió

  const t0 = Date.now();
  const u  = (i) => 's' + (t0 + i).toString(36);
  let   idx = 0;
  const id  = () => u(idx++);

  /* ── PROYECTOS ── */
  const PROJ = [
    { id:'p-fantasy',      name:'Fantasy',                icon:'⚽', area:'marketing',   team:['leonardo','veronica'] },
    { id:'p-financecup',   name:'Finance Cup',             icon:'💼', area:'ventas',       team:['leonardo','veronica','laura'] },
    { id:'p-contenidojun', name:'Contenido Junio',         icon:'📣', area:'marketing',    team:['veronica','leonardo'] },
    { id:'p-embajadores',  name:'Embajadores',             icon:'🌟', area:'ventas',       team:['leonardo','veronica'] },
    { id:'p-40cup',        name:'40 CUP',                  icon:'🏅', area:'ventas',       team:['leonardo','veronica'] },
    { id:'p-datos',        name:'Sistema Datos Partido',   icon:'📊', area:'operaciones',  team:[] },
    { id:'p-community',    name:'Community',               icon:'👥', area:'marketing',    team:[] },
    { id:'p-sponsors',     name:'Sponsorships',            icon:'🤝', area:'ventas',       team:[] },
    { id:'p-veo',          name:'VEO Cams',                icon:'📹', area:'marketing',    team:[] },
  ].map((p, i) => ({
    ...p, desc:'', meth:'lista', type:'once', cycle:null,
    status:'active', createdAt: t0 + i * 10
  }));

  /* ── HELPER ── */
  const leo  = ['leonardo'];
  const vero = ['veronica'];
  const dos  = ['leonardo', 'veronica'];

  function tarea(projId, name, { desc='', assign=[], start='', end='', st='pendiente' } = {}) {
    const done = st === 'completada';
    return {
      id: id(), taskType:'tarea', projectId:projId,
      name, desc, area:'general', priority:'media',
      startDate:start, endDate:end, dueDate:end,
      assignedUsers:assign,
      kStatus:'investigacion', calStatus:'idea', taskStatus:st,
      status: done ? 'done' : 'pending',
      createdAt: t0 + idx * 7
    };
  }

  /* ── TAREAS ── */
  const TASKS = [

    /* ── FANTASY ── */
    tarea('p-fantasy', 'Escribir a cada uno siguiendo el website',
          { desc:'Invitar a todos los jugadores CFL', assign:leo, start:'2026-05-28', end:'2026-06-04', st:'en-proceso' }),
    tarea('p-fantasy', 'Crear mensaje custom para invitar a todo el mundo',
          { desc:'Invitar a todos los jugadores CFL', assign:leo, st:'en-proceso' }),
    tarea('p-fantasy', 'Crear cronograma del evento de Jun-4',
          { desc:'Lanzamiento oficial 4 de junio', assign:leo, st:'completada' }),
    tarea('p-fantasy', 'Llamar marcas aliadas: Peroni, Google, Monster',
          { desc:'Lanzamiento oficial 4 de junio', st:'completada' }),
    tarea('p-fantasy', 'Planear 3-4 stories para invitar a la comunidad FCnoise'),
    tarea('p-fantasy', 'Programar y postear stories'),
    tarea('p-fantasy', 'Brainstorm 3-4 pilares de contenido para Whatsapp',
          { desc:'Ej. formaciones — Crear estrategia de activación del Whatsapp', assign:vero }),
    tarea('p-fantasy', 'Crear el Claude generador de contenido para Whatsapp',
          { assign:leo }),
    tarea('p-fantasy', 'Programar día para cerrar todos los signup sin pago',
          { desc:'Cerrar todos los leads' }),
    tarea('p-fantasy', 'Hacer follow up al chat de Fantasy que no se inscribieron',
          { desc:'Cerrar todos los leads' }),

    /* ── FINANCE CUP ── */
    tarea('p-financecup', 'Escribir el proceso del CRM para que Vero lo revise',
          { desc:'Crear un CRM de FCnoise en Claude', assign:leo }),
    tarea('p-financecup', 'Revisar una herramienta free tier para el CRM',
          { desc:'Crear un CRM de FCnoise en Claude', assign:leo, end:'2026-08-08' }),
    tarea('p-financecup', 'Conocer Substack',
          { desc:'Organizar el Substack (newsletter)', assign:vero, start:'2026-06-04', end:'2026-06-20' }),
    tarea('p-financecup', 'Definir herramienta del newsletter',
          { desc:'Organizar el Substack', assign:dos, start:'2026-06-20' }),
    tarea('p-financecup', 'Generar estrategia del newsletter',
          { desc:'Organizar el Substack' }),
    tarea('p-financecup', 'Plantilla de marcadores historias',
          { desc:'Crear plantillas iniciales Finance Cup', assign:vero, start:'2026-06-20', end:'2026-06-30' }),
    tarea('p-financecup', 'Plantilla de TOW',
          { desc:'Crear plantillas iniciales Finance Cup' }),
    tarea('p-financecup', 'Plantilla de goleadores',
          { desc:'Crear plantillas iniciales Finance Cup' }),
    tarea('p-financecup', 'Universo de marca Finance Cup — colores y vectores',
          { desc:'Crear plantillas iniciales Finance Cup' }),
    tarea('p-financecup', 'Plantilla de nuevo líder',
          { desc:'Crear plantillas iniciales Finance Cup' }),
    tarea('p-financecup', 'Plantilla de marcadores carrusel',
          { desc:'Crear plantillas iniciales Finance Cup' }),
    tarea('p-financecup', 'Definir fechas de eventos networking',
          { desc:'Planear y vender eventos networking', assign:leo }),
    tarea('p-financecup', 'Definir formatos de eventos networking',
          { desc:'Planear y vender eventos networking', assign:leo }),
    tarea('p-financecup', 'Diseñar y presupuestar eventos networking',
          { desc:'Planear y vender eventos networking' }),
    tarea('p-financecup', 'Reunión con Diego — programar regreso agosto',
          { desc:'Definir quién será el editor' }),

    /* ── CONTENIDO JUNIO ── */
    tarea('p-contenidojun', 'Carrusel Lenovo — definir fotos + caption', { assign:vero }),
    tarea('p-contenidojun', 'Carrusel Happy Hours — definir fotos + caption', { assign:vero }),
    tarea('p-contenidojun', 'Carrusel CFL Gala'),
    tarea('p-contenidojun', 'Carrusel EFG World Cup'),
    tarea('p-contenidojun', 'Carrusel Lanzamiento Fantasy — definir fotos + caption', { assign:vero }),
    tarea('p-contenidojun', 'Carrusel Láminas Equipo FCnoise',
          { desc:'Leo(COL), Andre(COL), Vero, Santi(ARG), Mathi(USA), Andrés(COL), Leslie(VEN), Jigga(COL)', assign:vero }),
    tarea('p-contenidojun', 'Video ADS FCnoise — terminar de editar', { assign:vero }),

    /* ── EMBAJADORES ── */
    tarea('p-embajadores', 'Definir 3 embajadores',
          { desc:'Lanzamiento oficial de embajadores', assign:dos }),
    tarea('p-embajadores', 'Definir caja de embajadores: Monster, Peroni, Coca Cola, Select, Culto, 90M, restaurante',
          { assign:dos }),
    tarea('p-embajadores', 'Estrategia 1 de embajadores', { assign:vero }),

    /* ── 40 CUP ── */
    tarea('p-40cup', 'Organizar el CRM del 40 CUP'),
    tarea('p-40cup', 'Planear el lanzamiento oficial', { assign:dos }),
    tarea('p-40cup', 'Crear el landing page', { assign:leo }),

    /* ── SISTEMA DATOS PARTIDO ── */
    tarea('p-datos', 'Mathi — sistema de datos del partido'),
    tarea('p-datos', 'Árbitros — sistema de datos del partido'),

    /* ── COMMUNITY ── */
    tarea('p-community', 'Crear plantilla de cumpleaños de jugadores'),
    tarea('p-community', 'Programar viernes: elegir quién recibe story de cumpleaños'),
    tarea('p-community', 'Definir fechas de todos los networking events del año',
          { desc:'Programar los networking events del año' }),
    tarea('p-community', 'Definir formatos de networking events',
          { desc:'Programar los networking events del año' }),

    /* ── SPONSORSHIPS ── */
    tarea('p-sponsors', 'Diseñar nueva estrategia y plataforma de sponsors'),

    /* ── VEO CAMS ── */
    tarea('p-veo', 'Definir categorías de contenido con VEO',
          { desc:'Definir cómo vamos a aprovechar VEO' }),
    tarea('p-veo', 'Investigar edición: Opus Clip, descarga videos, horizontal',
          { desc:'Definir cómo vamos a aprovechar VEO' }),
  ];

  /* ── MERGE con datos existentes ── */
  const existingProj  = JSON.parse(localStorage.getItem('fcn_projects') || '[]');
  const existingTasks = JSON.parse(localStorage.getItem('fcn_tasks')    || '[]');
  const existingNames = new Set(existingProj.map(p => p.name));

  const newProj  = PROJ.filter(p => !existingNames.has(p.name));
  const allProj  = [...existingProj, ...newProj];
  const allTasks = [...existingTasks, ...TASKS];

  localStorage.setItem('fcn_projects', JSON.stringify(allProj));
  localStorage.setItem('fcn_tasks',    JSON.stringify(allTasks));
  localStorage.setItem(SEED_KEY, 'done');

  console.log(`✅ Seed cargado: ${newProj.length} proyectos nuevos, ${TASKS.length} tareas nuevas`);
})();
