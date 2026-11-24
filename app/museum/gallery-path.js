const radius = 27;

export const path = {
  length: 48,
  sample(distance) {
    const angle = distance / radius;
    return {
      x: radius * (1 - Math.cos(angle)), z: -radius * Math.sin(angle),
      dx: Math.sin(angle), dz: -Math.cos(angle),
    };
  },
};

export const start = 1.65;
export const courtyardStart = 43.7;
export const finish = 47.64;
export const clamp = (value, low, high) => Math.min(high, Math.max(low, value));
export const distanceLabel = (value) => String(value.toFixed(3));
export const exhibitionAnchor = (room) => "exhibition-" + room.slug;

export function createRooms(gallery) {
  return gallery.map((room, i) => {
    const startAt = start + i * 13.05;
    const phone = startAt + 3.50;
    return {
      ...room, phoneAt: phone, startAt,
      frames: room.frames.map((frame, j) => ({ ...frame, at: phone + 5.82 + j * 1.22 })),
    };
  });
}

export function place(distance, across) {
  const p = path.sample(distance);
  const rx = -p.dz;
  const rz = p.dx;
  return { ...p, rx, rz, x: p.x + across * rx, z: p.z + across * rz };
}

export function currentRoom(rooms, distance) {
  return rooms.findLast((room) => room.startAt <= distance) ?? rooms[0];
}
