import { horaSalida, minutosDe } from './horas';
import type { Evento } from './tipos';

const MINUTOS_DEL_DIA = 24 * 60;

/**
 * Las cuatro fases del plan, más el vacío.
 *
 *   tranquilo   faltan más de 30 min   tenue
 *   preparate   entre 30 y 10 min      ámbar
 *   andando     menos de 10 min        naranja
 *   pasado      ya tendrías que haber salido   naranja, parpadeo lento
 *   manana      no queda nada hoy      el número se apaga
 */
export type Fase =
  | 'tranquilo'
  | 'preparate'
  | 'andando'
  | 'pasado'
  | 'en_curso'
  | 'manana';

export type Cuenta = {
  evento: Evento;
  /**
   * Minutos hasta el momento que manda: la hora de salida del próximo evento,
   * o el fin del que estás haciendo ahora si ese llega antes. Negativo si la
   * hora de salida ya pasó.
   */
  minutos: number;
  fase: Fase;
};

/** Arriba de este umbral el tiempo se lee en horas y no en minutos. */
export const MINUTOS_EN_HORAS = 90;

/** El parpadeo de "ya pasó" se corta a los 15 min: después queda naranja fijo. */
export const MINUTOS_DE_PARPADEO = 15;

/**
 * El color de cada fase, en un solo lugar, para que la cuenta regresiva y el
 * semáforo de cada fila no puedan discrepar. Cada color significa una cosa.
 */
export const TEXTO_FASE: Record<Fase, string> = {
  tranquilo: 'text-niebla',
  preparate: 'text-en-riesgo',
  andando: 'text-salida',
  pasado: 'text-salida',
  // En curso no es urgencia: no hay nada que hacer hasta que termine. El
  // naranja sigue queriendo decir una sola cosa, "tenés que salir".
  en_curso: 'text-niebla',
  manana: 'text-niebla',
};

export const FONDO_FASE: Record<Fase, string> = {
  tranquilo: 'bg-niebla',
  preparate: 'bg-en-riesgo',
  andando: 'bg-salida',
  pasado: 'bg-salida',
  en_curso: 'bg-niebla',
  manana: 'bg-niebla',
};

export const NOMBRE_FASE: Record<Fase, string> = {
  tranquilo: 'falta más de 30 min',
  preparate: 'faltan menos de 30 min',
  andando: 'faltan menos de 10 min',
  pasado: 'ya tendrías que haber salido',
  en_curso: 'en curso',
  manana: 'mañana',
};

export function faseDe(minutos: number): Fase {
  if (minutos < 0) return 'pasado';
  if (minutos < 10) return 'andando';
  if (minutos <= 30) return 'preparate';
  return 'tranquilo';
}

/** Los eventos del día en el orden en que hay que salir. */
export function porHoraDeSalida(eventos: Evento[]): Evento[] {
  return [...eventos].sort((a, b) => minutosDe(horaSalida(a)) - minutosDe(horaSalida(b)));
}

/**
 * El evento que manda la pantalla: el primero que todavía no empezó.
 *
 * Se queda en ese evento mientras la hora de inicio no haya pasado, así que si
 * la hora de salida ya pasó y todavía no empieza, la pantalla avisa que vas
 * tarde en vez de saltar al siguiente.
 *
 * Cuando no queda nada por empezar, lo que sigue es el primer evento del día
 * siguiente: ahí el número se apaga y la pantalla solo dice qué viene.
 */
/** El evento que estás haciendo ahora mismo, si hay alguno. */
export function eventoEnCurso(eventos: Evento[], ahora: number): Evento | null {
  return (
    eventos.find(
      (e) =>
        e.hora_fin !== null &&
        minutosDe(e.hora_inicio) <= ahora &&
        ahora < minutosDe(e.hora_fin)
    ) ?? null
  );
}

