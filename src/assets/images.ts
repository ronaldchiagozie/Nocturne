
export const images = {
  hero: '/bottle-07-nocturne.png',
  oud: '/oudwoodblock.png',
  citrus: '/bergamotcitrus.png',
  pepper: '/blackpepper.png',
  cedar: '/cedarwoodbark.png',
  ambergris: '/golden-brown.png',
  bottle: '/bottle-07-nocturne.png',

  no07: '/bottle-07-nocturne.png',

  no05: '/bottle-05-pepper-cedar.png',

  no03: '/bottle-03-oud-resin.png',
  bottle03OudResin: '/bottle-03-oud-resin.png',
  bottle05PepperCedar: '/bottle-05-pepper-cedar.png',
  bottle07Nocturne: '/bottle-07-nocturne.png',
  bottle08PaleDawn: '/bottle-08-pale-dawn.png',
  bottle11GoldenHour: '/bottle-11-golden-hour.png',
  bottle17VioletNoir: '/bottle-17-violet-noir.png',
  bottle19EmeraldNight: '/bottle-19-emerald-night.png',
  bottle22RoseDusk: '/bottle-22-rose-dusk.png',
} as const;

export type ImageKey = keyof typeof images;
