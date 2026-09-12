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
export type Fase = 'tranquilo' | 'preparate' | 'andando' | 'pasado' | 'manana';

export type Cuenta = {
  evento: Evento;
  /** Minutos hasta la hora de salida. Negativo si ya pasó. */
  minutos: number;
  fase: Fase;
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
export function proximaCuenta(eventos: Evento[], ahora: number): Cuenta | null {
  const ordenados = porHoraDeSalida(eventos);
  if (ordenados.length === 0) return null;

  const proximo = ordenados.find((e) => minutosDe(e.hora_inicio) > ahora);
  if (proximo) {
    const minutos = minutosDe(horaSalida(proximo)) - ahora;
    return { evento: proximo, minutos, fase: faseDe(minutos) };
  }

  const primero = ordenados[0];
  return {
    evento: primero,
    minutos: minutosDe(horaSalida(primero)) + MINUTOS_DEL_DIA - ahora,
    fase: 'manana',
  };
}