export function proximaCuenta(eventos: Evento[], ahora: number): Cuenta | null {
  const ordenados = porHoraDeSalida(eventos);
  if (ordenados.length === 0) return null;

  // Candidato 1: la salida del próximo evento que todavía no empezó.
  const proximo = ordenados.find((e) => minutosDe(e.hora_inicio) > ahora);
  const salida: Cuenta | null = proximo
    ? (() => {
        const minutos = minutosDe(horaSalida(proximo)) - ahora;
        return { evento: proximo, minutos, fase: faseDe(minutos) };
      })()
    : null;

  // Candidato 2: el fin de lo que estás haciendo ahora.
  const actual = eventoEnCurso(ordenados, ahora);
  const fin: Cuenta | null = actual
    ? {
        evento: actual,
        minutos: minutosDe(actual.hora_fin as string) - ahora,
        fase: 'en_curso',
      }
    : null;

  // Manda lo que pase primero. Estando dentro de un evento, contar hacia la
  // salida del siguiente cuando falta medio día es confuso; y al revés, si la
  // salida cae antes del fin, esa gana porque es la razón de ser de la app.
  // Si la salida ya pasó, `minutos` es negativo y gana siempre: llegar tarde
  // manda sobre todo lo demás.
  if (salida && (!fin || salida.minutos <= fin.minutos)) return salida;
  if (fin) return fin;

  // Ni nada por empezar ni nada en curso: el día se terminó.
  const primero = ordenados[0];
  return {
    evento: primero,
    minutos: minutosDe(horaSalida(primero)) + MINUTOS_DEL_DIA - ahora,
    fase: 'manana',
  };
}

/**
 * Cuánto falta, en texto. Arriba de 90 min pasa a horas: `390 min` se lee
 * mal de reojo, `6 h 30` no. Abajo de 90 se queda en minutos.
 *
 * Devuelve el valor y la unidad por separado porque en la pantalla van en
 * tamaños distintos: el valor es el número grande.
 */
export function textoDeEspera(minutos: number): { valor: string; unidad: string } {
  const m = Math.abs(minutos);
  if (m > MINUTOS_EN_HORAS) {
    const horas = Math.floor(m / 60);
    const resto = m % 60;
    // Con las dos unidades escritas: "9 h 00 min" se lee de una, "9h00" hay
    // que interpretarlo.
    return { valor: `${horas} h ${String(resto).padStart(2, '0')} min`, unidad: '' };
  }
  return { valor: String(m), unidad: 'min' };
}

/**
 * El semáforo de una fila de la lista: los mismos cuatro estados que el número
 * grande, para ver de un vistazo cuánto falta para cada cosa del día.
 *
 * `null` cuando el evento ya empezó: ahí no queda nada que avisar, y pintar de
 * naranja todo lo que ya pasó llenaría la pantalla de alarmas falsas.
 */
export function faseDeFila(evento: Evento, ahora: number): Fase | null {
  if (minutosDe(evento.hora_inicio) <= ahora) return null;
  return faseDe(minutosDe(horaSalida(evento)) - ahora);
}

/**
 * Dónde estás parado en el día, para la línea de contexto de arriba del héroe.
 *
 *   en_curso       estás dentro de un evento
 *   libre          no hay nada en curso pero todavía queda algo por empezar
 *   nada_mas_hoy   el día se terminó
 */
export type Contexto =
  | { tipo: 'en_curso'; evento: Evento }
  | { tipo: 'en_camino'; proximo: Evento }
  | { tipo: 'libre'; proximo: Evento }
  | { tipo: 'nada_mas_hoy'; manana: Evento };

export function contextoDe(eventos: Evento[], ahora: number): Contexto | null {
  if (eventos.length === 0) return null;

  const enCurso = eventoEnCurso(eventos, ahora);
  if (enCurso) return { tipo: 'en_curso', evento: enCurso };

  const porEmpezar = [...eventos]
    .filter((e) => minutosDe(e.hora_inicio) > ahora)
    .sort((a, b) => minutosDe(a.hora_inicio) - minutosDe(b.hora_inicio))[0];
  if (porEmpezar) {
    // Si la hora de salida ya pasó no estás libre, estás (o deberías estar) en
    // la micro. Decirle "libre" sería mentirle justo cuando más importa.
    const yaSalio = minutosDe(horaSalida(porEmpezar)) <= ahora;
    return { tipo: yaSalio ? 'en_camino' : 'libre', proximo: porEmpezar };
  }

  // El día se terminó: lo que sigue es el primer evento del día siguiente.
  const manana = [...eventos].sort(
    (a, b) => minutosDe(a.hora_inicio) - minutosDe(b.hora_inicio)
  )[0];
  return { tipo: 'nada_mas_hoy', manana };
}
