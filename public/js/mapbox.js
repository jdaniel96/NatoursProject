/* eslint-disable */
import * as L from 'leaflet';

export const displayMap = (locations) => {
  const [longitude, latitude] = locations[0].coordinates;

  const map = L.map('map', {
    zoomControl: false,
    attributionControl: false,
    scrollWheelZoom: false,
  }).setView([latitude, longitude], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  locations.forEach((element, index) => {
    const [longitude, latitude] = element.coordinates;
    L.marker([latitude, longitude])
      .addTo(map)
      .bindPopup(`day ${element.day} ${element.description}`, {
        autoClose: false,
      })
      .openPopup();
  });
};
